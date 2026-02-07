import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSpinner, FaSave } from 'react-icons/fa';

const EditCollectionModal = ({ collection, token, onClose, onSuccess }) => {
    // Initialize state with the current collection name
    const [newName, setNewName] = useState(collection.name);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- INTERNAL CSS: HOLOGRAPHIC MODAL ---
    const styles = {
        backdrop: {
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
        modal: {
            background: 'rgba(25, 20, 50, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            width: '90%',
            maxWidth: '450px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        },
        header: {
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, rgba(0, 212, 255, 0.1), transparent)'
        },
        title: {
            margin: 0,
            fontSize: '1.4rem',
            color: '#fff',
            fontWeight: '700'
        },
        closeBtn: {
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            transition: 'color 0.2s'
        },
        body: {
            padding: '2rem'
        },
        inputGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem',
            fontWeight: '600'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.3)',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s ease'
        },
        errorMsg: {
            background: 'rgba(255, 0, 85, 0.1)',
            border: '1px solid rgba(255, 0, 85, 0.3)',
            color: '#ff0055',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            textAlign: 'center'
        },
        saveBtn: {
            width: '100%',
            padding: '12px',
            borderRadius: '50px',
            border: 'none',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            fontWeight: '700',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
            transition: 'transform 0.2s'
        }
    };

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
            // Optional: Toast notification here instead of alert
            // alert(`Collection successfully renamed to "${newName.trim()}"`);
        } catch (err) {
            console.error('Error renaming collection:', err);
            const message = err.response?.data?.message || 'Failed to rename collection.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Helper for input focus
    const handleFocus = (e) => {
        e.target.style.borderColor = '#00d4ff';
        e.target.style.background = 'rgba(0, 0, 0, 0.5)';
        e.target.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.2)';
    };

    const handleBlur = (e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.background = 'rgba(0, 0, 0, 0.3)';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={styles.backdrop} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Rename Collection</h2>
                    <button 
                        style={styles.closeBtn} 
                        onClick={onClose} 
                        aria-label="Close modal"
                        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.body}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="collectionName" style={styles.label}>New Name</label>
                        <input
                            id="collectionName"
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder="Enter new collection name"
                            required
                            disabled={loading}
                            style={styles.input}
                            autoFocus
                        />
                    </div>

                    {error && <div style={styles.errorMsg}>⚠️ {error}</div>}
                    
                    <button 
                        type="submit" 
                        style={{...styles.saveBtn, opacity: loading ? 0.7 : 1}}
                        disabled={loading}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        {loading ? <FaSpinner className="spin" /> : <><FaSave /> Save Changes</>}
                    </button>
                </form>
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default EditCollectionModal;
