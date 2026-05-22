import { hasAnalyticsConsent } from "@/lib/cookies";

const isBrowser = typeof window !== "undefined";

export const initializeAnalytics = () => {
  if (!isBrowser || !hasAnalyticsConsent()) return;

  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || function () {
    w.dataLayer.push(arguments);
  };
};

export const trackPageView = (pathname?: string) => {
  if (!isBrowser || !hasAnalyticsConsent()) return;

  const pagePath = pathname ?? window.location.pathname;
  const w = window as any;
  if (typeof w.gtag === "function") {
    w.gtag("event", "page_view", {
      page_path: pagePath,
    });
  } else if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event: "page_view", page_path: pagePath });
  }
};
