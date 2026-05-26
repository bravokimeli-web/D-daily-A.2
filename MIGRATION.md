# D-Daily Frontend — Vite → Next.js Migration

## Status

Migration complete. Legacy Vite/TanStack Router files have been removed. Run `npm run build` before deploy.

## Parity checklist (vs old SPA)

| Feature | Status |
|---------|--------|
| All routes (`/`, `/shop`, `/product/:slug`, cart, checkout, admin, reseller, etc.) | App Router |
| Zustand cart + persist | Unchanged |
| Paystack redirect on checkout | `ordersApi.create` → `authorizationUrl` |
| Online payment checkout form + couriers | `CheckoutView` |
| Admin login + dashboard + products/resellers | `AdminView` |
| Reseller apply + track | `ResellerView` / `ResellerTrackView` |
| API catalog + static fallback | `mergeStaticAndApiProducts` + offline banner |
| Product variants, gallery, related products | `ProductView` |
| Shop filters (`?category`, `?q`) | `ShopView` + `useSearchParams` |
| WhatsApp button, cookie banner, cart drawer | `SiteChrome` |
| SEO meta + OG + product JSON-LD | `metadata` / `generateMetadata` |
| `sitemap.xml` / `robots.txt` | `src/app/sitemap.ts`, `robots.ts` |
| Scroll to top on navigation | `RouteScroll` |
| Hero + product images | `next/image` + `src/assets` |

## Commands

```bash
cp .env.example .env.local
npm install
npm run dev    # :3000 — dev proxies /api → localhost:5000
npm run build
npm start
```

## Environment

```env
NEXT_PUBLIC_SITE_URL=https://www.ddaily.co.ke
NEXT_PUBLIC_API_URL=https://api.ddaily.co.ke/api
NEXT_PUBLIC_REVALIDATE_SECONDS=300
```

## Vercel

- Framework: **Next.js**
- Env vars: same as above
- Region: `cdg1` in `vercel.json`
- Do **not** use the old SPA `rewrites` to `index.html`

Optional: if you prefer the backend-generated sitemap, add a rewrite in Vercel project settings (it will override Next’s `sitemap.ts` if configured at the edge).

## Structure

```
src/app/       → routes
src/views/     → client page UI (from old src/routes/)
src/components/
src/lib/       → api, env, metadata, storefrontCatalog
src/store/     → Zustand
src/data/      → static catalog fallback
```
