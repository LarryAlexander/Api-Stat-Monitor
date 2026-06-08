import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type {
  CheckRecord,
  IncidentWithMonitor,
  Monitor,
  MonitorPayload,
  MonitorStatus,
  MonitorWithState,
  MonitorsResponse,
} from "@/lib/models";

interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
}

const DEMO_MONITOR_FLAG = "seed:demo";

interface IncidentRecordFirestore {
  id: string;
  monitor_id: string;
  started_at: string;
  resolved_at: string | null;
  reason: string | null;
  status: "open" | "resolved";
  created_at: string;
  updated_at: string;
}

const toIso = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return new Date().toISOString();
};

const monitorFromDoc = (id: string, data: FirebaseFirestore.DocumentData): Monitor => ({
  id,
  workspace_id: data.workspace_id,
  name: data.name,
  url: data.url,
  method: data.method,
  expected_status: data.expected_status,
  interval_minutes: data.interval_minutes,
  is_active: data.is_active,
  headers: data.headers ?? null,
  created_at: toIso(data.created_at),
  updated_at: toIso(data.updated_at),
});

const checkFromDoc = (id: string, data: FirebaseFirestore.DocumentData): CheckRecord => ({
  id,
  monitor_id: data.monitor_id,
  status: data.status,
  status_code: data.status_code ?? null,
  response_time_ms: data.response_time_ms,
  error_message: data.error_message ?? null,
  checked_at: toIso(data.checked_at),
});

const incidentFromDoc = (
  id: string,
  data: FirebaseFirestore.DocumentData,
): IncidentRecordFirestore => ({
  id,
  monitor_id: data.monitor_id,
  started_at: toIso(data.started_at),
  resolved_at: data.resolved_at ? toIso(data.resolved_at) : null,
  reason: data.reason ?? null,
  status: data.status,
  created_at: toIso(data.created_at),
  updated_at: toIso(data.updated_at),
});

export async function ensureWorkspace(userId: string) {
  const ref = adminDb.collection("workspaces").doc(userId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    await ref.set({
      owner_id: userId,
      name: "My Workspace",
      created_at: FieldValue.serverTimestamp(),
    });
  }

  const refreshed = await ref.get();
  return {
    id: refreshed.id,
    ...(refreshed.data() as Omit<Workspace, "id">),
    created_at: toIso(refreshed.data()?.created_at),
  } satisfies Workspace;
}

export async function listWorkspaceMonitors(
  workspaceId: string,
): Promise<MonitorWithState[]> {
  const snapshot = await adminDb
    .collection("monitors")
    .where("workspace_id", "==", workspaceId)
    .orderBy("created_at", "desc")
    .get();

  const monitors = snapshot.docs.map((doc) => monitorFromDoc(doc.id, doc.data()));
  const latestChecks = await getLatestChecksForMonitors(monitors.map((monitor) => monitor.id));

  return monitors.map((monitor) => {
    const lastCheck = latestChecks.get(monitor.id) ?? null;
    return {
      ...monitor,
      last_check: lastCheck,
      current_status: lastCheck?.status ?? "unknown",
      current_response_time_ms: lastCheck?.response_time_ms ?? null,
    };
  });
}

export async function getLatestChecksForMonitors(monitorIds: string[]) {
  const latestChecks = new Map<string, CheckRecord>();
  await Promise.all(
    monitorIds.map(async (monitorId) => {
      const snapshot = await adminDb
        .collection("checks")
        .where("monitor_id", "==", monitorId)
        .orderBy("checked_at", "desc")
        .limit(1)
        .get();

      const doc = snapshot.docs[0];
      if (doc) {
        latestChecks.set(monitorId, checkFromDoc(doc.id, doc.data()));
      }
    }),
  );

  return latestChecks;
}

export async function getDashboardData(
  workspaceId: string,
): Promise<MonitorsResponse> {
  const monitors = await listWorkspaceMonitors(workspaceId);
  const responseTimes = monitors
    .map((monitor) => monitor.current_response_time_ms)
    .filter((value): value is number => value !== null);

  const totalResponseMs = responseTimes.reduce((sum, value) => sum + value, 0);

  return {
    monitors,
    summary: {
      totalMonitors: monitors.length,
      activeMonitors: monitors.filter((monitor) => monitor.is_active).length,
      healthy: monitors.filter((monitor) => monitor.current_status === "healthy").length,
      degraded: monitors.filter((monitor) => monitor.current_status === "degraded").length,
      down: monitors.filter((monitor) => monitor.current_status === "down").length,
      unknown: monitors.filter((monitor) => monitor.current_status === "unknown").length,
      averageResponseMs:
        responseTimes.length > 0
          ? Math.round(totalResponseMs / responseTimes.length)
          : null,
    },
  };
}

export async function createMonitor(
  workspaceId: string,
  payload: MonitorPayload,
  options?: {
    source?: string | null;
  },
) {
  const ref = await adminDb.collection("monitors").add({
    workspace_id: workspaceId,
    ...payload,
    source: options?.source ?? null,
    headers: payload.headers ?? null,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  });

  const snapshot = await ref.get();
  return monitorFromDoc(snapshot.id, snapshot.data()!);
}

export async function getMonitor(monitorId: string, workspaceId: string) {
  const snapshot = await adminDb.collection("monitors").doc(monitorId).get();
  if (!snapshot.exists) {
    return null;
  }

  const monitor = monitorFromDoc(snapshot.id, snapshot.data()!);
  return monitor.workspace_id === workspaceId ? monitor : null;
}

