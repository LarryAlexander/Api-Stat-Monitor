"use client";

import { startTransition, useState } from "react";
import { CheckRecord, MonitorWithState } from "@/lib/models";
import { formatDateTime } from "@/lib/format";
import ResponseChart from "@/components/charts/response-chart";
import StatusBadge from "@/components/monitor/status-badge";
import TopNav from "@/components/layout/top-nav";

interface MonitorDetailClientProps {
  initialMonitor: MonitorWithState | null;
  initialChecks: CheckRecord[];
}

export default function MonitorDetailClient({
  initialMonitor,
  initialChecks,
}: MonitorDetailClientProps) {
  const [monitor, setMonitor] = useState<MonitorWithState | null>(initialMonitor);
  const [checks, setChecks] = useState<CheckRecord[]>(initialChecks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runNow = async () => {
    if (!monitor) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/monitors/${monitor.id}/run`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Check execution failed");
      }

      const historyResponse = await fetch(`/api/monitors/${monitor.id}/history?limit=30`);
      if (!historyResponse.ok) {
        throw new Error("Could not refresh monitor history");
      }

      const payload = (await historyResponse.json()) as { checks: CheckRecord[] };
      const nextChecks = payload.checks ?? [];
      const latest = nextChecks.at(-1) ?? null;

      startTransition(() => {
        setChecks(nextChecks);
        if (latest) {
          setMonitor((previous) =>
            previous
              ? {
                  ...previous,
                  last_check: latest,
                  current_status: latest.status,
                  current_response_time_ms: latest.response_time_ms,
                }
              : previous,
          );
        }
      });
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Check execution failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {error ? <p className="text-rose-700">{error}</p> : null}
        {monitor ? (
          <>
            <section className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-semibold">{monitor.name}</h1>
                <p className="text-sm text-zinc-600">{monitor.url}</p>
              </div>
              <button
                onClick={() => {
                  void runNow();
                }}
                disabled={loading}
                className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
              >
                {loading ? "Running..." : "Run check"}
              </button>
            </section>

            <section className="mt-4 grid gap-4 md:grid-cols-3">
              <article className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase text-zinc-500">Current status</p>
                <div className="mt-2">
                  <StatusBadge status={monitor.current_status} />
                </div>
              </article>
              <article className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase text-zinc-500">Latest response</p>
                <p className="mt-2 text-lg font-semibold">
                  {monitor.current_response_time_ms ? `${monitor.current_response_time_ms}ms` : "--"}
                </p>
              </article>
              <article className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase text-zinc-500">Method / Expect status</p>
                <p className="mt-2 text-lg font-semibold">
                  {monitor.method} / {monitor.expected_status}
                </p>
              </article>
            </section>

            <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
              <h2 className="mb-3 text-base font-semibold">Response-time trend</h2>
              {checks.length === 0 ? (
                <p className="text-sm text-zinc-500">No history yet.</p>
              ) : (
                <ResponseChart data={checks} />
              )}
            </section>

            <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
              <h2 className="mb-3 text-base font-semibold">Recent checks</h2>
              <ul className="space-y-2 text-sm text-zinc-700">
                {checks
                  .slice()
                  .reverse()
                  .map((check) => (
                    <li key={check.id} className="rounded-lg border border-zinc-100 p-2">
                      <p>
                        {formatDateTime(check.checked_at)} • {check.status} • {check.response_time_ms}ms •
                        <span className="text-zinc-500"> status {check.status_code ?? "n/a"}</span>
                      </p>
                      {check.error_message ? <p className="text-xs text-rose-600">{check.error_message}</p> : null}
                    </li>
                  ))}
              </ul>
            </section>
          </>
        ) : (
          <p className="text-sm text-zinc-500">Monitor not found.</p>
        )}
      </main>
    </div>
  );
}
