"use client";

import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/products";
import { Lightbulb, Home, Leaf, Sparkles, Package } from "lucide-react";
import type { Product } from "@/data/products";
import { resolveMediaUrl } from "@/lib/api";
import { useMemo } from "react";

const categoryIcons = {
  lighting: Lightbulb,
  "home-protection": Home,
  "farm-protection": Leaf,
  "fashion-design": Sparkles,
} as const;

type CategoriesViewProps = {
  initialProducts: Product[];
};

export function CategoriesView({ initialProducts }: CategoriesViewProps) {
  const allCategories = useMemo(() => {
    const list = [...categories];
    const staticIds = new Set(categories.map((c) => c.id));
    for (const p of initialProducts) {
      if (p.category && !staticIds.has(p.category)) {
        staticIds.add(p.category);
        const name = p.category
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        list.push({
          id: p.category,
          name,
          description: `Browse products in ${name}`,
        });
      }
    }
    return list;
  }, [initialProducts]);

  return (
    <div className="container-px mx-auto max-w-7xl py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold">Categories</h1>
      <p className="mt-3 text-muted-foreground max-w-xl">Explore our product universe.</p>
      <div className="mt-10 grid md:grid-cols-2 gap-5">
        {allCategories.map((c) => {
          const items = initialProducts.filter((p) => p.category === c.id);
          const Icon = categoryIcons[c.id as keyof typeof categoryIcons] || Package;
          return (
            <Link
              key={c.id}
              href={`/shop?category=${c.id}`}
              className="group rounded-3xl bg-card border p-8 hover:border-primary/40 hover:shadow-soft transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-display text-2xl font-bold group-hover:text-primary">{c.name}</div>
              </div>
              <p className="mt-4 text-muted-foreground">{c.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {items.slice(0, 4).map((p) => (
                  <Image
                    key={p.slug}
                    src={resolveMediaUrl(String(p.image))}
                    alt={p.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-xl border-2 border-card object-cover bg-surface"
                  />
                ))}
              </div>
              <div className="mt-6 text-sm font-semibold text-muted-foreground">
                {items.length ? `${items.length} products available` : "Coming soon"}
              </div>
              <div className="mt-3 text-sm font-semibold text-primary">
                {items.length ? `Browse ${items.length} products →` : "Explore this category →"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
