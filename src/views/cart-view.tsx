"use client";

import Link from "next/link";
import { useCart, cartTotals } from "@/store/carts";
import { formatKES } from "@/data/products";
import { Button } from "@/components/ui/button";

export function CartView() {
  const { items, setQty, remove } = useCart();
  const { subtotal } = cartTotals(items);

  return (
    <div className="container-px mx-auto max-w-5xl py-16">
      <h1 className="font-display text-4xl font-bold">Your cart</h1>
      {items.length === 0 ? (
        <div className="mt-10 text-center py-20 border rounded-2xl bg-card">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4 rounded-full">
            <Link href="/shop">Shop products</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((i) => (
              <div key={`${i.slug}-${i.variant ?? "default"}`} className="flex gap-4 p-4 rounded-2xl border bg-card">
                <img src={i.image} alt={i.name} className="h-24 w-24 rounded-xl object-cover bg-surface" />
                <div className="flex-1">
                  <div className="font-semibold">{i.name}</div>
                  {i.variant && <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{i.variant}</div>}
                  <div className="text-sm text-muted-foreground">{formatKES(i.price)}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={i.qty}
                      onChange={(e) => {
                        const nextQty = Number(e.target.value);
                        setQty(i.slug, Number.isFinite(nextQty) && nextQty > 0 ? nextQty : 1, i.variant);
                      }}
                      className="w-16 h-9 px-2 rounded border text-sm"
                    />
                    <button type="button" onClick={() => remove(i.slug, i.variant)} className="text-sm text-muted-foreground hover:text-destructive">
                      Remove
                    </button>
                  </div>
                </div>
                <div className="font-semibold">{formatKES(i.price * i.qty)}</div>
              </div>
            ))}
          </div>
          <aside className="rounded-2xl border bg-card p-6 h-fit space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatKES(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>Calculated next</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatKES(subtotal)}</span>
            </div>
            <Button asChild className="w-full rounded-full h-12">
              <Link href="/checkout">Checkout</Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
