import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaSearch, FaRegFolderOpen, FaUserAstronaut, FaBookOpen, FaFeatherAlt } from 'react-icons/fa';
import NoteCard from '../components/notes/NoteCard';
import BlogCard from '../components/blog/BlogCard'; 
import Pagination from '../components/common/Pagination';
// IMPORTED: Missing Cloudinary Helper
import { optimizeCloudinaryUrl } from '../utils/cloudinaryHelper';

const SearchPage = () => {
    const [notes, setNotes] = useState([]);
    const [users, setUsers] = useState([]); 
    const [blogs, setBlogs] = useState([]); 
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
        sectionHeading: {
            color: '#00d4ff',
            fontSize: '1.2rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '3rem'
        },
        userList: {
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '3rem',
            maxWidth: '1400px',
            margin: '0 auto 3rem'
        },
        userCard: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textDecoration: 'none',
            color: '#fff',
            transition: '0.3s ease'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
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
        const fetchUniversalResults = async () => {
            try {
                const searchQuery = query ? encodeURIComponent(query.trim()) : '';
                
                const [notesRes, usersRes, blogsRes] = await Promise.all([
                    axios.get(`/notes?search=${searchQuery}&page=${page}&limit=${limit}`),
                    axios.get(`/users/search?q=${searchQuery}`),
                    axios.get(`/blogs?search=${searchQuery}&limit=6`) 
                ]);

                setNotes(notesRes.data.notes || []);
                setTotalPages(notesRes.data.totalPages || 0);
                setUsers(usersRes.data.users || []);
                setBlogs(blogsRes.data.blogs || []);
                
            } catch (error) {
                console.error("Failed to fetch universal results", error);
                setNotes([]);
                setUsers([]);
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUniversalResults();
    }, [query, page]);

    return (
        <div style={styles.wrapper}>
             <Helmet>
                <title>{query ? `Search: ${query}` : 'Universal Search'} | PeerNotez</title>
                <meta name="description" content={`Search results for ${query || 'notes, authors, and blogs'} on PeerNotez.`} />
                <link rel="canonical" href="https://peernotez.netlify.app/search" />
            </Helmet>

            <header style={styles.header}>
                <h1 style={styles.title}>
                    <FaSearch /> {query ? `Results for "${query}"` : "Global Search"}
                </h1>
                <p style={styles.subtitle}>
                    {loading ? 'Searching universe...' : `Found ${notes.length} notes, ${blogs.length} articles, and ${users.length} authors`}
                </p>
            </header>

            {loading ? (
                <div style={styles.loadingState}>Connecting to the knowledge base...</div>
            ) : (
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    
                    {/* --- USERS / AUTHORS SECTION --- */}
                    {users.length > 0 && (
                        <>
                            <h2 style={styles.sectionHeading}><FaUserAstronaut /> Matching Authors</h2>
                            <div style={styles.userList}>
                                {users.map(user => (
                                    <Link 
                                        to={`/profile/${user._id}`} 
                                        key={user._id} 
                                        style={styles.userCard}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                                            e.currentTarget.style.borderColor = '#00d4ff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        }}
                                    >
                                        <img 
                                            /* OPTIMIZATION:
                                               1. Added Cloudinary Optimization { width: 30, height: 30 }
                                               2. Added explicit width/height
                                               3. Added lazy loading & async decoding
                                            */
                                            src={user.avatar 
                                                ? optimizeCloudinaryUrl(user.avatar, { width: 30, height: 30 }) 
                                                : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                                            }
                                            alt={user.name} 
                                            width="30"
                                            height="30"
                                            loading="lazy"
                                            decoding="async"
                                            style={{width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover'}} 
                                        />
                                        <span>{user.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}

                    {/* --- BLOGS SECTION --- */}
                    {blogs.length > 0 && (
                        <>
                            <h2 style={styles.sectionHeading}><FaFeatherAlt /> Recommended Articles</h2>
                            <div style={styles.grid}>
                                {blogs.map(blog => (
                                    <BlogCard key={blog._id} blog={blog} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* --- NOTES SECTION --- */}
                    {notes.length > 0 ? (
                        <>
                            <h2 style={styles.sectionHeading}><FaBookOpen /> Matching Notes</h2>
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
                        users.length === 0 && blogs.length === 0 && (
                            <div style={styles.emptyState}>
                                <FaRegFolderOpen style={{fontSize: '3rem', marginBottom: '1rem', opacity: 0.5}} />
                                <p>No notes, authors, or articles found matching your criteria.</p>
                                <p style={{fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7}}>Try searching by subject, university, or a specific name.</p>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
