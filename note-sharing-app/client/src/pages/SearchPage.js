import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';
import Pagination from '../components/common/Pagination'; // Import the Pagination component

const SearchPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  // Set the number of notes per page. This must match the backend limit.
  const limit = 12; 

  useEffect(() => {
    setLoading(true);
    const fetchNotes = async () => {
      try {
        const { data } = await axios.get(
          `/notes?search=${query ? encodeURIComponent(query.trim()) : ''}&page=${page}&limit=${limit}`
        );
        setNotes(data.notes || []);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to fetch search results", error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [query, page]); // Rerun effect when query or page changes

  if (loading) {
    return <div>Loading notes...</div>;
  }

  return (
    <div>
      <h1>{query ? `Search Results for "${query}"` : "All Notes"}</h1>
      {notes.length > 0 ? (
        <>
          <div className="notes-grid">
            {notes.map(note => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <p>No notes found matching your criteria.</p>
      )}
    </div>
  );
};

export default SearchPage;