export async function updateMonitor(
  monitorId: string,
  workspaceId: string,
  payload: Partial<MonitorPayload>,
) {
  const monitor = await getMonitor(monitorId, workspaceId);
  if (!monitor) {
    return null;
  }

  await adminDb.collection("monitors").doc(monitorId).update({
    ...payload,
    updated_at: FieldValue.serverTimestamp(),
  });

  const refreshed = await adminDb.collection("monitors").doc(monitorId).get();
  return monitorFromDoc(refreshed.id, refreshed.data()!);
}

export async function deleteMonitor(monitorId: string, workspaceId: string) {
  const monitor = await getMonitor(monitorId, workspaceId);
  if (!monitor) {
    return false;
  }

  await adminDb.collection("monitors").doc(monitorId).delete();
  return true;
}

export async function getMonitorHistory(
  monitorId: string,
  workspaceId: string,
  limitCount = 30,
) {
  const monitor = await getMonitor(monitorId, workspaceId);
  if (!monitor) {
    return null;
  }

  const snapshot = await adminDb
    .collection("checks")
    .where("monitor_id", "==", monitorId)
    .orderBy("checked_at", "desc")
    .limit(limitCount)
    .get();

  return snapshot.docs
    .map((doc) => checkFromDoc(doc.id, doc.data()))
    .reverse();
}

export async function getMonitorDetail(
  monitorId: string,
  workspaceId: string,
) {
  const monitor = await getMonitor(monitorId, workspaceId);
  if (!monitor) {
    return null;
  }

  const checks = await getMonitorHistory(monitorId, workspaceId, 30);
  const history = checks ?? [];
  const latest = history.at(-1) ?? null;

  return {
    monitor: {
      ...monitor,
      last_check: latest,
      current_status: latest?.status ?? "unknown",
      current_response_time_ms: latest?.response_time_ms ?? null,
    },
    checks: history,
  };
}

export async function createCheckRecord(input: {
  monitorId: string;
  status: MonitorStatus;
  statusCode: number | null;
  responseTimeMs: number;
  errorMessage: string | null;
  checkedAt: string;
}) {
  const ref = await adminDb.collection("checks").add({
    monitor_id: input.monitorId,
    status: input.status,
    status_code: input.statusCode,
    response_time_ms: input.responseTimeMs,
    error_message: input.errorMessage,
    checked_at: input.checkedAt,
  });

  const snapshot = await ref.get();
  return checkFromDoc(snapshot.id, snapshot.data()!);
}

export async function getOpenIncident(monitorId: string) {
  const snapshot = await adminDb
    .collection("incidents")
    .where("monitor_id", "==", monitorId)
    .where("status", "==", "open")
    .limit(1)
    .get();

  const doc = snapshot.docs[0];
  return doc ? incidentFromDoc(doc.id, doc.data()) : null;
}

export async function createIncident(
  monitorId: string,
  reason: string | null,
  startedAt: string,
) {
  await adminDb.collection("incidents").add({
    monitor_id: monitorId,
    started_at: startedAt,
    resolved_at: null,
    reason,
    status: "open",
    created_at: startedAt,
    updated_at: startedAt,
  });
}

export async function resolveIncident(incidentId: string, resolvedAt: string) {
  await adminDb.collection("incidents").doc(incidentId).update({
    resolved_at: resolvedAt,
    status: "resolved",
    updated_at: resolvedAt,
  });
}

export async function listIncidents(
  workspaceId: string,
  todayOnly = false,
): Promise<IncidentWithMonitor[]> {
  const monitorSnapshot = await adminDb
    .collection("monitors")
    .where("workspace_id", "==", workspaceId)
    .get();

  const monitorMap = new Map<string, Monitor>();
  for (const doc of monitorSnapshot.docs) {
    const monitor = monitorFromDoc(doc.id, doc.data());
    monitorMap.set(monitor.id, monitor);
  }

  if (monitorMap.size === 0) {
    return [];
  }

  let query: FirebaseFirestore.Query = adminDb
    .collection("incidents")
    .where("monitor_id", "in", Array.from(monitorMap.keys()).slice(0, 30))
    .orderBy("started_at", "desc");

  if (todayOnly) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query = query.where("started_at", ">=", today.toISOString());
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => {
    const incident = incidentFromDoc(doc.id, doc.data());
    const monitor = monitorMap.get(incident.monitor_id);
    return {
      ...incident,
      monitors: monitor ? { name: monitor.name } : null,
    };
  });
}

export async function seedDemoMonitors(workspaceId: string) {
  const sampleMonitors: MonitorPayload[] = [
    {
      name: "Auth API",
      url: "https://httpbin.org/status/200",
      method: "GET",
      expected_status: 200,
      interval_minutes: 5,
      is_active: true,
      headers: null,
    },
    {
      name: "Payments API",
      url: "https://httpbin.org/status/500",
      method: "GET",
      expected_status: 200,
      interval_minutes: 5,
      is_active: true,
      headers: null,
    },
    {
      name: "Maps API",
      url: "https://httpbin.org/delay/1",
      method: "GET",
      expected_status: 200,
      interval_minutes: 10,
      is_active: true,
      headers: null,
    },
  ];

  return Promise.all(
    sampleMonitors.map((monitor) =>
      createMonitor(workspaceId, monitor, { source: DEMO_MONITOR_FLAG }),
    ),
  );
}

export async function hasDemoMonitors(workspaceId: string) {
  const snapshot = await adminDb
    .collection("monitors")
    .where("workspace_id", "==", workspaceId)
    .where("source", "==", DEMO_MONITOR_FLAG)
    .limit(1)
    .get();

  return !snapshot.empty;
}

export async function clearDemoMonitors(workspaceId: string) {
  const snapshot = await adminDb
    .collection("monitors")
    .where("workspace_id", "==", workspaceId)
    .where("source", "==", DEMO_MONITOR_FLAG)
    .get();

  if (snapshot.empty) {
    return 0;
  }

  const batch = adminDb.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  return snapshot.size;
}
