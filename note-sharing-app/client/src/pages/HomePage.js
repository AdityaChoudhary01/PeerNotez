import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoteCard from '../components/notes/NoteCard';
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination'; // --- ADD THIS IMPORT ---

const HomePage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('uploadDate');
    
    // --- STATE FOR PAGINATION ---
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                // Combine all parameters for the API call
                const params = {
                    ...filters,
                    sort: sortBy,
                    page: page,
                };
                const { data } = await axios.get('/notes', { params });
                
                // Set state from the new API response structure
                setNotes(data.notes);
                setPage(data.page);
                setTotalPages(data.totalPages);

            } catch (error) {
                console.error("Failed to fetch notes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [filters, sortBy, page]); // Re-fetch when filters, sort, or page changes

    const handleFilterSubmit = (newFilters) => {
        const activeFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, value]) => value !== '')
        );
        setPage(1); // Reset to page 1 on a new filter
        setFilters(activeFilters);
    };

    return (
        <div>
            <section className="welcome-section" style={{marginBottom: '2.5rem'}}>
                <h2>Welcome to PeerNotez!</h2>
                <p>Share and discover notes from students across universities and courses.</p>
            </section>

            <h1>Find Notes</h1>
            <FilterBar onFilterSubmit={handleFilterSubmit} />
            
            <div className="notes-header">
                <h2>All Notes</h2>
                <div className="sort-container">
                    <label htmlFor="sort-select">Sort by:</label>
                    <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="uploadDate">Most Recent</option>
                        <option value="highestRated">Highest Rated</option>
                        <option value="mostDownloaded">Most Downloaded</option>
                    </select>
                </div>
            </div>
            
            {loading ? (
                <div>Loading notes...</div>
            ) : notes.length > 0 ? (
                <>
                    <div className="notes-grid">
                        {notes.map(note => <NoteCard key={note._id} note={note} />)}
                    </div>
                    {/* --- ADD THE PAGINATION COMPONENT --- */}
                    <Pagination 
                        page={page} 
                        totalPages={totalPages} 
                        onPageChange={setPage} 
                    />
                </>
            ) : (
                <p style={{textAlign: 'center', marginTop: '2rem'}}>No notes found matching your criteria.</p>
            )}
        </div>
    );
};

export default HomePage;
