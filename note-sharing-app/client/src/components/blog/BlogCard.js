import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaCalendarAlt, FaEdit, FaTrash, FaArrowRight, FaImage } from 'react-icons/fa';
import StarRating from '../common/StarRating';
import { optimizeCloudinaryUrl } from '../../utils/cloudinaryHelper';

const BlogCard = ({ blog, showActions = false, onDelete = () => {}, onEdit = () => {} }) => {
    
    // --- 1. SAFE DATA HANDLING ---
    const dateToFormat = blog.createdAt ? new Date(blog.createdAt) : new Date();
    const formattedDate = dateToFormat.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const views = (blog.views || blog.downloadCount || 0).toLocaleString();

    // Summary Generation Logic
    const getSummary = () => {
        if (blog.summary && blog.summary.trim().length > 0) {
            return blog.summary.length > 100 ? blog.summary.substring(0, 100) + '...' : blog.summary;
        }
        if (blog.content) {
            const cleanText = blog.content.replace(/<[^>]+>/g, '').replace(/[#*`_[\]]/g, '');
            return cleanText.substring(0, 100) + '...';
        }
        return 'No summary available.';
    };

    const summaryText = getSummary();

    // --- 2. HOLOGRAPHIC STYLES ---
    const styles = {
        card: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            overflow: 'hidden', // Ensures image stays inside radius
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
        },
        cardHover: {
            transform: 'translateY(-5px)',
            borderColor: 'rgba(0, 212, 255, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 212, 255, 0.1)'
        },
        bannerContainer: {
            width: '100%',
            height: '180px',
            position: 'relative',
            overflow: 'hidden',
            background: '#1e293b' // Placeholder color
        },
        bannerImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
        },
        bannerPlaceholder: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            color: 'rgba(255,255,255,0.2)'
        },
        contentBody: {
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
        },
        title: {
            fontSize: '1.3rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0',
            lineHeight: 1.3,
            color: '#fff',
            textDecoration: 'none',
            display: 'block',
            transition: 'color 0.3s'
        },
        summary: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
            flex: 1, 
            fontFamily: "'Spline Sans', sans-serif"
        },
        metaList: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1rem',
            marginTop: 'auto'
        },
        authorDetails: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        authorAvatar: {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid rgba(0, 212, 255, 0.5)'
        },
        authorName: {
            fontSize: '0.85rem',
            color: '#fff',
            fontWeight: '600'
        },
        statsColumn: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.6)'
        },
        statRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        actionContainer: {
            display: 'flex',
            gap: '10px',
            marginTop: '1.5rem'
        },
        btn: {
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s'
        },
        editBtn: {
            background: 'rgba(0, 212, 255, 0.1)',
            color: '#00d4ff',
            border: '1px solid rgba(0, 212, 255, 0.3)'
        },
        deleteBtn: {
            background: 'rgba(255, 0, 85, 0.1)',
            color: '#ff0055',
            border: '1px solid rgba(255, 0, 85, 0.3)'
        },
        readMoreBtn: {
            marginTop: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#00d4ff',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'gap 0.3s'
        }
    };

    return (
        <div 
            style={styles.card}
            onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.cardHover);
                const img = e.currentTarget.querySelector('img.banner-img');
                if(img) img.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
                const img = e.currentTarget.querySelector('img.banner-img');
                if(img) img.style.transform = 'scale(1)';
            }}
        >
            <Link to={`/blogs/${blog.slug}`} style={styles.bannerContainer}>
                {blog.coverImage ? (
                    <img 
                        src={optimizeCloudinaryUrl(blog.coverImage, { width: 600, height: 338 })} 
                        alt={blog.title} 
                        loading="lazy"
                        style={styles.bannerImage} 
                        className="banner-img"
                    />
                ) : (
                    <div style={styles.bannerPlaceholder}>
                        <FaImage size={40} />
                    </div>
                )}
            </Link>

            <div style={styles.contentBody}>
                <Link to={`/blogs/${blog.slug}`} style={{textDecoration: 'none'}}>
                    <h3 
                        style={styles.title}
                        onMouseEnter={(e) => e.target.style.color = '#00d4ff'}
                        onMouseLeave={(e) => e.target.style.color = '#fff'}
                    >
                        {blog.title}
                    </h3>
                </Link>
                
                <p style={styles.summary}>
                    {summaryText}
                </p>
                
                <div style={styles.metaList}>
                    <div style={styles.authorDetails}>
                        <img 
                            src={optimizeCloudinaryUrl(blog.author?.avatar || 'https://via.placeholder.com/40', { width: 80, height: 80, crop: 'thumb', isProfile: true })} 
                            alt={`Avatar of ${blog.author?.name}`} 
                            loading="lazy"
                            style={styles.authorAvatar}
                        />
                        <div>
                            <div style={styles.authorName}>
                                {blog.author?.name || 'Deleted User'}
                            </div>
                            <div style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px'}}>
                                <FaCalendarAlt style={{fontSize: '0.7rem', marginRight: '4px'}} /> 
                                {formattedDate}
                            </div>
                        </div>
                    </div>

                    <div style={styles.statsColumn}>
                        <div style={styles.statRow}>
                            <StarRating rating={blog.rating || 0} readOnly={true} size={12} />
                            <span>({blog.numReviews || 0})</span>
                        </div>
                        <div style={styles.statRow}>
                            <FaEye /> {views} views
                        </div>
                    </div>
                </div>

                {showActions ? (
                    <div style={styles.actionContainer}>
                        <button 
                            style={{...styles.btn, ...styles.editBtn}} 
                            onClick={() => onEdit(blog)}
                            aria-label="Edit blog"
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'}
                        >
                            <FaEdit /> Edit
                        </button>
                        <button 
                            style={{...styles.btn, ...styles.deleteBtn}} 
                            onClick={() => onDelete(blog._id)}
                            aria-label="Delete blog"
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 0, 85, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 0, 85, 0.1)'}
                        >
                            <FaTrash /> Delete
                        </button>
                    </div>
                ) : (
                    <Link 
                        to={`/blogs/${blog.slug}`} 
                        style={styles.readMoreBtn}
                        onMouseEnter={(e) => e.currentTarget.style.gap = '12px'}
                        onMouseLeave={(e) => e.currentTarget.style.gap = '8px'}
                    >
                        Read Full Article <FaArrowRight />
                    </Link>
                )}
            </div>
        </div>
    );
};

export default BlogCard;
