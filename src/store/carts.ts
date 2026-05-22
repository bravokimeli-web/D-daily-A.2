import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  slug: string;
  variant?: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (slug: string, variant?: string) => void;
  setQty: (slug: string, qty: number, variant?: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

const matchesItem = (item: CartItem, slug: string, variant?: string) =>
  item.slug === slug && item.variant === variant;

export const useCart = create<CartState>()(
  persist(
    (set) => ({

      items: [],
      isOpen: false,
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => matchesItem(i, item.slug, item.variant));
          if (existing) {
            return {
              items: s.items.map((i) =>
                matchesItem(i, item.slug, item.variant) ? { ...i, qty: i.qty + qty } : i
              ),
              isOpen: true,
            };
          }
          return { items: [...s.items, { ...item, qty }], isOpen: true };
        }),
      remove: (slug, variant) =>
        set((s) => ({ items: s.items.filter((i) => !matchesItem(i, slug, variant)) })),
      setQty: (slug, qty, variant) =>
        set((s) => ({
          items: s.items.map((i) =>
            matchesItem(i, slug, variant) ? { ...i, qty: Math.max(1, qty) } : i
          ),
        })),

      clear: () => set({ items: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    { name: "ddaily-cart" },
  ),
);

export const cartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return { subtotal, count };
};
