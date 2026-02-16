export const optimizeCloudinaryUrl = (url, { width, height, crop = 'fill', pg } = {}) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const optimizedWidth = width || (isMobile ? 280 : 400);
    const quality = isMobile ? 'q_auto:eco' : 'q_auto:good';
    
    let params = `f_auto,${quality},w_${optimizedWidth}`;
    if (height) params += `,h_${height}`;
    params += `,c_${crop || 'limit'}`;
    if (pg) params += `,pg_${pg}`;

    // Fix: Safely inject params without breaking the version/path structure
    if (url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/${params}/`);
    }

    return url;
};
