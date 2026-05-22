import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="container-px mx-auto max-w-7xl py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Product not found</h1>
      <p className="mt-3 text-muted-foreground">This product may have been removed or the link is incorrect.</p>
      <Button asChild className="mt-6">
        <Link href="/shop">Back to shop</Link>
      </Button>
    </div>
  );
}
