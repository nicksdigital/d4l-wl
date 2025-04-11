"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { getOptimizedImageUrl, ImageOptimization, getBlurHashUrl } from '@/utils/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
  optimization?: ImageOptimization;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  blur?: boolean;
}

/**
 * Optimized image component that uses DigitalOcean Spaces CDN
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 80,
  unoptimized = false,
  optimization = ImageOptimization.ORIGINAL,
  objectFit = 'cover',
  blur = true,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Detect if the source is already a full URL or just a key
  const isFullUrl = src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:');
  
  // If it's a key, generate the optimized CDN URL
  const imageSrc = isFullUrl ? src : getOptimizedImageUrl(src, optimization, { width, height });
  
  // Generate blur hash placeholder if blur is enabled
  const blurDataURL = blur && !isFullUrl ? getBlurHashUrl(src) : undefined;
  
  // Handle image load complete
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };
  
  return (
    <div className={`relative overflow-hidden ${isLoading ? 'animate-pulse bg-gray-300' : ''} ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        priority={priority}
        quality={quality}
        unoptimized={unoptimized}
        style={{ objectFit }}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onLoadingComplete={handleLoadingComplete}
      />
    </div>
  );
}
