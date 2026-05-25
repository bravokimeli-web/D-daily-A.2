import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopView } from "@/views/shop-view";
import { CatalogApiBanner } from "@/components/commerce/catalog-api-banner";
import { getStorefrontProducts } from "@/lib/storefrontCatalog";
import { shopMetadata, shopBreadcrumbJsonLd } from "@/lib/metadata";

type Props = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  return shopMetadata(params.category, params.q);
}

export default async function ShopPage({ searchParams }: Props) {
  const { products: initialProducts, apiAvailable } = await getStorefrontProducts();
  const params = await searchParams;
  const breadcrumb = shopBreadcrumbJsonLd(params.category);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <CatalogApiBanner apiAvailable={apiAvailable} />
      <Suspense fallback={<div className="container-px mx-auto max-w-7xl py-16 text-muted-foreground">Loading shop…</div>}>
        <ShopView initialProducts={initialProducts} />
      </Suspense>
    </>
  );
}
