import type { Metadata } from "next";
import { CategoriesView } from "@/views/categories-view";
import { CatalogApiBanner } from "@/components/commerce/catalog-api-banner";
import { getStorefrontProducts } from "@/lib/storefrontCatalog";
import { staticPageMetadata, categoriesBreadcrumbJsonLd } from "@/lib/metadata";

export const metadata: Metadata = staticPageMetadata(
  "Categories",
  "Explore D-Daily Ltd product categories and filter by lighting, home protection, farm protection, and fashion.",
  "/categories",
  ["categories", "lighting", "home protection", "farm protection", "fashion design", "Kenya"],
);

export default async function CategoriesPage() {
  const { products: initialProducts, apiAvailable } = await getStorefrontProducts();
  const breadcrumb = categoriesBreadcrumbJsonLd();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <CatalogApiBanner apiAvailable={apiAvailable} />
      <CategoriesView initialProducts={initialProducts} />
    </>
  );
}
