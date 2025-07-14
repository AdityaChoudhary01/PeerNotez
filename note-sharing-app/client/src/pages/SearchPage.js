import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';

const SearchPage = () => {
  const [notes, setNotes] = useState([]);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  useEffect(() => {
    if (query) {
      const fetchNotes = async () => {
        try {
          const { data } = await axios.get(`https://peernotez.onrender.com/api/notes?search=${query}`);
          setNotes(data);
        } catch (error) {
          console.error("Failed to fetch search results", error);
        }
      };
      fetchNotes();
    }
  }, [query]);

  return (
    <div>
      <h1>Search Results for "{query}"</h1>
      {notes.length > 0 ? (
        <div className="notes-grid">
          {notes.map(note => <NoteCard key={note._id} note={note} />)}
        </div>
      ) : (
        <p>No notes found matching your search criteria.</p>
      )}
    </div>
  );
};

export default SearchPage;
