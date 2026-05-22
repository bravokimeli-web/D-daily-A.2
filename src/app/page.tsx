import { HomeView } from "@/views/home-view";
import { CatalogApiBanner } from "@/components/commerce/catalog-api-banner";
import { homeMetadata } from "@/lib/metadata";
import { getHomepageStorefrontProducts } from "@/lib/storefrontCatalog";

export const metadata = homeMetadata();

export default async function HomePage() {
  const { products: initialCatalog, apiAvailable } = await getHomepageStorefrontProducts();

  return (
    <>
      <CatalogApiBanner apiAvailable={apiAvailable} />
      <HomeView initialCatalog={initialCatalog} />
    </>
  );
}
