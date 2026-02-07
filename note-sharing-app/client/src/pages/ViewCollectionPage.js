import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaEdit, FaBookOpen, FaSpinner, FaExclamationTriangle, FaLayerGroup } from 'react-icons/fa';
import NoteCard from '../components/notes/NoteCard';
import useAuth from '../hooks/useAuth'; 
import EditCollectionModal from '../components/notes/EditCollectionModal';

const ViewCollectionPage = () => {
    const { collectionId } = useParams();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const navigate = useNavigate(); 
    const { token } = useAuth();

    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            minHeight: '80vh',
            paddingLeft: '1rem',
            paddingRight: '1rem'
        },
        headerCard: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2.5rem',
            marginBottom: '3rem',
            boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '2rem',
            position: 'relative',
            overflow: 'hidden'
        },
        glowBar: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: 'linear-gradient(to bottom, #00d4ff, #ff00cc)',
        },
        headerInfo: {
            flex: 1,
            minWidth: '280px'
        },
        title: {
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        meta: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginTop: '1rem'
        },
        badge: {
            background: 'rgba(0, 212, 255, 0.1)',
            color: '#00d4ff',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            border: '1px solid rgba(0, 212, 255, 0.2)'
        },
        actions: {
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
        },
        btn: {
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
        },
        editBtn: {
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        deleteBtn: {
            background: 'rgba(255, 0, 85, 0.1)',
            color: '#ff0055',
            border: '1px solid rgba(255, 0, 85, 0.3)'
        },
        divider: {
            border: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            marginBottom: '3rem'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto'
        },
        centerMessage: {
            textAlign: 'center',
            padding: '5rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.2rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px dashed rgba(255,255,255,0.1)'
        }
    };

    // --- Logic ---
    const fetchCollection = useCallback(async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`/notes/collections/${collectionId}`, config);
            setCollection(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching collection:', err);
            const message = err.response?.data?.message || 'Could not load collection details.';
            setError(message);
            setLoading(false);
        }
    }, [collectionId, token]); 

    const handleRefetch = useCallback(() => {
        fetchCollection();
    }, [fetchCollection]); 

    useEffect(() => {
        if (token) {
            fetchCollection();
        } else {
            setLoading(false);
            setError("You must be logged in to view collections.");
        }
    }, [fetchCollection, token]); 

    const handleDelete = async () => {
        if (!window.confirm('Are you absolutely sure you want to permanently delete this collection?')) {
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/notes/collections/${collectionId}`, config);
            
            alert(`Collection deleted successfully!`);
            navigate('/profile'); 
        } catch (err) {
            console.error('Failed to delete collection:', err);
            alert('Failed to delete collection. Please try again.');
        }
    };
    
    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    // --- Render ---

    if (loading) {
        return (
            <div style={{...styles.centerMessage, border: 'none'}}>
                <FaSpinner className="fa-spin" style={{fontSize: '2rem', color: '#00d4ff', marginBottom: '1rem'}} />
                <p>Loading collection details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.centerMessage}>
                <FaExclamationTriangle style={{fontSize: '2rem', color: '#ff0055', marginBottom: '1rem'}} />
                <p>{error}</p>
            </div>
        );
    }

    if (!collection) {
        return (
            <div style={styles.centerMessage}>
                <FaExclamationTriangle style={{fontSize: '2rem', color: '#ff0055', marginBottom: '1rem'}} />
                <p>Collection data is unavailable.</p>
            </div>
        );
    }
    
    const notesToDisplay = collection.notes || []; 
    const noteCount = notesToDisplay.length;

    return (
        <div style={styles.wrapper}>
            
            {/* Collection Header */}
            <div style={styles.headerCard}>
                <div style={styles.glowBar}></div>
                
                <div style={styles.headerInfo}>
                    <h1 style={styles.title}>
                        <FaBookOpen style={{color: '#fff'}} /> {collection.name}
                    </h1>
                    <div style={styles.meta}>
                        <span style={styles.badge}>{noteCount} {noteCount === 1 ? 'Note' : 'Notes'}</span>
                        <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <FaLayerGroup style={{color: '#bc13fe'}} /> Created: {new Date(collection.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={styles.actions}>
                    <button 
                        style={{...styles.btn, ...styles.editBtn}}
                        onClick={handleEdit}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <FaEdit /> Rename
                    </button>
                    <button 
                        style={{...styles.btn, ...styles.deleteBtn}}
                        onClick={handleDelete}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 0, 85, 0.2)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 0, 85, 0.1)'}
                    >
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>

            <hr style={styles.divider} />

            {/* Notes List */}
            <div style={styles.grid}>
                {notesToDisplay.length > 0 ? (
                    notesToDisplay.map(note => (
                        <NoteCard key={note._id} note={note} /> 
                    ))
                ) : (
                    <div style={{...styles.centerMessage, gridColumn: '1 / -1'}}>
                        <p>This collection is currently empty.</p>
                        <p style={{fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7}}>
                            Add notes to this collection from the Note View page!
                        </p>
                    </div>
                )}
            </div>

            {/* Render the Edit Modal */}
            {isEditModalOpen && collection && (
                <EditCollectionModal
                    collection={collection}
                    token={token}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleRefetch}
                />
            )}
        </div>
    );
};

export default ViewCollectionPage;
