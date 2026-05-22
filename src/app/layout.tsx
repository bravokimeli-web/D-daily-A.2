import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteChrome } from "@/components/layout/site-chrome";
import { organizationJsonLd, SITE_NAME } from "@/lib/metadata";
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
    "Premium pest control, lighting, home protection, and farm protection essentials. Fast delivery across Kenya with M-PESA payments.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: true, email: true },
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
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
      </head>
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}
