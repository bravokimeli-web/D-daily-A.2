import { notFound } from "next/navigation";
import { ProductView } from "@/views/product-view";
import { productMetadata, productJsonLd } from "@/lib/metadata";
import { getProductPageData, getStorefrontProducts } from "@/lib/storefrontCatalog";

export const revalidate = 300;

export async function generateStaticParams() {
  const { products } = await getStorefrontProducts();
  return products.map((p) => ({ slug: p.slug }));
}

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const data = await getProductPageData(slug);
  if (!data) return { title: "Product not found" };
  return productMetadata(data.product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const data = await getProductPageData(slug);
  if (!data) notFound();

  const jsonLd = productJsonLd(data.product);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductView product={data.product} related={data.related} />
    </>
  );
}
