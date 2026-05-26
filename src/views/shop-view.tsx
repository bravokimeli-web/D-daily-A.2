"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { categories, type Category, type Product } from "@/data/products";
import { ProductCard } from "@/components/commerce/ProductCard";

const VALID_CATEGORIES = new Set<Category>(["lighting", "home-protection", "farm-protection", "fashion-design"]);

type ShopViewProps = {
  initialProducts: Product[];
};

function buildShopHref(category?: Category, q?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q?.trim()) params.set("q", q.trim());
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export function ShopView({ initialProducts }: ShopViewProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const cat =
    categoryParam && VALID_CATEGORIES.has(categoryParam as Category) ? (categoryParam as Category) : undefined;
  const searchQ = searchParams.get("q") ?? undefined;

  const [q, setQ] = useState(searchQ ?? "");

  useEffect(() => {
    setQ(searchQ ?? "");
  }, [searchQ]);

  const filtered = useMemo(() => {
    const query = (q.trim() || searchQ)?.trim();
    return initialProducts.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (query && !`${p.name} ${p.tagline}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [initialProducts, cat, q, searchQ]);

  const isFashionDesign = cat === "fashion-design";
  const query = q.trim() || searchQ;

  return (
    <div className="container-px mx-auto max-w-7xl py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Shop</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">{isFashionDesign ? "Fashion & Design" : "All products"}</h1>
        <p className="mt-3 text-muted-foreground">
          {isFashionDesign
            ? "Stylish products are arriving soon — stay tuned for our new fashion collection."
            : "Premium essentials, ready to ship across Kenya."}
        </p>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Link
          href={buildShopHref(undefined, searchQ)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!cat ? "bg-foreground text-background" : "bg-muted hover:bg-accent"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={buildShopHref(c.id, searchQ)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${cat === c.id ? "bg-foreground text-background" : "bg-muted hover:bg-accent"}`}
          >
            {c.name}
          </Link>
        ))}
        <div className="ml-auto flex w-full max-w-md items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="h-10 flex-1 rounded-full border border-input bg-card text-sm px-4 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Link
            href={buildShopHref(cat, q)}
            className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Search
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> product{filtered.length === 1 ? "" : "s"}
          {cat ? ` in ${categories.find((c) => c.id === cat)?.name}` : ""}
          {query ? ` for "${query}"` : ""}
        </p>
        {(cat || searchQ) && (
          <Link href="/shop" className="font-semibold text-primary hover:underline">
            Clear filters
          </Link>
        )}
      </div>

      {isFashionDesign && (
        <div className="mt-10 rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-primary">Fashion & Design</p>
          <h2 className="mt-4 text-3xl font-semibold">Something stylish is coming soon</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            We’re curating a fresh collection of design-led products for brands, creatives, and modern homes. Check back shortly
            for the launch.
          </p>
        </div>
      )}

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 auto-rows-fr">
        {filtered.map((p) => (
          <ProductCard product={p} key={p.slug} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg font-semibold text-foreground">
            {cat === "fashion-design" ? "Fashion & Design products are coming soon." : "No products match your filters."}
          </p>
          <p className="mt-2">
            {cat === "fashion-design"
              ? "We’re working on stylish products for this category. Browse our other collections while you wait."
              : "Try clearing category filters or searching with a different keyword."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/shop" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              View all products
            </Link>
            <Link
              href="/shop"
              className="rounded-full border border-input px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              Clear filters
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
