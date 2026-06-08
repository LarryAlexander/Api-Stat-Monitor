import {
  createCheckRecord,
  createIncident,
  getOpenIncident,
  resolveIncident,
  updateMonitorStateAfterCheck,
} from "@/lib/firebase/data";
import { HttpMethod, MonitorStatus } from "./models";
import { sendOutageAlert, sendRecoveryAlert } from "./alerts";

interface RawCheckPayload {
  monitor_id: string;
  status: MonitorStatus;
  status_code: number | null;
  response_time_ms: number;
  error_message: string | null;
  checked_at: string;
}

interface MonitorForRun {
  id: string;
  workspace_id: string;
  name: string;
  url: string;
  method: HttpMethod;
  expected_status: number;
  headers?: string | null;
  interval_minutes: number;
}

const parseHeaders = (value?: string | null): Record<string, string> => {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).filter(([, v]) => typeof v === "string") as [string, string][],
      );
    }
  } catch {
    // ignored: invalid JSON will be treated as no headers
  }

  return {};
};

const evaluate = (statusCode: number | null, expectedStatus: number, responseTimeMs: number): MonitorStatus => {
  if (statusCode === null) {
    return "down";
  }

  if (statusCode !== expectedStatus) {
    return "down";
  }

  return responseTimeMs > 1000 ? "degraded" : "healthy";
};

const probe = async (monitor: MonitorForRun): Promise<Omit<RawCheckPayload, "monitor_id" | "checked_at">> => {
  const startedAt = Date.now();
  const headers = parseHeaders(monitor.headers);
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 10000);

  try {
    const response = await fetch(monitor.url, {
      method: monitor.method,
      headers,
      signal: abortController.signal,
    });

    const responseTimeMs = Date.now() - startedAt;
    const statusCode = response.status;

    return {
      status: evaluate(statusCode, monitor.expected_status, responseTimeMs),
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      error_message: statusCode !== monitor.expected_status ? `Expected ${monitor.expected_status}` : null,
    };
  } catch (error) {
    return {
      status: "down",
      status_code: null,
      response_time_ms: Date.now() - startedAt,
      error_message: (error as Error).name === "AbortError" ? "Request timed out" : (error as Error).message,
    };
  } finally {
    clearTimeout(timeout);
  }
};

const probeWithRetries = async (
  monitor: MonitorForRun,
  maxAttempts = 3,
  delayMs = 1000,
): Promise<Omit<RawCheckPayload, "monitor_id" | "checked_at">> => {
  let lastResult: Omit<RawCheckPayload, "monitor_id" | "checked_at"> | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await probe(monitor);
    if (res.status === "healthy" || res.status === "degraded") {
      return res;
    }
    lastResult = res;
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return lastResult!;
};

export const runMonitorCheck = async (
  monitor: MonitorForRun,
): Promise<RawCheckPayload> => {
  const checkedAt = new Date().toISOString();
  const probeResult = await probeWithRetries(monitor);
  await createCheckRecord({
    monitorId: monitor.id,
    status: probeResult.status,
    statusCode: probeResult.status_code,
    responseTimeMs: probeResult.response_time_ms,
    errorMessage: probeResult.error_message,
    checkedAt,
  });

  const openIncident = await getOpenIncident(monitor.id);

  if (probeResult.status === "healthy") {
    if (openIncident) {
      await resolveIncident(openIncident.id, checkedAt);
      void sendRecoveryAlert(monitor.workspace_id, monitor.name, monitor.url);
    }
  } else if (!openIncident) {
    await createIncident(monitor.id, probeResult.error_message, checkedAt);
    void sendOutageAlert(monitor.workspace_id, monitor.name, monitor.url, probeResult.error_message);
  }

  await updateMonitorStateAfterCheck(monitor.id, {
    status: probeResult.status,
    checkedAt,
    intervalMinutes: monitor.interval_minutes ?? 5,
    isFailure: probeResult.status === "down",
  });

  return {
    monitor_id: monitor.id,
    ...probeResult,
    checked_at: checkedAt,
  };
};

export async function runChecksInBatches(
  monitors: MonitorForRun[],
  concurrencyLimit = 5,
): Promise<RawCheckPayload[]> {
  const results: RawCheckPayload[] = [];
  const executing: Promise<any>[] = [];

  for (const monitor of monitors) {
    const p = runMonitorCheck(monitor).then((res) => {
      results.push(res);
      executing.splice(executing.indexOf(p), 1);
    });
    executing.push(p);

    if (executing.length >= concurrencyLimit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}
