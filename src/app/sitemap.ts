import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { getStorefrontProducts } from "@/lib/storefrontCatalog";

const STATIC_ROUTES = [
  "",
  "/shop",
  "/categories",
  "/cart",
  "/checkout",
  "/about",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/safety",
  "/reseller",
  "/reseller/track",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getStorefrontProducts();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/shop" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
