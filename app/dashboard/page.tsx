import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { getDashboardData, getIncidents } from "@/lib/server-data";

export default async function DashboardPage() {
  try {
    const [dashboardData, incidents] = await Promise.all([
      getDashboardData(),
      getIncidents(true),
    ]);

    return (
      <DashboardShell
        initialMonitors={dashboardData.monitors}
        initialIncidents={incidents}
      />
    );
  } catch (err) {
    // If the session is missing or invalid, redirect to login.
    // The middleware handles this first but this is a safety net.
    const message = err instanceof Error ? err.message : "";
    if (message === "Unauthorized" || message.includes("auth")) {
      redirect("/auth/login");
    }
    throw err; // re-throw unexpected errors
  }
}
