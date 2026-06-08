import { ReactNode } from "react";

interface StatusBadgeProps {
  status: "healthy" | "degraded" | "down" | "unknown";
}

const statusMap: Record<StatusBadgeProps["status"], string> = {
  healthy: "bg-emerald-100 text-emerald-700",
  degraded: "bg-amber-100 text-amber-700",
  down: "bg-rose-100 text-rose-700",
  unknown: "bg-zinc-100 text-zinc-600",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const labels: Record<StatusBadgeProps["status"], ReactNode> = {
    healthy: "Healthy",
    degraded: "Degraded",
    down: (
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
        </span>
        Down
      </span>
    ),
    unknown: "Unknown",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusMap[status]}`}
      aria-live="polite"
    >
      {labels[status]}
    </span>
  );
}
