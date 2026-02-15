/**
 * Automatically optimizes Cloudinary URLs with f_auto, q_auto:good and custom dimensions.
 * Includes dynamic mobile downscaling to reach 98+ PageSpeed Mobile score.
 */
export const optimizeCloudinaryUrl = (url, { width, height, crop = 'fill', pg } = {}) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    // 1. DYNAMIC MOBILE SCALING
    // PageSpeed mobile audit flagged 400px as too large for mobile card slots.
    // We detect if the screen is mobile and serve a width that fits the viewport perfectly.
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Use requested width, or fallback to 400 (desktop) / 280 (mobile)
    const optimizedWidth = width || (isMobile ? 280 : 400);

    // 2. CORE OPTIMIZATIONS
    // f_auto: Serves WebP/AVIF to modern mobile browsers
    // q_auto:eco: Used for mobile to maximize compression (best for 4G scores)
    // c_limit: Ensures we don't scale up small images (saves CPU processing)
    const quality = isMobile ? 'q_auto:eco' : 'q_auto:good';
    let params = `f_auto,${quality},w_${optimizedWidth}`;

    // 3. APPEND ADDITIONAL TRANSFORMS
    if (height) params += `,h_${height}`;
    
    // Use c_limit for responsiveness unless a specific crop is needed
    params += `,c_${crop || 'limit'}`;
    
    if (pg) params += `,pg_${pg}`; // For PDF page previews

    // 4. CLEAN URL INJECTION
    // Remove any existing transformations to avoid parameter stacking
    const baseUrl = url.split('/upload/')[0];
    const imagePath = url.split('/upload/')[1].replace(/v\d+\/|[^/]+\//, ''); 

    return `${baseUrl}/upload/${params}/${imagePath}`;
};
