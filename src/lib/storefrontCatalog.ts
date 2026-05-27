import { unstable_cache } from "next/cache";
import type { Product, Category } from "@/data/products";
import { products as staticCatalogProducts, getProduct } from "@/data/products";
import { getApiBaseUrl } from "@/lib/env";

const REVALIDATE = Number(process.env.NEXT_PUBLIC_REVALIDATE_SECONDS ?? 300);

/**
 * Built-in catalog (data/products.ts) plus live API products.
 * Same slug: API version wins so admin can override a built-in item.
 */
export function mergeStaticAndApiProducts(apiList: Product[]): Product[] {
  const bySlug = new Map<string, Product>();
  for (const p of staticCatalogProducts) {
    bySlug.set(p.slug, p);
  }
  for (const p of apiList) {
    bySlug.set(p.slug, p);
  }

  const ordered: Product[] = [];
  const seen = new Set<string>();

  for (const p of staticCatalogProducts) {
    ordered.push(bySlug.get(p.slug)!);
    seen.add(p.slug);
  }
  for (const p of apiList) {
    if (!seen.has(p.slug)) {
      ordered.push(p);
      seen.add(p.slug);
    }
  }
  return ordered;
}

export type ApiProductRow = {
  slug: string;
  name: string;
  price: number | null;
  category: string;
  image: string;
  tagline?: string;
  description?: string;
  usage?: string[];
  safety?: string[];
  specs?: { label: string; value: string }[];
  badge?: string;
  originalPrice?: number;
  images?: string[];
  video?: string;
  variants?: { id: string; label: string; price: number; originalPrice?: number }[];
  imageVariants?: Product["imageVariants"];
};

export function mapApiProductToStorefront(p: ApiProductRow): Product {
  return {
    slug: p.slug,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    category: p.category as Category,
    image: p.image,
    tagline: p.tagline ?? "",
    description: p.description ?? "",
    usage: Array.isArray(p.usage) ? p.usage : [],
    safety: Array.isArray(p.safety) ? p.safety : [],
    specs: Array.isArray(p.specs) ? p.specs : [],
    badge: p.badge,
    images: p.images,
    video: p.video,
    variants: p.variants,
    imageVariants: p.imageVariants,
  };
}

export type StorefrontCatalog = {
  products: Product[];
  apiAvailable: boolean;
};

async function fetchApiProducts(): Promise<StorefrontCatalog> {
  let apiList: Product[] = [];
  let apiAvailable = false;
  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/products?active=true`, {
      next: { revalidate: REVALIDATE },
    });
    if (res.ok) {
      const json = (await res.json()) as { data?: ApiProductRow[] };
      apiList = (json.data ?? []).map(mapApiProductToStorefront);
      apiAvailable = true;
    }
  } catch {
    /* offline — static catalog still renders */
  }
  return { products: mergeStaticAndApiProducts(apiList), apiAvailable };
}

async function fetchHomepageProducts(): Promise<StorefrontCatalog> {
  let apiList: Product[] = [];
  let apiAvailable = false;

  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/homepage-products`, {
      next: { revalidate: REVALIDATE },
    });
    if (res.ok) {
      const json = (await res.json()) as { success?: boolean; data?: ApiProductRow[] };
      if (json.success && Array.isArray(json.data)) {
        apiList = json.data.map(mapApiProductToStorefront);
        apiAvailable = true;
      }
    }
  } catch {
    /* offline — static catalog still renders */
  }

  return { products: mergeStaticAndApiProducts(apiList), apiAvailable };
}

export const getStorefrontProducts = unstable_cache(
  fetchApiProducts,
  ["storefront-catalog"],
  { revalidate: REVALIDATE, tags: ["products"] },
);

export const getHomepageStorefrontProducts = unstable_cache(
  fetchHomepageProducts,
  ["homepage-storefront"],
  { revalidate: REVALIDATE, tags: ["homepage-products"] },
);

export async function fetchActiveStorefrontProducts(): Promise<Product[]> {
  const catalog = await fetchStorefrontCatalog();
  return catalog.products;
}

export async function fetchStorefrontCatalog(): Promise<StorefrontCatalog> {
  if (typeof window === "undefined") {
    return getStorefrontProducts();
  }
  return fetchApiProducts();
}

export async function fetchStorefrontProductOrStatic(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE },
    });
    if (res.ok) {
      const json = (await res.json()) as { success?: boolean; data?: ApiProductRow };
      if (json.success && json.data) return mapApiProductToStorefront(json.data);
    }
  } catch {
    /* fall through */
  }
  return getProduct(slug) ?? null;
}

export async function getProductPageData(slug: string) {
  const product = await fetchStorefrontProductOrStatic(slug);
  if (!product) return null;

  const allMerged = await fetchActiveStorefrontProducts();
  const related = allMerged
    .filter((p) => p.slug !== product.slug && p.category === product.category && p.price)
    .slice(0, 4);

  return { product, related };
}
