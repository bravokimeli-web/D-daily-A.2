"use client";

import Link from "next/link";
import { useCart, cartTotals } from "@/store/carts";
import { formatKES } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Smartphone, Truck, CheckCircle2, Loader2 } from "lucide-react";
import { FormEvent, InputHTMLAttributes, useState } from "react";
import { toast } from "sonner";
import { ordersApi } from "@/lib/api";

export function CheckoutView() {
  const { items, clear } = useCart();
  const { subtotal } = cartTotals(items);
  const [courier, setCourier] = useState("Swatin");
  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const hasRequiredInfo = Boolean(name.trim() && phone.trim() && city.trim() && address.trim());
  const canSubmit = items.length > 0 && hasRequiredInfo;

  if (placed) {
    return (
      <div className="container-px mx-auto max-w-xl py-24 text-center">
        <CheckCircle2 className="h-14 w-14 text-success mx-auto" />
        <h1 className="mt-5 font-display text-3xl font-bold">Order received!</h1>
        <p className="mt-2 text-muted-foreground">We'll send M-PESA STK push and confirm your order via SMS shortly.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  const place = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (items.length === 0) return toast.error("Your cart is empty.");
    if (!hasRequiredInfo) return toast.error("Please fill in all required fields.");

    setLoading(true);
    try {
      const res = await ordersApi.create({
        customer: { name, phone, email: email || undefined, city, address },
        items: items.map((i) => ({ slug: i.slug, name: i.name, price: i.price, qty: i.qty, image: i.image })),
        courier,
      });

      clear();
      window.location.href = res.data.payment.authorizationUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-px mx-auto max-w-6xl py-16">
      <h1 className="font-display text-4xl font-bold">Checkout</h1>
      <form onSubmit={place} className="mt-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section title="Contact">
            <Field
              id="checkout-name"
              label="Full name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={attemptedSubmit && !name}
            />
            <Field
              id="checkout-phone"
              label="Phone (M-PESA)"
              required
              type="tel"
              placeholder="07xx xxx xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={attemptedSubmit && !phone}
            />
            <Field
              id="checkout-email"
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Section>
          <Section title="Delivery">
            <Field
              id="checkout-city"
              label="Town / City"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-invalid={attemptedSubmit && !city}
            />
            <Field
              id="checkout-address"
              label="Address / Landmark"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              aria-invalid={attemptedSubmit && !address}
            />
            <div>
              <div className="text-sm font-medium mb-2">Courier partner</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Swatin", "Bolt", "G4S", "Fargo"].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCourier(c)}
                    className={`p-3 rounded-xl border text-sm font-medium transition ${courier === c ? "border-primary bg-primary-soft text-primary" : "hover:border-primary/40"}`}
                  >
                    <Truck className="h-4 w-4 mx-auto mb-1" />
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </Section>
          <Section title="Payment">
            <div className="p-4 rounded-2xl border bg-primary-soft/40 flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-semibold">M-PESA STK Push</div>
                <p className="text-sm text-muted-foreground">After placing the order, you'll receive a payment prompt on your phone.</p>
              </div>
            </div>
          </Section>
        </div>
        <aside className="rounded-2xl border bg-card p-6 h-fit space-y-3 sticky top-24">
          <div className="font-semibold">Order summary</div>
          {items.map((i) => (
            <div key={i.slug} className="flex justify-between text-sm">
              <span className="text-muted-foreground truncate pr-2">
                {i.name} × {i.qty}
              </span>
              <span>{formatKES(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatKES(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery ({courier})</span>
            <span>At checkout</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatKES(subtotal)}</span>
          </div>
          <Button type="submit" className="w-full rounded-full h-12" disabled={!canSubmit || loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing…
              </>
            ) : (
              "Place order & Pay"
            )}
          </Button>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <h2 className="font-display font-bold text-lg">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const invalid = props["aria-invalid"];

  return (
    <div>
      <label htmlFor={props.id} className="text-sm font-medium">
        {label}
        {props.required && <span className="text-primary"> *</span>}
      </label>
      <input
        {...props}
        id={props.id}
        className={`mt-1 w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
          invalid ? "border-destructive/80 ring-destructive/40" : "border-input"
        }`}
      />
    </div>
  );
}
