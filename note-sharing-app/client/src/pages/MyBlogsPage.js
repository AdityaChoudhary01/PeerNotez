import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for Portals
import axios from 'axios';
import { Helmet } from 'react-helmet';
import useAuth from '../hooks/useAuth';
import BlogCard from '../components/blog/BlogCard';
import PostBlogPage from './PostBlogPage';
import Pagination from '../components/common/Pagination';
import { FaBookOpen, FaPenNib, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MyBlogsPage = () => {
    const [myBlogs, setMyBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [refetchIndex, setRefetchIndex] = useState(0);
    const [editingBlog, setEditingBlog] = useState(null); 

    const { token, loading: authLoading } = useAuth();

    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            minHeight: '80vh',
            maxWidth: '1200px', 
            margin: '0 auto',
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
        },
        title: {
            fontSize: 'clamp(2rem, 5vw, 2.5rem)',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap',
            justifyContent: 'center'
        },
        subtitle: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.1rem',
            maxWidth: '600px'
        },
        createBtn: {
            padding: '12px 30px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '700',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.2s'
        },
        sectionHeading: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#fff',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem',
            marginBottom: '2rem',
            marginTop: '2rem'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
        },
        emptyState: {
            textAlign: 'center',
            padding: '5rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '1.2rem',
            border: '1px dashed rgba(255,255,255,0.1)'
        },
        // Modal Styles
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // FIX: High z-index to force above Navbar
            zIndex: 100000, 
            padding: '1rem',
            overflow: 'hidden'
        },
        modalContainer: {
            position: 'relative',
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#0f0f1a', 
            backgroundImage: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(30, 30, 50, 0.95))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        },
        closeModalBtn: {
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'background 0.2s'
        }
    };

    // Scroll Lock Effect for Modal
    useEffect(() => {
        if (editingBlog) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [editingBlog]);

    const fetchMyBlogs = useCallback(async () => {
        if (authLoading || !token) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`/blogs/my-blogs?page=${currentPage}`, config);
            setMyBlogs(data.blogs || []);
            setTotalPages(data.totalPages || 0);
            setTotalBlogs(data.totalBlogs || 0);
        } catch (error) {
            console.error('Failed to fetch my blogs:', error);
            setMyBlogs([]);
        } finally {
            setLoading(false);
        }
    }, [token, authLoading, currentPage]);

    useEffect(() => {
        fetchMyBlogs();
    }, [fetchMyBlogs, refetchIndex]);

    const handleDeleteBlog = async (blogId) => {
        if (window.confirm('Are you sure you want to permanently delete this blog post?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/blogs/${blogId}`, config);
                setRefetchIndex(prev => prev + 1);
            } catch (error) {
                console.error('Failed to delete blog', error);
                alert('Failed to delete blog.');
            }
        }
    };
    
    const handleBlogUpdated = () => {
        setEditingBlog(null); 
        setRefetchIndex(prev => prev + 1); 
    };

    if (authLoading) return <div style={{textAlign: 'center', padding: '5rem', color: 'rgba(255,255,255,0.7)'}}>Authenticating...</div>;

    // --- EDIT MODAL (Using Portal) ---
    if (editingBlog) {
        return ReactDOM.createPortal(
            <div style={styles.modalOverlay} onClick={() => setEditingBlog(null)}>
                <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => setEditingBlog(null)} 
                        style={styles.closeModalBtn}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 0, 85, 0.5)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                    >
                        <FaTimes />
                    </button>
                    
                    {/* Render PostBlogPage directly inside */}
                    <PostBlogPage 
                        existingBlog={editingBlog} 
                        onBlogUpdated={handleBlogUpdated} 
                        onClose={() => setEditingBlog(null)}
                    />
                </div>
            </div>,
            document.body // Portal target
        );
    }
    
    // --- MAIN RENDER ---
    return (
        <div style={styles.wrapper} className="my-blogs-wrapper">
            <Helmet>
                <title>{`My Blogs (${totalBlogs ?? 0}) | PeerNotez`}</title>
            </Helmet>

            <header style={styles.header} className="my-blogs-header">
                <div>
                    <h1 style={styles.title}><FaBookOpen /> My Blog Posts</h1>
                    <p style={styles.subtitle}>Manage, edit, and track the performance of your articles.</p>
                </div>
                
                <Link 
                    to="/blogs/post" 
                    style={styles.createBtn}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    <FaPenNib /> Write New Post
                </Link>
            </header>
            
            <h2 style={styles.sectionHeading}>Published Posts ({totalBlogs})</h2>

            {loading ? (
                <div style={{textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)'}}>Loading your blog posts...</div>
            ) : myBlogs.length > 0 ? (
                <>
                    <div style={styles.grid}>
                        {myBlogs.map(blog => (
                            <BlogCard 
                                key={blog._id} 
                                blog={blog} 
                                showActions={true} 
                                onDelete={handleDeleteBlog}
                                onEdit={setEditingBlog}
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <Pagination 
                            page={currentPage} 
                            totalPages={totalPages} 
                            onPageChange={setCurrentPage} 
                        />
                    )}
                </>
            ) : (
                <div style={styles.emptyState}>
                    <p>You haven't published any blog posts yet.</p>
                    <Link to="/blogs/post" style={{color: '#00d4ff', textDecoration: 'none', fontWeight: '600', marginTop: '1rem', display: 'inline-block'}}>
                        Start writing your first article &rarr;
                    </Link>
                </div>
            )}

            {/* RESPONSIVE STYLES */}
            <style>{`
                @media (max-width: 768px) {
                    .my-blogs-wrapper {
                        padding-top: 1rem !important;
                        padding-left: 0.5rem !important;
                        padding-right: 0.5rem !important;
                    }
                    .my-blogs-header {
                        padding: 2rem 1rem !important;
                        margin-bottom: 2rem !important;
                        border-radius: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MyBlogsPage;
