"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Matches legacy `useSEO` behavior: scroll to top on route change. */
export function RouteScroll() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
