export const optimizeCloudinaryUrl = (url, { width, height, crop = 'fill', pg } = {}) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    // 1. Force HTTPS
    if (url.startsWith('http://')) {
        url = url.replace('http://', 'https://');
    }

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
