import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination';
import { FaFilter, FaDownload, FaTimes, FaArrowLeft } from 'react-icons/fa';

// --- Download Link Constant ---
const DOWNLOAD_LINK = 'https://github.com/AdityaChoudhary01/public-peernotez/releases/download/v1.0.3/PeerNotez.apk';

const HomePage = () => {
    // --- State for main notes grid ---
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('uploadDate');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // --- State for featured content ---
    const [featuredNotes, setFeaturedNotes] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);

    // --- State for dynamic content sections ---
    const [stats, setStats] = useState({ totalNotes: 0, totalUsers: 0, downloadsThisMonth: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [blogPosts, setBlogPosts] = useState([]);
    const [loadingBlog, setLoadingBlog] = useState(true);
    const [topContributors, setTopContributors] = useState([]);
    const [loadingContributors, setLoadingContributors] = useState(true);
    
    // --- State for mobile filter bar ---
    const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);

    // --- State for Fixed Download Button: Shows on every page load ---
    const [showAppButton, setShowAppButton] = useState(true); 

    // --- BLOG PAGE STATE ---
    const [selectedBlogSlug, setSelectedBlogSlug] = useState(null); 
    const [fullBlogPost, setFullBlogPost] = useState(null); 
    const [loadingFullBlog, setLoadingFullBlog] = useState(false);

    // --- DATA FETCHING HOOKS ---
    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                const params = { ...filters, sort: sortBy, page: page };
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

    useEffect(() => {
        const fetchFeaturedNotes = async () => {
            setLoadingFeatured(true);
            try {
                const { data } = await axios.get('/notes', { params: { isFeatured: true, limit: 3 } });
                setFeaturedNotes(data.notes);
            } catch (error) {
                console.error("Failed to fetch featured notes", error);
            } finally {
                setLoadingFeatured(false);
            }
        };
        fetchFeaturedNotes();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                const { data } = await axios.get('/notes/stats');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch statistics", error);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchTopContributors = async () => {
            setLoadingContributors(true);
            try {
                const { data } = await axios.get('/users/top-contributors');
                setTopContributors(data.users);
            } catch (error) {
                console.error("Failed to fetch top contributors", error);
            } finally {
                setLoadingContributors(false);
            }
        };
        fetchTopContributors();
    }, []);

    useEffect(() => {
        const fetchBlogPosts = async () => {
            setLoadingBlog(true);
            try {
                const { data } = await axios.get('/blogs'); 
                setBlogPosts(data);
            } catch (error) {
                console.error("Failed to fetch blog posts", error);
            } finally {
                setLoadingBlog(false);
            }
        };
        fetchBlogPosts();
    }, []);

    // --- FETCH FULL BLOG POST BY SLUG ---
    useEffect(() => {
        if (!selectedBlogSlug) {
            setFullBlogPost(null);
            return;
        }

        const fetchFullBlogPost = async () => {
            setLoadingFullBlog(true);
            try {
                const { data } = await axios.get(`/blogs/${selectedBlogSlug}`); 
                setFullBlogPost(data);
            } catch (error) {
                console.error(`Failed to fetch blog post: ${selectedBlogSlug}`, error);
                setFullBlogPost(null);
            } finally {
                setLoadingFullBlog(false);
            }
        };
        fetchFullBlogPost();
    }, [selectedBlogSlug]); 




   
    // --- UTILITY FUNCTIONS ---
    const handleFilterSubmit = (newFilters) => {
        const activeFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, value]) => value !== '')
        );
        setPage(1); 
        setFilters(activeFilters); 
        setIsFilterBarOpen(false);
    };
    
    const toggleFilterBar = () => { setIsFilterBarOpen(!isFilterBarOpen); };

    const handleCloseButton = () => { setShowAppButton(false); };

    // Function to handle navigation to the full blog post
    const handleViewBlog = (slug) => {
        setSelectedBlogSlug(slug);
        window.scrollTo(0, 0); 
    };

    // Function to go back to the homepage view
    const handleGoBack = () => {
        setSelectedBlogSlug(null);
        setFullBlogPost(null);
    };

    // --- Fixed Download Button Component with Close Button (THEMED) ---
    const AppDownloadFixedButton = () => {
        if (!showAppButton) return null;

        return (
            <div className="fixed-download-button-wrapper">
                <button 
                    className="fixed-download-close-btn" 
                    onClick={handleCloseButton}
                    aria-label="Close download button"
                >
                    <FaTimes />
                </button>
                <a 
                    href={DOWNLOAD_LINK} 
                    download 
                    className="fixed-download-button"
                    aria-label="Download PeerNotez App"
                    onClick={() => setTimeout(handleCloseButton, 1000)} 
                >
                    <FaDownload className="download-icon" /> 
                    <span className="button-text">Get App</span>
                </a>
            </div>
        );
    };

    // Utility function to convert line breaks in the raw text into separate <p> tags.
    // This ensures natural paragraph breaks and allows CSS to control the gap between them.
    const renderContentWithParagraphs = (rawContent) => {
        if (!rawContent) return null;
        
        // Split the content by double line breaks ('\n\n'), which typically denotes a paragraph break.
        const contentBlocks = rawContent.split('\n\n'); 
        
        // Wrap each block in a <p> tag with a specific class for styling the gap.
        return contentBlocks.map((block, index) => {
            const trimmedBlock = block.trim();
            // Skip rendering empty blocks that might result from extra newlines
            if (trimmedBlock === '') return null; 
    
            return (
                <p key={index} className="article-paragraph">
                    {trimmedBlock}
                </p>
            );
        });
    };
    
    
    // --- FULL BLOG POST COMPONENT (UPDATED) ---
    const FullBlogContent = () => {
        if (loadingFullBlog) {
            return <div className="full-blog-container loading">Loading full article...</div>;
        }
        if (!fullBlogPost) {
            return (
                <div className="full-blog-container error">
                    <button onClick={handleGoBack} className="back-button"><FaArrowLeft /> Back to Home</button>
                    <h1>Article Not Found</h1>
                    <p>The requested blog post could not be loaded. Please ensure your backend is running and the single blog route (`/blogs/:slug`) is set up correctly.</p>
                </div>
            );
        }
    
        const publishDate = fullBlogPost.createdAt ? new Date(fullBlogPost.createdAt).toLocaleDateString() : 'N/A';
    
        return (
            <div className="full-blog-container">
                <Helmet>
                    <title>{fullBlogPost.title} | PeerNotez Blog</title>
                    <meta name="description" content={fullBlogPost.summary} />
                </Helmet>
                
                <button onClick={handleGoBack} className="back-button"><FaArrowLeft /> Back to Home</button>
    
                <article className="blog-article-content">
                    <h1 className="article-title">{fullBlogPost.title}</h1>
                    
                    <div className="article-meta">
                        {fullBlogPost.author && (
                            <div className="blog-author-details">
                                {fullBlogPost.author.avatar && (
                                    <img src={fullBlogPost.author.avatar} alt={fullBlogPost.author.name} className="blog-author-avatar" />
                                )}
                                {fullBlogPost.author.name && (
                                    <p className="blog-author-name">
                                        By <strong>{fullBlogPost.author.name}</strong>
                                    </p>
                                )}
                            </div>
                        )}
                        <span className="article-date">Published on: {publishDate}</span>
                    </div>
    
                    <hr className="article-separator" />
                    
                    <div className="article-body">
                        {/* 🌟 FIX APPLIED HERE: Process the raw content into structured paragraphs */}
                        {renderContentWithParagraphs(fullBlogPost.content)} 
                    </div>
                </article>
            </div>
        );
    };

    // --- MAIN RENDER LOGIC ---
    if (selectedBlogSlug) {
        return (
            <div className="homepage-content">
                <AppDownloadFixedButton />
                <FullBlogContent />
            </div>
        );
    }

    return (
        <div className="homepage-content">
            <AppDownloadFixedButton />
            
            <Helmet>
                <title>PeerNotez | Share and Discover Academic Notes</title>
                <meta
                    name="description"
                    content="Find, share, and explore academic notes across universities and courses. PeerNotez helps students collaborate and learn more effectively. Aditya, Aditya Choudhary"
                />
                <link rel="canonical" href="https://peernotez.netlify.app/" />
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
                <meta property="og:title" content="PeerNotez | Share and Discover Academic Notes" />
                <meta property="og:description" content="Find, share, and explore academic notes across universities and courses. PeerNotez helps students collaborate and learn more effectively." />
                <meta property="og:url" content="https://peernotez.netlify.app/" />
                <meta property="og:image" content="https://peernotez.netlify.app/logo192.png" />
            </Helmet>

            <section className="hero-banner">
                <div className="hero-content">
                    <h1 className="hero-title">Empower Your Learning with PeerNotez</h1>
                    <p className="hero-subtitle">Access a vast, community-driven library of academic notes from universities worldwide. Search, share, and succeed.</p>
                    <div className="hero-actions">
                        <Link to="/search" className="hero-cta-button primary">Explore Notes</Link>
                        <Link to="/upload" className="hero-cta-button secondary">Contribute Now</Link>
                    </div>
                </div>
            </section>

            <hr/>

            <section className="stats-section">
                {loadingStats ? (
                    <div>Loading stats...</div>
                ) : (
                    <div className="stats-container">
                        <div className="stat-card">
                            <h3>{stats.totalNotes.toLocaleString()}+</h3>
                            <p>Notes Available</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats.totalUsers.toLocaleString()}+</h3>
                            <p>Students Empowered</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats.downloadsThisMonth.toLocaleString()}+</h3>
                            <p>Downloads This Month</p>
                        </div>
                    </div>
                )}
            </section>

            <hr/>

            <section className="how-it-works-section">
                <h2 className="section-title">A Seamless Way to Share and Learn</h2>
                <div className="steps-container">
                    <div className="step-card">
                        <span className="step-icon">1</span>
                        <h3>Discover</h3>
                        <p>Effortlessly find millions of notes using our advanced search and filter options.</p>
                    </div>
                    <div className="step-card">
                        <span className="step-icon">2</span>
                        <h3>Contribute</h3>
                        <p>Upload your academic notes to a global community and earn recognition.</p>
                    </div>
                    <div className="step-card">
                        <span className="step-icon">3</span>
                        <h3>Succeed</h3>
                        <p>Empower your studies by accessing high-quality content and engaging with peers.</p>
                    </div>
                </div>
            </section>

            <hr/>

            <section className="featured-notes-section">
                <h2>⭐ Editor's Picks</h2>
                {loadingFeatured ? (
                    <div>Loading featured notes...</div>
                ) : featuredNotes.length > 0 ? (
                    <div className="notes-grid">
                        {featuredNotes.map(note => <NoteCard key={note._id} note={note} />)}
                    </div>
                ) : (
                    <p style={{textAlign: 'center'}}>No featured notes have been selected yet.</p>
                )}
            </section>

            <hr/>

            {/* --- Filter Bar Toggle Button for Mobile --- */}
            <div className="filter-toggle-container">
                <button 
                    className="filter-toggle-btn" 
                    onClick={toggleFilterBar}
                >
                    {isFilterBarOpen ? 'Hide Filters' : 'Show Filters'}
                    <FaFilter className="filter-icon" />
                </button>
            </div>

            {/* --- Main Notes Section with Filter and Sort --- */}
            <section className="all-notes-section">
                <h1>Find Notes</h1>
                <FilterBar
                    onFilterSubmit={handleFilterSubmit}
                    className={isFilterBarOpen ? 'filter-bar open' : 'filter-bar'}
                />

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
                        <Pagination 
                            page={page} 
                            totalPages={totalPages} 
                            onPageChange={setPage} 
                        />
                    </>
                ) : (
                    <p style={{textAlign: 'center', marginTop: '2rem'}}>No notes found matching your criteria.</p>
                )}
            </section>

            <hr/>

            <section className="top-contributors-section">
                <h2>Our Top Note-Takers</h2>
                {loadingContributors ? (
                    <div>Loading...</div>
                ) : topContributors.length > 0 ? (
                    <div className="contributors-list">
                        {topContributors.map(contributor => (
                            <div key={contributor._id} className="contributor-card">
                                <img src={contributor.avatar} alt={contributor.name} />
                                <h4>{contributor.name}</h4>
                                <p>{contributor.noteCount} notes uploaded</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No contributors to show yet.</p>
                )}
            </section>

            <hr/>

            <section className="blog-section">
                <h2>From Our Blog</h2>
                {loadingBlog ? (
                    <div>Loading articles...</div>
                ) : blogPosts.length > 0 ? (
                    <div className="blog-posts-grid">
                        {blogPosts.map(post => (
                            <article key={post._id} className="blog-card">
                                <h3>
                                    <button 
                                        onClick={() => handleViewBlog(post.slug)} 
                                        className="blog-title-button-link"
                                    >
                                        {post.title}
                                    </button>
                                </h3>
                                {post.author && (
                                    <div className="blog-author-details">
                                        {post.author.avatar && (
                                            <img 
                                                src={post.author.avatar} 
                                                alt={`Avatar of ${post.author.name}`} 
                                                className="blog-author-avatar"
                                            />
                                        )}
                                        {post.author.name && (
                                            <p className="blog-author-name">
                                                By <strong>{post.author.name}</strong>
                                            </p>
                                        )}
                                    </div>
                                )}
                                <p className="blog-summary">{post.summary}</p>
                                <button
                                    onClick={() => handleViewBlog(post.slug)}
                                    className="read-more-btn"
                                >
                                    Read More &rarr;
                                </button>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p>No blog posts available at the moment.</p>
                )}
            </section>
        </div>
    );
};

export default HomePage;
