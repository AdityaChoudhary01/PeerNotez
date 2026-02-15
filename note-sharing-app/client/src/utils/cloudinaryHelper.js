export const optimizeCloudinaryUrl = (url, { width, height, crop = 'fill', pg } = {}) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    // Use a safer replacement logic that doesn't destroy the path
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const optimizedWidth = width || (isMobile ? 320 : 400); // Audit suggested ~300
    const quality = isMobile ? 'q_auto:eco' : 'q_auto:good';
    
    let params = `f_auto,${quality},w_${optimizedWidth},c_${crop}`;
    if (height) params += `,h_${height}`;
    if (pg) params += `,pg_${pg}`;

    // Replace '/upload/' with '/upload/params/' safely
    return url.replace('/upload/', `/upload/${params}/`);
};
