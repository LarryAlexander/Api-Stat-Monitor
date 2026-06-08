import DashboardShell from "@/components/dashboard/dashboard-shell";
import { getDashboardData, getIncidents } from "@/lib/server-data";

export default async function DashboardPage() {
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
}
