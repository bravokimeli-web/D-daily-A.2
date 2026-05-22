"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  variants?: {
    thumbnail?: string;
    medium?: string;
    original?: string;
    webp?: string;
  };
};

function isOptimizable(src: string) {
  return src.startsWith("/") || src.startsWith("https://");
}

export function ProductImage({ src, alt, className, sizes, priority, variants }: ProductImageProps) {
  const [error, setError] = useState(false);
  const displaySrc = !error && variants?.webp ? variants.webp : src;

  if (!isOptimizable(displaySrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={displaySrc} alt={alt} className={cn("object-cover", className)} loading={priority ? "eager" : "lazy"} />
    );
  }

  const unoptimized = displaySrc.startsWith("http") && !displaySrc.includes("ddaily.co.ke");

  return (
    <Image
      src={displaySrc}
      alt={alt}
      fill
      className={cn("object-cover", className)}
      sizes={sizes ?? "(max-width: 640px) 100vw, 50vw"}
      priority={priority}
      unoptimized={unoptimized}
      onError={() => setError(true)}
    />
  );
}
