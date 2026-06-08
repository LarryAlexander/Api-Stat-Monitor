"use client";

import Link from "next/link";
import { MonitorWithState } from "@/lib/models";
import { formatResponseTime } from "@/lib/format";
import StatusBadge from "./status-badge";

interface MonitorCardProps {
  monitor: MonitorWithState;
  onRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

export default function MonitorCard({ monitor, onRun, onEdit, onDelete, onToggle }: MonitorCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-900">{monitor.name}</h3>
            <StatusBadge status={monitor.current_status} />
          </div>
          <p className="mt-1 max-w-3xl break-all text-sm text-zinc-500">{monitor.url}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {monitor.method} • Expected {monitor.expected_status} • {monitor.interval_minutes}m •
            <span className={monitor.is_active ? "text-emerald-600" : "text-zinc-500"}>
              {monitor.is_active ? " active" : " paused"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={onRun}>
            Run
          </button>
          <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={onEdit}>
            Edit
          </button>
          <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={onToggle}>
            {monitor.is_active ? "Pause" : "Resume"}
          </button>
          <button className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-600" onClick={onDelete}>
            Delete
          </button>
          <Link className="rounded-lg border px-3 py-1.5 text-sm" href={`/monitors/${monitor.id}`}>
            Details
          </Link>
        </div>
      </div>
      <p className="mt-2 text-sm text-zinc-600">Last response: {formatResponseTime(monitor.current_response_time_ms)}</p>
    </article>
  );
}
