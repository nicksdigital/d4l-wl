import { getCdnUrl } from '@/lib/storage';

/**
 * Types of image optimizations
 */
export enum ImageOptimization {
  ORIGINAL = 'original', // Original image without optimization
  THUMBNAIL = 'thumbnail', // Small thumbnail (200px width)
  MEDIUM = 'medium',     // Medium size (600px width)
  LARGE = 'large',       // Large size (1200px width)
  WEBP = 'webp',         // Convert to WebP format
  AVIF = 'avif',         // Convert to AVIF format
}

/**
 * Interface for image dimensions
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Get the DigitalOcean CDN URL for an image with optional transformation parameters
 * @param key The object key in DO Spaces
 * @param optimization The type of optimization to apply
 * @param dimensions Optional width and height for resizing
 */
export function getOptimizedImageUrl(
  key: string,
  optimization: ImageOptimization = ImageOptimization.ORIGINAL,
  dimensions?: Partial<ImageDimensions>
): string {
  // Base URL for the CDN
  let url = getCdnUrl(key);
  
  // Add query parameters based on optimization type
  const params: string[] = [];
  
  switch (optimization) {
    case ImageOptimization.THUMBNAIL:
      params.push('w=200');
      params.push('fit=cover');
      break;
    case ImageOptimization.MEDIUM:
      params.push('w=600');
      params.push('fit=inside');
      break;
    case ImageOptimization.LARGE:
      params.push('w=1200');
      params.push('fit=inside');
      break;
    case ImageOptimization.WEBP:
      params.push('format=webp');
      params.push('q=90');
      break;
    case ImageOptimization.AVIF:
      params.push('format=avif');
      params.push('q=80');
      break;
    case ImageOptimization.ORIGINAL:
    default:
      // No transformation
      break;
  }
  
  // Add custom dimensions if provided
  if (dimensions) {
    if (dimensions.width) {
      params.push(`w=${dimensions.width}`);
    }
    if (dimensions.height) {
      params.push(`h=${dimensions.height}`);
    }
  }
  
  // Append parameters to URL if any
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  
  return url;
}

/**
 * Generate responsive image sources for different devices
 * @param key The object key in DO Spaces
 * @param alt Alt text for the image
 * @param widths Array of widths for responsive sizes
 * @param formats Array of formats to generate (webp, avif, original)
 */
export function getResponsiveImageSources(
  key: string,
  alt: string,
  widths: number[] = [640, 768, 1024, 1280, 1536],
  formats: ('webp' | 'avif' | 'original')[] = ['webp', 'original']
): {
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
  webpSrcSet?: string;
  avifSrcSet?: string;
} {
  // Default src is the original image
  const src = getCdnUrl(key);
  
  // Generate srcSet for original format
  const srcSet = widths
    .map((width) => `${getOptimizedImageUrl(key, ImageOptimization.ORIGINAL, { width })} ${width}w`)
    .join(', ');
  
  // Generate srcSet for WebP format if requested
  const webpSrcSet = formats.includes('webp')
    ? widths
        .map((width) => `${getOptimizedImageUrl(key, ImageOptimization.WEBP, { width })} ${width}w`)
        .join(', ')
    : undefined;
  
  // Generate srcSet for AVIF format if requested
  const avifSrcSet = formats.includes('avif')
    ? widths
        .map((width) => `${getOptimizedImageUrl(key, ImageOptimization.AVIF, { width })} ${width}w`)
        .join(', ')
    : undefined;
  
  // Create standard sizes attribute
  const sizes = '(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 50vw';
  
  return {
    src,
    srcSet,
    sizes,
    alt,
    webpSrcSet,
    avifSrcSet,
  };
}

/**
 * Generate a blurhash placeholder URL for an image
 * @param key The object key in DO Spaces
 */
export function getBlurHashUrl(key: string): string {
  return `${getCdnUrl(key)}?w=20&blur=10`;
}
