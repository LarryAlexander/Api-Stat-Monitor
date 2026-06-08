import { NextRequest, NextResponse } from "next/server";
import { ensureWorkspace, listIncidents } from "@/lib/firebase/data";
import { requireUserSession } from "@/lib/firebase/session";

export async function GET(request: NextRequest) {
  try {
    const session = await requireUserSession();
    const workspace = await ensureWorkspace(session.uid);
    const todayOnly = request.nextUrl.searchParams.get("today") === "true";
    return NextResponse.json({ incidents: await listIncidents(workspace.id, todayOnly) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load incidents";
    return NextResponse.json({ message }, { status: 401 });
  }
}
