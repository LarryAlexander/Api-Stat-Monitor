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
    down: "Down",
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
