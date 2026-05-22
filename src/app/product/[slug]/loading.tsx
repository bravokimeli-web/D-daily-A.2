import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="container-px mx-auto max-w-7xl py-6 pb-32">
      <Skeleton className="h-4 w-48 mb-8" />
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-12 w-full rounded-full" />
          <div className="space-y-3 pt-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
