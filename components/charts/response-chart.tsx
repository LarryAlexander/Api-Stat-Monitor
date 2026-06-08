"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CheckPoint {
  checked_at: string;
  response_time_ms: number;
  status: string;
}

interface ResponseChartProps {
  data: CheckPoint[];
}

const statusToColor = (status: string) => {
  if (status === "healthy") return "#16a34a";
  if (status === "degraded") return "#f59e0b";
  return "#dc2626";
};

export default function ResponseChart({ data }: ResponseChartProps) {
  const chartData = data.map((check) => ({
    ...check,
    label: new Date(check.checked_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    stroke: statusToColor(check.status),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Line dataKey="response_time_ms" stroke="#1d4ed8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
