import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
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
            fileType === 'application/vnd.ms-powerpoint' || // .ppt - This line was corrected
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
           <h1 className="visually-hidden">
  Upload Your Study Notes – Help Fellow Students Learn and Succeed
</h1>

            <div className="note-viewer-container">
                <h2>{note.title}</h2>
                <div className="note-meta-details">
                    <StarRating rating={note.rating} readOnly={true} />
                    <span>{note.numReviews} Reviews</span>
                </div>
                <p>{note.subject} - {note.university}</p>
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
