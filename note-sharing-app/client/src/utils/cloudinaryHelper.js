/**
 * Automatically optimizes Cloudinary URLs with f_auto, q_auto:good and custom dimensions.
 * Works for existing and future uploads.
 */
export const optimizeCloudinaryUrl = (url, { width, height, crop = 'fill', pg } = {}) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    // OPTIMIZATION:
    // 1. q_auto:good balances visual quality with much smaller file sizes (PageSpeed recommendation).
    // 2. Default width to 300px to prevent loading massive images for small cards.
    const defaultWidth = width || 300; 

    // Start with format auto (WebP/AVIF) and quality auto:good
    let params = 'f_auto,q_auto:good';
    
    // Append dimensions
    params += `,w_${defaultWidth}`;
    if (height) params += `,h_${height}`;
    if (crop) params += `,c_${crop}`;
    if (pg) params += `,pg_${pg}`; // For PDF page previews

    // Insert parameters into the URL
    return url.replace('/upload/', `/upload/${params}/`);
};
