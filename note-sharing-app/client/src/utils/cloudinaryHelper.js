export const optimizeCloudinaryUrl = (url, options = {}) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    // 1. FIX: Handle case where options is just a number (e.g. from BlogCard)
    const settings = typeof options === 'number' ? { width: options } : options;
    const { width, height, crop = 'fill', pg } = settings;

    // Use a safer replacement logic that doesn't destroy the path
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const optimizedWidth = width || (isMobile ? 320 : 400); 
    const quality = isMobile ? 'q_auto:eco' : 'q_auto:good';
    
    // 2. FIX: Use SLASHES ('/') instead of COMMAS (',')
    // Commas inside the URL break the 'srcset' attribute parsing.
    let params = `f_auto/${quality}/w_${optimizedWidth}/c_${crop}`;
    
    if (height) params += `/h_${height}`;
    if (pg) params += `/pg_${pg}`;

    // Replace '/upload/' with '/upload/params/' safely
    return url.replace('/upload/', `/upload/${params}/`);
};
