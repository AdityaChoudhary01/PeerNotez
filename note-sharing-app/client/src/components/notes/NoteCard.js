import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import StarRating from '../common/StarRating';
import { FaDownload, FaEye, FaHeart, FaRegHeart, FaEdit, FaTrash } from 'react-icons/fa';
import { optimizeCloudinaryUrl } from '../../utils/cloudinaryHelper';

const NoteCard = ({ note, showActions = false, onEdit = () => {}, onDelete = () => {} }) => {
    const { user, token, saveNote, unsaveNote } = useAuth();
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
            height: '180px',
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
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
            padding: '1.2rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
        },
        title: {
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '0.5rem',
            lineHeight: 1.3,
            textDecoration: 'none',
            display: 'block'
        },
        meta: {
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '1rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '5px'
        },
        actions: {
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
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
            padding: '5px 8px',
            borderRadius: '6px'
        },
        viewBtn: {
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontSize: '0.85rem',
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

    // Optimized Cloudinary Logic
    if (note.cloudinaryId) {
        const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${note.cloudinaryId}.jpg`;
        
        if (fileType.startsWith('image/')) {
            // Optimize image thumbnails
            thumbnailUrl = optimizeCloudinaryUrl(baseUrl, { width: 400, height: 300 });
        } else if (fileType === 'application/pdf') {
            // Generate optimized PDF preview of page 1
            thumbnailUrl = optimizeCloudinaryUrl(baseUrl, { width: 400, height: 300, pg: 1, crop: 'pad' });
        }
    } 
    // Static Fallback Icons
    else if (fileType.includes('msword') || fileType.includes('wordprocessingml')) {
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
                        // Apply specific styling if using a static icon vs an image preview
                        css={!note.cloudinaryId ? { objectFit: 'contain', padding: '20%' } : {}}
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
                <Link to={`/view/${note._id}`} style={styles.title}>
                    {note.title}
                </Link>
                
                <div style={{marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#ffcc00'}}>
                    <StarRating rating={note.rating} readOnly={true} size={12} />
                    <span style={{color: 'rgba(255,255,255,0.5)'}}>({note.numReviews})</span>
                </div>

                <div style={styles.meta}>
                    <span>🎓 {note.university}</span>
                    <span>📚 {note.course}</span>
                    <span>📝 {note.subject}</span>
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
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NoteCard;
