"use client";

import { startTransition, useMemo, useState } from "react";
import { IncidentWithMonitor, MonitorPayload, MonitorStatus, MonitorWithState, MonitorsResponse } from "@/lib/models";
import { formatDateTime } from "@/lib/format";
import MonitorCard from "@/components/monitor/monitor-card";
import MonitorFormModal from "@/components/monitor/monitor-form-modal";
import StatusBadge from "@/components/monitor/status-badge";
import TopNav from "@/components/layout/top-nav";

interface DashboardShellProps {
  initialMonitors: MonitorWithState[];
  initialIncidents: IncidentWithMonitor[];
}

export default function DashboardShell({ initialMonitors, initialIncidents }: DashboardShellProps) {
  const [monitors, setMonitors] = useState<MonitorWithState[]>(initialMonitors);
  const [incidents, setIncidents] = useState<IncidentWithMonitor[]>(initialIncidents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMonitor, setEditingMonitor] = useState<MonitorWithState | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [demoDataEnabled, setDemoDataEnabled] = useState(
    initialMonitors.some((monitor) => monitor.name === "Auth API" || monitor.name === "Payments API" || monitor.name === "Maps API"),
  );

  const summary = useMemo(() => {
    const totalMonitors = monitors.length;
    const activeMonitors = monitors.filter((monitor) => monitor.is_active).length;
    const healthy = monitors.filter((monitor) => monitor.current_status === "healthy").length;
    const degraded = monitors.filter((monitor) => monitor.current_status === "degraded").length;
    const down = monitors.filter((monitor) => monitor.current_status === "down").length;
    const totalMs = monitors.reduce((acc, item) => acc + (item.current_response_time_ms ?? 0), 0);
    const avgMs = monitors.length > 0 ? Math.round(totalMs / monitors.length) : null;
    const incidentsToday = incidents;

    return {
      totalMonitors,
      activeMonitors,
      healthy,
      degraded,
      down,
      avgMs,
      incidentsToday: incidentsToday.length,
    };
  }, [incidents, monitors]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [monitorsResponse, incidentResponse] = await Promise.all([
        fetch("/api/monitors"),
        fetch("/api/incidents?today=true"),
      ]);

      if (!monitorsResponse.ok || !incidentResponse.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const monitorPayload = (await monitorsResponse.json()) as MonitorsResponse;
      const incidentPayload = (await incidentResponse.json()) as { incidents: IncidentWithMonitor[] };
      setMonitors(monitorPayload.monitors);
      setIncidents(incidentPayload.incidents ?? []);
      const demoResponse = await fetch("/api/demo/seed");
      if (demoResponse.ok) {
        const demoPayload = (await demoResponse.json()) as { enabled: boolean };
        setDemoDataEnabled(demoPayload.enabled);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateMonitor = async (payload: MonitorPayload) => {
    const route = editingMonitor
      ? `/api/monitors/${editingMonitor.id}`
      : "/api/monitors";
    const method = editingMonitor ? "PATCH" : "POST";

    const response = await fetch(route, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message ?? "Unable to save monitor");
    }

    setEditingMonitor(null);
    setShowModal(false);
    startTransition(() => {
      void fetchAll();
    });
  };

  const runAllChecks = async () => {
    const response = await fetch("/api/checks/run", { method: "POST" });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message ?? "Unable to run checks");
    }
    startTransition(() => {
      void fetchAll();
    });
  };

  const runSingleMonitor = async (monitor: MonitorWithState) => {
    const response = await fetch(`/api/monitors/${monitor.id}/run`, { method: "POST" });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message ?? "Monitor check failed");
    }
    startTransition(() => {
      void fetchAll();
    });
  };

  const deleteMonitor = async (monitor: MonitorWithState) => {
    if (!window.confirm(`Delete ${monitor.name}?`)) return;
    const response = await fetch(`/api/monitors/${monitor.id}`, { method: "DELETE" });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message ?? "Unable to delete monitor");
    }
    startTransition(() => {
      void fetchAll();
    });
  };

  const toggleMonitor = async (monitor: MonitorWithState) => {
    const response = await fetch(`/api/monitors/${monitor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !monitor.is_active }),
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message ?? "Unable to update monitor");
    }
    startTransition(() => {
      void fetchAll();
    });
  };

  const seedDemo = async () => {
    const response = await fetch("/api/demo/seed", { method: "POST" });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message ?? "Unable to create demo data");
    }
    const result = (await response.json()) as { enabled: boolean };
    setDemoDataEnabled(result.enabled);
    startTransition(() => {
      void fetchAll();
    });
  };

  const overallHealth: MonitorStatus =
    summary.totalMonitors === 0
      ? "unknown"
      : summary.down > 0
        ? "down"
        : summary.degraded > 0
          ? "degraded"
          : "healthy";

  if (loading) {
    return (
      <div>
        <TopNav />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">Loading dashboard...</main>
      </div>
    );
  }

  return (
    <div>
      <TopNav />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard title="Overall Health" value={overallHealth} />
          <StatCard title="Active Monitors" value={`${summary.activeMonitors}/${summary.totalMonitors}`} />
          <StatCard title="Incidents Today" value={String(summary.incidentsToday)} />
          <StatCard title="Avg Response Time" value={summary.avgMs ? `${summary.avgMs}ms` : "--"} />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Getting Started
              </p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                How to operate PulseBoard
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                PulseBoard tracks whether your endpoints are healthy, slow, or down.
                Add a monitor, run checks, review history, and use incidents to see when
                a service failed and recovered.
              </p>
            </div>
            <div className="rounded-xl bg-zinc-100 px-3 py-2 text-xs text-zinc-600">
              Guide file: <code>instruction.md</code>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            <GuideCard
              step="1"
              title="Add a monitor"
              body="Use Add Monitor to enter a service name, URL, HTTP method, expected status code, and check interval."
            />
            <GuideCard
              step="2"
              title="Run checks"
              body="Use Run All Checks or the Run button on a single card to test the endpoint and store latency, status code, and errors."
            />
            <GuideCard
              step="3"
              title="Read statuses"
              body="Healthy means expected response. Degraded means the endpoint responded but took too long. Down means the request failed or returned the wrong status."
            />
            <GuideCard
              step="4"
              title="Inspect details"
              body="Open Details to view response-time history, recent checks, and failure patterns. Use Incidents to review outages across the workspace."
            />
          </div>
        </section>

        <section className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Endpoint Cards</h2>
            <p className="text-sm text-zinc-500">Add, run, and track API health checks.</p>
          </div>
              <div className="flex flex-wrap gap-2">
            <button
              className="rounded-lg border px-3 py-2 text-sm"
              onClick={() =>
                runAllChecks().catch((err) => setError(err instanceof Error ? err.message : "Could not run checks"))
              }
            >
              Run All Checks
            </button>
            <button className="rounded-lg border px-3 py-2 text-sm" onClick={() => setShowModal(true)}>
              Add Monitor
            </button>
            <button
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              onClick={() =>
                seedDemo().catch((err) =>
                  setError(err instanceof Error ? err.message : "Could not toggle demo data"),
                )
              }
            >
              {demoDataEnabled ? "Clear demo data" : "Enable demo data"}
            </button>
          </div>
        </section>

        {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        {summary.down > 0 && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            Alert: one or more endpoints are down.
          </div>
        )}

        <section className="space-y-3">
          {monitors.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
              No monitors yet. Add one to begin tracking your API health.
            </div>
          ) : (
            monitors.map((monitor) => (
              <MonitorCard
                key={monitor.id}
                monitor={monitor}
                onRun={() =>
                  runSingleMonitor(monitor).catch((err) =>
                    setError(err instanceof Error ? err.message : "Check failed"),
                  )
                }
                onEdit={() => {
                  setEditingMonitor(monitor);
                  setShowModal(true);
                }}
                onToggle={() => {
                  toggleMonitor(monitor).catch((err) => setError(err instanceof Error ? err.message : "Could not update"));
                }}
                onDelete={() => {
                  deleteMonitor(monitor).catch((err) => setError(err instanceof Error ? err.message : "Could not delete"));
                }}
              />
            ))
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="mb-3 text-base font-semibold">Incidents Today</h3>
          {incidents.length === 0 ? (
            <p className="text-sm text-zinc-500">No incidents yet.</p>
          ) : (
            <ul className="space-y-2 text-sm text-zinc-700">
              {incidents.map((incident) => (
                <li key={incident.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <strong>{incident.monitors?.name}</strong> • {incident.reason ?? "Issue detected"}
                  </span>
                  <span className="text-zinc-500">
                    {formatDateTime(incident.started_at)}
                    {incident.resolved_at ? ` to ${formatDateTime(incident.resolved_at)}` : " (open)"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <MonitorFormModal
          key={editingMonitor?.id ?? "new"}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingMonitor(null);
          }}
          defaults={editingMonitor}
          onSubmit={createOrUpdateMonitor}
        />
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{title}</p>
      <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-zinc-900">
        {title === "Overall Health" ? <StatusBadge status={value as MonitorStatus} /> : null}
        <span>{title === "Overall Health" ? null : value}</span>
      </p>
    </article>
  );
}

function GuideCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
          {step}
        </div>
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{body}</p>
    </article>
  );
}
