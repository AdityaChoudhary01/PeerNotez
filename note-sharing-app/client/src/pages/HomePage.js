import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoteCard from '../components/notes/NoteCard';
import FilterBar from '../components/common/FilterBar';

const HomePage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                // The 'filters' object is passed as URL parameters
                const { data } = await axios.get('/notes', { params: filters });
                setNotes(data);
            } catch (error) {
                console.error("Failed to fetch notes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [filters]);

    const handleFilterSubmit = (newFilters) => {
        // Remove empty filters to keep the URL clean
        const activeFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, value]) => value !== '')
        );
        setFilters(activeFilters);
    };

    return (
        <div>
            <section className="welcome-section" style={{marginBottom: '2.5rem'}}>
                <h2>Welcome to PeerNotez!</h2>
                <p>
                    Share and discover notes from students across universities and courses.<br/>
                    <strong>Features:</strong>
                </p>
                <ul style={{textAlign: 'left', maxWidth: '600px', margin: '1rem auto', color: '#a0a0c0', fontSize: '1.1rem', listStyle: 'none', padding: 0}}>
                    <li>🔍 Search notes by title, university, course, or subject.</li>
                    <li>📤 Upload your own notes and help the community.</li>
                    <li>⭐ Rate and review notes to highlight the best content.</li>
                    <li>📚 Save your favorite notes to your personal profile.</li>
                </ul>
            </section>

            <h1>Find Notes</h1>
            <FilterBar onFilterSubmit={handleFilterSubmit} />
            
            {loading ? (
                <div>Loading notes...</div>
            ) : notes.length > 0 ? (
                <div className="notes-grid">
                    {notes.map(note => <NoteCard key={note._id} note={note} />)}
                </div>
            ) : (
                <p style={{textAlign: 'center', marginTop: '2rem'}}>No notes found matching your criteria. Try adjusting your filters.</p>
            )}
        </div>
    );
};

export default HomePage;
