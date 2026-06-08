export const formatStatus = (status: string | null | undefined) => {
  if (!status) return "Unknown";
  if (status === "healthy") return "Healthy";
  if (status === "degraded") return "Degraded";
  if (status === "down") return "Down";
  return "Unknown";
};

export const statusColorClass = (status: string) => {
  if (status === "healthy") return "bg-emerald-100 text-emerald-700";
  if (status === "degraded") return "bg-amber-100 text-amber-700";
  if (status === "down") return "bg-rose-100 text-rose-700";
  return "bg-zinc-100 text-zinc-700";
};

export const severityLabel = (status: string) => {
  if (status === "healthy") return "good";
  if (status === "degraded") return "warning";
  if (status === "down") return "critical";
  return "neutral";
};

export const formatResponseTime = (ms: number | null) => {
  if (ms === null) return "--";
  return `${ms.toFixed(0)}ms`;
};

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
