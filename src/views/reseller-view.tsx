"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/lib/api";
import { TrackResellerApplication } from "@/components/reseller/TrackResellerApplication";
import { CheckCircle2, Upload, TrendingUp, Wallet, Users, Search } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(255),
});

export function ResellerView() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [appliedEmail, setAppliedEmail] = useState<string | null>(null);
  const [files, setFiles] = useState<{ id_front?: File; id_back?: File; kra_pin?: File; additional?: File }>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      full_name: fd.get("full_name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("full_name", parsed.data.full_name);
      submitData.append("phone", parsed.data.phone);
      submitData.append("email", parsed.data.email);

      if (files.id_front) submitData.append("id_front", files.id_front);
      if (files.id_back) submitData.append("id_back", files.id_back);
      if (files.kra_pin) submitData.append("kra_pin", files.kra_pin);
      if (files.additional) submitData.append("additional", files.additional);

      const response = await fetch(`${getApiBaseUrl()}/reseller/apply`, {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        if (response.status === 405) {
          errorMessage =
            "HTTP 405 (wrong target). The form posted to a server that does not allow this POST. " +
            `Check NEXT_PUBLIC_API_URL on your host (must be the Render/backend URL like https://….onrender.com/api). Current base: ${getApiBaseUrl()}`;
        }
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          try {
            await response.text();
          } catch {
            /* ignore */
          }
        }
        throw new Error(errorMessage);
      }

      await response.json().catch(() => null);
      toast.success("Application submitted successfully!");
      setAppliedEmail(parsed.data.email);
      setDone(true);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="container-px mx-auto max-w-xl py-16 md:py-24">
        <div className="text-center">
          <CheckCircle2 className="h-14 w-14 text-success mx-auto" />
          <h1 className="mt-5 font-display text-3xl font-bold">Application received</h1>
          <p className="mt-2 text-muted-foreground">
            Status: <strong>Pending</strong>. Our team will review and reach out within 2 business days.
          </p>
        </div>
        <div className="mt-12 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
            <Search className="h-4 w-4 text-primary" />
            Track your application
          </div>
          <p className="text-xs text-muted-foreground mb-4">Your email is filled in below. Check again anytime as your status updates.</p>
          <TrackResellerApplication initialEmail={appliedEmail ?? undefined} />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/reseller/track" className="text-primary font-medium hover:underline">
            Open the dedicated tracking page
          </Link>
          {" · "}
          <button
            type="button"
            className="text-primary font-medium hover:underline"
            onClick={() => {
              setDone(false);
              setAppliedEmail(null);
            }}
          >
            Submit another application
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-surface">
        <div className="container-px mx-auto max-w-7xl py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Reseller Program</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold leading-tight">Earn with D-Daily.</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Join trusted resellers across Kenya. Get wholesale prices, marketing support, and commissions on every sale.
            </p>
            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              {[
                { icon: TrendingUp, t: "Up to 25%", d: "commission" },
                { icon: Wallet, t: "Weekly", d: "M-PESA payouts" },
                { icon: Users, t: "Referral", d: "rewards" },
              ].map((f) => (
                <div key={f.d} className="rounded-2xl border bg-card p-4">
                  <f.icon className="h-5 w-5 text-primary" />
                  <div className="mt-2 font-bold">{f.t}</div>
                  <div className="text-xs text-muted-foreground">{f.d}</div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="rounded-3xl bg-card border p-6 md:p-8 shadow-soft space-y-4">
            <h2 className="font-display text-2xl font-bold">Apply now</h2>
            <Field label="Full name" name="full_name" required />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone (M-PESA)" name="phone" type="tel" required />
              <Field label="Email" name="email" type="email" required />
            </div>
            <FileField label="ID front" onChange={(f) => setFiles((s) => ({ ...s, id_front: f }))} />
            <FileField label="ID back" onChange={(f) => setFiles((s) => ({ ...s, id_back: f }))} />
            <FileField label="KRA PIN certificate" onChange={(f) => setFiles((s) => ({ ...s, kra_pin: f }))} />
            <FileField label="Additional document (optional)" onChange={(f) => setFiles((s) => ({ ...s, additional: f }))} />
            <Button type="submit" disabled={submitting} className="w-full h-12 rounded-full">
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">Your documents are stored securely.</p>
            <p className="text-xs text-center text-muted-foreground pt-2 border-t border-border">
              Already applied?{" "}
              <Link href="/reseller/track" className="text-primary font-medium hover:underline">
                Track your application
              </Link>
            </p>
          </form>
        </div>
      </section>

      <section className="border-t border-border bg-muted/20 py-16 md:py-20">
        <div className="container-px mx-auto max-w-xl">
          <h2 className="font-display text-2xl font-bold text-foreground">Track your application</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the email you used when you applied. You will see your current status (pending, approved, or not approved) and
            when you submitted — we do not show your documents or phone here.
          </p>
          <div className="mt-6">
            <TrackResellerApplication />
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
        {props.required && <span className="text-primary"> *</span>}
      </label>
      <input {...props} className="mt-1 w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}

function FileField({ label, onChange }: { label: string; onChange: (f: File | undefined) => void }) {
  const [name, setName] = useState("");
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <label className="mt-1 flex items-center gap-3 px-3 h-11 rounded-lg border bg-background cursor-pointer hover:border-primary/40 transition-colors">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground truncate">{name || "Choose file"}</span>
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setName(f?.name ?? "");
            onChange(f);
          }}
        />
      </label>
    </div>
  );
}
