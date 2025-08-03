import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; // --- IMPORT LINK ---
import { Helmet } from 'react-helmet'; // --- IMPORT HELMET ---
import Reviews from '../components/notes/Reviews';
import StarRating from '../components/common/StarRating';

const ViewNotePage = () => {
    const [note, setNote] = useState(null);
    const [error, setError] = useState('');
    const { noteId } = useParams();

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

    const renderFileViewer = () => {
        if (!note || !note.filePath) return null;

        const fileType = note.fileType || '';
        const encodedUrl = encodeURIComponent(note.filePath);
        const googleDocsViewerUrl = `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;

        // Handle Images directly
        if (fileType.startsWith('image/')) {
            return <img src={note.filePath} alt={note.title} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />;
        }

        // Use the Google Docs Viewer for all common document types
        if (
            fileType === 'application/pdf' ||
            fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || // .pptx
            fileType === 'application/vnd.ms-powerpoint' || // .ppt
            fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
            fileType === 'application/msword' // .doc
        ) {
            return <iframe src={googleDocsViewerUrl} style={{ width: '100%', height: '80vh', border: 'none' }} title={note.title}></iframe>;
        }
        
        // Fallback for any other file type
        return (
            <div className="download-fallback">
                <p>This file type cannot be previewed online.</p>
                <a href={note.filePath} download className="btn btn-download">Click to Download</a>
            </div>
        );
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!note) {
        return <div>Loading...</div>;
    }

    return (
        <div className="content-page">
            <Helmet>
                <title>{note.title} - {note.subject} | PeerNotez</title>
            </Helmet>

            <div className="note-viewer-container">
                {/* Promote the note title to an h1 tag */}
                <h1>{note.title}</h1>
                <p>
                    <strong>Subject:</strong> <Link to={`/search?q=${note.subject}`}>{note.subject}</Link>
                    <br />
                    <strong>University:</strong> <Link to={`/search?q=${note.university}`}>{note.university}</Link>
                </p>
                <div className="note-meta-details">
                    <StarRating rating={note.rating} readOnly={true} />
                    <span>{note.numReviews} Reviews</span>
                </div>
                
                <div className="file-viewer-frame">
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
