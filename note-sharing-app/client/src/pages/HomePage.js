import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';
import BlogCard from '../components/blog/BlogCard';
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination';
import { FaFilter, FaDownload, FaTimes, FaFeatherAlt } from 'react-icons/fa';

// --- Constants ---
const DOWNLOAD_LINK = 'https://github.com/AdityaChoudhary01/PeerNotez/releases/download/v1.0.3/PeerNotez.apk';
const SITE_URL = "https://peernotez.netlify.app/";
const LOGO_URL = "https://peernotez.netlify.app/logo192.png";
const SITE_NAME = "PeerNotez";
const SITE_DESCRIPTION = "PeerNotez is the ultimate platform for students to share handwritten notes, discover study materials, and collaborate with peers globally.";

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

    // --- NEW STATE FOR FEATURED BLOGS ---
    const [featuredBlogs, setFeaturedBlogs] = useState([]);
    const [loadingFeaturedBlogs, setLoadingFeaturedBlogs] = useState(true);

    // --- State for dynamic content sections ---
    const [stats, setStats] = useState({ totalNotes: 0, totalUsers: 0, downloadsThisMonth: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [topContributors, setTopContributors] = useState([]);
    const [loadingContributors, setLoadingContributors] = useState(true);
    
    // --- State for mobile filter bar ---
    const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);

    // --- State for Fixed Download Button ---
    const [showAppButton, setShowAppButton] = useState(true); 

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
        const fetchFeaturedBlogs = async () => {
            setLoadingFeaturedBlogs(true);
            try {
                const { data } = await axios.get('/blogs', { params: { isFeatured: true, limit: 3 } });
                setFeaturedBlogs(data.blogs || []);
            } catch (error) {
                console.error("Failed to fetch featured blogs", error);
                setFeaturedBlogs([]);
            } finally {
                setLoadingFeaturedBlogs(false);
            }
        };
        fetchFeaturedBlogs();
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

    // --- Fixed Download Button Component ---
    const AppDownloadFixedButton = () => {
        if (!showAppButton) return null;
        return (
            <div className="fixed-download-button-wrapper">
                <button className="fixed-download-close-btn" onClick={handleCloseButton} aria-label="Close">
                    <FaTimes />
                </button>
                <a href={DOWNLOAD_LINK} download className="fixed-download-button" onClick={() => setTimeout(handleCloseButton, 1000)}>
                    <FaDownload className="download-icon" /> 
                    <span className="button-text">Get App</span>
                </a>
            </div>
        );
    };

    // --- RICH RESULT SCHEMA CONFIGURATION ---
    const schemaMarkup = {
        "@context": "https://schema.org",
        "@graph": [
            // 1. WebSite Schema with Sitelinks Search Box
            {
                "@type": "WebSite",
                "name": SITE_NAME,
                "url": SITE_URL,
                "description": SITE_DESCRIPTION,
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": `${SITE_URL}search?search={search_term_string}`,
                    "query-input": "required name=search_term_string"
                }
            },
            // 2. Organization Schema
            {
                "@type": "Organization",
                "name": SITE_NAME,
                "url": SITE_URL,
                "logo": LOGO_URL,
                "sameAs": [
                    "https://www.instagram.com/aditya_choudhary__021/",
                    "https://www.linkedin.com/in/aditya-kumar-38093a304/"
                ]
            },
            // 3. WebApplication Schema (For the App download)
            {
                "@type": "WebApplication",
                "name": "PeerNotez App",
                "url": SITE_URL,
                "applicationCategory": "EducationalApplication",
                "operatingSystem": "Android",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                }
            }
        ]
    };

    return (
        <div className="homepage-content">
            <AppDownloadFixedButton />
            
            <Helmet>
                <title>{SITE_NAME} | Share and Discover Academic Notes</title>
                <meta name="description" content={SITE_DESCRIPTION} />
                <link rel="canonical" href={SITE_URL} />
                
                {/* Open Graph / Social Media */}
                <meta property="og:title" content={`${SITE_NAME} | Share and Discover Academic Notes`} />
                <meta property="og:description" content={SITE_DESCRIPTION} />
                <meta property="og:url" content={SITE_URL} />
                <meta property="og:image" content={LOGO_URL} />
                
                {/* JSON-LD Schema for Rich Results */}
                <script type="application/ld+json">
                    {JSON.stringify(schemaMarkup)}
                </script>
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
            
            {/* FEATURED BLOGS SECTION */}
            <section className="featured-blog-section">
                <h2><FaFeatherAlt /> Featured Insights</h2>
                {loadingFeaturedBlogs ? (
                    <div>Loading featured blog posts...</div>
                ) : featuredBlogs.length > 0 ? (
                    <div className="blog-posts-grid"> 
                        {featuredBlogs.map(blog => <BlogCard key={blog._id} blog={blog} />)}
                    </div>
                ) : (
                    <p style={{textAlign: 'center'}}>No featured blog posts to show yet.</p>
                )}
                <div style={{textAlign: 'center', marginTop: '2rem'}}>
                    <Link to="/blogs" className="hero-cta-button secondary" style={{maxWidth: '300px', margin: '0 auto'}}>
                        View All Blogs &rarr;
                    </Link>
                </div>
            </section>

            <hr/>

            {/* Filter Bar Toggle Button for Mobile */}
            <div className="filter-toggle-container">
                <button 
                    className="filter-toggle-btn" 
                    onClick={toggleFilterBar}
                >
                    {isFilterBarOpen ? 'Hide Filters' : 'Show Filters'}
                    <FaFilter className="filter-icon" />
                </button>
            </div>

            {/* Main Notes Section with Filter and Sort */}
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

        </div>
    );
};

export default HomePage;
