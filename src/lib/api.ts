/**
 * D-Daily API Client
 * Thin wrapper around fetch for communicating with the Express backend.
 */
import { getApiBaseUrl } from "@/lib/env";

export { getApiBaseUrl };

/**
 * Image URL for `<img src>`.
 * - Absolute `http(s)://` and `data:` / `blob:` pass through.
 * - `/uploads/...` is served by the API host (not the static frontend).
 * - Other paths (`/assets/...` from Vite, bundled imports, `/public`) stay same-origin on the storefront.
 */
export function resolveMediaUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith("data:") || pathOrUrl.startsWith("blob:")) return pathOrUrl;
  if (pathOrUrl.startsWith("/uploads/")) {
    const base = getApiBaseUrl().replace(/\/api\/?$/, "").replace(/\/+$/, "");
    return `${base}${pathOrUrl}`;
  }
  return pathOrUrl;
}

const BASE_URL = getApiBaseUrl();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "API error");
  return data;
}

// ─── Products ──────────────────────────────────────────────────────────────────

export interface Product {
  _id: string;
  slug: string;
  name: string;
  price: number | null;
  category: string;
  image: string;
  tagline: string;
  description: string;
  usage: string[];
  safety: string[];
  specs: { label: string; value: string }[];
  badge?: string;
  stock: number;
  isActive: boolean;
}

export const productsApi = {
  getAll: (params?: { category?: string; search?: string; active?: boolean }) => {
    const p = new URLSearchParams();
    if (params?.category) p.set("category", params.category);
    if (params?.search) p.set("search", params.search);
    if (params?.active !== undefined) p.set("active", String(params.active));
    const qs = p.toString();
    return request<{ success: boolean; data: Product[] }>(`/products${qs ? `?${qs}` : ""}`);
  },
  getBySlug: (slug: string) =>
    request<{ success: boolean; data: Product }>(`/products/${slug}`),
  getHomepage: () => request<{ success: boolean; data: Product[] }>("/homepage-products"),
  getCategories: () => request<{ success: boolean; data: string[] }>("/categories"),
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  slug: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface CreateOrderPayload {
  customer: {
    name: string;
    phone?: string;
    email?: string;
    city: string;
    address: string;
  };
  items: OrderItem[];
  courier?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    order: { id: string; orderNumber: string; total: number; status: string };
    payment: { authorizationUrl: string; reference: string; accessCode: string };
  };
}

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    request<CreateOrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verify: (reference: string) =>
    request<{ success: boolean; data: { orderNumber: string; status: string; total: number; paidAt: string } }>(
      `/orders/verify/${reference}`
    ),

  getByOrderNumber: (orderNumber: string) =>
    request<{ success: boolean; data: unknown }>(`/orders/${orderNumber}`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; data: { token: string; admin: { name: string; email: string; role: string } } }>(
      "/admin/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  getDashboard: (token: string) =>
    request<{ success: boolean; data: unknown }>("/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
