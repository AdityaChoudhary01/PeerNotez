import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoteCard from '../components/notes/NoteCard';
import FilterBar from '../components/common/FilterBar';
import { Helmet } from 'react-helmet';


const HomePage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('uploadDate');

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                // Combine filters and sort options into a single params object
                const params = {
                    ...filters,
                    sort: sortBy,
                };
                const { data } = await axios.get('/notes', { params });
                setNotes(data);
            } catch (error) {
                console.error("Failed to fetch notes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [filters, sortBy]); // Re-fetch when either filters or sort changes

    const handleFilterSubmit = (newFilters) => {
        const activeFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, value]) => value !== '')
        );
        setFilters(activeFilters);
    };

    return (
        <div>
        <Helmet>
  <title>PeerNotez – Note Sharing App</title>
  <meta name="description" content="PeerNotez is a collaborative platform for students to share and discover handwritten notes, organize study material, and learn together." />
  <meta name="keywords" content="PeerNotez, note sharing, student notes, online notes, study tools, handwritten notes, college resources" />
</Helmet>

            <section className="welcome-section" style={{marginBottom: '2.5rem'}}>
            <h1 className="visually-hidden">Welcome to PeerNotez – A Note Sharing App for Students</h1>
                <h2>Welcome to PeerNotez!</h2>
                <p>
                    Share and discover notes from students across universities and courses.<br/>
                    <strong>Features:</strong>
                </p>
                <ul style={{textAlign: 'left', maxWidth: '600px', margin: '1rem auto', color: '#a0a0c0', fontSize: '1.1rem', listStyle: 'none', padding: 0}}>
                    <li>🔍 Filter or search for specific notes.</li>
                    <li>📤 Upload your own notes to help the community.</li>
                    <li>⭐ Rate and review notes to highlight the best content.</li>
                    <li>📚 Save your favorite notes to your personal profile.</li>
                </ul>
            </section>

            <h1>Find Notes</h1>
            <FilterBar onFilterSubmit={handleFilterSubmit} />
            
            <div className="notes-header">
                <h2>All Notes</h2>
                <div className="sort-container">
                    <label htmlFor="sort-select">Sort by:</label>
                    <select 
                        id="sort-select" 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="uploadDate">Most Recent</option>
                        <option value="highestRated">Highest Rated</option>
                        <option value="mostDownloaded">Most Downloaded</option>
                    </select>
                </div>
            </div>
            
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
