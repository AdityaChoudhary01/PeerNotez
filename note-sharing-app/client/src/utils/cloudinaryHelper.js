export const optimizeCloudinaryUrl = (url, { width, height, crop = 'fill', pg } = {}) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const optimizedWidth = width || (isMobile ? 280 : 400);
    const quality = isMobile ? 'q_auto:eco' : 'q_auto:good';
    
    // FIX: Use slashes (/) instead of commas (,)
    // This allows the URL to work in 'srcset' if you ever use it.
    let paramsParts = [`f_auto`, quality, `w_${optimizedWidth}`];
    
    if (height) paramsParts.push(`h_${height}`);
    paramsParts.push(`c_${crop || 'limit'}`);
    if (pg) paramsParts.push(`pg_${pg}`);

    const params = paramsParts.join('/');

    // Safely inject params
    if (url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/${params}/`);
    }

    return url;
};
