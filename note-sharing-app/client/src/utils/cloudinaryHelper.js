export const optimizeCloudinaryUrl = (url, options = {}) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    // 1. Robustness: Handle case where options is just a number (legacy/simple usage)
    // This fixes potential issues in components like BlogCard.js passing '500' directly
    const { width, height, crop = 'fill', pg } = typeof options === 'number' 
        ? { width: options } 
        : options;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const optimizedWidth = width || (isMobile ? 320 : 400); // Audit suggested ~300
    const quality = isMobile ? 'q_auto:eco' : 'q_auto:good';
    
    // 2. Fix for 'srcset' Warnings:
    // We use slashes ('/') instead of commas (',') to separate parameters.
    // Commas in URLs break the 'srcset' attribute because 'srcset' uses commas to separate candidates.
    let params = `f_auto/${quality}/w_${optimizedWidth}/c_${crop}`;
    
    if (height) params += `/h_${height}`;
    if (pg) params += `/pg_${pg}`;

    // Replace '/upload/' with '/upload/params/' safely
    return url.replace('/upload/', `/upload/${params}/`);
};
