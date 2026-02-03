import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NoteCard from './NoteCard'; // Reusing your existing card

const RelatedNotes = ({ currentNoteId }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
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

    if (loading) return null; // Or a small spinner
    if (notes.length === 0) return null; // Don't show section if no related notes

    return (
        <div className="related-notes-section" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ 
                color: 'var(--text-color)', 
                marginBottom: '1rem',
                borderBottom: '2px solid var(--primary-color)',
                paddingBottom: '0.5rem',
                display: 'inline-block'
            }}>
                You May Also Like
            </h3>
            
            <div className="notes-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '1.5rem' 
            }}>
                {notes.map(note => (
                    <NoteCard key={note._id} note={note} showActions={false} />
                ))}
            </div>
        </div>
    );
};

export default RelatedNotes;
