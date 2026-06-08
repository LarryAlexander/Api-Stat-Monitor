"use client";

import { FormEvent, useState } from "react";
import { HttpMethod, Monitor, MonitorPayload, MonitorWithState, monitorMethods } from "@/lib/models";

interface MonitorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: MonitorPayload) => Promise<void>;
  defaults?: Monitor | MonitorWithState | null;
}

export default function MonitorFormModal({ isOpen, onClose, onSubmit, defaults }: MonitorFormModalProps) {
  const [name, setName] = useState(defaults?.name ?? "");
  const [url, setUrl] = useState(defaults?.url ?? "");
  const [method, setMethod] = useState<HttpMethod>(defaults?.method ?? "GET");
  const [expectedStatus, setExpectedStatus] = useState(String(defaults?.expected_status ?? 200));
  const [intervalMinutes, setIntervalMinutes] = useState(String(defaults?.interval_minutes ?? 5));
  const [headers, setHeaders] = useState(defaults?.headers ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload: MonitorPayload = {
      name,
      url,
      method,
      expected_status: Number.parseInt(expectedStatus, 10),
      interval_minutes: Number.parseInt(intervalMinutes, 10),
      is_active: defaults?.is_active ?? true,
      headers,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-zinc-950/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{defaults ? "Edit monitor" : "Add monitor"}</h2>
          <button onClick={onClose} className="rounded-md border px-2 py-1 text-sm">
            Close
          </button>
        </div>

        <form className="space-y-3" onSubmit={submit}>
          <label className="block text-sm">
            Service Name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            URL
            <input
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block text-sm">
              HTTP Method
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value as HttpMethod)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              >
                {monitorMethods.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Expected status
              <input
                type="number"
                required
                value={expectedStatus}
                onChange={(event) => setExpectedStatus(event.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              Check interval (minutes)
              <input
                type="number"
                required
                value={intervalMinutes}
                onChange={(event) => setIntervalMinutes(event.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block text-sm">
            Optional Headers (JSON)
            <textarea
              value={headers}
              onChange={(event) => setHeaders(event.target.value)}
              className="mt-1 h-28 w-full rounded-md border px-3 py-2 font-mono text-sm"
              placeholder='{"Authorization": "Bearer ..."}'
            />
          </label>
          {error && <p className="text-sm text-rose-700">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border px-3 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              {loading ? "Saving..." : "Save monitor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
