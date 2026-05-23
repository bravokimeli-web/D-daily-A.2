import type { Metadata } from "next";
import type { Product } from "@/data/products";
import { absoluteUrl, SITE_URL } from "@/lib/env";
import { resolveMediaUrl } from "@/lib/api";

export const SITE_NAME = "D-Daily Ltd";
const DEFAULT_IMAGE = "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/hero-sction_cvgwxl";
const DEFAULT_TWITTER = "@ddailykenya01";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  robots?: Metadata["robots"];
  noIndex?: boolean;
};

export function buildPageMetadata(input: PageMetaInput): Metadata {
  const url = absoluteUrl(input.path);
  const image = absoluteUrl(input.image ?? DEFAULT_IMAGE);

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: input.noIndex
      ? { index: false, follow: false }
      : (input.robots ?? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }),
    openGraph: {
      type: input.type ?? "website",
      locale: "en_KE",
      url,
      siteName: SITE_NAME,
      title: input.title,
      description: input.description,
      images: [{ url: image, alt: input.imageAlt ?? input.title }],
    },
    twitter: {
      card: "summary_large_image",
      site: DEFAULT_TWITTER,
      creator: DEFAULT_TWITTER,
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

export function homeMetadata(): Metadata {
  return buildPageMetadata({
    title: `${SITE_NAME} — Trusted Home, Farm & Pest Protection in Kenya`,
    description:
      "Premium pest control, lighting, home protection, and farm protection essentials. Fast delivery across Kenya with M-PESA payments.",
    path: "/",
    keywords: [
      "pest control",
      "lighting",
      "home protection",
      "farm protection",
      "Kenya",
      "M-PESA",
      "online shopping",
    ],
    imageAlt: "D-Daily Ltd hero banner",
  });
}

export function staticPageMetadata(
  title: string,
  description: string,
  path: string,
  keywords: string[] = [],
): Metadata {
  return buildPageMetadata({
    title: `${title} — ${SITE_NAME}`,
    description,
    path,
    keywords,
    imageAlt: `${title} — ${SITE_NAME}`,
  });
}

export function shopMetadata(category?: string, query?: string): Metadata {
  const title = category
    ? `${category.replace("-", " ")} products | ${SITE_NAME}`
    : `Shop | ${SITE_NAME} — Lighting, Home & Farm Protection`;
  const description = category
    ? `Shop ${category.replace("-", " ")} products from D-Daily Ltd. Fast delivery in Kenya and M-PESA-friendly checkout.`
    : "Browse our complete range of pest control, lighting, home and farm protection products. Fast delivery across Kenya.";
  const keywords = ["shop", "buy", "Kenya", "fast delivery", "M-PESA"];
  if (category) keywords.push(category.replace("-", " "));
  if (query) keywords.push(query);

  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (query) params.set("q", query);
  const qs = params.toString();

  return buildPageMetadata({
    title,
    description,
    path: `/shop${qs ? `?${qs}` : ""}`,
    keywords,
    imageAlt: `Shop products at ${SITE_NAME}`,
  });
}

export function productMetadata(product: Product): Metadata {
  const path = `/product/${product.slug}`;
  const imagePath = product.imageVariants?.webp ?? product.image ?? DEFAULT_IMAGE;
  const image = resolveMediaUrl(String(imagePath));
  const absoluteImage = image.startsWith("http") ? image : absoluteUrl(image);

  return {
    ...buildPageMetadata({
      title: `${product.name} | ${SITE_NAME}`,
      description: (product.tagline || product.description).slice(0, 160),
      path,
      keywords: [product.name, product.category, "Kenya", "buy online", "fast delivery"],
      image: absoluteImage,
      imageAlt: product.name,
    }),
    openGraph: {
      type: "website",
      locale: "en_KE",
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      title: `${product.name} | ${SITE_NAME}`,
      description: (product.tagline || product.description).slice(0, 160),
      images: [{ url: absoluteImage, alt: product.name }],
    },
  };
}

export function productJsonLd(product: Product) {
  const path = `/product/${product.slug}`;
  const imagePath = product.imageVariants?.webp ?? product.image ?? DEFAULT_IMAGE;
  const image = resolveMediaUrl(String(imagePath));
  const absoluteImage = image.startsWith("http") ? image : absoluteUrl(image);
  const price = product.price ?? product.variants?.[0]?.price ?? 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [absoluteImage],
    description: product.tagline || product.description,
    sku: product.slug,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(path),
      priceCurrency: "KES",
      price,
      availability:
        price > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/Ddaily-logo_iefzvg",
    description:
      "D-Daily Ltd is a Kenyan retailer of pest control, lighting, home protection and farm protection essentials.",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+254106555333",
        contactType: "Customer Service",
        areaServed: "KE",
        availableLanguage: "English",
      },
    ],
    sameAs: ["https://www.instagram.com/ddailykenya01?igsh=cm5wd3FpbXhoenRu"],
  };
}
