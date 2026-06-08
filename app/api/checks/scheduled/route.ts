import { NextRequest, NextResponse } from "next/server";
import { listDueMonitors } from "@/lib/firebase/data";
import { runChecksInBatches } from "@/lib/check-runner";
import { after } from "next/server";

export async function POST(request: NextRequest) {
  // Validate CRON_SECRET token
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && token !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dueMonitors = await listDueMonitors();

    if (dueMonitors.length === 0) {
      return NextResponse.json({ message: "No monitors due for checks" }, { status: 200 });
    }

    // Isolate check execution from request path using after
    after(async () => {
      try {
        const results = await runChecksInBatches(dueMonitors);
        console.log(`Scheduled checks complete. Ran ${results.length} checks.`);
      } catch (err) {
        console.error("Failed to run scheduled checks:", err);
      }
    });

    return NextResponse.json(
      { 
        message: "Checks triggered", 
        count: dueMonitors.length, 
        monitors: dueMonitors.map(m => m.name) 
      }, 
      { status: 202 }
    );
  } catch (error) {
    console.error("Scheduled check trigger error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
