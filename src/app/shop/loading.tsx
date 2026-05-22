import { ProductGridSkeleton } from "@/components/ui/page-skeleton";

export default function ShopLoading() {
  return (
    <div className="container-px mx-auto max-w-7xl py-12 md:py-16">
      <div className="max-w-2xl space-y-3 mb-10">
        <div className="h-4 w-16 rounded bg-muted animate-pulse" />
        <div className="h-10 w-64 rounded bg-muted animate-pulse" />
        <div className="h-5 w-96 max-w-full rounded bg-muted animate-pulse" />
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
