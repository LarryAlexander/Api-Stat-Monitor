"use client";

import { useState } from "react";
import { Workspace } from "@/lib/models";
import TopNav from "@/components/layout/top-nav";

interface BillingClientProps {
  initialWorkspace: Workspace;
  monitorCount: number;
}

export default function BillingClient({ initialWorkspace, monitorCount }: BillingClientProps) {
  const [workspace] = useState<Workspace>(initialWorkspace);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = workspace.subscription_status === "active";
  const limit = 3;
  const usagePercent = isPro ? 0 : Math.min(100, (monitorCount / limit) * 100);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Unable to start checkout session.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Unable to open billing portal.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <TopNav />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Billing & Plans</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your subscriptions, usage limits, and Stripe details.</p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Current Plan Card */}
          <div className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">Current Subscription</h2>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isPro 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-zinc-100 text-zinc-600"
                }`}>
                  {isPro ? "Pro Plan" : "Free Plan"}
                </span>
              </div>
              
              <p className="text-zinc-500 text-sm mt-2">
                {isPro 
                  ? "Thank you for supporting PulseBoard! You have full access to unlimited monitors and high frequency checks."
                  : "You are currently using the free tier. Upgrade to the Pro plan for unlimited monitors and faster checks."
                }
              </p>

              {/* Usage Progress */}
              <div className="mt-6">
                <div className="flex justify-between text-xs font-medium text-zinc-500 mb-2">
                  <span>Monitors Used</span>
                  <span>{monitorCount} of {isPro ? "Unlimited" : limit}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPro 
                        ? "bg-emerald-500" 
                        : monitorCount >= limit 
                          ? "bg-rose-500" 
                          : "bg-zinc-800"
                    }`}
                    style={{ width: `${isPro ? (monitorCount > 0 ? 100 : 0) : usagePercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              {isPro ? (
                <button
                  onClick={handlePortal}
                  disabled={loading}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 shadow-sm transition disabled:opacity-50"
                >
                  {loading ? "Redirecting..." : "Manage Subscription"}
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 shadow-sm transition disabled:opacity-50"
                >
                  {loading ? "Redirecting..." : "Upgrade to Pro"}
                </button>
              )}
            </div>
          </div>

          {/* Plan Options Summary */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">PulseBoard Pro</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">$9</span>
                <span className="ml-1 text-sm font-semibold text-zinc-500">/month</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Simple, flat-rate pricing.</p>

              <ul className="mt-6 space-y-3 text-sm text-zinc-600">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unlimited active monitors</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>1-minute check frequency</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Webhook notifications</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
