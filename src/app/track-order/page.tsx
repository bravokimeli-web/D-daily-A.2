"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ordersApi } from "@/lib/api";

interface OrderCustomer {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
}

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface OrderPayment {
  reference?: string;
  paidAt?: string;
  channel?: string;
  authorizationUrl?: string;
}

interface OrderTrack {
  orderNumber: string;
  status: string;
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  courier?: string;
  notes?: string;
  createdAt?: string;
  customer?: OrderCustomer;
  items?: OrderItem[];
  payment?: OrderPayment;
}

const statusLabel: Record<string, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<OrderTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) {
      setError("Enter your order number to track it.");
      setOrder(null);
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await ordersApi.getByOrderNumber(trimmed);
      setOrder(response.data as OrderTrack);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found. Check your order number and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-px mx-auto max-w-4xl py-20">
      <div className="mb-10 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Track order</p>
        <h1 className="font-display text-4xl font-bold">Check your order status</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Enter the order number you received after checkout and we will show you the current order status, delivery details, and payment information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_auto] mb-10">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Order number</span>
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            placeholder="e.g. DDAILY-123456-1680000000000"
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <Button type="submit" className="h-12 w-full md:w-auto">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching...</> : "Track my order"}
        </Button>
      </form>

      {error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {order ? (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-lg font-semibold">{order.orderNumber}</p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
              order.status === "paid"
                ? "bg-emerald-100 text-emerald-800"
                : order.status === "pending_payment"
                ? "bg-yellow-100 text-yellow-900"
                : "bg-slate-100 text-slate-800"
            }`}>
              {statusLabel[order.status] ?? order.status}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-background p-4">
              <p className="text-sm font-semibold text-muted-foreground">Customer</p>
              <p>{order.customer?.name || "—"}</p>
              <p className="text-sm text-muted-foreground">{order.customer?.email || "No email"}</p>
              <p className="text-sm text-muted-foreground">{order.customer?.phone || "No phone"}</p>
            </div>
            <div className="rounded-2xl bg-background p-4">
              <p className="text-sm font-semibold text-muted-foreground">Delivery</p>
              <p>{order.customer?.city || "—"}</p>
              <p>{order.customer?.address || "—"}</p>
              <p className="text-sm text-muted-foreground">Courier: {order.courier || "Standard"}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-background p-4">
            <p className="text-sm font-semibold text-muted-foreground">Order details</p>
            <div className="mt-3 space-y-3">
              {order.items?.map((item) => (
                <div key={`${item.name}-${item.qty}`} className="flex justify-between text-sm">
                  <span>{item.name} × {item.qty}</span>
                  <span>KES {item.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>KES {(order.subtotal ?? order.total).toLocaleString()}</span>
              </div>
              {order.deliveryFee !== undefined ? (
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span>KES {order.deliveryFee.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>KES {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {order.payment?.reference ? (
            <div className="mt-6 rounded-2xl bg-background p-4 text-sm text-muted-foreground">
              <p><strong>Payment reference:</strong> {order.payment.reference}</p>
              {order.payment.paidAt ? <p>Paid at: {new Date(order.payment.paidAt).toLocaleString()}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-10 text-sm text-muted-foreground">
        <p>If you do not know your order number yet, check the email we sent after checkout or contact our support team.</p>
        <p className="mt-2">
          <Link href="/contact" className="font-semibold text-primary hover:underline">Contact support</Link> or <Link href="/shop" className="font-semibold text-primary hover:underline">continue shopping</Link>.
        </p>
      </div>
    </div>
  );
}
