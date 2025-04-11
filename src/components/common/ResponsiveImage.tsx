"use client";

import React, { useState } from 'react';
import { getResponsiveImageSources, getBlurHashUrl } from '@/utils/imageUtils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  widths?: number[];
  formats?: ('webp' | 'avif' | 'original')[];
  sizes?: string;
  loading?: 'lazy' | 'eager';
  blur?: boolean;
}

/**
 * Responsive image component that generates multiple source sets for different
 * formats and screen sizes using the DigitalOcean Spaces CDN
 */
export default function ResponsiveImage({
  src,
  alt,
  className = '',
  widths = [640, 768, 1024, 1280, 1536],
  formats = ['webp', 'original'],
  sizes,
  loading = 'lazy',
  blur = true,
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Detect if the source is already a full URL or just a key
  const isFullUrl = src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:');
  
  // If it's a key, generate the responsive image sources
  const imageSources = !isFullUrl
    ? getResponsiveImageSources(src, alt, widths, formats)
    : {
        src,
        srcSet: '',
        sizes: sizes || '100vw',
        alt,
      };
  
  // Generate blur hash placeholder if blur is enabled
  const blurDataURL = blur && !isFullUrl ? getBlurHashUrl(src) : undefined;
  
  // Handle image load complete
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  return (
    <div className={`relative overflow-hidden ${isLoading ? 'animate-pulse bg-gray-300' : ''} ${className}`}>
      <picture>
        {/* AVIF format for browsers that support it */}
        {imageSources.avifSrcSet && (
          <source
            srcSet={imageSources.avifSrcSet}
            sizes={imageSources.sizes}
            type="image/avif"
          />
        )}
        
        {/* WebP format for browsers that support it */}
        {imageSources.webpSrcSet && (
          <source
            srcSet={imageSources.webpSrcSet}
            sizes={imageSources.sizes}
            type="image/webp"
          />
        )}
        
        {/* Original format as fallback */}
        <img
          src={imageSources.src}
          srcSet={imageSources.srcSet || undefined}
          sizes={imageSources.sizes}
          alt={alt}
          loading={loading}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          style={blurDataURL ? { backgroundImage: `url(${blurDataURL})`, backgroundSize: 'cover' } : undefined}
        />
      </picture>
    </div>
  );
}
