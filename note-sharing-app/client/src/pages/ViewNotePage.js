import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Reviews from '../components/notes/Reviews';
import StarRating from '../components/common/StarRating';
import useAuth from '../hooks/useAuth';
import AuthorInfoBlock from '../components/common/AuthorInfoBlock';
import { FaBookmark, FaDownload, FaList, FaExclamationTriangle, FaSpinner, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import AddToCollectionModal from '../components/notes/AddToCollectionModal';
import RelatedNotes from '../components/notes/RelatedNotes'; // RESTORED IMPORT

// Utility function: Converts bytes to human-readable format (KB, MB)
const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const ViewNotePage = () => {
    const [note, setNote] = useState(null);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [refetchIndex, setRefetchIndex] = useState(0);
    const { noteId } = useParams();
    const { token, isAuthenticated } = useAuth();

    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            minHeight: '80vh',
            maxWidth: '1200px',
            margin: '0 auto',
            paddingLeft: '1rem',
            paddingRight: '1rem'
        },
        card: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2.5rem',
            marginBottom: '3rem',
            boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
            color: '#fff'
        },
        header: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            marginBottom: '2rem'
        },
        title: {
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', // Responsive font size
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            wordBreak: 'break-word' // Prevent overflow on small screens
        },
        subtitle: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem',
            lineHeight: 1.6
        },
        // RESTORED DESCRIPTION STYLE
        descriptionBox: {
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1.5rem',
            borderRadius: '16px',
            marginTop: '1.5rem',
            borderLeft: '4px solid #00d4ff',
            lineHeight: '1.7',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.05rem'
        },
        actionsBar: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1.5rem'
        },
        btn: {
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            flex: '1 1 auto', // Allow buttons to grow/shrink nicely
            justifyContent: 'center'
        },
        primaryBtn: {
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'
        },
        secondaryBtn: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        downloadBtn: {
            background: 'rgba(0, 255, 170, 0.15)',
            color: '#00ffaa',
            border: '1px solid rgba(0, 255, 170, 0.3)'
        },
        ratingContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '1rem',
            background: 'rgba(255,255,255,0.05)',
            padding: '10px 15px',
            borderRadius: '12px',
            width: 'fit-content'
        },
        viewerContainer: {
            marginTop: '2rem',
            background: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            minHeight: '500px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
        iframe: {
            width: '100%',
            height: '800px',
            border: 'none'
        },
        image: {
            maxWidth: '100%',
            height: 'auto',
            display: 'block'
        },
        fallbackViewer: {
            textAlign: 'center',
            padding: '3rem',
            color: 'rgba(255,255,255,0.6)'
        },
        centerMessage: {
            textAlign: 'center',
            padding: '5rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.2rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px dashed rgba(255,255,255,0.1)'
        }
    };

    const fetchNote = useCallback(async () => {
        try {
            const { data } = await axios.get(`/notes/${noteId}`);
            setNote(data);
        } catch (err) {
            console.error('Error fetching note:', err);
            setError('Could not load the note. Please ensure the URL is correct.');
        }
    }, [noteId]);

    useEffect(() => {
        fetchNote();
    }, [noteId, refetchIndex, fetchNote]);

    const handleRefetch = () => {
        setRefetchIndex(prev => prev + 1);
    };

    const handleSaveNote = async () => {
        if (!isAuthenticated) {
            alert('Please log in to save notes.');
            return;
        }

        setIsSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const endpoint = `/users/save/${noteId}`;

            const { data } = await axios.put(endpoint, {}, config);
            alert(data.message);
        } catch (error) {
            console.error('Failed to save note', error);
            alert('Failed to save note. It might already be saved or an error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const renderFileViewer = () => {
        if (!note || !note.filePath) return null;

        const fileType = note.fileType || '';
        const encodedUrl = encodeURIComponent(note.filePath);
        const googleDocsViewerUrl = `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;

        const isLocalFile = note.filePath.startsWith('http://localhost') || note.filePath.startsWith('https://localhost');

        if (
            (fileType.startsWith('image/') || fileType === 'application/pdf' || fileType.includes('officedocument') || fileType.includes('ms-')) && !isLocalFile
        ) {
            if (fileType.startsWith('image/')) {
                return (
                    <div style={{...styles.viewerContainer, background: 'transparent', border: 'none'}}>
                        <img src={note.filePath} alt={note.title} style={styles.image} />
                    </div>
                );
            } else {
                return (
                    <div style={styles.viewerContainer} className="viewer-container-responsive">
                        <iframe
                            src={googleDocsViewerUrl}
                            style={styles.iframe}
                            title={note.title}
                            allowFullScreen
                        ></iframe>
                    </div>
                );
            }
        }

        return (
            <div style={styles.viewerContainer} className="viewer-container-responsive">
                <div style={styles.fallbackViewer}>
                    <FaFileAlt style={{fontSize: '3rem', marginBottom: '1rem', opacity: 0.5}} />
                    <p style={{marginBottom: '1.5rem'}}>
                        {isLocalFile ? "File preview not available for local files." : "This file type cannot be previewed online."}
                    </p>
                    <a 
                        href={note.filePath} 
                        download 
                        style={{...styles.btn, ...styles.downloadBtn, display: 'inline-flex', width: 'auto'}}
                    >
                        <FaDownload /> Download Note
                    </a>
                </div>
            </div>
        );
    };

    if (error) {
        return (
            <div style={{...styles.centerMessage, marginTop: '2rem'}}>
                <FaExclamationTriangle style={{fontSize: '2rem', color: '#ff0055', marginBottom: '1rem'}} />
                <p>{error}</p>
            </div>
        );
    }

    if (!note) {
        return (
            <div style={{...styles.centerMessage, marginTop: '2rem'}}>
                <FaSpinner className="fa-spin" style={{fontSize: '2rem', color: '#00d4ff', marginBottom: '1rem'}} />
                <p>Loading note details...</p>
            </div>
        );
    }

    const authorName = note.user?.name || 'Anonymous';
    const displayFileSize = formatFileSize(note.fileSize);

    // =========================================================
    // MERGED SEO LOGIC: Smart Metadata & Schema
    // =========================================================
    const seoDescription = note.description 
        ? note.description 
        : `Download "${note.title}" - free lecture notes for ${note.course} (${note.subject}) at ${note.university}. Read reviews and study materials uploaded by ${authorName}.`;

    const noteSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": note.title,
        "description": seoDescription,
        "provider": {
            "@type": "Organization",
            "name": "PeerNotez"
        },
        "hasPart": {
            "@type": "LearningResource",
            "name": note.title,
            "url": window.location.href,
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": (note.rating || 0).toFixed(1),
                "reviewCount": note.numReviews
            }
        },
        "about": note.subject,
        "inLanguage": "en"
    };

    return (
        <div style={styles.wrapper} className="view-note-wrapper">
            <Helmet>
                <title>{note.title} | PeerNotez</title>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={`https://peernotez.netlify.app/view/${noteId}`} />
                {note.numReviews > 0 && (
                    <script type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(noteSchema)
                        }}
                    />
                )}
            </Helmet>

            <div style={styles.card} className="view-note-card">
                <div style={styles.header} className="view-note-header">
                    <div>
                        <h1 style={styles.title}>{note.title}</h1>
                        <div style={{marginBottom: '1rem'}}>
                            <AuthorInfoBlock author={note.user} contentId={noteId} contentType="note" />
                        </div>
                        <p style={styles.subtitle}>
                            Course: <strong style={{color: '#fff'}}>{note.course}</strong> | Subject: <strong style={{color: '#fff'}}>{note.subject}</strong> | University: <strong style={{color: '#fff'}}>{note.university}</strong>
                        </p>
                    </div>

                    {/* RESTORED: Description UI Section */}
                    {note.description && (
                        <div style={styles.descriptionBox}>
                            <h4 style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#00d4ff', fontSize: '0.9rem', textTransform: 'uppercase'}}>
                                <FaInfoCircle /> About these notes
                            </h4>
                            {note.description}
                        </div>
                    )}

                    <div style={styles.ratingContainer}>
                        <StarRating rating={note.rating} readOnly={true} />
                        <span style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>{note.numReviews} Reviews</span>
                    </div>

                    <div style={styles.actionsBar} className="view-note-actions">
                        {isAuthenticated && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                style={{...styles.btn, ...styles.secondaryBtn}}
                                disabled={isSaving}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                <FaList /> Add to Collection
                            </button>
                        )}
                        
                        {isAuthenticated && (
                            <button 
                                onClick={handleSaveNote} 
                                disabled={isSaving} 
                                style={{...styles.btn, ...styles.primaryBtn}}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                <FaBookmark />
                                {isSaving ? ' Saving...' : ' Save Note'}
                            </button>
                        )}
                        
                        <a 
                            href={note.filePath} 
                            download 
                            style={{...styles.btn, ...styles.downloadBtn}}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(0, 255, 170, 0.25)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(0, 255, 170, 0.15)'}
                        >
                            <FaDownload /> Download ({displayFileSize})
                        </a>
                    </div>
                </div>

                {renderFileViewer()}
            </div>

            {/* ADDED: Related Notes Section */}
            <RelatedNotes currentNoteId={noteId} />

            <div style={{marginTop: '3rem'}}>
                <Reviews noteId={noteId} reviews={note.reviews || []} onReviewAdded={handleRefetch} />
            </div>

            {isAuthenticated && isModalOpen && (
                <AddToCollectionModal
                    noteId={noteId}
                    token={token}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {/* RESPONSIVE STYLES */}
            <style>{`
                /* Mobile Styles */
                @media (max-width: 768px) {
                    .view-note-wrapper {
                        padding-top: 1rem !important;
                        padding-left: 0.5rem !important;
                        padding-right: 0.5rem !important;
                    }
                    .view-note-card {
                        padding: 1.25rem !important;
                        border-radius: 16px !important;
                        margin-bottom: 2rem !important;
                    }
                    .view-note-header {
                        gap: 1rem !important;
                        margin-bottom: 1.5rem !important;
                    }
                    .view-note-actions {
                        flex-direction: column;
                        gap: 0.8rem !important;
                    }
                    .view-note-actions button,
                    .view-note-actions a {
                        width: 100%;
                    }
                    .viewer-container-responsive {
                        min-height: 300px !important;
                    }
                    .viewer-container-responsive iframe {
                        height: 400px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ViewNotePage;
