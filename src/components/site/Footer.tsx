"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-surface">
      <div className="container-px mx-auto max-w-7xl py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="font-display font-bold text-xl">D-Daily Ltd</div>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Trusted home, farm and lighting essentials. Made for the African market — built to last.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Shop</div>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/shop" className="hover:text-primary transition-colors no-underline">All products</Link></li>
            <li><Link href="/categories" className="hover:text-primary transition-colors no-underline">Categories</Link></li>
            <li><Link href="/reseller" className="hover:text-primary transition-colors no-underline">Become a reseller</Link></li>
            <li><Link href="/track-order" className="hover:text-primary transition-colors no-underline">Track order</Link></li>
            <li><Link href="/reseller/track" className="hover:text-primary transition-colors no-underline">Track reseller application</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Company</div>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/about" className="hover:text-primary transition-colors no-underline">About</Link></li>
            <li><Link href="/safety" className="hover:text-primary transition-colors no-underline">Safety & Education</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors no-underline">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors no-underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Reach us</div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-primary"/>Physical store: Garden City, Nairobi, Kenya</li>
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-primary"/>+254 106555333</li>
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-primary"/>ddailykenya01@gmail.com</li>
            <li className="flex items-start gap-2">
              <Facebook className="h-4 w-4 mt-0.5 text-primary"/>
              <a href="https://www.facebook.com/profile.php?id=61575401875421" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Facebook</a>
            </li>
            <li className="flex items-start gap-2">
              <Instagram className="h-4 w-4 mt-0.5 text-primary"/>
              <a href="https://www.instagram.com/ddailykenya01?igsh=cm5wd3FpbXhoenRu" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Instagram</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-px mx-auto max-w-7xl py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} D-Daily Ltd. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-foreground no-underline">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground no-underline">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
