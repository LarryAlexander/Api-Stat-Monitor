import { NextResponse } from "next/server";
import {
  clearDemoMonitors,
  ensureWorkspace,
  hasDemoMonitors,
  seedDemoMonitors,
} from "@/lib/firebase/data";
import { requireUserSession } from "@/lib/firebase/session";

export async function GET() {
  try {
    const session = await requireUserSession();
    const workspace = await ensureWorkspace(session.uid);
    return NextResponse.json({ enabled: await hasDemoMonitors(workspace.id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load demo data status";
    return NextResponse.json({ message }, { status: 401 });
  }
}

export async function POST() {
  try {
    const session = await requireUserSession();
    const workspace = await ensureWorkspace(session.uid);
    const enabled = await hasDemoMonitors(workspace.id);

    if (enabled) {
      const removed = await clearDemoMonitors(workspace.id);
      return NextResponse.json({ enabled: false, removed });
    }

    return NextResponse.json({
      enabled: true,
      created: await seedDemoMonitors(workspace.id),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to seed demo monitors";
    return NextResponse.json({ message }, { status: 401 });
  }
}
