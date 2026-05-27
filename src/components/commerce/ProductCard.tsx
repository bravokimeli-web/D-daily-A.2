"use client";

import Link from "next/link";
import { useMemo, useState, type MouseEvent } from "react";
import type { Product } from "@/data/products";
import { formatKES } from "@/data/products";
import { resolveMediaUrl } from "@/lib/api";
import { useCart } from "@/store/carts";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const add = useCart((s) => s.add);
  const images = useMemo(
    () => [product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean),
    [product.image, product.images]
  );
  const imageCount = images.length;
  const imageSrc = resolveMediaUrl(String(images[currentIndex] ?? product.image));
  const isSoldOut = (product as any).stock !== undefined && Number((product as any).stock) <= 0;
  const containSlugs = new Set([
    "mosquito-window-net",
    "solar-ceiling-light-200w",
    "led-light-100w",
    "4-in-1-home-pest-control-kit",
  ]);
  const fit: "cover" | "contain" = containSlugs.has(product.slug) ? "contain" : "cover";

  const showCarousel = imageCount > 1;
  const handlePrevImage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentIndex((currentIndex) => (currentIndex - 1 + imageCount) % imageCount);
  };

  const handleNextImage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentIndex((currentIndex) => (currentIndex + 1) % imageCount);
  };

  return (
    <div className="group relative flex h-full min-h-0 flex-col rounded-2xl bg-card border border-border/60 overflow-hidden isolate transform-gpu will-change-[transform] backface-visibility-[hidden] hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">

      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-surface no-underline isolate">
        <ProductImage
          src={imageSrc}
          alt={`${product.name} - ${product.tagline || product.category}`}
          variants={product.imageVariants}
          fit={fit}
          className="h-full w-full group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {showCarousel && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label={`Previous image of ${product.name}`}
              className="pointer-events-auto rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label={`Next image of ${product.name}`}
              className="pointer-events-auto rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        {showCarousel && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] text-white">
            {currentIndex + 1}/{imageCount}
          </span>
        )}
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
