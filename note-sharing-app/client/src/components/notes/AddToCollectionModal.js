// File: src/components/notes/AddToCollectionModal.js

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import axios from 'axios';
import { FaPlus, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
const AddToCollectionModal = ({ noteId, token, onClose }) => {
    const [collections, setCollections] = useState([]);
    const [selectedCollections, setSelectedCollections] = useState({});
    const [newCollectionName, setNewCollectionName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Fetch Collections (Wrapped in useCallback to fix ESLint warning) ---
    const fetchCollections = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        try {
            const { data } = await axios.get('/notes/collections', config);
            setCollections(data);
            
            // Initialize selectedCollections based on which collections already contain the note
            const initialSelection = data.reduce((acc, collection) => {
                acc[collection._id] = collection.notes.includes(noteId);
                return acc;
            }, {});
            setSelectedCollections(initialSelection);
        } catch (error) {
            console.error('Failed to fetch collections:', error);
        } finally {
            setLoading(false);
        }
    }, [noteId, token]); // Dependencies: noteId and token

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]); // Depend on the stable fetchCollections function

    // --- Toggle Selection ---
    const handleToggleCollection = (collectionId) => {
        setSelectedCollections(prev => ({
            ...prev,
            [collectionId]: !prev[collectionId],
        }));
    };

    // --- Create New Collection ---
    const handleCreateCollection = async (e) => {
        e.preventDefault();
        const name = newCollectionName.trim();
        if (!name) return alert('Please enter a name.');
        
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            const { data } = await axios.post('/notes/collections', { name }, config);
            
            // Immediately add the new collection to state and select it
            setCollections(prev => [...prev, data]);
            setSelectedCollections(prev => ({
                ...prev,
                [data._id]: true,
            }));
            setNewCollectionName('');
            alert(`Collection '${name}' created successfully!`);
        } catch (error) {
            console.error('Failed to create collection:', error);
            alert('Failed to create collection.');
        }
    };

    // --- Final Submission (Add/Remove Note to selected collections) ---
    const handleSubmit = async () => {
        setIsSubmitting(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const promises = [];

        collections.forEach(collection => {
            const isSelected = selectedCollections[collection._id];
            const alreadyInCollection = collection.notes.includes(noteId);
            
            // Add note (if selected and not already present)
            if (isSelected && !alreadyInCollection) {
                promises.push(axios.put(`/notes/collections/${collection._id}/add/${noteId}`, {}, config));
            }
            
            // Remove note (if not selected but currently present)
            if (!isSelected && alreadyInCollection) {
                promises.push(axios.put(`/notes/collections/${collection._id}/remove/${noteId}`, {}, config));
            }
        });

        try {
            await Promise.all(promises);
            alert('Note collections updated successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to update collections:', error);
            alert('An error occurred while updating collections.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Note to Collections</h2>
                    <button onClick={onClose} className="close-btn"><FaTimes /></button>
                </div>
                
                {loading ? (
                    <div className="modal-body loading-state"><FaSpinner className="spin" /> Loading Collections...</div>
                ) : (
                    <div className="modal-body">
                        {/* Collection List */}
                        <div className="collection-list-container">
                            {collections.map(collection => (
                                <div 
                                    key={collection._id} 
                                    className={`collection-item ${selectedCollections[collection._id] ? 'selected' : ''}`}
                                    onClick={() => handleToggleCollection(collection._id)}
                                >
                                    <span>{collection.name}</span>
                                    {selectedCollections[collection._id] ? <FaCheck style={{color: 'green'}} /> : <FaPlus style={{color: '#999'}} />}
                                </div>
                            ))}
                            {collections.length === 0 && <p className="no-collections">No collections found. Create one below!</p>}
                        </div>

                        {/* Create New Collection Form */}
                        <form onSubmit={handleCreateCollection} className="create-collection-form">
                            <input
                                type="text"
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                placeholder="New Collection Name"
                                required
                            />
                            <button type="submit" className="create-btn">Create</button>
                        </form>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="modal-footer">
                    <button onClick={onClose} disabled={isSubmitting} className="cancel-btn">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="save-changes-btn">
                        {isSubmitting ? <FaSpinner className="spin" /> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToCollectionModal;
