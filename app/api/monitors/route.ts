import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createMonitor, ensureWorkspace, getDashboardData, isWorkspaceGated } from "@/lib/firebase/data";
import { requireUserSession } from "@/lib/firebase/session";

const monitorSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  url: z.string().url("Enter a valid URL"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  expected_status: z.number().int().min(100).max(599),
  interval_minutes: z.number().int().min(1).max(1440),
  headers: z
    .string()
    .max(2000)
    .optional()
    .nullable()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  is_active: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const session = await requireUserSession();
    const workspace = await ensureWorkspace(session.uid);
    return NextResponse.json(await getDashboardData(workspace.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load monitors";
    return NextResponse.json({ message }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireUserSession();
    const workspace = await ensureWorkspace(session.uid);

    if (await isWorkspaceGated(workspace.id)) {
      return NextResponse.json(
        { message: "Plan limit reached (3 monitors). Please upgrade to Pro." },
        { status: 403 }
      );
    }

    const payload = monitorSchema.parse(await request.json());
    const monitor = await createMonitor(workspace.id, payload);

    return NextResponse.json({
      monitor: {
        ...monitor,
        last_check: null,
        current_status: "unknown",
        current_response_time_ms: null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create monitor";
    return NextResponse.json({ message }, { status: 400 });
  }
}
