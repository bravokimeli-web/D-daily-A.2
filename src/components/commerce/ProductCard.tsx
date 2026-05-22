"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { formatKES } from "@/data/products";
import { resolveMediaUrl } from "@/lib/api";
import { useCart } from "@/store/carts";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { ShoppingBag } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const imageSrc = resolveMediaUrl(String(product.image));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.35 }}
      className="group relative flex flex-col rounded-2xl bg-card border border-border/60 overflow-hidden hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-surface no-underline">
        <ProductImage
          src={imageSrc}
          alt={`${product.name} - ${product.tagline || product.category}`}
          variants={product.imageVariants}
          className="h-full w-full group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
            {product.badge}
          </span>
        )}
      </Link>
      <div className="flex-1 p-4 flex flex-col gap-2">
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
          {product.price && (
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
        </div>
      </div>
    </motion.div>
  );
}
