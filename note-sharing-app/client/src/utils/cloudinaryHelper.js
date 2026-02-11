/**
 * Automatically optimizes Cloudinary URLs with f_auto, q_auto and custom dimensions.
 * Works for existing and future uploads.
 */
export const optimizeCloudinaryUrl = (url, { width, height, crop = 'fill', pg } = {}) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    // Parameters:
    // f_auto: Optimal format (WebP)
    // q_auto: Best compression
    let params = 'f_auto,q_auto';
    if (width) params += `,w_${width}`;
    if (height) params += `,h_${height}`;
    if (crop) params += `,c_${crop}`;
    if (pg) params += `,pg_${pg}`; // For PDF page previews

    // Replace the '/upload/' part of the URL with '/upload/transformations/'
    return url.replace('/upload/', `/upload/${params}/`);
};
