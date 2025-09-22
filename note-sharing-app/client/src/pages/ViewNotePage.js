import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Reviews from '../components/notes/Reviews';
import StarRating from '../components/common/StarRating';
import useAuth from '../hooks/useAuth';

const ViewNotePage = () => {
    const [note, setNote] = useState(null);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { noteId } = useParams();
    const { token, isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const { data } = await axios.get(`https://peernotez.onrender.com/api/notes/${noteId}`);
                setNote(data);
            } catch (err) {
                setError('Could not load the note. Please ensure the URL is correct.');
            }
        };
        fetchNote();
    }, [noteId]);

    const handleSaveNote = async () => {
        if (!isAuthenticated) {
            alert('Please log in to save notes.');
            return;
        }

        setIsSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`https://peernotez.onrender.com/api/notes/${noteId}/save`, {}, config);
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
    
        // Check if the URL is from a local server, which won't work with the viewer
        const isLocalFile = note.filePath.startsWith('http://localhost') || note.filePath.startsWith('https://localhost');
    
        // Only attempt to render a preview if the file is a document type and not a local file
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
        
        // Fallback for files that cannot be previewed or are local
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
    const authorProfileLink = note.user?._id ? `/profile/${note.user._id}` : '#';

    return (
        <div className="note-view-page-wrapper">
            <Helmet>
                <title>{note.title} | PeerNotez</title>
                <meta name="description" content={`View and download notes on ${note.subject} from ${note.university}, uploaded by ${authorName}.`} />
            </Helmet>

            <div className="note-details-card">
                <div className="note-header-wrapper">
                    <div className="note-header-info">
                        <h1 className="note-title">{note.title}</h1>
                        <p className="note-subtitle">
                            <Link to={authorProfileLink} className="note-author-link">
                                by {authorName}
                            </Link>
                            <span className="note-course-info">{note.subject} | {note.university}</span>
                        </p>
                    </div>
                    <div className="note-actions">
                        {isAuthenticated && (
                            <button onClick={handleSaveNote} disabled={isSaving} className="note-action-save-btn">
                                <i className="fas fa-bookmark"></i>
                                {isSaving ? ' Saving...' : ' Save Note'}
                            </button>
                        )}
                        <a href={note.filePath} download className="note-action-download-btn">
                            <i className="fas fa-download"></i> Download ({note.fileSize})
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
                <Reviews noteId={noteId} reviews={note.reviews || []} />
            </div>
        </div>
    );
};

export default ViewNotePage;

