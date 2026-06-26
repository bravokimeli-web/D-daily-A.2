import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteChrome } from "@/components/layout/site-chrome";
import { organizationJsonLd, siteJsonLd, SITE_NAME } from "@/lib/metadata";
import { SITE_URL, getApiBaseUrl } from "@/lib/env";
import "./globals.css";

const apiOrigin = (() => {
  try {
    return new URL(getApiBaseUrl().replace(/\/api\/?$/, "") || SITE_URL).origin;
  } catch {
    return "https://api.ddaily.co.ke";
  }
})();

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Trusted Home, Farm & Pest Protection in Kenya`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Premium pest control, lighting, home protection, and farm protection essentials. Fast delivery across Kenya with secure M-Pesa checkout.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: true, email: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/icon-192x192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#E67E22",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE" className={`${inter.variable} ${plusJakarta.variable}`}>
      <head>
        <link rel="dns-prefetch" href={apiOrigin} />
        <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#E67E22" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="D-Daily Ltd" />
      </head>
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd(), siteJsonLd()]),
          }}
        />
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}
