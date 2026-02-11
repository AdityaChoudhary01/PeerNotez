import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import StarRating from '../common/StarRating';
import { FaDownload, FaEye, FaHeart, FaRegHeart, FaEdit, FaTrash } from 'react-icons/fa';
import { optimizeCloudinaryUrl } from '../../utils/cloudinaryHelper';

const NoteCard = ({ note, showActions = false, onEdit = () => {}, onDelete = () => {} }) => {
    const { user, token, saveNote, unsaveNote } = useAuth();
    const location = useLocation();
    
    // 1. Check if on Homepage
    const isHomePage = location.pathname === '/';

    // 2. Check if device is Mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 3. Apply compact styles ONLY if on Homepage AND Mobile
    const isCompact = isHomePage && isMobile;

    // Safely check if savedNotes exists before checking includes
    const isSaved = user?.savedNotes ? user.savedNotes.includes(note._id) : false;
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const [isHovered, setIsHovered] = useState(false);

    // --- INTERNAL CSS: HOLOGRAPHIC CARD ---
    const styles = {
        card: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            height: '100%',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
        },
        cardHover: {
            transform: 'translateY(-8px)',
            borderColor: 'rgba(0, 212, 255, 0.3)',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 212, 255, 0.1)'
        },
        thumbnailContainer: {
            // Only shorten height on Mobile Homepage
            height: isCompact ? '150px' : '180px', 
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            transition: 'height 0.3s ease'
        },
        thumbnail: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
        },
        thumbnailHover: {
            transform: 'scale(1.1)'
        },
        content: {
            // Only reduce padding on Mobile Homepage
            padding: isCompact ? '0.8rem' : '1.2rem', 
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
        },
        title: {
            // Only reduce font size on Mobile Homepage
            fontSize: isCompact ? '1rem' : '1.1rem', 
            fontWeight: '700',
            color: '#fff',
            marginBottom: '0.5rem',
            lineHeight: 1.3,
            textDecoration: 'none',
            display: 'block',
            // Truncate text only on Mobile Homepage to fit 2 columns
            whiteSpace: isCompact ? 'nowrap' : 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        meta: {
            fontSize: isCompact ? '0.75rem' : '0.85rem',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '1rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: isCompact ? '2px' : '5px'
        },
        actions: {
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: isCompact ? '0.8rem' : '1rem',
            borderTop: '1px solid rgba(255,255,255,0.1)'
        },
        actionBtn: {
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.9rem',
            padding: isCompact ? '4px' : '5px 8px',
            borderRadius: '6px'
        },
        viewBtn: {
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            padding: isCompact ? '5px 10px' : '6px 12px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontSize: isCompact ? '0.75rem' : '0.85rem',
            fontWeight: '600'
        },
        heartIcon: {
            color: isSaved ? '#ff0055' : 'inherit',
            filter: isSaved ? 'drop-shadow(0 0 5px rgba(255,0,85,0.5))' : 'none'
        }
    };

    // --- THUMBNAIL LOGIC ---
    let thumbnailUrl = '/images/icons/document-icon.png';
    const fileType = note.fileType || '';

    if (note.cloudinaryId) {
        const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${note.cloudinaryId}.jpg`;
        if (fileType.startsWith('image/')) {
            thumbnailUrl = optimizeCloudinaryUrl(baseUrl, { width: 400, height: 300 });
        } else if (fileType === 'application/pdf') {
            thumbnailUrl = optimizeCloudinaryUrl(baseUrl, { width: 400, height: 300, pg: 1, crop: 'pad' });
        }
    } else if (fileType.includes('msword') || fileType.includes('wordprocessingml')) {
        thumbnailUrl = '/images/icons/word-icon.png';
    } else if (fileType.includes('ms-excel') || fileType.includes('spreadsheetml')) {
        thumbnailUrl = '/images/icons/excel-icon.png';
    } else if (fileType.includes('powerpoint') || fileType.includes('presentationml')) {
        thumbnailUrl = '/images/icons/ppt-icon.png';
    } else if (fileType === 'text/plain') {
        thumbnailUrl = '/images/icons/text-icon.png';
    }

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
            <Link to={`/view/${note._id}`} style={{display: 'block'}}>
                <div style={styles.thumbnailContainer}>
                    <img 
                        src={thumbnailUrl} 
                        alt={note.title} 
                        loading="lazy"
                        style={isHovered ? {...styles.thumbnail, ...styles.thumbnailHover} : styles.thumbnail}
                        {...(!note.cloudinaryId ? { style: { ...styles.thumbnail, objectFit: 'contain', padding: '20%' } } : {})}
                    />
                    {isHovered && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <FaEye size={30} color="#fff" />
                        </div>
                    )}
                </div>
            </Link>

            <div style={styles.content}>
                <Link to={`/view/${note._id}`} style={styles.title} title={note.title}>
                    {note.title}
                </Link>
                
                <div style={{marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#ffcc00'}}>
                    <StarRating rating={note.rating} readOnly={true} size={12} />
                    <span style={{color: 'rgba(255,255,255,0.5)'}}>({note.numReviews})</span>
                </div>

                <div style={styles.meta}>
                    <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>🎓 {note.university}</span>
                    <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>📚 {note.course}</span>
                    <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>📝 {note.subject}</span>
                    <span>📅 {note.year}</span>
                </div>

                {showActions && (
                    <div style={{display: 'flex', gap: '10px', marginBottom: '1rem', marginTop: 'auto'}}>
                         <button 
                            onClick={(e) => { e.preventDefault(); onEdit(note); }}
                            style={{...styles.actionBtn, color: '#00d4ff', background: 'rgba(0,212,255,0.1)'}}
                            aria-label="Edit note"
                         >
                             <FaEdit /> Edit
                         </button>
                         <button 
                            onClick={(e) => { e.preventDefault(); onDelete(note._id); }}
                            style={{...styles.actionBtn, color: '#ff0055', background: 'rgba(255,0,85,0.1)'}}
                            aria-label="Delete note"
                         >
                             <FaTrash /> Delete
                         </button>
                    </div>
                )}

                <div style={styles.actions}>
                    <button 
                        onClick={handleSaveToggle} 
                        style={styles.actionBtn}
                        title={isSaved ? "Unsave" : "Save"}
                        aria-label={isSaved ? "Unsave note" : "Save note"}
                    >
                        {isSaved ? <FaHeart style={styles.heartIcon} /> : <FaRegHeart />}
                    </button>

                    <button 
                        onClick={handleDownload} 
                        style={styles.actionBtn}
                        title="Download"
                        aria-label="Download note"
                    >
                        <FaDownload />
                    </button>

                    <Link to={`/view/${note._id}`} style={styles.viewBtn}>
                        {isCompact ? 'View' : 'View Details'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NoteCard;
