/** Canonical storefront origin (no trailing slash). */
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ddaily.co.ke").replace(/\/+$/, "");

/** Production API when env is unset (Express `/api` routes). */
export const DEFAULT_PRODUCTION_API = "https://api.ddaily.co.ke/api";

export function getApiBaseUrl(): string {
  const rawInput = (process.env.NEXT_PUBLIC_API_URL as string | undefined)?.trim();

  const normalizeHttpBase = (s: string): string => {
    const base = s.replace(/\/+$/, "");
    if (base.endsWith("/api")) return base;
    return `${base}/api`;
  };

  if (process.env.NODE_ENV === "development") {
    if (!rawInput) return "/api";
    if (!/^https?:\/\//i.test(rawInput)) return "/api";
    return normalizeHttpBase(rawInput);
  }

  if (!rawInput || !/^https?:\/\//i.test(rawInput)) {
    return DEFAULT_PRODUCTION_API;
  }
  return normalizeHttpBase(rawInput);
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
