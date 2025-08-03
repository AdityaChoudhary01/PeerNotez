import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom'; // --- IMPORT LINK ---
import { Helmet } from 'react-helmet'; // --- IMPORT HELMET ---
import NoteCard from '../components/notes/NoteCard';

const SearchPage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    useEffect(() => {
        if (query && query.trim() !== '') {
            setLoading(true);
            const fetchNotes = async () => {
                try {
                    const { data } = await axios.get(
                        `${process.env.REACT_APP_API_URL}/notes?search=${encodeURIComponent(query.trim())}`
                    );
                    setNotes(data.notes || []);
                } catch (error) {
                    console.error("Failed to fetch search results", error);
                    setNotes([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchNotes();
        } else {
            setNotes([]);
            setLoading(false);
        }
    }, [query]);

    if (loading) {
        return <div>Searching for notes...</div>;
    }

    return (
        <div>
            <Helmet>
                <title>Search Results for "{query}" | PeerNotez</title>
            </Helmet>

            <h1>Search Results for "{query}" on PeerNotez</h1>
            {notes.length > 0 ? (
                <div className="notes-grid">
                    {notes.map(note => (
                        <NoteCard key={note._id} note={note} />
                    ))}
                </div>
            ) : (
                <>
                    <p>No notes found matching your search criteria.</p>
                    <p><Link to="/">Return to the homepage</Link> to browse for other notes.</p>
                </>
            )}
        </div>
    );
};

export default SearchPage;
