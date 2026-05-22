"use client";

import { useState, useEffect } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";

export type ResellerTrackData = {
  full_name: string;
  status: "pending" | "approved" | "rejected";
  applied_at: string;
  reviewed_at: string | null;
  message: string;
};

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function TrackResellerApplication({ initialEmail }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail ?? "");
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResellerTrackData | null>(null);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData(null);
    const trimmed = email.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const u = new URL(`${getApiBaseUrl()}/reseller/track`);
      u.searchParams.set("email", trimmed);
      const res = await fetch(u.toString());
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json.message === "string" ? json.message : "Could not look up your application.");
        return;
      }
      if (json.success && json.data) setData(json.data as ResellerTrackData);
      else setError("Unexpected response from server.");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon =
    data?.status === "approved" ? CheckCircle2 : data?.status === "rejected" ? XCircle : Clock;

  const statusColor =
    data?.status === "approved"
      ? "text-green-600"
      : data?.status === "rejected"
        ? "text-destructive"
        : "text-amber-600";

  return (
    <div className="space-y-4">
      <form onSubmit={lookup} className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label className="sr-only" htmlFor="track-email">
          Application email
        </label>
        <input
          id="track-email"
          type="email"
          autoComplete="email"
          placeholder="Email you used when applying"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" disabled={loading} className="h-11 shrink-0 rounded-full px-6">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Checking…
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Check status
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {data && (
        <div className="rounded-2xl border bg-card p-5 shadow-soft space-y-3">
          <div className="flex items-start gap-3">
            <StatusIcon className={`h-8 w-8 shrink-0 mt-0.5 ${statusColor}`} />
            <div className="min-w-0">
              <p className="font-display text-lg font-bold text-foreground">{data.full_name}</p>
              <p className="text-sm font-semibold capitalize mt-1">
                Status:{" "}
                <span className={statusColor}>
                  {data.status === "pending" && "Under review"}
                  {data.status === "approved" && "Approved"}
                  {data.status === "rejected" && "Not approved"}
                </span>
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.message}</p>
          <dl className="grid gap-2 text-xs text-muted-foreground border-t border-border pt-3">
            <div className="flex justify-between gap-4">
              <dt>Submitted</dt>
              <dd className="font-medium text-foreground text-right">{formatWhen(data.applied_at)}</dd>
            </div>
            {data.reviewed_at && (
              <div className="flex justify-between gap-4">
                <dt>Last update</dt>
                <dd className="font-medium text-foreground text-right">{formatWhen(data.reviewed_at)}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
