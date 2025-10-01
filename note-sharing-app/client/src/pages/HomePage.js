import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination';
import { FaFilter, FaDownload, FaTimes } from 'react-icons/fa';

// --- Download Link Constant (Kept) ---
const DOWNLOAD_LINK = 'https://github.com/AdityaChoudhary01/PeerNotez/releases/download/v1.0.3/PeerNotez.apk';

// NOTE: BUTTON_STORAGE_KEY is removed.

const HomePage = () => {
    // State for main notes grid (unchanged)
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('uploadDate');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // State for featured content (unchanged)
    const [featuredNotes, setFeaturedNotes] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);

    // State for dynamic content sections (unchanged)
    const [stats, setStats] = useState({ totalNotes: 0, totalUsers: 0, downloadsThisMonth: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [blogPosts, setBlogPosts] = useState([]);
    const [loadingBlog, setLoadingBlog] = useState(true);
    const [topContributors, setTopContributors] = useState([]);
    const [loadingContributors, setLoadingContributors] = useState(true);
    
    // --- State for mobile filter bar (unchanged) ---
    const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);

    // --- State for Fixed Download Button: ALWAYS TRUE INITIALLY (FIX APPLIED) ---
    const [showAppButton, setShowAppButton] = useState(true); // Always starts as visible

    // --- Data Fetching Hooks (unchanged) ---
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

    const handleFilterSubmit = (newFilters) => {
        const activeFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, value]) => value !== '')
        );
        setPage(1); 
        setFilters(activeFilters);
        setIsFilterBarOpen(false);
    };
    
    const toggleFilterBar = () => {
        setIsFilterBarOpen(!isFilterBarOpen);
    };

    // Function to handle manual closing (user clicks 'X' or 'Download')
    const handleCloseButton = () => {
        // FIX: Only sets the state to false. On refresh, the component remounts 
        // and showAppButton is reset to true.
        setShowAppButton(false);
        // sessionStorage.setItem(BUTTON_STORAGE_KEY, 'true'); <-- REMOVED THIS LINE
    };

    // --- Fixed Download Button Component with Close Button ---
    const AppDownloadFixedButton = () => {
        if (!showAppButton) return null;

        return (
            <div className="fixed-download-button-wrapper">
                {/* Close Button */}
                <button 
                    className="fixed-download-close-btn" 
                    onClick={handleCloseButton}
                    aria-label="Close download button"
                >
                    <FaTimes />
                </button>
                
                {/* Download Link/Button */}
                <a 
                    href={DOWNLOAD_LINK} 
                    download 
                    className="fixed-download-button"
                    aria-label="Download PeerNotez App"
                    onClick={() => setTimeout(handleCloseButton, 1000)} // Hide a moment after clicking download
                >
                    <FaDownload className="download-icon" /> 
                    <span className="button-text">Get App</span>
                </a>
            </div>
        );
    };


    return (
        <div className="homepage-content">
            {/* 1. Insert the Fixed Download Button component here */}
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

            {/* --- Refined Hero Banner --- */}
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

            {/* --- Key Statistics Section --- */}
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

            {/* --- Updated "How It Works" Section --- */}
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

            {/* --- Featured Notes Section --- */}
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
                    // Conditionally add the 'open' class for mobile visibility
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

            {/* --- Top Contributors Section --- */}
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

            {/* --- Blog/Resources Section --- */}
            <section className="blog-section">
                <h2>From Our Blog</h2>
                {loadingBlog ? (
                    <div>Loading articles...</div>
                ) : blogPosts.length > 0 ? (
                    <div className="blog-posts-grid">
                        {blogPosts.map(post => (
                            <article key={post._id} className="blog-card">
                                <h3>{post.title}</h3>
                                <p>{post.summary}</p>
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
