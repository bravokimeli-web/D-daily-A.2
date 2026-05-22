"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  variants?: {
    thumbnail?: string;
    medium?: string;
    original?: string;
    webp?: string;
  };
  className?: string;
  size?: "thumbnail" | "medium" | "original";
  loading?: "lazy" | "eager";
  blurPlaceholder?: string;
}

/**
 * Responsive image component that:
 * - Serves WebP with JPEG/PNG fallback
 * - Uses multiple image sizes based on viewport
 * - Lazy loads with blur placeholder
 * - Optimized for product listings and hero sections
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  variants,
  className,
  size = "medium",
  loading = "lazy",
  blurPlaceholder,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine which image to show
  const getImageSrc = (): string => {
    // Try WebP first if available
    if (variants?.webp && !imageError) {
      return variants.webp;
    }
    // Fall back to size variant
    if (variants?.[size]) {
      return variants[size];
    }
    // Final fallback to main src
    return src;
  };

  // Generate srcset for responsive images
  const getSrcSet = (): string | undefined => {
    if (!variants) return undefined;

    const sizes = [
      variants.thumbnail && `${variants.thumbnail} 150w`,
      variants.medium && `${variants.medium} 400w`,
      variants.original && `${variants.original} 1200w`,
      src && `${src} 1200w`,
    ].filter(Boolean);

    return sizes.length > 0 ? sizes.join(", ") : undefined;
  };

  // Generate sizes attribute for responsive images
  const getSizes = (): string => {
    return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
  };

  return (
    <picture>
      {/* WebP format for modern browsers */}
      {variants?.webp && (
        <source
          srcSet={variants.webp}
          type="image/webp"
          media="(min-width: 0px)"
        />
      )}
      
      {/* Fallback JPEG/PNG */}
      <img
        src={getImageSrc()}
        alt={alt}
        srcSet={getSrcSet()}
        sizes={getSizes()}
        loading={loading}
        onError={() => setImageError(true)}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          !isLoaded && blurPlaceholder ? "blur-sm" : "",
          isLoaded ? "blur-0" : "",
          className
        )}
        style={
          !isLoaded && blurPlaceholder
            ? { backgroundImage: `url(${blurPlaceholder})` }
            : undefined
        }
      />
    </picture>
  );
};

export default ResponsiveImage;
