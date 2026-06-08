export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export const monitorMethods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export type MonitorStatus = "healthy" | "degraded" | "down" | "unknown";
export type StatusSeverity = "good" | "warning" | "critical" | "neutral";

export type IncidentStatus = "open" | "resolved";

export interface Monitor {
  id: string;
  workspace_id: string;
  name: string;
  url: string;
  method: HttpMethod;
  expected_status: number;
  interval_minutes: number;
  is_active: boolean;
  headers?: string | null;
  created_at: string;
  updated_at: string;
  last_checked_at?: string | null;
  next_check_at?: string | null;
  consecutive_failures?: number;
}

export interface MonitorPayload {
  name: string;
  url: string;
  method: HttpMethod;
  expected_status: number;
  interval_minutes: number;
  is_active: boolean;
  headers?: string | null;
}

export interface CheckRecord {
  id: string;
  monitor_id: string;
  status: MonitorStatus;
  status_code: number | null;
  response_time_ms: number;
  error_message: string | null;
  checked_at: string;
}

export interface IncidentRecord {
  id: string;
  monitor_id: string;
  started_at: string;
  resolved_at: string | null;
  reason: string | null;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
}

export interface MonitorWithState extends Monitor {
  last_check: CheckRecord | null;
  current_status: MonitorStatus;
  current_response_time_ms: number | null;
}

export interface MonitorsResponse {
  monitors: MonitorWithState[];
  summary: {
    totalMonitors: number;
    activeMonitors: number;
    healthy: number;
    degraded: number;
    down: number;
    unknown: number;
    averageResponseMs: number | null;
  };
}

export interface IncidentWithMonitor extends IncidentRecord {
  monitors: {
    name: string;
  } | null;
}

export interface DashboardHistoryPoint {
  timestamp: string;
  label: string;
  status: MonitorStatus;
  status_code: number | null;
  response_time_ms: number;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
  stripe_customer_id?: string | null;
  subscription_status?: string | null;
  subscription_id?: string | null;
}
