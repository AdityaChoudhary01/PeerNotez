import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';

const SearchPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  useEffect(() => {
    if (query && query.trim() !== '') {
      setLoading(true); // Show loader on new search
      const fetchNotes = async () => {
        try {
          const { data } = await axios.get(
            `${process.env.REACT_APP_API_URL}/notes?search=${encodeURIComponent(query.trim())}`
          );
          // Backend returns { notes, page, totalPages }
          setNotes(data.notes || []);
        } catch (error) {
          console.error("Failed to fetch search results", error);
          setNotes([]); // Clear notes on error
        } finally {
          setLoading(false);
        }
      };
      fetchNotes();
    } else {
      // If no query, clear notes and stop loading
      setNotes([]);
      setLoading(false);
    }
  }, [query]);

  if (loading) {
    return <div>Searching for notes...</div>;
  }

  return (
    <div>
      <h1>Search Results for "{query}"</h1>
      {notes.length > 0 ? (
        <div className="notes-grid">
          {notes.map(note => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      ) : (
        <p>No notes found matching your search criteria.</p>
      )}
    </div>
  );
};

export default SearchPage;
