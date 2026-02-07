import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import useAuth from '../hooks/useAuth';
import NoteCard from '../components/notes/NoteCard';
import BlogCard from '../components/blog/BlogCard'; 
import { 
    FaRss, 
    FaUserPlus, 
    FaSearch, 
    FaChevronRight, 
    FaSpinner, 
    FaExclamationTriangle,
    FaArrowUp,
    FaBook,
    FaPenNib,
    FaFilter
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

// --- Internal Helper Component: FeedStatus ---
const FeedStatus = ({ loading, error, feedContentLength, onFilterChange }) => {
    // Holographic Styles for Status
    const statusStyles = {
        container: {
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '600px',
            margin: '2rem auto'
        },
        icon: {
            fontSize: '3rem',
            marginBottom: '1.5rem',
            color: 'rgba(255,255,255,0.5)'
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '1rem'
        },
        text: {
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '2rem',
            lineHeight: 1.6
        },
        ctaBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 30px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '700',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
            transition: 'transform 0.2s',
            border: 'none',
            cursor: 'pointer'
        }
    };

    if (loading) {
        return (
            <div style={statusStyles.container}>
                <FaSpinner className="fa-spin" style={{...statusStyles.icon, color: '#00d4ff'}} />
                <p style={{color: 'rgba(255,255,255,0.8)'}}>Building your personalized feed...</p>
            </div>
        );
    }
    
    if (error) {
          return (
              <div style={{...statusStyles.container, borderColor: 'rgba(255, 0, 85, 0.3)'}}>
                  <FaExclamationTriangle style={{...statusStyles.icon, color: '#ff0055'}} />
                  <h2 style={statusStyles.title}>Error Loading Feed</h2>
                  <p style={statusStyles.text}>We couldn't fetch your content. Please check your connection.</p>
              </div>
          );
    }

    if (feedContentLength === 0) {
        return (
            <div style={statusStyles.container}>
                <h2 style={statusStyles.title}>Your Feed is Quiet... 😴</h2>
                <p style={statusStyles.text}>
                    You haven't followed any users yet, or your followed authors haven't posted recently.
                </p>
                
                <Link to="/search" style={statusStyles.ctaBtn}>
                   <FaSearch /> Discover Authors <FaChevronRight />
                </Link>
                
                <p style={{marginTop: '2rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)'}}>
                    <strong>Tip:</strong> Look for the <strong><FaUserPlus /> Follow</strong> button on user profiles!
                </p>
            </div>
        );
    }
    
    return (
        <div style={statusStyles.container}>
            <p style={statusStyles.text}>No content matches your current filter settings.</p>
            <button onClick={() => onFilterChange('all')} style={statusStyles.ctaBtn}>View All Updates</button>
        </div>
    );
};

