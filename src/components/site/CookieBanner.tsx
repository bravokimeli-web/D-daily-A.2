"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAnalyticsConsent, setAnalyticsConsent } from "@/lib/cookies";
import { initializeAnalytics, trackPageView } from "@/lib/analytics";

const BANNER_ID = "analytics-cookie-banner";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const consent = getAnalyticsConsent();
    if (consent === "granted") {
      initializeAnalytics();
      trackPageView(pathname);
      setShowBanner(false);
      return;
    }

    if (consent === "denied") {
      setShowBanner(false);
      return;
    }

    setShowBanner(true);
  }, [pathname]);

  const accept = () => {
    setAnalyticsConsent("granted");
    initializeAnalytics();
    trackPageView(pathname);
    setShowBanner(false);
  };

  const reject = () => {
    setAnalyticsConsent("denied");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      id={BANNER_ID}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg"
    >
      <div className="container-px mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm leading-relaxed text-foreground">
              We use cookies to give you the best possible experience while you browse through our website. By pursuing the use of our website you implicitly agree to the usage of cookies on this site.{" "}
              <Link href="/privacy" className="font-semibold underline hover:text-primary transition-colors">
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 sm:flex-nowrap">
            <button
              type="button"
              onClick={reject}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Preferences
            </button>
            <button
              type="button"
              onClick={accept}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
