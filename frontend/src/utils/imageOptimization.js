/**
 * Image Optimization Utilities
 * Provides functions to optimize external images for better performance
 */

/**
 * Optimize external image URLs by adding format/size parameters
 * Works with popular CDN services like Contentful, Cloudinary, imgix
 * 
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @param {number} options.width - Target width (default: 800)
 * @param {number} options.quality - Quality 1-100 (default: 75)
 * @param {string} options.format - Target format: 'webp', 'avif', 'auto' (default: 'auto')
 * @returns {string} Optimized image URL
 */
export function optimizeImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  const { width = 800, quality = 75, format = 'auto' } = options;

  try {
    const urlObj = new URL(url);

    // Contentful CDN (images.ctfassets.net)
    if (urlObj.hostname.includes('ctfassets.net')) {
      const params = new URLSearchParams(urlObj.search);
      params.set('w', width.toString());
      params.set('q', quality.toString());
      params.set('fm', format === 'auto' ? 'webp' : format);
      params.set('fit', 'fill'); // Maintain aspect ratio with crop
      urlObj.search = params.toString();
      return urlObj.toString();
    }

    // Cloudinary
    if (urlObj.hostname.includes('cloudinary.com')) {
      const pathParts = urlObj.pathname.split('/');
      const transformIndex = pathParts.findIndex(p => p === 'upload');
      if (transformIndex !== -1) {
        const transforms = `w_${width},q_${quality},f_${format === 'auto' ? 'auto' : format}`;
        pathParts.splice(transformIndex + 1, 0, transforms);
        urlObj.pathname = pathParts.join('/');
        return urlObj.toString();
      }
    }

    // imgix
    if (urlObj.hostname.includes('imgix.net')) {
      const params = new URLSearchParams(urlObj.search);
      params.set('w', width.toString());
      params.set('q', quality.toString());
      params.set('auto', 'format,compress');
      if (format !== 'auto') {
        params.set('fm', format);
      }
      urlObj.search = params.toString();
      return urlObj.toString();
    }

    // Unsplash (for demo/testing)
    if (urlObj.hostname.includes('unsplash.com') || urlObj.hostname.includes('images.unsplash.com')) {
      const params = new URLSearchParams(urlObj.search);
      params.set('w', width.toString());
      params.set('q', quality.toString());
      params.set('fm', format === 'auto' ? 'webp' : format);
      urlObj.search = params.toString();
      return urlObj.toString();
    }

    // For unknown CDNs, return original URL
    return url;
  } catch (error) {
    // If URL parsing fails, return original
    if (import.meta.env.DEV) {
      console.warn('Failed to optimize image URL:', url, error);
    }
    return url;
  }
}

/**
 * Generate optimized srcset for responsive images
 * 
 * @param {string} url - Original image URL
 * @param {number[]} widths - Array of widths for srcset (default: [400, 800, 1200])
 * @param {Object} options - Optimization options
 * @returns {string} srcset string
 */
export function generateSrcSet(url, widths = [400, 800, 1200], options = {}) {
  if (!url) return '';

  return widths
    .map(width => {
      const optimizedUrl = optimizeImageUrl(url, { ...options, width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Preload critical images with optimal format
 * 
 * @param {string} url - Image URL to preload
 * @param {Object} options - Optimization options
 */
export function preloadImage(url, options = {}) {
  if (!url || typeof window === 'undefined') return;

  const optimizedUrl = optimizeImageUrl(url, options);
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedUrl;

  // Add type hint for WebP if supported
  if (options.format === 'webp' || options.format === 'auto') {
    link.type = 'image/webp';
  }

  document.head.appendChild(link);
}

/**
 * Check if browser supports WebP format
 * 
 * @returns {Promise<boolean>}
 */
export async function supportsWebP() {
  if (typeof window === 'undefined') return false;

  // Check cached result
  if (window.__webpSupport !== undefined) {
    return window.__webpSupport;
  }

  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = function () {
      window.__webpSupport = webP.height === 2;
      resolve(window.__webpSupport);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

export default {
  optimizeImageUrl,
  generateSrcSet,
  preloadImage,
  supportsWebP,
};