// ------------------------------------------------------------
// --- Main MyFeedPage Component ---
// ------------------------------------------------------------
const MyFeedPage = () => {
    const [feedContent, setFeedContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contentTypeFilter, setContentTypeFilter] = useState('all'); 
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    
    const { token } = useAuth();

    // --- INTERNAL CSS: HOLOGRAPHIC FEED PAGE ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            minHeight: '80vh'
        },
        header: {
            textAlign: 'center',
            marginBottom: '3rem',
            padding: '3rem 1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        },
        title: {
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px'
        },
        subtitle: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.1rem'
        },
        controls: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '3rem',
            flexWrap: 'wrap'
        },
        filterLabel: {
            color: 'rgba(255,255,255,0.6)',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        filterBtn: {
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)',
            padding: '10px 20px',
            borderRadius: '50px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        activeFilter: {
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            borderColor: 'transparent',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto'
        },
        cardWrapper: {
            position: 'relative',
            transition: 'transform 0.3s'
        },
        newBadge: {
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            background: '#ff00cc',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '20px',
            boxShadow: '0 2px 10px rgba(255,0,204,0.4)',
            zIndex: 10
        },
        typeBadge: {
            position: 'absolute',
            top: '15px',
            left: '15px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: '600',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        scrollTopBtn: {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#00d4ff',
            color: '#000',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
            transition: 'transform 0.3s',
            zIndex: 100
        }
    };
    
    const fetchFeed = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/users/feed', config); 
            setFeedContent(data.content || []); 
        } catch (err) {
            console.error('Failed to fetch feed:', err);
            setError(err);
            setFeedContent([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollToTop(true);
            } else {
                setShowScrollToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredContent = feedContent.filter(item => {
        if (contentTypeFilter === 'all') return true;
        return item.type === contentTypeFilter;
    });

    return (
        <div style={styles.wrapper}>
            <Helmet>
                <title>My Personalized Feed | PeerNotez</title>
                <meta name="description" content="See the latest notes and blog posts from authors you follow." />
            </Helmet>

            <header style={styles.header}>
                <h1 style={styles.title}>
                    <FaRss /> Your Daily Stream
                </h1>
                <p style={styles.subtitle}>Fresh updates from authors you follow, curated just for you.</p>
            </header>
            
            {/* Filter UI */}
            {!loading && feedContent.length > 0 && (
                <div style={styles.controls}>
                    <span style={styles.filterLabel}><FaFilter /> Show:</span>
                    <button 
                        style={{...styles.filterBtn, ...(contentTypeFilter === 'all' ? styles.activeFilter : {})}}
                        onClick={() => setContentTypeFilter('all')}>
                        All Updates
                    </button>
                    <button 
                        style={{...styles.filterBtn, ...(contentTypeFilter === 'note' ? styles.activeFilter : {})}}
                        onClick={() => setContentTypeFilter('note')}>
                        <FaBook /> Notes
                    </button>
                    <button 
                        style={{...styles.filterBtn, ...(contentTypeFilter === 'blog' ? styles.activeFilter : {})}}
                        onClick={() => setContentTypeFilter('blog')}>
                        <FaPenNib /> Articles
                    </button>
                </div>
            )}

            {/* Display Status or Content */}
            {(loading || error || feedContent.length === 0) && (
                <FeedStatus 
                    loading={loading} 
                    error={error} 
                    feedContentLength={feedContent.length} 
                    onFilterChange={setContentTypeFilter}
                />
            )}
            
            {/* Display Content Grid */}
            {!loading && feedContent.length > 0 && filteredContent.length > 0 && (
                <section style={styles.grid}>
                    {filteredContent.map((item, index) => {
                        const isNew = index < 3; 

                        if (item.type === 'note') {
                            const safeNote = {
                                ...item,
                                fileType: item.fileType || 'application/octet-stream', 
                                cloudinaryId: item.cloudinaryId || 'missing-id', 
                                filePath: item.filePath || '#'
                            };

                            return (
                                <div key={`${item.type}-${item._id}`} style={styles.cardWrapper} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    {isNew && <span style={styles.newBadge}>🔥 New</span>}
                                    <span style={styles.typeBadge}><FaBook /> Note</span>
                                    <NoteCard note={safeNote} />
                                </div>
                            );
                        }
                        
                        if (item.type === 'blog') {
                            // Fix: Robust summary generation
                            const cleanContent = item.content ? item.content.replace(/[#*`]/g, '') : '';
                            const fallbackSummary = cleanContent.length > 120 
                                ? cleanContent.substring(0, 120) + '...' 
                                : cleanContent || 'Click to read more.';
                                
                            const safeBlog = {
                                ...item,
                                summary: (item.summary && item.summary.trim() !== "") 
                                    ? item.summary 
                                    : (item.description && item.description.trim() !== "") 
                                        ? item.description 
                                        : fallbackSummary
                            };

                            return (
                                <div key={`${item.type}-${item._id}`} style={styles.cardWrapper} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    {isNew && <span style={styles.newBadge}>🔥 New</span>}
                                    <span style={{...styles.typeBadge, background: 'rgba(0, 212, 255, 0.6)'}}><FaPenNib /> Blog</span>
                                    <BlogCard blog={safeBlog} />
                                </div>
                            );
                        }

                        return null;
                    })}
                </section>
            )}

            {/* Empty state for applied filter */}
            {!loading && feedContent.length > 0 && filteredContent.length === 0 && (
                <FeedStatus feedContentLength={0} onFilterChange={setContentTypeFilter} />
            )}

            {/* Back to Top Button */}
            {showScrollToTop && (
                <button 
                    style={styles.scrollTopBtn} 
                    onClick={scrollToTop} 
                    aria-label="Back to top"
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    <FaArrowUp />
                </button>
            )}
        </div>
    );
};

export default MyFeedPage;
