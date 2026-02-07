import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaLayerGroup, FaSpinner } from 'react-icons/fa';
import NoteCard from './NoteCard';

const RelatedNotes = ({ currentNoteId }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            setLoading(true);
            try {
                // Using relative path to stay consistent with your other components
                const { data } = await axios.get(`https://peernotez.onrender.com/api/notes/related/${currentNoteId}`);
                setNotes(data);
            } catch (error) {
                console.error('Error fetching related notes:', error);
            } finally {
                setLoading(false);
            }
        };

        if (currentNoteId) {
            fetchRelated();
        }
    }, [currentNoteId]);

    // Don't render anything if not loading and no notes found
    if (!loading && notes.length === 0) return null;

    return (
        <section className="related-notes-container" style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <FaLayerGroup style={styles.icon} />
                    <h3 style={styles.title}>You May Also Like</h3>
                </div>
                <div style={styles.line}></div>
            </div>

            {loading ? (
                <div style={styles.loadingState}>
                    <FaSpinner className="fa-spin" style={styles.spinner} />
                    <p style={styles.loadingText}>Curating related notes...</p>
                </div>
            ) : (
                <div className="related-notes-grid" style={styles.grid}>
                    {notes.map(note => (
                        <div key={note._id} style={styles.cardWrapper}>
                            <NoteCard note={note} showActions={false} />
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                /* Hide scrollbar for Chrome, Safari and Opera */
                .related-notes-grid::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .related-notes-grid {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }

                @media (max-width: 768px) {
                    .related-notes-grid {
                        display: flex !important;
                        overflow-x: auto !important;
                        scroll-snap-type: x mandatory;
                        padding-bottom: 1rem;
                        gap: 1rem !important;
                    }
                }
            `}</style>
        </section>
    );
};

const styles = {
    container: {
        marginTop: '4rem',
        marginBottom: '3rem',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
    },
    header: {
        marginBottom: '2rem',
        position: 'relative'
    },
    titleGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px'
    },
    icon: {
        color: '#00d4ff',
        fontSize: '1.2rem'
    },
    title: {
        fontSize: '1.4rem',
        fontWeight: '700',
        color: '#fff',
        margin: 0,
        letterSpacing: '0.5px'
    },
    line: {
        width: '60px',
        height: '3px',
        background: 'linear-gradient(90deg, #00d4ff, #ff00cc)',
        borderRadius: '10px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem',
    },
    cardWrapper: {
        transition: 'transform 0.3s ease',
        scrollSnapAlign: 'start',
        minWidth: '280px' // For mobile horizontal scroll
    },
    loadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 0',
        gap: '1rem'
    },
    spinner: {
        fontSize: '2rem',
        color: '#00d4ff',
        opacity: 0.8
    },
    loadingText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.9rem',
        fontWeight: '500'
    }
};

export default RelatedNotes;
