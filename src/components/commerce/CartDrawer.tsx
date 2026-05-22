"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart, cartTotals } from "@/store/carts";
import { formatKES } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export function CartDrawer() {
  const { items, isOpen, setOpen, setQty, remove, clear } = useCart();
  const { subtotal, count } = cartTotals(items);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="font-display text-xl">Your cart {count > 0 && <span className="text-muted-foreground font-normal">({count})</span>}</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
            <div className="h-16 w-16 rounded-full bg-primary-soft flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-primary" />
            </div>
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Browse our trusted essentials and add your first item.</p>
            <Button asChild className="mt-2" onClick={() => setOpen(false)}>
              <Link href="/shop">Shop products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((i) => (
                <div key={`${i.slug}-${i.variant ?? "default"}`} className="flex gap-3">
                  <img src={i.image} alt={i.name} className="h-20 w-20 rounded-lg object-cover bg-surface border" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm leading-snug line-clamp-2">{i.name}</div>
                    {i.variant && <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">{i.variant}</div>}
                    <div className="text-sm text-muted-foreground mt-1">{formatKES(i.price)}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center border rounded-full">
                        <button type="button" onClick={() => setQty(i.slug, i.qty - 1, i.variant)} className="p-1.5 hover:text-primary" aria-label="Decrease quantity">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-sm tabular-nums">{i.qty}</span>
                        <button type="button" onClick={() => setQty(i.slug, i.qty + 1, i.variant)} className="p-1.5 hover:text-primary" aria-label="Increase quantity">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button type="button" onClick={() => remove(i.slug, i.variant)} aria-label="Remove item" className="text-muted-foreground hover:text-destructive ml-auto">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t px-6 py-5 space-y-3 bg-surface">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatKES(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Shipping calculated at checkout.</p>
              <div className="grid gap-3">
                <Button type="button" onClick={() => { clear(); }} variant="outline" className="w-full h-12 rounded-full text-base">
                  Clear cart
                </Button>
                <Button asChild className="w-full h-12 rounded-full text-base" onClick={() => setOpen(false)}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
