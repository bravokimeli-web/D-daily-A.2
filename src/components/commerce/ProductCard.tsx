"use client";

import Link from "next/link";
import type { Product } from "@/data/products";
import { formatKES } from "@/data/products";
import { resolveMediaUrl } from "@/lib/api";
import { useCart } from "@/store/carts";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const imageSrc = resolveMediaUrl(String(product.image));
  const isSoldOut = (product as any).stock !== undefined && Number((product as any).stock) <= 0;
  const fit: "cover" | "contain" = "contain";

  return (
    <div className="group relative flex h-full min-h-0 flex-col rounded-2xl bg-card border border-border/60 overflow-hidden isolate transform-gpu will-change-[transform] backface-visibility-[hidden] hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">

      <Link
        href={`/product/${product.slug}`}
        className={cn(
          "relative block aspect-square overflow-hidden no-underline isolate transition-colors duration-300",
          fit === "contain" ? "bg-white dark:bg-zinc-900" : "bg-surface"
        )}
      >
        <ProductImage
          src={imageSrc}
          alt={`${product.name} - ${product.tagline || product.category}`}
          variants={product.imageVariants}
          fit={fit}
          className={cn(
            "h-full w-full group-hover:scale-105 transition-transform duration-500",
            fit === "contain" ? "p-3 sm:p-4" : ""
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
            {product.badge}
          </span>
        )}
      </Link>
      <div className="flex-1 min-h-0 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-1">{product.category.replace("-", " ")}</span>
        </div>
        <Link href={`/product/${product.slug}`} className="font-semibold leading-snug hover:text-primary transition-colors line-clamp-2 no-underline">
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2">{product.tagline}</p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="font-display font-bold text-lg">
            {product.price ? (
              <div className="flex items-center gap-2">
                {formatKES(product.price)}
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">{formatKES(product.originalPrice)}</span>
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Coming soon</span>
            )}
          </div>
          {product.price && !isSoldOut && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Add ${product.name} to cart`}
              onClick={() => add({ slug: product.slug, name: product.name, price: product.price!, image: imageSrc })}
              className="rounded-full hover:bg-primary hover:text-primary-foreground"
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          )}
          {isSoldOut && <span className="text-xs font-semibold text-amber-700">Sold out</span>}
        </div>
      </div>
    </div>
  );
}
