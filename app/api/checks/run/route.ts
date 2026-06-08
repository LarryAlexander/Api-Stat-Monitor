import { NextResponse } from "next/server";
import { ensureWorkspace, listWorkspaceMonitors } from "@/lib/firebase/data";
import { requireUserSession } from "@/lib/firebase/session";
import { runMonitorCheck } from "@/lib/check-runner";

export async function POST() {
  try {
    const session = await requireUserSession();
    const workspace = await ensureWorkspace(session.uid);
    const monitors = (await listWorkspaceMonitors(workspace.id)).filter(
      (monitor) => monitor.is_active,
    );

    const checks = await Promise.all(
      monitors.map((monitor) => runMonitorCheck(monitor).catch((err) => ({
        monitor_id: monitor.id,
        status: "down",
        status_code: null,
        response_time_ms: 0,
        error_message: err instanceof Error ? err.message : "Unexpected worker error",
        checked_at: new Date().toISOString(),
      }))),
    );

    return NextResponse.json({ checks });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to run checks";
    return NextResponse.json({ message }, { status: 401 });
  }
}
