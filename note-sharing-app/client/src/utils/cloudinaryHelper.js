export const optimizeCloudinaryUrl = (url, options = {}) => {
    // 1. Basic validation: return empty string if url is invalid, or original if not Cloudinary
    if (!url || typeof url !== 'string') return '';
    if (!url.includes('res.cloudinary.com')) return url;

    // 2. Normalize options: Handle case where options is just a number (e.g., from BlogCard passing 500)
    const settings = typeof options === 'number' ? { width: options } : (options || {});
    const { width, height, crop = 'fill', pg } = settings;

    // 3. Determine Viewport/Quality Settings
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const targetWidth = width || (isMobile ? 320 : 400); 
    const quality = isMobile ? 'q_auto:eco' : 'q_auto:good';
    
    // 4. CRITICAL FIX: Use SLASHES ('/') instead of COMMAS (',')
    // Browser 'srcset' parsing fails if URLs contain commas.
    // Cloudinary supports slashes as separators (e.g., .../upload/f_auto/w_300/...)
    let paramsParts = [`f_auto`, quality, `w_${targetWidth}`, `c_${crop}`];
    
    if (height) paramsParts.push(`h_${height}`);
    if (pg) paramsParts.push(`pg_${pg}`);

    const params = paramsParts.join('/');

    // 5. Inject params into URL
    // We replace the first instance of '/upload/' with '/upload/<params>/'
    return url.replace('/upload/', `/upload/${params}/`);
};
