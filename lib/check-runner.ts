import {
  createCheckRecord,
  createIncident,
  getOpenIncident,
  resolveIncident,
} from "@/lib/firebase/data";
import { HttpMethod, MonitorStatus } from "./models";

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
  url: string;
  method: HttpMethod;
  expected_status: number;
  headers?: string | null;
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

export const runMonitorCheck = async (
  monitor: MonitorForRun,
): Promise<RawCheckPayload> => {
  const checkedAt = new Date().toISOString();
  const probeResult = await probe(monitor);
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
    }
  } else if (!openIncident) {
    await createIncident(monitor.id, probeResult.error_message, checkedAt);
  }

  return {
    monitor_id: monitor.id,
    ...probeResult,
    checked_at: checkedAt,
  };
};
