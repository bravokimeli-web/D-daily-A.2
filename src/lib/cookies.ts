const COOKIE_NAME = "analytics_consent";

export const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const setCookie = (name: string, value: string, days = 365) => {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; sameSite=Lax${secure}`;
};

export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; sameSite=Lax`;
};

export const getAnalyticsConsent = () => getCookie(COOKIE_NAME);

export const setAnalyticsConsent = (value: "granted" | "denied") => {
  setCookie(COOKIE_NAME, value, 365);
};

export const hasAnalyticsConsent = () => getAnalyticsConsent() === "granted";
