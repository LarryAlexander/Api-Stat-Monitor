import { formatDateTime } from "@/lib/format";
import { getIncidents } from "@/lib/server-data";
import TopNav from "@/components/layout/top-nav";

export default async function IncidentsPage() {
  const incidents = await getIncidents();
  const grouped = incidents.reduce<Record<string, typeof incidents>>((acc, incident) => {
    const label = incident.monitors?.name ?? "Unknown monitor";
    acc[label] ??= [];
    acc[label].push(incident);
    return acc;
  }, {});

  return (
    <div>
      <TopNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <h1 className="text-xl font-semibold">Incident History</h1>
        <p className="mb-4 text-sm text-zinc-500">Grouped outages and resolved events for your workspace.</p>

        {Object.entries(grouped).length === 0 ? (
          <p className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-500">No incidents yet.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([name, items]) => (
              <article key={name} className="rounded-xl border border-zinc-200 bg-white p-4">
                <h2 className="mb-2 font-semibold">{name}</h2>
                <ul className="space-y-2 text-sm text-zinc-700">
                  {items.map((incident) => (
                    <li key={incident.id} className="rounded-lg border border-zinc-100 p-2">
                      <p>
                        {incident.reason ?? "Outage detected"}
                        <span className="ml-2 rounded-full border border-zinc-200 px-2 py-0.5 text-xs">
                          {incident.status}
                        </span>
                      </p>
                      <p className="text-xs text-zinc-500">
                        Started {formatDateTime(incident.started_at)}
                        {incident.resolved_at ? ` • Resolved ${formatDateTime(incident.resolved_at)}` : " • Open"}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
