"use client";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { CookieBanner } from "@/components/site/CookieBanner";
import { RouteScroll } from "@/components/layout/route-scroll";
import { Toaster } from "@/components/ui/sonner";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteScroll />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <CartDrawer />
      <WhatsAppButton />
      <Toaster richColors position="top-center" />
      <CookieBanner />
    </>
  );
}
