import { getMonitorDetail } from "@/lib/server-data";
import MonitorDetailClient from "@/components/monitor/monitor-detail-client";

export default async function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { monitor, checks } = await getMonitorDetail(id);

  return <MonitorDetailClient initialMonitor={monitor} initialChecks={checks} />;
}
