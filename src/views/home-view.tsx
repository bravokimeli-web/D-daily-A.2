"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Smartphone, Sparkles, Star, Leaf, Lightbulb, Home, Settings } from "lucide-react";
import Image from "next/image";
const hero = "https://res.cloudinary.com/daytxhhu5/image/upload/f_auto/q_auto/dpr_auto/hero-sction_cvgwxl";
import { categories, type Product } from "@/data/products";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Button } from "@/components/ui/button";
import { useAdminAccess } from "@/hooks/use-admin";

const catIcons = { lighting: Lightbulb, "home-protection": Home, "farm-protection": Leaf, "fashion-design": Sparkles } as const;

type HomeViewProps = {
  initialCatalog: Product[];
};

export function HomeView({ initialCatalog }: HomeViewProps) {
  const { isAdmin } = useAdminAccess();
  const featured = initialCatalog.filter((p) => p.price != null && p.price > 0);

  return (
    <div>
      <section className="relative overflow-hidden min-h-screen">
        <div className="absolute inset-0">
        <Image
          src={hero}
          alt="D-Daily hero banner - lighting, home and farm protection"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

        <div className="container-px mx-auto max-w-7xl py-16 md:py-24 lg:py-32 relative z-10 flex items-center justify-start min-h-screen">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white">
              <span className="block text-primary text-sm md:text-base font-semibold uppercase tracking-widest mb-3">D-Daily Ltd</span>
              Protect what <span className="text-primary">matters</span>.
              <br />
              Every day.
            </h1>
            <p className="mt-5 text-base md:text-lg text-gray-200 max-w-xl leading-relaxed">
              Trusted lighting, home and farm protection essentials — curated for Kenyan homes, farms and businesses. Fast
              delivery. Easy online payment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full h-12 px-7 text-base">
                <Link href="/shop">
                  Shop products <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-7 text-base">
                <Link href="/reseller">Become a reseller</Link>
              </Button>
              {isAdmin && (
                <Button asChild size="lg" variant="secondary" className="rounded-full h-12 px-7 text-base">
                  <Link href="/admin" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Admin
                  </Link>
                </Button>
              )}
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Quality assured
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Nationwide delivery
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" /> Easy payment
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Best sellers</h2>
            <p className="mt-2 text-muted-foreground">What Kenyan homes and farms trust most.</p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-primary hover:underline hidden md:inline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 items-stretch auto-rows-fr">
          {featured.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-8">No priced products to highlight right now.</p>
          ) : (
            featured.map((p) => <ProductCard product={p} key={p.slug} />)
          )}
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-20">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Shop by category</h2>
            <p className="mt-2 text-muted-foreground">Curated essentials, organized by what you need.</p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-primary hover:underline hidden md:inline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => {
            const Icon = catIcons[c.id as keyof typeof catIcons] || Sparkles;
            return (
              <div key={c.id}>
                <Link
                  href={`/shop?category=${c.id}`}
                  className="group block p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-soft transition-all h-full isolate transform-gpu will-change-[transform] backface-visibility-[hidden]"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-display font-bold text-lg">{c.name}</div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-20">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 isolate transform-gpu will-change-[transform] backface-visibility-[hidden]">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Why D-Daily</h2>
            <p className="mt-3 text-primary-foreground/80">A small list of promises we never break.</p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, t: "Trusted products", d: "Sourced and tested for Kenyan conditions." },
              { icon: Truck, t: "Fast delivery", d: "Swatin, Bolt, G4S & Fargo nationwide." },
              { icon: Smartphone, t: "Easy checkout", d: "Pay safely from your phone or browser in seconds." },
              { icon: Star, t: "Real support", d: "WhatsApp our team — we actually reply." },
            ].map((f) => (
              <div key={f.t}>
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="font-semibold">{f.t}</div>
                <p className="mt-1 text-sm text-primary-foreground/80">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-primary">Client reviews</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Loved by Kenyan homes and farms</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Read feedback from customers who trust our products for fast delivery, safety, and value.
            </p>
          </div>
          <div className="hidden md:block text-sm font-semibold text-primary">4.9/5 average rating</div>
        </div>
        <div className="overflow-hidden md:overflow-visible">
          <div className="flex gap-4 overflow-x-auto px-2 pb-2 md:grid md:grid-cols-3 md:gap-6 md:px-0 md:overflow-visible snap-x snap-mandatory md:snap-none transform-gpu will-change-[transform]">
            {[
              {
                name: "Amina N.",
                role: "Nairobi homeowner",
                quote: "Fast delivery, genuine products, and support that actually answers. My home is safer now.",
              },
              {
                name: "John M.",
                role: "Small farm owner",
                quote: "The protection and lighting options are strong and affordable. Delivery was smooth across Nairobi.",
              },
              {
                name: "Grace K.",
                role: "Retail reseller",
                quote: "Great selection and reliable stock. My customers keep asking for more D-Daily products.",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="snap-start min-w-[80%] sm:min-w-[60%] md:min-w-0 rounded-3xl border border-border/70 bg-card p-5 shadow-sm isolate transform-gpu will-change-[transform] backface-visibility-[hidden]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-semibold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{review.name}</p>
                    <p className="text-sm text-muted-foreground">{review.role}</p>
                  </div>
                </div>
                <p className="text-sm leading-7 text-foreground/90">“{review.quote}”</p>
                <div className="mt-4 flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3 w-3" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold uppercase tracking-wider">
              Safety & Education
            </span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold">Use it right. Stay safe.</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              We believe selling a product means teaching how to use it well. Read short guides on mosquito prevention, snake
              control, safe herbicide handling and home safety.
            </p>
            <Button asChild variant="outline" className="mt-6 rounded-full">
              <Link href="/safety">Read guides</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              "Mosquito prevention",
              "Safe herbicide use",
              "Snake-aware homes",
              "Indoor pest control",
            ].map((t) => (
              <div key={t} className="p-5 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-colors isolate transform-gpu will-change-[transform] backface-visibility-[hidden]">
                <Leaf className="h-5 w-5 text-primary" />
                <div className="mt-3 font-semibold text-sm">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-12">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Earn with D-Daily</h2>
            <p className="mt-2 text-primary-foreground/85 max-w-xl">
              Join our reseller program. Sell trusted products, earn commission, and grow your hustle.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="rounded-full h-12 px-7 text-base">
            <Link href="/reseller">Apply now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
