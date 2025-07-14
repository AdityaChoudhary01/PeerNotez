import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoteCard from '../components/notes/NoteCard';

const HomePage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                // Fetch all notes without any filter parameters
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/notes`);
                setNotes(data);
            } catch (error) {
                console.error("Failed to fetch notes", error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };
        fetchNotes();
    }, []); // Empty dependency array means this runs once on page load

    if (loading) {
        return <div>Loading notes...</div>;
    }

    return (
        <div>
            <section className="welcome-section" style={{marginBottom: '2.5rem'}}>
                <h2>Welcome to PeerNotez!</h2>
                <p>
                  Share and discover notes from students across universities and courses.<br/>
                  <strong>Features:</strong>
                </p>
                <ul style={{textAlign: 'left', maxWidth: '600px', margin: '1rem auto', color: '#a0a0c0', fontSize: '1.1rem'}}>
                  <li>🔍 Search notes by university, course, subject, or year</li>
                  <li>📤 Upload your own notes and help others</li>
                  <li>📥 Download notes for free, no registration required</li>
                  <li>💬 Connect and contribute to a growing student community</li>
                </ul>
            </section>
            <h1>All Notes</h1>
            {notes.length > 0 ? (
                <div className="notes-grid">
                    {notes.map(note => <NoteCard key={note._id} note={note} />)}
                </div>
            ) : (
                <div className="welcome-section">
                    <h2>Welcome to NoteShare!</h2>
                    <p>No notes have been uploaded yet. Be the first to share!</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;
