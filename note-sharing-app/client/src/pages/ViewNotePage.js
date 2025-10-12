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
    // ⭐ IMPROVEMENT: Destructure 'user' as well for saved state check
    const { user, isAuthenticated, updateUser } = useAuth(); 

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

    // ⭐ IMPROVEMENT: Handle saving and unsaving logic
    const handleSaveNote = async () => {
        if (!isAuthenticated) {
            alert('Please log in to save notes.');
            return;
        }

        setIsSaving(true);
        try {
            // Check if the note is currently saved by the user
            const action = isSaved ? 'unsave' : 'save'; 
            const endpoint = `/users/${action}/${noteId}`;

            // Authorization is handled by global axios defaults from AuthContext
            const { data } = await axios.put(endpoint); 
            
            // ⭐ Call updateUser from AuthContext to sync the local user state immediately
            // Assuming the server returns the updated user data or a simple success message
            if (data.user) {
                updateUser(data.user);
            }
            
            alert(data.message);
        } catch (error) {
            console.error('Failed to update saved note status', error);
            alert('Failed to update saved note status. Please try again.');
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

        // ... (rest of renderFileViewer remains the same)
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
    const displayFileSize = formatFileSize(note.fileSize);
    
    // ⭐ IMPROVEMENT: Determine saved state for the button
    // Check if the noteId is in the user's savedNotes array.
    const isSaved = user?.savedNotes?.includes(note._id || noteId);

    // Educational Resource Schema Markup (remains the same)
    const noteSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": note.title,
        "description": `Academic notes for the course ${note.course} in subject ${note.subject} at ${note.university}.`,
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
                <meta name="description" content={`View and download notes on ${note.subject} from ${note.university}, uploaded by ${authorName}.`} />
                <link rel="canonical" href={window.location.href} />

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
                        {/* 2. Save/Unsave Note Button */}
                        {isAuthenticated && (
                            <button 
                                onClick={handleSaveNote} 
                                disabled={isSaving} 
                                // ⭐ IMPROVEMENT: Dynamic class and text
                                className={`note-action-save-btn ${isSaved ? 'saved-btn' : 'primary-btn'}`}
                            >
                                <FaBookmark />
                                {isSaving ? ' Updating...' : isSaved ? ' Saved' : ' Save Note'}
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

            <div className="note-feedback-section">
                <Reviews noteId={noteId} reviews={note.reviews || []} onReviewAdded={handleRefetch} />
            </div>

            {/* Collection Modal */}
  {isAuthenticated && isModalOpen && AddToCollectionModal ? (
  <AddToCollectionModal
    noteId={noteId}
    token={user}
    onClose={() => setIsModalOpen(false)}
  />
) : null}

        </div>
    );
};

export default ViewNotePage;

