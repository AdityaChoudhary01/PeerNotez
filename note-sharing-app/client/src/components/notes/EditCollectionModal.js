import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSpinner } from 'react-icons/fa';

const EditCollectionModal = ({ collection, token, onClose, onSuccess }) => {
    // Initialize state with the current collection name
    const [newName, setNewName] = useState(collection.name);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Trap keyboard focus and close on Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newName.trim() === '' || newName === collection.name) {
            setError('New name must be different from the current name.');
            return;
        }

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // API call to the server PUT route
            await axios.put(
                `/notes/collections/${collection._id}`,
                { name: newName.trim() },
                config
            );

            // Call the success handler passed from ViewCollectionPage to refresh data
            onSuccess(); 
            onClose(); 
            alert(`Collection successfully renamed to "${newName.trim()}"`);
        } catch (err) {
            console.error('Error renaming collection:', err);
            const message = err.response?.data?.message || 'Failed to rename collection.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content edit-collection-modal">
                <div className="modal-header">
                    <h2>Rename Collection</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close modal">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="collectionName">New Name:</label>
                        <input
                            id="collectionName"
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter new collection name"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <p className="form-error-message">{error}</p>}
                    
                    <button type="submit" className="primary-btn full-width" disabled={loading}>
                        {loading ? <FaSpinner className="spin-icon" /> : 'Save New Name'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditCollectionModal;
