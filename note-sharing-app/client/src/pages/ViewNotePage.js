import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Reviews from '../components/notes/Reviews';
import StarRating from '../components/common/StarRating';
import useAuth from '../hooks/useAuth';
import AuthorInfoBlock from '../components/common/AuthorInfoBlock';
import { FaBookmark, FaDownload, FaList } from 'react-icons/fa';
import AddToCollectionModal from '../components/notes/AddToCollectionModal';
// FIX 4: Import the new RelatedNotes component
import RelatedNotes from '../components/notes/RelatedNotes'; 

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
    const [isModalOpen, setIsModalOpen] = useState(false); // State for Collection Modal
    const [refetchIndex, setRefetchIndex] = useState(0);
    const { noteId } = useParams();
    const { token, isAuthenticated } = useAuth();

    const fetchNote = useCallback(async () => {
        try {
            // FIX: Use full production URL
            const { data } = await axios.get(`https://peernotez.onrender.com/api/notes/${noteId}`);
            setNote(data);
        } catch (err) {
            console.error('Error fetching note:', err);
            setError('Could not load the note. Please ensure the URL is correct.');
        }
    }, [noteId]);

    useEffect(() => {
        fetchNote();
        // FIX 4: Scroll to top when switching between related notes
        window.scrollTo(0, 0);
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
            // FIX: Use full production URL
            const endpoint = `https://peernotez.onrender.com/api/users/save/${noteId}`;

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
                    <div className="note-image-viewer-container">
                        <img src={note.filePath} alt={note.title} className="note-image" />
                    </div>
                );
            } else {
                return (
                    <iframe
                        src={googleDocsViewerUrl}
                        className="note-file-viewer-iframe"
                        title={note.title}
                        allowFullScreen
                    ></iframe>
                );
            }
        }

        return (
            <div className="note-file-viewer-fallback">
                <i className="fas fa-file-download fallback-icon"></i>
                <p className="fallback-text">
                    {isLocalFile ? "File preview not available for local files." : "This file type cannot be previewed online."}
                </p>
                <a href={note.filePath} download className="note-download-fallback-btn">
                    <i className="fas fa-download"></i> Download Note
                </a>
            </div>
        );
    };

    if (error) {
        return (
            <div className="note-view-page-wrapper error-state">
                <i className="fas fa-exclamation-triangle error-icon"></i>
                <p className="error-message">{error}</p>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="note-view-page-wrapper loading-state">
                <i className="fas fa-spinner fa-spin loading-icon"></i>
                <p className="loading-message">Loading note details...</p>
            </div>
        );
    }

    const authorName = note.user?.name || 'Anonymous';
    // Calculate display file size
    const displayFileSize = formatFileSize(note.fileSize);

    // =========================================================
    // FIX 2 (Enhanced): Smart Metadata Logic
    // =========================================================
    // 1. If we have a manual description (Fix 1), use it.
    // 2. If not, generate a rich description using Title, Subject, and University.
    const seoDescription = note.description 
        ? note.description 
        : `Download "${note.title}" - free lecture notes for ${note.course} (${note.subject}) at ${note.university}. Read reviews and study materials uploaded by ${authorName}.`;

    // Educational Resource Schema Markup
    const noteSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": note.title,
        "description": seoDescription, // Used here as well
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
        <div className="note-view-page-wrapper">
            <Helmet>
                <title>{note.title} | PeerNotez</title>
                {/* 2. SEO FIX: Apply unique description to meta tag */}
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={`https://peernotez.netlify.app/view/${noteId}`} />

                {/* Schema Markup */}
                {note.numReviews > 0 && (
                    <script type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(noteSchema)
                        }}
                    />
                )}
            </Helmet>

            <div className="note-details-card">
                <div className="note-header-wrapper">
                    <div className="note-header-info">
                        <h1 className="note-title">{note.title}</h1>

                        <div className="author-info-line">
                            <AuthorInfoBlock author={note.user} contentId={noteId} contentType="note" />
                        </div>

                        <p className="note-subtitle-text">
                            Course: {note.course} | Subject: {note.subject} | University: {note.university}
                        </p>

                        {/* 3. SEO FIX (Fix 1): Visible unique text content for Googlebot */}
                        {note.description && (
                            <div className="note-description-box" style={{ marginTop: '1.2rem', padding: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '3px solid #6a40f0' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#fff' }}>About these notes:</h4>
                                <p style={{ margin: 0, color: '#ccc', lineHeight: '1.6', fontSize: '1rem' }}>
                                    {note.description}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="note-actions">
                        {/* 1. Add to Collection Button */}
                        {isAuthenticated && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="note-action-save-btn secondary-btn"
                                disabled={isSaving}
                            >
                                <FaList /> Add to Collection
                            </button>
                        )}
                        {/* 2. Save Note Button */}
                        {isAuthenticated && (
                            <button onClick={handleSaveNote} disabled={isSaving} className="note-action-save-btn primary-btn">
                                <FaBookmark />
                                {isSaving ? ' Saving...' : ' Save Note'}
                            </button>
                        )}
                        {/* 3. Download Button (with formatted size) */}
                        <a href={note.filePath} download className="note-action-download-btn download-btn">
                            <FaDownload /> Download ({displayFileSize})
                        </a>
                    </div>
                </div>

                <div className="note-rating-container">
                    <StarRating rating={note.rating} readOnly={true} />
                    <span className="note-rating-count">{note.numReviews} Reviews</span>
                </div>

                <div className="note-file-viewer-container">
                    {renderFileViewer()}
                </div>
            </div>

            {/* FIX 4: Related Notes (Topic Clusters) */}
            {/* Added logic to only show if we have a note loaded */}
            {note && <RelatedNotes currentNoteId={noteId} />}

            <div className="note-feedback-section">
                <Reviews noteId={noteId} reviews={note.reviews || []} onReviewAdded={handleRefetch} />
            </div>

            {/* Collection Modal */}
            {isAuthenticated && isModalOpen && (
                <AddToCollectionModal
                    noteId={noteId}
                    token={token}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ViewNotePage;
