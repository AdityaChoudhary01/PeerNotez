import React, { useState, useEffect, useCallback } from 'react'; 
import axios from 'axios';
import { FaPlus, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const AddToCollectionModal = ({ noteId, token, onClose }) => {
    const [collections, setCollections] = useState([]);
    const [selectedCollections, setSelectedCollections] = useState({});
    const [newCollectionName, setNewCollectionName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            maxWidth: '500px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'float 0.5s ease-out'
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
            padding: '1.5rem',
            maxHeight: '60vh',
            overflowY: 'auto'
        },
        list: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '1.5rem'
        },
        item: {
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: '#fff'
        },
        itemSelected: {
            background: 'rgba(0, 212, 255, 0.15)',
            borderColor: '#00d4ff',
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.2)'
        },
        inputGroup: {
            display: 'flex',
            gap: '10px',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        },
        input: {
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(0, 0, 0, 0.3)',
            color: '#fff',
            outline: 'none'
        },
        createBtn: {
            padding: '0 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: '600',
            whiteSpace: 'nowrap'
        },
        footer: {
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: 'rgba(0, 0, 0, 0.2)'
        },
        saveBtn: {
            padding: '10px 24px',
            borderRadius: '50px',
            border: 'none',
            background: '#00d4ff',
            color: '#000',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.4)'
        },
        cancelBtn: {
            padding: '10px 20px',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer'
        }
    };

    // --- Fetch Collections ---
    const fetchCollections = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        try {
            // Using relative path to hit proxy
            const { data } = await axios.get('/notes/collections', config);
            setCollections(data);
            
            // Initialize selectedCollections
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
    }, [noteId, token]);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

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
            
            // Add and select new collection
            setCollections(prev => [...prev, data]);
            setSelectedCollections(prev => ({
                ...prev,
                [data._id]: true,
            }));
            setNewCollectionName('');
        } catch (error) {
            console.error('Failed to create collection:', error);
            alert('Failed to create collection.');
        }
    };

    // --- Final Submission ---
    const handleSubmit = async () => {
        setIsSubmitting(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const promises = [];

        collections.forEach(collection => {
            const isSelected = selectedCollections[collection._id];
            const alreadyInCollection = collection.notes.includes(noteId);
            
            if (isSelected && !alreadyInCollection) {
                promises.push(axios.put(`/notes/collections/${collection._id}/add/${noteId}`, {}, config));
            }
            
            if (!isSelected && alreadyInCollection) {
                promises.push(axios.put(`/notes/collections/${collection._id}/remove/${noteId}`, {}, config));
            }
        });

        try {
            await Promise.all(promises);
            onClose();
        } catch (error) {
            console.error('Failed to update collections:', error);
            alert('An error occurred while updating collections.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.backdrop} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Manage Collections</h2>
                    <button onClick={onClose} style={styles.closeBtn}><FaTimes /></button>
                </div>
                
                <div style={styles.body}>
                    {loading ? (
                        <div style={{textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)'}}>
                            <FaSpinner className="spin" size={24} /> Loading...
                        </div>
                    ) : (
                        <>
                            <div style={styles.list}>
                                {collections.map(collection => (
                                    <div 
                                        key={collection._id} 
                                        style={{
                                            ...styles.item, 
                                            ...(selectedCollections[collection._id] ? styles.itemSelected : {})
                                        }}
                                        onClick={() => handleToggleCollection(collection._id)}
                                    >
                                        <span style={{fontWeight: '500'}}>{collection.name}</span>
                                        {selectedCollections[collection._id] ? 
                                            <FaCheck style={{color: '#00d4ff'}} /> : 
                                            <div style={{width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '4px'}}></div>
                                        }
                                    </div>
                                ))}
                                {collections.length === 0 && (
                                    <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.5)'}}>
                                        No collections found. Create one below!
                                    </p>
                                )}
                            </div>

                            <form onSubmit={handleCreateCollection} style={styles.inputGroup}>
                                <input
                                    type="text"
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    placeholder="New Collection Name..."
                                    style={styles.input}
                                />
                                <button type="submit" style={styles.createBtn}>
                                    <FaPlus /> Create
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <div style={styles.footer}>
                    <button onClick={onClose} disabled={isSubmitting} style={styles.cancelBtn}>Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} style={styles.saveBtn}>
                        {isSubmitting ? <><FaSpinner className="spin" /> Saving...</> : 'Save Changes'}
                    </button>
                </div>
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AddToCollectionModal;
