import { getCurrentWorkspace } from "@/lib/server-data";
import { listWorkspaceMonitors } from "@/lib/firebase/data";
import BillingClient from "./billing-client";

export default async function BillingPage() {
  const workspace = await getCurrentWorkspace();
  const monitors = await listWorkspaceMonitors(workspace.id);

  return (
    <BillingClient
      initialWorkspace={workspace}
      monitorCount={monitors.length}
    />
  );
}
export const dynamic = "force-dynamic";
