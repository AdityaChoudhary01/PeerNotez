import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import StarRating from '../common/StarRating';
import { 
    FaDownload, FaEye, FaHeart, FaRegHeart, FaEdit, FaTrash, 
    FaGraduationCap, FaBook, FaCalendarAlt, FaFileAlt 
} from 'react-icons/fa';
import { optimizeCloudinaryUrl } from '../../utils/cloudinaryHelper';

const NoteCard = ({ note, showActions = false, onEdit = () => {}, onDelete = () => {} }) => {
    const { user, token, saveNote, unsaveNote } = useAuth();
    const location = useLocation();
    
    // 1. Check if on Homepage
    const isHomePage = location.pathname === '/';

    // 2. Check if device is Mobile (Kept for Layout Styling)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 3. Apply compact styles ONLY if on Homepage AND Mobile
    const isCompact = isHomePage && isMobile;

    // Safely check if savedNotes exists
    const isSaved = user?.savedNotes ? user.savedNotes.includes(note._id) : false;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';

    // --- INTERNAL CSS: DEEP SPACE HOLOGRAPHIC THEME ---
    const styles = {
        card: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            height: '100%',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
        },
        cardHover: {
            transform: 'translateY(-8px)',
            borderColor: 'rgba(0, 212, 255, 0.4)', // Neon Cyan Border
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 212, 255, 0.2)' // Neon Glow
        },
        thumbnailContainer: {
            height: isCompact ? '140px' : '180px', 
            background: '#0f0c29', // Dark backing for images
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        },
        thumbnail: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            opacity: 0.9
        },
        thumbnailHover: {
            transform: 'scale(1.1)',
            opacity: 1
        },
        overlay: {
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            background: 'rgba(15, 12, 41, 0.6)', // Deep purple tint
            backdropFilter: 'blur(2px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease'
        },
        overlayVisible: {
            opacity: 1
        },
        content: {
            padding: isCompact ? '0.8rem' : '1.2rem', 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.01), transparent)'
        },
        title: {
            fontSize: isCompact ? '0.95rem' : '1.1rem', 
            fontWeight: '700',
            color: '#fff',
            marginBottom: '0.5rem',
            lineHeight: 1.4,
            textDecoration: 'none',
            display: 'block',
            whiteSpace: isCompact ? 'nowrap' : 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: "'Spline Sans', sans-serif"
        },
        metaContainer: {
            fontSize: isCompact ? '0.7rem' : '0.85rem',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis'
        },
        actions: {
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: isCompact ? '0.6rem' : '1rem',
            borderTop: '1px solid rgba(255,255,255,0.08)'
        },
        iconBtn: {
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isCompact ? '32px' : '38px',
            height: isCompact ? '32px' : '38px',
            borderRadius: '50%', // Circular buttons
        },
        viewBtn: {
            background: 'linear-gradient(135deg, #00d4ff 0%, #ff00cc 100%)', // Brand Gradient
            color: '#fff',
            padding: isCompact ? '6px 14px' : '8px 20px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontSize: isCompact ? '0.75rem' : '0.85rem',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
            transition: 'all 0.3s ease',
            border: 'none'
        },
        starContainer: {
            marginBottom: '0.8rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            fontSize: '0.8rem', 
            color: '#ffcc00'
        }
    };

    // --- LOGIC: THUMBNAIL GENERATION WITH SRCSET ---
    let thumbnailUrl = '/images/icons/document-icon.png';
    let srcSet = null;
    const fileType = note.fileType || '';

    if (note.cloudinaryId) {
        let baseUrl;
        if (note.cloudinaryId.startsWith('http')) {
             baseUrl = note.cloudinaryId;
        } else {
             baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${note.cloudinaryId}.jpg`;
        }
        
        // Generate responsive versions
        // 320w (mobile) and 400w (desktop card) - maintaining approx 4:3 ratio
        if (fileType.startsWith('image/')) {
            // Default Fill Crop
            thumbnailUrl = optimizeCloudinaryUrl(baseUrl, { width: 400, height: 300 });
            const smUrl = optimizeCloudinaryUrl(baseUrl, { width: 320, height: 240 });
            const lgUrl = optimizeCloudinaryUrl(baseUrl, { width: 400, height: 300 });
            
            srcSet = `${smUrl} 320w, ${lgUrl} 400w`;

        } else if (fileType === 'application/pdf') {
            // PDF specific opts
            const opts = { pg: 1, crop: 'pad' };
            thumbnailUrl = optimizeCloudinaryUrl(baseUrl, { width: 400, height: 300, ...opts });
            const smUrl = optimizeCloudinaryUrl(baseUrl, { width: 320, height: 240, ...opts });
            const lgUrl = optimizeCloudinaryUrl(baseUrl, { width: 400, height: 300, ...opts });
            
            srcSet = `${smUrl} 320w, ${lgUrl} 400w`;
        }
    } else {
        // Fallback icons
        if (fileType.includes('word')) thumbnailUrl = '/images/icons/word-icon.png';
        else if (fileType.includes('excel') || fileType.includes('spreadsheet')) thumbnailUrl = '/images/icons/excel-icon.png';
        else if (fileType.includes('powerpoint')) thumbnailUrl = '/images/icons/ppt-icon.png';
    }

    // --- HANDLERS ---
    const handleSaveToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return alert('Please log in to save notes.');

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const endpoint = isSaved ? `/users/unsave/${note._id}` : `/users/save/${note._id}`;

        try {
            await axios.put(endpoint, {}, config);
            isSaved ? unsaveNote(note._id) : saveNote(note._id);
        } catch (error) {
            console.error('Failed to update saved notes', error);
        }
    };

    const handleDownload = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await axios.put(`/notes/${note._id}/download`);
            window.open(note.filePath, '_blank');
        } catch (error) {
            console.error('Failed to download', error);
        }
    };

    return (
        <div 
            style={isHovered ? {...styles.card, ...styles.cardHover} : styles.card}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* THUMBNAIL SECTION */}
            <Link 
                to={`/view/${note._id}`} 
                style={{display: 'block', position: 'relative'}}
                aria-label={`View note: ${note.title}`}
            >
                <div style={styles.thumbnailContainer}>
                    <img 
                        src={thumbnailUrl} 
                        srcSet={srcSet || undefined}
                        sizes="(max-width: 768px) 320px, 400px"
                        alt={note.title} 
                        /* OPTIMIZATION APPLIED:
                           1. explicit width/height
                           2. srcset/sizes for browser-native selection
                           3. decoding async
                        */
                        width="400"
                        height="300"
                        loading="lazy"
                        decoding="async"
                        style={isHovered ? {...styles.thumbnail, ...styles.thumbnailHover} : styles.thumbnail}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/icons/document-icon.png'; }}
                    />
                    {/* Hover Overlay */}
                    <div style={isHovered ? {...styles.overlay, ...styles.overlayVisible} : styles.overlay}>
                        <FaEye size={30} color="#00d4ff" style={{filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.8))'}} />
                    </div>
                </div>
            </Link>

            {/* CONTENT SECTION */}
            <div style={styles.content}>
                <Link 
                    to={`/view/${note._id}`} 
                    style={isHovered ? {...styles.title, color: '#00d4ff'} : styles.title}
                    title={note.title}
                >
                    {note.title}
                </Link>
                
                <div style={styles.starContainer}>
                    <StarRating rating={note.rating} readOnly={true} size={12} />
                    <span style={{color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem'}}>({note.numReviews})</span>
                </div>

                <div style={styles.metaContainer}>
                    <div style={styles.metaItem}><FaGraduationCap color="#ff00cc" size={12} /> {note.university}</div>
                    <div style={styles.metaItem}><FaBook color="#00d4ff" size={12} /> {note.course}</div>
                    <div style={styles.metaItem}><FaFileAlt color="#00ff99" size={12} /> {note.subject}</div>
                    <div style={styles.metaItem}><FaCalendarAlt color="#ffcc00" size={12} /> {note.year}</div>
                </div>

                {/* ADMIN/AUTHOR ACTIONS */}
                {showActions && (
                    <div style={{display: 'flex', gap: '10px', marginBottom: '1rem', marginTop: 'auto'}}>
                         <button 
                            onClick={(e) => { e.preventDefault(); onEdit(note); }}
                            style={{
                                ...styles.viewBtn, 
                                background: 'rgba(0,212,255,0.1)', 
                                border: '1px solid rgba(0,212,255,0.3)', 
                                color: '#00d4ff', 
                                flex: 1, 
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                            aria-label={`Edit ${note.title}`}
                         >
                             <FaEdit /> Edit
                         </button>
                         <button 
                            onClick={(e) => { e.preventDefault(); onDelete(note._id); }}
                            style={{
                                ...styles.viewBtn, 
                                background: 'rgba(255,0,85,0.1)', 
                                border: '1px solid rgba(255,0,85,0.3)', 
                                color: '#ff0055', 
                                flex: 1, 
                                padding: '6px', 
                                boxShadow: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                            aria-label={`Delete ${note.title}`}
                         >
                             <FaTrash /> Delete
                         </button>
                    </div>
                )}

                {/* USER ACTIONS */}
                <div style={styles.actions}>
                    <button 
                        onClick={handleSaveToggle} 
                        style={styles.iconBtn}
                        title={isSaved ? "Unsave" : "Save"}
                        aria-label={isSaved ? "Unsave note" : "Save note"}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ff0055'; e.currentTarget.style.borderColor = '#ff0055'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    >
                        {isSaved ? <FaHeart color="#ff0055" /> : <FaRegHeart />}
                    </button>

                    <button 
                        onClick={handleDownload} 
                        style={styles.iconBtn}
                        title="Download"
                        aria-label={`Download ${note.title}`}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#00d4ff'; e.currentTarget.style.borderColor = '#00d4ff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    >
                        <FaDownload />
                    </button>

                    <Link 
                        to={`/view/${note._id}`} 
                        style={styles.viewBtn}
                        aria-label={`View details for ${note.title}`}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 0, 204, 0.4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)'; }}
                    >
                        {isCompact ? 'View' : 'View Details'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NoteCard;
