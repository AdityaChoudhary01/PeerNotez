import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';
import BlogCard from '../components/blog/BlogCard';
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination';
import { FaFilter, FaDownload, FaTimes, FaFeatherAlt, FaRocket, FaGlobe, FaStar, FaUserAstronaut, FaArrowRight } from 'react-icons/fa';

const DOWNLOAD_LINK = 'https://github.com/AdityaChoudhary01/PeerNotez/releases/download/v1.0.3/PeerNotez.apk';

// --- Skeleton Component for SEO and UX ---
const CardSkeleton = () => (
    <div style={{
        height: '350px', 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: '20px', 
        border: '1px solid rgba(255,255,255,0.1)',
        animation: 'pulse 1.5s infinite ease-in-out'
    }} />
);

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
    const [featuredBlogs, setFeaturedBlogs] = useState([]);
    const [loadingFeaturedBlogs, setLoadingFeaturedBlogs] = useState(true);

    // --- State for dynamic content ---
    const [stats, setStats] = useState({ totalNotes: 29, totalUsers: 16, downloadsThisMonth: 36 }); // Pre-filled with approximate values for SEO
    const [topContributors, setTopContributors] = useState([]);
    const [loadingContributors, setLoadingContributors] = useState(true);
    
    const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
    const [showAppButton, setShowAppButton] = useState(true);

    // --- 3D TILT STATE ---
    const heroRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    // --- INTERNAL CSS: HOLOGRAPHIC HOMEPAGE ---
    const styles = {
        heroSection: {
            minHeight: '85vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginTop: '-50px',
            marginBottom: '4rem',
            perspective: '1000px'
        },
        heroCard: {
            textAlign: 'center',
            zIndex: 10,
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transition: 'transform 0.1s ease-out',
            padding: '4rem 1.5rem', 
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            maxWidth: '1000px',
            width: '95%' 
        },
        heroTitle: {
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem',
            lineHeight: 1.2
        },
        heroSubtitle: {
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            maxWidth: '700px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
        },
        btnGroup: {
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
        },
        primaryBtn: {
            padding: '14px 32px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '1.1rem',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
            transition: 'transform 0.3s',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        secondaryBtn: {
            padding: '14px 32px',
            borderRadius: '50px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '1.1rem',
            backdropFilter: 'blur(5px)',
            transition: 'background 0.3s',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        sectionHeader: {
            textAlign: 'center',
            marginBottom: '3rem',
            position: 'relative'
        },
        sectionTitle: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#fff',
            display: 'inline-block',
            paddingBottom: '10px',
            borderBottom: '2px solid #00d4ff'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '5rem'
        },
        statCard: {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            transition: 'transform 0.3s'
        },
        statNumber: {
            fontSize: '3rem',
            fontWeight: '800',
            background: 'linear-gradient(to bottom, #fff, #a0a0a0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
        },
        gridContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
        },
        contributorCard: {
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'all 0.3s ease',
            textDecoration: 'none', 
            cursor: 'pointer'
        },
        fixedBtnWrapper: {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        fixedBtn: {
            background: 'rgba(15, 12, 41, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 212, 255, 0.5)',
            color: '#fff',
            padding: '12px', 
            borderRadius: '50%', 
            width: '50px',
            height: '50px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
            transition: 'transform 0.3s'
        },
        closeFixedBtn: {
            background: 'rgba(255, 0, 85, 0.2)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        filterToggle: {
            display: 'block',
            margin: '0 auto 2rem',
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '1rem'
        },
        controlsHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem',
            background: 'rgba(0,0,0,0.2)',
            padding: '1rem',
            borderRadius: '16px'
        },
        select: {
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            outline: 'none',
            cursor: 'pointer'
        }
    };

    const handleMouseMove = (e) => {
        if (!heroRef.current) return;
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 30;
        const y = -(e.clientY - top - height / 2) / 30;
        setTilt({ x, y });
    };
    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                const params = { ...filters, sort: sortBy, page: page };
                const { data } = await axios.get('/notes', { params });
                setNotes(data.notes);
                setPage(data.page);
                setTotalPages(data.totalPages);
            } catch (error) { console.error("Failed to fetch notes", error); } 
            finally { setLoading(false); }
        };
        fetchNotes();
    }, [filters, sortBy, page]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stats separately for immediate visibility
                axios.get('/notes/stats').then(res => {
                    setStats(res.data);
                });

                const notesRes = await axios.get('/notes', { params: { isFeatured: true, limit: 3 } });
                setFeaturedNotes(notesRes.data.notes);
                setLoadingFeatured(false);

                const blogsRes = await axios.get('/blogs', { params: { isFeatured: true, limit: 3 } });
                setFeaturedBlogs(blogsRes.data.blogs || []);
                setLoadingFeaturedBlogs(false);

                const contribRes = await axios.get('/users/top-contributors');
                setTopContributors(contribRes.data.users);
                setLoadingContributors(false);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    const handleFilterSubmit = (newFilters) => {
        const activeFilters = Object.fromEntries(Object.entries(newFilters).filter(([_, v]) => v !== ''));
        setPage(1);
        setFilters(activeFilters);
        setIsFilterBarOpen(false);
    };

    return (
        <div className="homepage-content">
            <Helmet>
                <title>PeerNotez | Share and Discover Academic Notes</title>
                <meta name="description" content="PeerNotez is a note-sharing platform for students to discover handwritten notes, collaborate with peers, and boost study efficiency." />
            </Helmet>

            {showAppButton && (
                <div style={styles.fixedBtnWrapper}>
                    <button onClick={() => setShowAppButton(false)} style={styles.closeFixedBtn} aria-label="Close download button"><FaTimes /></button>
                    <a href={DOWNLOAD_LINK} download style={styles.fixedBtn} title="Download App">
                        <FaDownload />
                    </a>
                </div>
            )}

            {/* --- HERO SECTION: INDEPENDENT OF API --- */}
            <section 
                className="hero-section-responsive"
                style={styles.heroSection} 
                onMouseMove={handleMouseMove} 
                onMouseLeave={handleMouseLeave} 
                ref={heroRef}
            >
                <div style={styles.heroCard}>
                    <h1 style={styles.heroTitle}>Empower Your Learning<br />with PeerNotez</h1>
                    <p style={styles.heroSubtitle}>Access a vast, community-driven library of academic notes from universities worldwide. Search, share, and succeed together.</p>
                    <div style={styles.btnGroup}>
                        <Link to="/search" style={styles.primaryBtn} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>Explore Notes</Link>
                        <Link to="/upload" style={styles.secondaryBtn}>Contribute Now</Link>
                    </div>
                </div>
                <div style={{
                    position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', 
                    background: 'radial-gradient(circle, rgba(255, 0, 204, 0.2), transparent 70%)', 
                    filter: 'blur(50px)', zIndex: 0 
                }} />
                <div style={{
                    position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', 
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2), transparent 70%)', 
                    filter: 'blur(50px)', zIndex: 0 
                }} />
            </section>

            {/* --- STATS SECTION: SEMI-INDEPENDENT --- */}
            <div style={styles.statsGrid}>
                {[
                    { icon: <FaRocket />, val: stats.totalNotes, label: 'Notes Available', color: '#ff00cc' },
                    { icon: <FaGlobe />, val: stats.totalUsers, label: 'Students Empowered', color: '#00d4ff' },
                    { icon: <FaDownload />, val: stats.downloadsThisMonth, label: 'Downloads This Month', color: '#ffcc00' }
                ].map((item, idx) => (
                    <div key={idx} style={styles.statCard} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{fontSize: '2rem', color: item.color, marginBottom: '10px'}}>{item.icon}</div>
                        <div style={styles.statNumber}>{item.val.toLocaleString()}+</div>
                        <div style={{color: 'rgba(255,255,255,0.7)'}}>{item.label}</div>
                    </div>
                ))}
            </div>

            {/* --- EDITOR'S PICKS --- */}
            <section style={{marginBottom: '5rem'}}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>⭐ Editor's Picks</h2>
                </div>
                <div style={styles.gridContainer}>
                    {loadingFeatured ? (
                        [1,2,3].map(i => <CardSkeleton key={i} />)
                    ) : featuredNotes.length > 0 ? (
                        featuredNotes.map(note => <NoteCard key={note._id} note={note} />)
                    ) : (
                        <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.5)', gridColumn: '1/-1'}}>No featured notes available.</p>
                    )}
                </div>
            </section>

            {/* --- FEATURED INSIGHTS --- */}
            <section style={{marginBottom: '5rem'}}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}><FaFeatherAlt /> Featured Insights</h2>
                </div>
                <div style={styles.gridContainer}>
                    {loadingFeaturedBlogs ? (
                        [1,2,3].map(i => <CardSkeleton key={i} />)
                    ) : featuredBlogs.length > 0 ? (
                        featuredBlogs.map(blog => <BlogCard key={blog._id} blog={blog} />)
                    ) : (
                        <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.5)', gridColumn: '1/-1'}}>No blogs to show.</p>
                    )}
                </div>
                <div style={{textAlign: 'center'}}>
                    <Link to="/blogs" style={{...styles.secondaryBtn, fontSize: '0.9rem', padding: '10px 24px'}}>
                        View All Blogs <FaArrowRight style={{marginLeft: '5px'}}/>
                    </Link>
                </div>
            </section>

            {/* --- LIBRARY SECTION --- */}
            <section style={{marginBottom: '5rem'}} id="notes-library">
                <div style={styles.sectionHeader}>
                    <h1 style={styles.sectionTitle}>Library</h1>
                </div>

                <div className="mobile-filter-toggle">
                    <button 
                        style={styles.filterToggle} 
                        onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
                    >
                        {isFilterBarOpen ? 'Hide Filters' : 'Show Filters'} <FaFilter />
                    </button>
                </div>

                <div style={{display: isFilterBarOpen || window.innerWidth > 768 ? 'block' : 'none'}}>
                    <FilterBar onFilterSubmit={handleFilterSubmit} />
                </div>

                <div style={styles.controlsHeader}>
                    <h3 style={{margin: 0, color: '#fff'}}>All Notes</h3>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <label htmlFor="sort-select" style={{color: 'rgba(255,255,255,0.7)'}}>Sort by:</label>
                        <select 
                            id="sort-select" 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            style={styles.select}
                        >
                            <option value="uploadDate">Most Recent</option>
                            <option value="highestRated">Highest Rated</option>
                            <option value="mostDownloaded">Most Downloaded</option>
                        </select>
                    </div>
                </div>

                <div style={styles.gridContainer}>
                    {loading ? (
                        [1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)
                    ) : notes.length > 0 ? (
                        notes.map(note => <NoteCard key={note._id} note={note} />)
                    ) : (
                        <p style={{textAlign: 'center', marginTop: '2rem', color: 'rgba(255,255,255,0.5)', gridColumn: '1/-1'}}>No notes found matching your criteria.</p>
                    )}
                </div>

                {!loading && totalPages > 1 && (
                    <Pagination 
                        page={page} 
                        totalPages={totalPages} 
                        onPageChange={setPage} 
                    />
                )}
            </section>

            {/* --- TOP CONTRIBUTORS --- */}
            <section>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}><FaUserAstronaut /> Top Contributors</h2>
                </div>
                <div style={styles.gridContainer}>
                    {loadingContributors ? (
                        [1,2,3].map(i => <CardSkeleton key={i} />)
                    ) : topContributors.length > 0 ? (
                        topContributors.map(contributor => (
                            <Link 
                                to={`/profile/${contributor._id}`} 
                                key={contributor._id} 
                                style={styles.contributorCard}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                            >
                                <img 
                                    src={contributor.avatar} 
                                    alt={contributor.name} 
                                    style={{width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #00d4ff', objectFit: 'cover'}}
                                />
                                <div>
                                    <h4 style={{margin: '0 0 5px 0', color: '#fff'}}>{contributor.name}</h4>
                                    <p style={{margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)'}}>
                                        <FaStar color="#ffcc00"/> {contributor.noteCount} notes
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.5)', gridColumn: '1/-1'}}>No contributors to show yet.</p>
                    )}
                </div>
            </section>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                    100% { opacity: 0.5; }
                }

                @media (max-width: 768px) {
                    .hero-section-responsive {
                        margin-top: 2rem !important;
                        padding: 0 10px !important;
                    }
                    
                    .hero-section-responsive > div:first-of-type {
                        width: 99.9% !important;
                        padding: 6rem 1rem !important;
                    }

                    h1 {
                        font-size: 2rem !important;
                        padding: 0 10px;
                    }
                    
                    p {
                        font-size: 1rem !important;
                        padding: 0 5px;
                    }
                }
            `}</style>
        </div>
    );
};

export default HomePage;
