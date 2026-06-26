"use client";

import { useCart, cartTotals } from "@/store/carts";
import { formatKES } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Smartphone, Truck, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { FormEvent, InputHTMLAttributes, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ordersApi } from "@/lib/api";

type PaymentPhase = "idle" | "sending" | "awaiting" | "error";

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

export function CheckoutView() {
  const { items, clear } = useCart();
  const { subtotal } = cartTotals(items);
  const [courier, setCourier] = useState("Swatin");
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [awaitingPhone, setAwaitingPhone] = useState<string | null>(null);
  const pollStartedAt = useRef<number | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaPhoneTouched, setMpesaPhoneTouched] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  useEffect(() => {
    if (!mpesaPhoneTouched) setMpesaPhone(phone);
  }, [phone, mpesaPhoneTouched]);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    pollStartedAt.current = null;
  };

  const startPaymentPolling = (reference: string) => {
    stopPolling();
    pollStartedAt.current = Date.now();

    pollTimer.current = setInterval(async () => {
      if (pollStartedAt.current && Date.now() - pollStartedAt.current > POLL_TIMEOUT_MS) {
        stopPolling();
        setPaymentPhase("error");
        setPaymentError(
          "Payment was not confirmed in time. If you completed the M-Pesa prompt, wait a moment and try again, or contact support with your order reference."
        );
        return;
      }

      try {
        const response = await ordersApi.paymentStatus(reference);
        if (response.data.status === "paid") {
          stopPolling();
          clear();
          window.location.href = `/checkout/verify?ref=${encodeURIComponent(reference)}`;
          return;
        }
        if (response.data.promptFailed && response.data.stkResultDesc) {
          stopPolling();
          setPaymentPhase("error");
          setPaymentError(response.data.stkResultDesc);
        }
      } catch {
        // Keep polling — webhook may still be in flight.
      }
    }, POLL_INTERVAL_MS);
  };

  const resetPayment = () => {
    stopPolling();
    setPaymentPhase("idle");
    setPaymentError(null);
    setPaymentReference(null);
    setAwaitingPhone(null);
  };

  const hasRequiredInfo = Boolean(
    name.trim() && phone.trim() && mpesaPhone.trim() && city.trim() && address.trim()
  );
  const canSubmit = items.length > 0 && hasRequiredInfo && paymentPhase !== "sending" && paymentPhase !== "awaiting";
  const isBusy = paymentPhase === "sending" || paymentPhase === "awaiting";

  const place = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setPaymentError(null);

    if (items.length === 0) return toast.error("Your cart is empty.");
    if (!hasRequiredInfo) {
      return toast.error("Please fill in all required fields, including your M-Pesa payment number.");
    }

    setPaymentPhase("sending");
    try {
      const res = await ordersApi.create({
        customer: { name, email: email || undefined, phone, city, address },
        mpesaPhone,
        items: items.map((i) => ({ slug: i.slug, name: i.name, price: i.price, qty: i.qty, image: i.image })),
        courier,
      });

      const reference = res.data.payment.reference;
      const payPhone = res.data.payment.customerPhone || mpesaPhone;

      setPaymentReference(reference);
      setAwaitingPhone(payPhone);
      setPaymentPhase("awaiting");
      startPaymentPolling(reference);
    } catch (err) {
      setPaymentPhase("error");
      const message = err instanceof Error ? err.message : "Failed to send M-Pesa prompt. Please try again.";
      setPaymentError(message);
      toast.error(message);
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
              disabled={isBusy}
              aria-invalid={attemptedSubmit && !name}
            />
            <Field
              id="checkout-email"
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isBusy}
            />
            <Field
              id="checkout-phone"
              label="Contact phone"
              required
              type="tel"
              placeholder="e.g. 0712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isBusy}
              aria-invalid={attemptedSubmit && !phone.trim()}
            />
            <p className="text-sm text-muted-foreground">Used for delivery updates and order contact.</p>
          </Section>
          <Section title="Delivery">
            <Field
              id="checkout-city"
              label="Town / City"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isBusy}
              aria-invalid={attemptedSubmit && !city}
            />
            <Field
              id="checkout-address"
              label="Address / Landmark"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isBusy}
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
                    disabled={isBusy}
                    className={`p-3 rounded-xl border text-sm font-medium transition disabled:opacity-50 ${courier === c ? "border-primary bg-primary-soft text-primary" : "hover:border-primary/40"}`}
                  >
                    <Truck className="h-4 w-4 mx-auto mb-1" />
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </Section>
          <Section title="Payment">
            <div className="p-4 rounded-2xl border bg-primary-soft/40 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="w-full space-y-4">
                  <div>
                    <div className="font-semibold">Secure M-Pesa payment</div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Enter the M-Pesa number to charge. We will send the STK prompt to that phone when you pay.
                    </p>
                  </div>

                  <Field
                    id="checkout-mpesa-phone"
                    label="M-Pesa payment number"
                    required
                    type="tel"
                    placeholder="e.g. 0712 345 678"
                    value={mpesaPhone}
                    onChange={(e) => {
                      setMpesaPhoneTouched(true);
                      setMpesaPhone(e.target.value);
                    }}
                    disabled={isBusy}
                    aria-invalid={attemptedSubmit && !mpesaPhone.trim()}
                  />

                  {paymentPhase === "sending" && (
                    <div className="rounded-xl border border-primary/30 bg-background p-4 flex items-center gap-3 text-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                      <div>
                        <p className="font-semibold">Sending M-Pesa prompt…</p>
                        <p className="text-muted-foreground mt-0.5">Please wait while we contact Safaricom.</p>
                      </div>
                    </div>
                  )}

                  {paymentPhase === "awaiting" && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 text-sm space-y-2">
                      <div className="flex items-start gap-3">
                        <Loader2 className="h-5 w-5 animate-spin shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Check your phone</p>
                          <p className="mt-1">
                            An M-Pesa prompt was sent to <strong>{awaitingPhone}</strong>. Enter your PIN on your phone to
                            complete payment.
                          </p>
                          <p className="mt-2 text-amber-800">Waiting for payment confirmation…</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentPhase === "error" && paymentError && (
                    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
                      <div className="flex items-start gap-3 text-destructive">
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Payment prompt failed</p>
                          <p className="mt-1 text-destructive/90">{paymentError}</p>
                        </div>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={resetPayment}>
                        Try again
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={paymentPhase === "sending"}
                onClick={() =>
                  toast(
                    "Enter your M-Pesa PIN when the prompt appears on your phone. If you don't receive it within a minute, check the number and try again.",
                    { duration: 8000 }
                  )
                }
              >
                Payment help
              </Button>
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
            <span className="text-muted-foreground">Preferred courier</span>
            <span>{courier}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Delivery cost is paid directly to the courier on confirmation and is not included in this total.
          </div>
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatKES(subtotal)}</span>
          </div>

          {paymentPhase === "awaiting" && paymentReference && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 flex gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Prompt sent. Complete payment on your phone — this page will update automatically.</span>
            </div>
          )}

          <Button type="submit" className="w-full rounded-full h-12" disabled={!canSubmit}>
            {paymentPhase === "sending" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending prompt…
              </>
            ) : paymentPhase === "awaiting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Waiting for payment…
              </>
            ) : (
              "Pay with M-Pesa"
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
        className={`mt-1 w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 ${
          invalid ? "border-destructive/80 ring-destructive/40" : "border-input"
        }`}
      />
    </div>
  );
}
