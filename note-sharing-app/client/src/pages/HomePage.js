import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoteCard from '../components/notes/NoteCard';

const HomePage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('uploadDate'); // State for sorting option

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                // The API call now includes the sort parameter
                const { data } = await axios.get(`https://peernotez.onrender.com/api/notes?sort=${sortBy}`);
                setNotes(data);
            } catch (error) {
                console.error("Failed to fetch notes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [sortBy]); // This now re-runs whenever 'sortBy' changes

    return (
        <div>
            <section className="welcome-section" style={{marginBottom: '2.5rem', animation: 'fadeUp 0.5s ease-out'}}>
                <h2>Welcome to PeerNotez!</h2>
                <p>
                    Share and discover notes from students across universities and courses.
                </p>
                <ul style={{textAlign: 'left', listStyle: 'none', padding: 0, maxWidth: '600px', margin: '1rem auto', color: '#a0a0c0', fontSize: '1.1rem'}}>
                    <li>🔍 Search for specific notes using the search bar above.</li>
                    <li>📤 Upload your own notes to help the community.</li>
                    <li>⭐ Rate and review notes to highlight the best content.</li>
                </ul>
            </section>
            
            <div className="notes-header">
                <h1>All Notes</h1>
                {/* --- SORTING DROPDOWN --- */}
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
                <p>No notes found. Be the first to upload!</p>
            )}
        </div>
    );
};

export default HomePage;
