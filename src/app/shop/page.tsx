import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopView } from "@/views/shop-view";
import { CatalogApiBanner } from "@/components/commerce/catalog-api-banner";
import { getStorefrontProducts } from "@/lib/storefrontCatalog";
import { shopMetadata } from "@/lib/metadata";

type Props = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  return shopMetadata(params.category, params.q);
}

export default async function ShopPage() {
  const { products: initialProducts, apiAvailable } = await getStorefrontProducts();

  return (
    <>
      <CatalogApiBanner apiAvailable={apiAvailable} />
      <Suspense fallback={<div className="container-px mx-auto max-w-7xl py-16 text-muted-foreground">Loading shop…</div>}>
        <ShopView initialProducts={initialProducts} />
      </Suspense>
    </>
  );
}
