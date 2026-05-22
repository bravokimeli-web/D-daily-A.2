const ADMIN_EMAIL = "dandailybusiness02@gmail.com";
const ADMIN_EMAIL_COOKIE = "admin_email";

export const isAdminEmail = (email: string) => {
  return email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
};

export const getAdminEmail = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${ADMIN_EMAIL_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const setAdminEmail = (email: string) => {
  if (typeof document === "undefined") return;
  if (isAdminEmail(email)) {
    document.cookie = `${ADMIN_EMAIL_COOKIE}=${encodeURIComponent(email)}; path=/; max-age=${365 * 24 * 60 * 60}; sameSite=Lax`;
  }
};

export const clearAdminEmail = () => {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_EMAIL_COOKIE}=; path=/; max-age=0; sameSite=Lax`;
};

export const hasAdminAccess = () => {
  const adminEmail = getAdminEmail();
  return adminEmail && isAdminEmail(adminEmail);
};

export const ADMIN_EMAIL_PUBLIC = ADMIN_EMAIL;
