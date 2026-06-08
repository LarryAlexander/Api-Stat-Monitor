import type { CheckRecord, IncidentWithMonitor, MonitorWithState, MonitorsResponse } from "@/lib/models";
import { ensureWorkspace, getDashboardData as getDashboardDataForWorkspace, getMonitorDetail as getMonitorDetailForWorkspace, listIncidents } from "@/lib/firebase/data";
import { requireUserSession } from "@/lib/firebase/session";

export async function getCurrentWorkspace() {
  const session = await requireUserSession();
  return ensureWorkspace(session.uid);
}

export async function getDashboardData(): Promise<MonitorsResponse> {
  const workspace = await getCurrentWorkspace();
  return getDashboardDataForWorkspace(workspace.id);
}

export async function getIncidents(todayOnly = false): Promise<IncidentWithMonitor[]> {
  const workspace = await getCurrentWorkspace();
  return listIncidents(workspace.id, todayOnly);
}

export async function getMonitorDetail(monitorId: string): Promise<{
  monitor: MonitorWithState | null;
  checks: CheckRecord[];
}> {
  const workspace = await getCurrentWorkspace();
  const detail = await getMonitorDetailForWorkspace(monitorId, workspace.id);

  return detail ?? { monitor: null, checks: [] };
}
