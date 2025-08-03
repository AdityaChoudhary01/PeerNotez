import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination';

const HomePage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('uploadDate');
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                const params = {
                    ...filters,
                    sort: sortBy,
                    page: page,
                };
                const { data } = await axios.get('/notes', { params });
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
    }, [filters, sortBy, page]);

    const handleFilterSubmit = (newFilters) => {
        const activeFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, value]) => value !== '')
        );
        setPage(1);
        setFilters(activeFilters);
    };

    return (
        <div>
            <Helmet>
                <title>PeerNotez | Share and Discover Academic Notes</title>
                <meta 
                    name="description" 
                    content="Find, share, and explore academic notes across universities and courses. PeerNotez helps students collaborate and learn more effectively. Aditya, Aditya Choudhary" 
                />
                
                {/* Canonical URL */}
                <link rel="canonical" href="https://peernotez.netlify.app/" />

                {/* JSON-LD WebSite schema */}
                <script type="application/ld+json">
                {`
                {
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "name": "PeerNotez",
                  "url": "https://peernotez.netlify.app/",
                  "description": "PeerNotez helps students share and find academic notes globally."
                }
                `}
                </script>

                {/* JSON-LD Organization schema */}
                <script type="application/ld+json">
                {`
                {
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  "name": "PeerNotez",
                  "url": "https://peernotez.netlify.app/",
                  "logo": "https://peernotez.netlify.app/logo192.png",
                  "sameAs": [
                    "https://www.instagram.com/aditya_choudhary__021/",
                    "https://www.linkedin.com/in/aditya-kumar-38093a304/"
                  ]
                }
                `}
                </script>

                {/* Open Graph Meta Tags */}
                <meta property="og:title" content="PeerNotez | Share and Discover Academic Notes" />
                <meta property="og:description" content="Find, share, and explore academic notes across universities and courses. PeerNotez helps students collaborate and learn more effectively." />
                <meta property="og:url" content="https://peernotez.netlify.app/" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://peernotez.netlify.app/logo192.png" />
            </Helmet>

            <h1>Welcome to PeerNotez! Share and Discover Notes from Students</h1>
            
            <section className="welcome-section" style={{ marginBottom: '2.5rem' }}>
                <p>
                    PeerNotez is a collaborative platform dedicated to helping students learn and share knowledge freely. 
                    Use the search and filters below to find notes from universities and courses worldwide, or{' '}
                    <Link to="/signup" className="linktag">create an account</Link> to start uploading your own!
                </p>
            </section>
            
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
                <>
                    <div className="notes-grid">
                        {notes.map(note => <NoteCard key={note._id} note={note} />)}
                    </div>
                    <Pagination 
                        page={page} 
                        totalPages={totalPages} 
                        onPageChange={setPage} 
                    />
                </>
            ) : (
                <p style={{ textAlign: 'center', marginTop: '2rem' }}>
                    No notes found matching your criteria.
                </p>
            )}

            <div className="footer-links" style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Link to="/about" className="linktag" style={{ marginRight: '1rem' }}>About Peernotez</Link>
                <Link to="/contact" className="linktag" style={{ marginRight: '1rem' }}>Contact Us</Link>
                <Link to="/donate" className="linktag">Support This Project</Link>
            </div>
        </div>
    );
};

export default HomePage;
