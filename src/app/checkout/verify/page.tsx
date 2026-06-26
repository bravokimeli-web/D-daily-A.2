"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ordersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

interface VerifyResult {
  orderNumber: string;
  status: string;
  total: number;
  paidAt?: string;
  customerPhone?: string | null;
}

export default function CheckoutVerifyPage() {
  const searchParams = useSearchParams();
  const reference = searchParams?.get("ref") ?? "";

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("Missing payment reference. Please return to checkout and try again.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const response = await ordersApi.verify(reference);
        setResult(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to verify payment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [reference]);

  const handleNeedHelp = () => {
    toast(
      "Your order is saved as pending. If payment failed or you canceled the M-Pesa prompt, return to checkout and complete payment, or contact support if you need assistance.",
      {
        duration: 8000,
      }
    );
  };

  return (
    <div className="container-px mx-auto max-w-3xl py-16">
      <div className="rounded-3xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-3xl font-bold mb-4">Complete your payment</h1>

        {loading ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking payment status...</span>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-5 text-yellow-900">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Unable to verify payment</p>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/checkout" className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                Return to checkout
              </Link>
              <Button variant="outline" onClick={handleNeedHelp}>
                <Info className="mr-2 h-4 w-4" />
                How to complete payment
              </Button>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-6">
            {result.status === "paid" ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Payment successful!</p>
                    <p className="mt-1 text-sm">Order #{result.orderNumber} is confirmed. We will process your order shortly.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Payment not confirmed yet</p>
                    <p className="mt-1 text-sm">
                      If you have not paid, return to checkout to try again. If you already paid, wait a moment and refresh this page.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid gap-3 rounded-2xl border border-border bg-background p-5 text-sm">
              <p><strong>Order number:</strong> {result.orderNumber}</p>
              <p><strong>Status:</strong> {result.status.replace("_", " ")}</p>
              <p><strong>Total:</strong> KES {result.total.toLocaleString()}</p>
              {result.customerPhone && <p><strong>M-Pesa number:</strong> {result.customerPhone}</p>}
              {result.paidAt && <p><strong>Paid at:</strong> {new Date(result.paidAt).toLocaleString()}</p>}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/" className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                Back to shop
              </Link>
              <Button variant="outline" onClick={handleNeedHelp}>
                <Info className="mr-2 h-4 w-4" />
                Payment help
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
