import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaLayerGroup, FaSpinner } from 'react-icons/fa';
import NoteCard from './NoteCard';

const RelatedNotes = ({ currentNoteId }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- INTERNAL CSS: DEEP SPACE HOLOGRAPHIC THEME ---
    const styles = {
        container: {
            marginTop: '4rem',
            marginBottom: '4rem',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.03)', // Consistent glass background
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
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
            fontSize: '1.4rem',
            filter: 'drop-shadow(0 0 5px rgba(0, 212, 255, 0.5))'
        },
        title: {
            fontSize: '1.6rem',
            fontWeight: '700',
            // Consistent Gradient Text
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            letterSpacing: '0.5px',
            fontFamily: "'Space Grotesk', sans-serif"
        },
        line: {
            width: '60px',
            height: '3px',
            background: 'linear-gradient(90deg, #00d4ff, #ff00cc)',
            borderRadius: '10px',
            opacity: 0.8
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem',
        },
        cardWrapper: {
            transition: 'transform 0.3s ease',
            height: '100%' // Ensure consistent height
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

    useEffect(() => {
        const fetchRelated = async () => {
            setLoading(true);
            try {
                // Ensure we don't fetch if ID is missing
                if (!currentNoteId) return;

                const { data } = await axios.get(`/notes/related/${currentNoteId}`);
                setNotes(data);
            } catch (error) {
                console.error('Error fetching related notes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
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
                        <div key={note._id} style={styles.cardWrapper} className="related-card-wrapper">
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
                    .related-notes-container {
                        padding: 1.5rem 1rem !important;
                        background: transparent !important; /* Cleaner look on mobile */
                        border: none !important;
                        box-shadow: none !important;
                    }

                    .related-notes-grid {
                        display: flex !important;
                        overflow-x: auto !important;
                        scroll-snap-type: x mandatory;
                        padding-bottom: 1.5rem;
                        gap: 1rem !important;
                        -webkit-overflow-scrolling: touch;
                    }

                    .related-card-wrapper {
                        flex: 0 0 85%;
                        min-width: 280px;
                        scroll-snap-align: center;
                    }
                }
            `}</style>
        </section>
    );
};

export default RelatedNotes;
