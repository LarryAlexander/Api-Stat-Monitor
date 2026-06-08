import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Monitor } from "@/lib/models";
import { deleteMonitor, ensureWorkspace, getMonitor, updateMonitor } from "@/lib/firebase/data";
import { requireUserSession } from "@/lib/firebase/session";

const monitorSchema = z.object({
  name: z.string().min(2).optional(),
  url: z.string().url().optional(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
  expected_status: z.number().int().min(100).max(599).optional(),
  interval_minutes: z.number().int().min(1).max(1440).optional(),
  headers: z
    .string()
    .max(2000)
    .optional()
    .nullable()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  is_active: z.boolean().optional(),
});

const readMonitor = (monitorId: string, workspaceId: string): Promise<Monitor | null> =>
  getMonitor(monitorId, workspaceId);

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUserSession();
    const workspace = await ensureWorkspace(session.uid);
    const { id } = await context.params;
    const monitor = await readMonitor(id, workspace.id);

    if (!monitor) {
      return NextResponse.json({ message: "Monitor not found" }, { status: 404 });
    }

    return NextResponse.json({ monitor });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load monitor";
    return NextResponse.json({ message }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUserSession();
    const workspace = await ensureWorkspace(session.uid);
    const { id } = await context.params;
    const payload = monitorSchema.parse(await request.json());
    const monitor = await updateMonitor(id, workspace.id, payload);
    if (!monitor) {
      return NextResponse.json({ message: "Monitor not found" }, { status: 404 });
    }
    return NextResponse.json({ monitor });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update monitor";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUserSession();
    const workspace = await ensureWorkspace(session.uid);
    const { id } = await context.params;
    const deleted = await deleteMonitor(id, workspace.id);
    if (!deleted) {
      return NextResponse.json({ message: "Monitor not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Monitor removed" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete monitor";
    return NextResponse.json({ message }, { status: 401 });
  }
}
