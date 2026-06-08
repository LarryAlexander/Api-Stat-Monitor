import { NextRequest, NextResponse } from "next/server";
import { ensureWorkspace, getMonitorHistory } from "@/lib/firebase/data";
import { requireUserSession } from "@/lib/firebase/session";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUserSession();
    const workspace = await ensureWorkspace(session.uid);
    const { id } = await context.params;
    const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "30", 10);
    const maxLimit = Number.isNaN(limit) ? 30 : Math.min(Math.max(limit, 1), 100);
    const checks = await getMonitorHistory(id, workspace.id, maxLimit);
    if (!checks) {
      return NextResponse.json({ message: "Monitor not found" }, { status: 404 });
    }
    return NextResponse.json({ checks });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load history";
    return NextResponse.json({ message }, { status: 401 });
  }
}
