import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import useAuth from '../hooks/useAuth';
// Assuming these components exist and handle their internal modern styling
import NoteCard from '../components/notes/NoteCard';
import BlogCard from '../components/blog/BlogCard'; 
import { 
    FaRss, 
    FaUserPlus, 
    FaSearch, 
    FaChevronRight, 
    FaSpinner, 
    FaExclamationTriangle,
    FaArrowUp
} from 'react-icons/fa';

// --- Internal Helper Components ---

// Component for displaying Loading, Error, or Empty States
const FeedStatus = ({ loading, error, feedContentLength, onFilterChange }) => {
    if (loading) {
        return (
            <div className="feed-status loading">
                <FaSpinner className="spin-icon" size={30} />
                <p>One moment, building your personalized feed...</p>
            </div>
        );
    }
    
    if (error) {
          return (
              <div className="feed-status error">
                  <FaExclamationTriangle size={30} color="var(--error-color)" />
                  <h2>Error Loading Feed</h2>
                  <p>We couldn't fetch your content. Please try refreshing or check your network connection.</p>
              </div>
          );
    }

    if (feedContentLength === 0) {
        return (
            <div className="feed-status empty-feed-container">
                <h2>Your Feed is Quiet... 😴</h2>
                <p className="header-subtitle">
                    You haven't followed any users yet, or your followed authors haven't posted recently.
                </p>
                
                <div className="cta-group">
                    <a href="/search" className="main-cta-button discover-button">
                       <FaSearch style={{marginRight: '0.6rem'}} /> Discover New Notes & Authors <FaChevronRight style={{marginLeft: '0.6rem'}} />
                    </a>
                </div>
                
                <p className="empty-feed-tip">
                    **Tip:** Look for the **<FaUserPlus /> Follow** button on any user profile or content page!
                </p>
            </div>
        );
    }
    
    // Fallback for content when filters might be applied and hide everything
    return (
        <div className="feed-status empty-filtered-result">
            <p>No content matches your current filter settings. Try selecting "All Updates" above.</p>
        </div>
    );
};

// ------------------------------------------------------------
// --- Main MyFeedPage Component (Ultra Modern) ---
// ------------------------------------------------------------
const MyFeedPage = () => {
    const [feedContent, setFeedContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contentTypeFilter, setContentTypeFilter] = useState('all'); // 'all', 'note', or 'blog'
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    
    const { token } = useAuth();
    
    const fetchFeed = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Ensure your backend endpoint returns objects with a 'type' field ('note' or 'blog')
            const { data } = await axios.get('/users/feed', config); 
            // Assuming data.content is the array of feed items
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

    // Handle scroll visibility for 'Back to Top' button
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
        <div className="content-page my-feed-page ultra-modern-feed">
            <Helmet>
                <title>My Personalized Feed | PeerNotez</title>
                <meta name="description" content="See the latest notes and blog posts from authors you follow on PeerNotez." />
            </Helmet>

            {/* ENHANCEMENT: Header with subtle depth */}
            <header className="page-header feed-header ultra-modern-header">
                <h1 className="header-title feed-title">
                    <FaRss className="feed-icon" /> Your Daily Stream
                </h1>
                <p className="header-subtitle">Fresh updates from authors you follow, curated just for you.</p>
            </header>
            
            {/* Conditional Content Filter UI */}
            {!loading && feedContent.length > 0 && (
                <div className="feed-controls-bar modern-filter-bar">
                    <p className="filter-label">Viewing:</p> 
                    <div className="filter-buttons">
                        <button 
                            className={`filter-btn ${contentTypeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setContentTypeFilter('all')}>
                            ✨ All Updates
                        </button>
                        <button 
                            className={`filter-btn ${contentTypeFilter === 'note' ? 'active' : ''}`}
                            onClick={() => setContentTypeFilter('note')}>
                            📚 Notes
                        </button>
                        <button 
                            className={`filter-btn ${contentTypeFilter === 'blog' ? 'active' : ''}`}
                            onClick={() => setContentTypeFilter('blog')}>
                            📰 Articles
                        </button>
                    </div>
                </div>
            )}

            {/* Display Status or Content */}
            {(loading || error || feedContent.length === 0) && (
                <FeedStatus 
                    loading={loading} 
                    error={error} 
                    feedContentLength={feedContent.length} 
                />
            )}
            
            {/* Display Content Grid */}
            {!loading && feedContent.length > 0 && filteredContent.length > 0 && (
                <section className="feed-content-grid ultra-modern-grid">
                    {filteredContent.map((item, index) => {
                        const isNew = index < 3; // Placeholder for a visual 'New' indicator

                        if (item.type === 'note') {
                            // Sanitize note data to guarantee NoteCard receives valid string values
                            const isMissingThumbnailData = !item.cloudinaryId || !item.filePath;
                            const safeNote = {
                                ...item,
                                fileType: item.fileType || 'application/octet-stream', 
                                cloudinaryId: item.cloudinaryId || 'missing-id', 
                                filePath: item.filePath || '#'
                            };

                            return (
                                <div key={`${item.type}-${item._id}`} className={`feed-item-card ${isNew ? 'is-new' : ''}`}>
                                    <NoteCard note={safeNote} />
                                    {isNew && <span className="new-badge">🔥 New</span>}
                                    {isMissingThumbnailData && (
                                        <p className="generic-thumbnail-warning">
                                            (Generic thumbnail used)
                                        </p>
                                    )}
                                    <span className="content-type-badge note">📝 Note</span>
                                </div>
                            );
                        }
                        
                        if (item.type === 'blog') {
                            return (
                                <div key={`${item.type}-${item._id}`} className={`feed-item-card ${isNew ? 'is-new' : ''}`}>
                                    <BlogCard blog={item} />
                                    {isNew && <span className="new-badge">🔥 New</span>}
                                    <span className="content-type-badge blog">✍️ Article</span>
                                </div>
                            );
                        }

                        // Fallback for corrupted entries
                        return (
                            <div key={`${item.type}-${item._id}`} className="feed-item-card corrupted-entry">
                                <FaExclamationTriangle color="var(--error-color)" />
                                <p>Unrecognized or Corrupted Content Found (ID: {item._id})</p>
                            </div>
                        );
                    })}
                </section>
            )}

            {/* Empty state for applied filter */}
            {!loading && feedContent.length > 0 && filteredContent.length === 0 && (
                // Re-using FeedStatus logic for empty filtered result
                <FeedStatus feedContentLength={0} onFilterChange={setContentTypeFilter} />
            )}

            {/* Back to Top Button */}
            {showScrollToTop && (
                <button className="back-to-top-btn ultra-modern-scroll-btn" onClick={scrollToTop} aria-label="Back to top">
                    <FaArrowUp />
                </button>
            )}
        </div>
    );
};

export default MyFeedPage;
