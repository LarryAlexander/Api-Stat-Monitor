import { NextRequest, NextResponse } from "next/server";
import { ensureWorkspace, getMonitor } from "@/lib/firebase/data";
import { requireUserSession } from "@/lib/firebase/session";
import { runMonitorCheck } from "@/lib/check-runner";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUserSession();
    const workspace = await ensureWorkspace(session.uid);
    const { id } = await context.params;
    const monitor = await getMonitor(id, workspace.id);
    if (!monitor) {
      return NextResponse.json({ message: "Monitor not found" }, { status: 404 });
    }

    const check = await runMonitorCheck(monitor);
    return NextResponse.json({ check });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to run monitor check";
    return NextResponse.json({ message }, { status: 400 });
  }
}
