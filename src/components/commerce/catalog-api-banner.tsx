"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/** Same UX as legacy shop page when the API is unreachable. */
export function CatalogApiBanner({ apiAvailable }: { apiAvailable: boolean }) {
  useEffect(() => {
    if (!apiAvailable) {
      toast.error("Could not reach the server. Showing built-in catalog only.");
    }
  }, [apiAvailable]);

  if (apiAvailable) return null;

  return (
    <div
      role="status"
      className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
    >
      Live inventory is temporarily unavailable. You are viewing our built-in catalog — checkout may still work when the server is back.
    </div>
  );
}
