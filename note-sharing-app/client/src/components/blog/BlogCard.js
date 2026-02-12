import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaCalendarAlt, FaEdit, FaTrash, FaArrowRight, FaClock } from 'react-icons/fa';
import StarRating from '../common/StarRating';
import { optimizeCloudinaryUrl } from '../../utils/cloudinaryHelper';
import RoleBadge from '../common/RoleBadge';

const BlogCard = ({ blog, showActions = false, onDelete = () => {}, onEdit = () => {} }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const MAIN_ADMIN_EMAIL = process.env.REACT_APP_MAIN_ADMIN_EMAIL;
    const isSuperAdmin = blog.author?.email === MAIN_ADMIN_EMAIL;

    // --- LOGIC: ACCURATE READING TIME ---
    const calculateReadingTime = () => {
        if (!blog.content) return 1;
        const cleanText = blog.content.replace(/<[^>]+>/g, '').replace(/[#*`_[\]]/g, '').trim();
        const wordCount = cleanText.split(/\s+/).length;
        const wordsPerMinute = 225;
        return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    };

    const readingTime = calculateReadingTime();

    const getSummary = () => {
        if (blog.summary && blog.summary.trim().length > 0) return blog.summary;
        if (blog.content) {
            const cleanText = blog.content.replace(/<[^>]+>/g, '').replace(/[#*`_[\]]/g, '');
            return cleanText.substring(0, 120) + '...';
        }
        return 'No summary available.';
    };

    const summaryText = getSummary();
    const formattedDate = blog.createdAt 
        ? new Date(blog.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';
    
    const views = (blog.views || blog.downloadCount || 0).toLocaleString();
    const rating = blog.averageRating || blog.rating || 0;

    // --- STYLES (Kept identical to your theme) ---
    const styles = {
        card: {
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            cursor: 'default',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        },
        cardHover: {
            transform: 'translateY(-10px) scale(1.01)',
            boxShadow: '0 30px 80px rgba(102, 126, 234, 0.2)',
            borderColor: 'rgba(240, 147, 251, 0.3)'
        },
        imageContainer: {
            position: 'relative',
            width: '100%',
            height: '220px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)'
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            opacity: imageLoaded ? 1 : 0
        },
        imageHover: {
            transform: 'scale(1.1) rotate(-1deg)'
        },
        skeleton: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonLoading 1.5s ease-in-out infinite'
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 10
        },
        badgesContainer: {
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            right: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            zIndex: 11
        },
        badge: {
            padding: '0.4rem 0.8rem',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
        },
        content: {
            padding: '1.5rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
        },
        titleLink: {
            textDecoration: 'none'
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: '800',
            color: '#fff',
            margin: 0,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontFamily: "'Space Grotesk', sans-serif",
            transition: 'color 0.2s',
            cursor: 'pointer'
        },
        summary: {
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontFamily: "'Spline Sans', sans-serif'"
        },
        metaInfo: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: 'auto',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        },
        ratingRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        footer: {
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.1)'
        },
        authorLink: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            flex: 1,
            cursor: isSuperAdmin ? 'default' : 'pointer'
        },
        authorImage: {
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: isSuperAdmin ? '2px solid #ffd700' : '2px solid rgba(255,255,255,0.2)',
            objectFit: 'cover'
        },
        authorInfo: {
            display: 'flex',
            flexDirection: 'column'
        },
        authorName: {
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        actions: {
            display: 'flex',
            gap: '0.5rem'
        },
        actionButton: {
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.85rem'
        },
        readButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.8rem',
            background: 'linear-gradient(135deg, #00d4ff, #ff00cc)',
            border: 'none',
            borderRadius: '50px',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: '700',
            cursor: 'pointer',
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.4)',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }
    };

    const AuthorWrapper = isSuperAdmin ? 'div' : Link;
    const authorWrapperProps = isSuperAdmin 
        ? { style: styles.authorLink }
        : { to: `/profile/${blog.author?._id}`, style: styles.authorLink };

    return (
        <div 
            style={{
                ...styles.card,
                ...(isHovered ? styles.cardHover : {})
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={styles.imageContainer}>
                {!imageLoaded && <div style={styles.skeleton} />}
                <img
                    /* OPTIMIZATION: 
                       1. Reduced width request to 500px (plenty for card).
                       2. Added loading="lazy" for off-screen images.
                       3. Added decoding="async" to prevent UI freeze.
                    */
                    src={blog.coverImage 
                        ? optimizeCloudinaryUrl(blog.coverImage, 500) 
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.title)}&size=500&background=1e293b&color=fff`
                    }
                    alt={blog.title}
                    loading="lazy"
                    decoding="async"
                    style={{
                        ...styles.image,
                        ...(isHovered ? styles.imageHover : {})
                    }}
                    onLoad={() => setImageLoaded(true)}
                />
                
                <div style={styles.badgesContainer}>
                    <div style={styles.badge}>
                        <FaClock style={{color: '#00d4ff'}} size={10} />
                        <span>{readingTime} min read</span>
                    </div>
                </div>

                <div style={styles.overlay}>
                    <Link to={`/blogs/${blog.slug || blog._id}`} style={styles.readButton}>
                        Read Article <FaArrowRight size={12} />
                    </Link>
                </div>
            </div>

            <div style={styles.content}>
                <Link to={`/blogs/${blog.slug || blog._id}`} style={styles.titleLink}>
                    <h3 
                        style={styles.title}
                        onMouseEnter={(e) => e.target.style.color = '#00d4ff'}
                        onMouseLeave={(e) => e.target.style.color = '#fff'}
                    >
                        {blog.title}
                    </h3>
                </Link>
                
                <p style={styles.summary}>{summaryText}</p>
                
                <div style={styles.metaInfo}>
                    <div style={styles.ratingRow}>
                        <StarRating rating={rating} readOnly={true} size={14} />
                        <span style={{fontSize: '0.75rem', opacity: 0.8}}>({blog.numReviews || 0})</span>
                    </div>
                    
                    <div style={{display: 'flex', gap: '15px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <FaCalendarAlt /> {formattedDate}
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <FaEye /> {views}
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.footer}>
                {blog.author ? (
                    <AuthorWrapper {...authorWrapperProps}>
                        <img
                            /* OPTIMIZATION: 
                               1. Request 80px (for 2x pixel density on 40px circle).
                               2. Lazy load and async decode.
                            */
                            src={blog.author.profilePicture || blog.author.avatar
                                ? optimizeCloudinaryUrl(blog.author.profilePicture || blog.author.avatar, 80)
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author.name)}&size=80`
                            }
                            alt={blog.author.name}
                            loading="lazy"
                            decoding="async"
                            style={styles.authorImage}
                        />
                        <div style={styles.authorInfo}>
                            <div style={styles.authorName}>
                                {blog.author.name}
                                <RoleBadge user={blog.author} />
                            </div>
                        </div>
                    </AuthorWrapper>
                ) : (
                    <div style={styles.authorLink}>
                        <div style={{...styles.authorImage, background: '#333'}} />
                        <span style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem'}}>Unknown User</span>
                    </div>
                )}

                {showActions && (
                    <div style={styles.actions}>
                        <button
                            onClick={(e) => { e.preventDefault(); onEdit(blog); }}
                            style={{
                                ...styles.actionButton,
                                background: 'rgba(0, 212, 255, 0.1)',
                                color: '#00d4ff',
                                border: '1px solid rgba(0, 212, 255, 0.3)'
                            }}
                            title="Edit"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); onDelete(blog._id); }}
                            style={{
                                ...styles.actionButton,
                                background: 'rgba(255, 0, 85, 0.1)',
                                color: '#ff0055',
                                border: '1px solid rgba(255, 0, 85, 0.3)'
                            }}
                            title="Delete"
                        >
                            <FaTrash />
                        </button>
                    </div>
                )}
            </div>

            <style>
                {`
                    @keyframes skeletonLoading {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                `}
            </style>
        </div>
    );
};

export default BlogCard;
