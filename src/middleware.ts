import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirects incoming requests to the preferred hostname configured via
 * `NEXT_PUBLIC_SITE_URL`. This enforces a single canonical domain (www vs non-www).
 */
export function middleware(req: NextRequest) {
  try {
    const preferred = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ddaily.co.ke";
    const preferredUrl = new URL(preferred);
    const preferredHost = preferredUrl.host;

    const host = req.headers.get("host");
    if (!host) return;

    // If host already matches preferred, do nothing
    if (host === preferredHost) return;

    // Build redirect URL preserving path and search
    const url = req.nextUrl.clone();
    url.hostname = preferredHost;
    url.protocol = preferredUrl.protocol.replace(":", "");

    return NextResponse.redirect(url, 301);
  } catch (err) {
    // Fail-open: do not block requests if the middleware errors
    return;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|favicon.ico).*)"],
};
