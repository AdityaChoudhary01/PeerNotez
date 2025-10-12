// note-sharing-app/client/src/pages/ViewCollectionPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaEdit, FaBookOpen, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import NoteCard from '../components/notes/NoteCard';
import useAuth from '../hooks/useAuth'; 
import EditCollectionModal from '../components/notes/EditCollectionModal'; // Import the Edit Modal

const ViewCollectionPage = () => {
    const { collectionId } = useParams();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for Edit Modal

    const navigate = useNavigate(); 
    const { token } = useAuth(); // Get token for secure requests

    // Function to fetch the collection details
    const fetchCollection = useCallback(async () => {
        setLoading(true);
        try {
            // Include token in header for authorized request
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`/notes/collections/${collectionId}`, config);
            setCollection(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching collection:', err);
            const message = err.response?.data?.message || 'Could not load collection details. Server error or access denied.';
            setError(message);
            setLoading(false);
        }
    }, [collectionId, token]); 

    // Used by the Edit Modal to refresh data after a successful rename
    const handleRefetch = useCallback(() => {
        fetchCollection();
    }, [fetchCollection]); 

    useEffect(() => {
        // Only run fetch if the user is authenticated (token is available)
        if (token) {
            fetchCollection();
        } else {
            setLoading(false);
            setError("You must be logged in to view collections.");
        }
    }, [fetchCollection, token]); 

    // DELETE HANDLER (Functional)
    const handleDelete = async () => {
        if (!window.confirm('Are you absolutely sure you want to permanently delete this collection? This action cannot be undone.')) {
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/notes/collections/${collectionId}`, config);
            
            alert(`Collection deleted successfully!`);
            navigate('/profile'); // Redirect to profile page
        } catch (err) {
            console.error('Failed to delete collection:', err);
            alert('Failed to delete collection. Please try again.');
        }
    };
    
    // EDIT HANDLER (Opens the modal)
    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    // --- UI/UX Rendering ---

    if (loading) {
        return (
            <div className="collection-center-message loading">
                <FaSpinner className="spin-icon" size={32} />
                <p>Loading collection details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="collection-center-message error">
                <FaExclamationTriangle size={32} />
                <p>{error}</p>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="collection-center-message error">
                <FaExclamationTriangle size={32} />
                <p>Collection data is unavailable.</p>
            </div>
        );
    }
    
    const notesToDisplay = collection.notes || []; 
    const noteCount = notesToDisplay.length;

    return (
        <div className="view-collection-page-wrapper">
            
            {/* Collection Header */}
            <div className="collection-header">
                <div className="header-info">
                    <h1 className="collection-title">
                        <FaBookOpen className="collection-icon" /> {collection.name}
                    </h1>
                    <p className="collection-meta">
                        <span className="note-count-badge">{noteCount} {noteCount === 1 ? 'Note' : 'Notes'}</span>
                        <span>Created on: {new Date(collection.createdAt).toLocaleDateString()}</span>
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="collection-actions">
                    <button 
                        className="collection-action-btn edit-btn"
                        onClick={handleEdit}
                    >
                        <FaEdit /> Edit Name
                    </button>
                    <button 
                        className="collection-action-btn delete-btn"
                        onClick={handleDelete}
                    >
                        <FaTrash /> Delete Collection
                    </button>
                </div>
            </div>

            <hr className="collection-divider" />

            {/* Notes List */}
            <div className="collection-notes-grid">
                {notesToDisplay.length > 0 ? (
                    notesToDisplay.map(note => (
                        <NoteCard key={note._id} note={note} /> 
                    ))
                ) : (
                    <div className="empty-collection-message">
                        <p>This collection is currently empty. Add notes from the View Note page!</p>
                    </div>
                )}
            </div>

            {/* Render the Edit Modal */}
            {isEditModalOpen && collection && (
                <EditCollectionModal
                    collection={collection}
                    token={token}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleRefetch} // Refreshes page data after successful rename
                />
            )}
        </div>
    );
};

export default ViewCollectionPage;
