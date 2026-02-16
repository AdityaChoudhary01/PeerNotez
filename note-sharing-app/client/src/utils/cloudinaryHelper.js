export const optimizeCloudinaryUrl = (url, options = {}) => {
    // 1. Basic validation
    if (!url || typeof url !== 'string') return '';
    if (!url.includes('res.cloudinary.com')) return url;

    // 2. Normalize options
    const settings = typeof options === 'number' ? { width: options } : (options || {});
    const { width, height, crop = 'fill', pg } = settings;

    // 3. Determine Viewport/Quality
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const targetWidth = width || (isMobile ? 320 : 400); 
    const quality = isMobile ? 'q_auto:eco' : 'q_auto:good';
    
    // 4. GENERATE PARAMS WITH SLASHES (Not Commas)
    let paramsParts = [`f_auto`, quality, `w_${targetWidth}`, `c_${crop}`];
    if (height) paramsParts.push(`h_${height}`);
    if (pg) paramsParts.push(`pg_${pg}`);
    
    const params = paramsParts.join('/');

    // 5. INJECT PARAMS & CLEAN UP
    // First, inject our new params
    let optimizedUrl = url.replace('/upload/', `/upload/${params}/`);

    // CRITICAL: Replace ALL remaining commas with slashes.
    // If your DB has URLs like ".../upload/w_500,h_500/...", this fixes them.
    return optimizedUrl.replace(/,/g, '/');
};
