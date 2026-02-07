import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaSearch, FaRegFolderOpen } from 'react-icons/fa';
import NoteCard from '../components/notes/NoteCard';
import Pagination from '../components/common/Pagination';

const SearchPage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    
    const limit = 12; 

    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            minHeight: '80vh',
            paddingLeft: '1rem',
            paddingRight: '1rem'
        },
        header: {
            textAlign: 'center',
            marginBottom: '3rem',
            padding: '3rem 1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            maxWidth: '1200px',
            margin: '0 auto 3rem'
        },
        title: {
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap'
        },
        subtitle: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.1rem'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto'
        },
        loadingState: {
            textAlign: 'center',
            padding: '5rem',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1.2rem'
        },
        emptyState: {
            textAlign: 'center',
            padding: '4rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '20px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.2rem',
            maxWidth: '800px',
            margin: '0 auto',
            border: '1px dashed rgba(255,255,255,0.1)'
        }
    };

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
    }, [query, page]);

    return (
        <div style={styles.wrapper}>
            <Helmet>
                <title>{query ? `Search: ${query}` : 'All Notes'} | PeerNotez</title>
                <meta name="description" content={`Search results for ${query || 'notes'} on PeerNotez.`} />
                <link rel="canonical" href="https://peernotez.netlify.app/search" />
            </Helmet>

            <header style={styles.header}>
                <h1 style={styles.title}>
                    <FaSearch /> {query ? `Results for "${query}"` : "Explore All Notes"}
                </h1>
                <p style={styles.subtitle}>
                    {loading ? 'Searching...' : `Found ${notes.length} note${notes.length !== 1 ? 's' : ''} on this page`}
                </p>
            </header>

            {loading ? (
                <div style={styles.loadingState}>Searching the archives...</div>
            ) : (
                <>
                    {notes.length > 0 ? (
                        <>
                            <div style={styles.grid}>
                                {notes.map(note => (
                                    <NoteCard key={note._id} note={note} />
                                ))}
                            </div>
                            
                            {totalPages > 1 && (
                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
                            )}
                        </>
                    ) : (
                        <div style={styles.emptyState}>
                            <FaRegFolderOpen style={{fontSize: '3rem', marginBottom: '1rem', opacity: 0.5}} />
                            <p>No notes found matching your criteria.</p>
                            <p style={{fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7}}>Try checking your spelling or using different keywords.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchPage;
