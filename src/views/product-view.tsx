"use client";

import Link from "next/link";
import { useState } from "react";
import { formatKES, type Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/carts";
import { Truck, ShieldCheck, Smartphone, Minus, Plus, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ProductImage } from "@/components/ui/product-image";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/api";

type ProductViewProps = {
  product: Product;
  related: Product[];
};

export function ProductView({ product, related }: ProductViewProps) {
  const [qty, setQty] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const defaultVariant = product.variants?.[0];
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id ?? "");
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId) ?? defaultVariant;
  const add = useCart((s) => s.add);
  const cartItem = useCart((s) =>
    s.items.find((item) => item.slug === product.slug && item.variant === selectedVariant?.label),
  );
  const currentCartQty = cartItem?.qty ?? 0;
  const totalPrice = (selectedVariant?.price ?? product.price ?? 0) * qty;

  const primaryImage = resolveMediaUrl(String(product.image));
  const allImagesRaw = product.images && product.images.length > 0 ? product.images : [product.image];
  const allImages = allImagesRaw.map((img) => resolveMediaUrl(String(img)));
  const mediaItems: Array<{ type: "image" | "video"; src: string }> = [
    ...allImages.map((src) => ({ type: "image" as const, src })),
    ...(product.video ? [{ type: "video" as const, src: resolveMediaUrl(product.video) }] : []),
  ];
  const selected = mediaItems[selectedMedia] ?? mediaItems[0];

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice;
  const selectedVariantLabel = selectedVariant?.label;

  const handleAdd = () => {
    if (!displayPrice) return;
    add(
      {
        slug: product.slug,
        variant: selectedVariantLabel,
        name: selectedVariantLabel ? `${product.name} (${selectedVariantLabel})` : product.name,
        price: displayPrice,
        image: selected?.type === "image" ? selected.src : allImages[0] ?? primaryImage,
      },
      qty,
    );
    toast.success(`${product.name} added to cart!`, {
      description: "Ready to checkout or keep shopping?",
      action: {
        label: "Continue shopping",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="pb-32 md:pb-12">
      <div className="container-px mx-auto max-w-7xl py-6 text-sm text-muted-foreground flex items-center gap-1.5">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <div className="container-px mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl bg-surface overflow-hidden relative">
            {selected?.type === "video" ? (
              <video src={selected.src} controls className="h-full w-full object-cover" />
            ) : (
              <ProductImage
                src={selected?.src ?? allImages[0]}
                alt={product.name}
                variants={product.imageVariants}
                priority={selectedMedia === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
          </div>
          {mediaItems.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {mediaItems.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedMedia(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedMedia === index ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  {item.type === "video" ? (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-xs font-medium">Video</div>
                  ) : (
                    <ProductImage src={item.src} alt={`${product.name} ${index + 1}`} sizes="80px" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.badge && (
            <span className="inline-block px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
              {product.badge}
            </span>
          )}
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>
          <p className="mt-3 text-muted-foreground text-lg">{product.tagline}</p>
          {product.variants && product.variants.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    selectedVariantId === variant.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/70"
                  }`}
                >
                  {variant.label}
                </button>
              ))}
            </div>
          )}
          <div className="mt-6 font-display text-3xl font-bold">
            {displayPrice ? (
              <div className="flex items-center gap-3">
                {formatKES(displayPrice)}
                {displayOriginalPrice && (
                  <span className="text-lg text-muted-foreground line-through">{formatKES(displayOriginalPrice)}</span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground text-xl">Coming soon</span>
            )}
          </div>

          {currentCartQty > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-sm text-primary">
              In cart: {currentCartQty} item{currentCartQty === 1 ? "" : "s"}
            </div>
          )}

          {product.price && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center border rounded-full">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-3 hover:text-primary"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-3 font-medium tabular-nums w-8 text-center">{qty}</span>
                <button type="button" onClick={() => setQty(qty + 1)} className="p-3 hover:text-primary" aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                type="button"
                size="lg"
                className="flex-1 rounded-full h-12 hidden md:inline-flex"
                onClick={handleAdd}
                aria-label={`Add ${qty} ${product.name} to cart`}
              >
                Add {qty} to cart
              </Button>
            </div>
          )}

          {currentCartQty > 0 && (
            <div className="mt-4 flex gap-3">
              <Button asChild variant="outline" size="lg" className="flex-1 rounded-full">
                <Link href="/shop">Continue shopping</Link>
              </Button>
              <Button asChild size="lg" className="flex-1 rounded-full">
                <Link href="/cart">View cart</Link>
              </Button>
            </div>
          )}

          <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
            {[
              { icon: Truck, t: "Nationwide" },
              { icon: ShieldCheck, t: "Quality assured" },
              { icon: Smartphone, t: "Easy payment" },
            ].map((b) => (
              <div key={b.t} className="p-3 rounded-xl bg-surface border border-border/60 text-center">
                <b.icon className="h-4 w-4 mx-auto text-primary" />
                <div className="mt-1 font-medium">{b.t}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-6 text-sm leading-relaxed">
            <Section title="Description">
              <p>{product.description}</p>
            </Section>
            <Section title="How to use">
              <ul className="list-disc pl-5 space-y-1">
                {product.usage.map((u: string) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </Section>
            <Section title="Safety precautions">
              <ul className="list-disc pl-5 space-y-1">
                {product.safety.map((u: string) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </Section>
            <Section title="Specifications">
              <dl className="grid grid-cols-2 gap-y-2">
                {product.specs.map((s: { label: string; value: string }) => (
                  <div key={s.label} className="contents">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="container-px mx-auto max-w-7xl mt-20">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard product={p} key={p.slug} />
            ))}
          </div>
        </div>
      )}

      {product.price && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 z-30">
          {currentCartQty > 0 ? (
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1 rounded-full h-11">
                <Link href="/shop">Continue shopping</Link>
              </Button>
              <Button asChild className="flex-1 rounded-full h-11">
                <Link href="/cart">View cart ({currentCartQty})</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="font-bold">{formatKES(totalPrice)}</div>
              </div>
              <Button className="flex-1 rounded-full h-11" onClick={handleAdd} aria-label={`Add ${qty} items to cart`}>
                Add to cart
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display font-bold text-base mb-2">{title}</h3>
      <div className="text-foreground/80">{children}</div>
    </div>
  );
}
