"use client";

import Link from "next/link";
import { TrackResellerApplication } from "@/components/reseller/TrackResellerApplication";
import { ArrowLeft } from "lucide-react";

export function ResellerTrackView() {
  return (
    <div className="container-px mx-auto max-w-lg py-16 md:py-24">
      <Link href="/reseller" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to reseller program
      </Link>
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Reseller</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Track your application</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Enter the same email address you used on your application form. We never show your documents or phone number here.
      </p>
      <div className="mt-8">
        <TrackResellerApplication />
      </div>
    </div>
  );
}
