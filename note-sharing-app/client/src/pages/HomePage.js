import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';
import BlogCard from '../components/blog/BlogCard';
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination';
import { optimizeCloudinaryUrl } from '../utils/cloudinaryHelper';
import { 
    FaFilter, FaDownload, FaTimes, FaFeatherAlt, FaRocket, 
    FaStar, FaUserAstronaut, FaArrowRight, FaBolt, FaCrown, FaMedal 
} from 'react-icons/fa';

const DOWNLOAD_LINK = 'https://github.com/AdityaChoudhary01/PeerNotez/releases/download/v1.0.3/PeerNotez.apk';

const HomePage = () => {
    // --- State ---
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('uploadDate');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [featuredNotes, setFeaturedNotes] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const [featuredBlogs, setFeaturedBlogs] = useState([]);
    const [loadingFeaturedBlogs, setLoadingFeaturedBlogs] = useState(true);

    const [stats, setStats] = useState({ totalNotes: 0, totalUsers: 0, downloadsThisMonth: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [topContributors, setTopContributors] = useState([]);
    const [loadingContributors, setLoadingContributors] = useState(true);
    
    const [isFilterBarOpen, setIsFilterBarOpen] = useState(window.innerWidth > 768);
    const [showAppButton, setShowAppButton] = useState(true);

    // --- 3D Tilt & Animation State ---
    const heroRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    // --- Ticker State ---
    const [currentActivity, setCurrentActivity] = useState(0);
    const activities = [
        { user: 'Aditya', action: 'uploaded React Notes', icon: <FaBolt color="#ffcc00"/> },
        { user: 'Sneha', action: 'shared DBMS PDF', icon: <FaStar color="#00d4ff"/> },
        { user: 'Rahul', action: 'just joined PeerNotez', icon: <FaRocket color="#ff00cc"/> }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentActivity((prev) => (prev + 1) % activities.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [activities.length]);

    // --- Styling Objects ---
    const styles = {
        heroSection: {
            minHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginTop: '-50px',
            marginBottom: '2rem',
            perspective: '1000px',
            zIndex: 1,
            overflow: 'hidden',
            width: '100%'
        },
        heroContent: {
            textAlign: 'center',
            zIndex: 10,
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transition: 'transform 0.1s ease-out',
            maxWidth: '1000px',
            width: '100%',
            padding: '0 1.5rem'
        },
        heroTitle: {
            fontSize: 'clamp(3rem, 6vw, 5.5rem)',
            fontWeight: '900',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem',
            lineHeight: 1.1,
            letterSpacing: '-1px',
            textShadow: '0 10px 30px rgba(0,0,0,0.3)'
        },
        heroSubtitle: {
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.85)',
            maxWidth: '700px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
            fontWeight: '400'
        },
        btnGroup: { display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' },
        primaryBtn: {
            padding: '16px 40px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '1.1rem',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        secondaryBtn: {
            padding: '16px 40px',
            borderRadius: '50px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '1.1rem',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        tickerPill: {
            background: 'rgba(15, 12, 41, 0.6)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            borderRadius: '100px',
            padding: '8px 24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            animation: 'fadeInDown 1s ease-out'
        },
        // Updated Compact Stats Container
        statsContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)', // Always 3 columns
            gap: '10px',
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto 6rem',
            padding: '1.5rem 1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
        },
        statItem: {
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        sectionHeader: { textAlign: 'center', marginBottom: '3rem', position: 'relative' },
        sectionTitle: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#fff',
            display: 'inline-block',
            paddingBottom: '10px',
            borderBottom: '2px solid #00d4ff'
        },
        fixedBtnWrapper: { 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
        },
        fixedBtn: {
            background: 'rgba(15, 12, 41, 0.9)', 
            border: '1px solid rgba(0, 212, 255, 0.5)',
            color: '#fff',
            padding: '12px',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
            transition: 'transform 0.3s',
            fontSize: '1.2rem'
        },
        closeFixedBtn: {
            background: 'rgba(255, 0, 85, 0.2)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        filterToggle: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            margin: '0 auto 2rem',
            padding: '12px 30px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            width: 'fit-content'
        },
        controlsHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem',
            background: 'rgba(0,0,0,0.2)',
            padding: '1.2rem',
            borderRadius: '16px',
            gap: '15px'
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
        const x = (e.clientX - left - width / 2) / 40;
        const y = -(e.clientY - top - height / 2) / 40;
        setTilt({ x, y });
    };

    // --- API Calls ---
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
                const [notesRes, blogsRes, statsRes, contribRes] = await Promise.all([
                    axios.get('/notes', { params: { isFeatured: true, limit: 3 } }),
                    axios.get('/blogs', { params: { isFeatured: true, limit: 3 } }),
                    axios.get('/notes/stats'),
                    axios.get('/users/top-contributors')
                ]);
                setFeaturedNotes(notesRes.data.notes);
                setLoadingFeatured(false);
                setFeaturedBlogs(blogsRes.data.blogs || []);
                setLoadingFeaturedBlogs(false);
                setStats(statsRes.data);
                setLoadingStats(false);
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
        if (window.innerWidth < 768) setIsFilterBarOpen(false); 
    };

    // --- Contributor Badge Helper ---
    const getContributorBadge = (index) => {
        if (index === 0) return { icon: <FaCrown />, color: '#FFD700', border: '1px solid #FFD700', shadow: '0 0 20px rgba(255, 215, 0, 0.3)' }; // Gold
        if (index === 1) return { icon: <FaMedal />, color: '#C0C0C0', border: '1px solid #C0C0C0', shadow: 'none' }; // Silver
        if (index === 2) return { icon: <FaMedal />, color: '#CD7F32', border: '1px solid #CD7F32', shadow: 'none' }; // Bronze
        return { icon: null, color: '#fff', border: '1px solid rgba(255,255,255,0.1)', shadow: 'none' };
    };

    return (
        <main className="homepage-content">
           {/* --- MERGED SEO DATA --- */}
            <Helmet>
                <title>PeerNotez | Discover & Share Student Handwritten Notes Online</title>
                <meta name="description" content="PeerNotez is a collaborative platform for students to share and discover handwritten notes, study materials, and academic insights. Boost your exam preparation today!" />
                <meta name="keywords" content="PeerNotez, handwritten notes, student notes, engineering notes, study materials, Aditya Choudhary, college notes app" />
                <link rel="canonical" href="https://peernotez.netlify.app/" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://peernotez.netlify.app/" />
                <meta property="og:title" content="PeerNotez | The Ultimate Note Sharing Platform" />
                <meta property="og:description" content="Join thousands of students sharing quality handwritten notes globally. Find your course material on PeerNotez." />
                <meta property="og:image" content="https://peernotez.netlify.app/logo512.png" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="PeerNotez – Student Powered Learning" />

                {/* Structured Data */}
                <script type="application/ld+json">
                {`
                {
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": "PeerNotez",
                    "url": "https://peernotez.netlify.app/",
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": "https://peernotez.netlify.app/search?q={search_term_string}",
                        "query-input": "required name=search_term_string"
                    }
                }
                `}
                </script>
            </Helmet>

            <style>{`
                .homepage-content {
                    width: 100%;
                    overflow-x: hidden;
                }

                .responsive-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                }

                .blog-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 2.5rem;
                }

                /* Responsive Typography for Stats */
                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 800;
                    line-height: 1;
                    margin-bottom: 0.25rem;
                    display: block;
                }
                .stat-label {
                    color: rgba(255,255,255,0.6);
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .responsive-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                    }
                    .blog-grid {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                    .hero-section-responsive {
                        margin-top: 1rem !important;
                        min-height: 70vh !important;
                        overflow: hidden;
                    }
                    /* Smaller stats text for mobile to fit side-by-side */
                    .stat-value {
                        font-size: 1.5rem; 
                    }
                    .stat-label {
                        font-size: 0.7rem;
                        letter-spacing: 0px;
                    }
                }

                @keyframes float-ticker {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { transform: translateY(-5px); opacity: 1; }
                    90% { transform: translateY(-5px); opacity: 1; }
                    100% { transform: translateY(-10px); opacity: 0; }
                }
                .ticker-anim { animation: float-ticker 4s ease-in-out infinite; }

                .contributor-card {
                    transition: all 0.3s ease;
                }
                .contributor-card:hover {
                    transform: translateY(-5px);
                    background: rgba(255,255,255,0.08) !important;
                }
            `}</style>

            {/* App Download Button */}
            {showAppButton && (
                <div style={styles.fixedBtnWrapper}>
                    <button onClick={() => setShowAppButton(false)} style={styles.closeFixedBtn}><FaTimes /></button>
                    <a href={DOWNLOAD_LINK} download style={styles.fixedBtn} title="Download App">
                        <FaDownload />
                    </a>
                </div>
            )}

            {/* --- HERO SECTION --- */}
            <section 
                className="hero-section-responsive"
                style={styles.heroSection} 
                onMouseMove={handleMouseMove} 
                onMouseLeave={() => setTilt({ x: 0, y: 0 })} 
                ref={heroRef}
            >
                {/* Floating Background Glows */}
                <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15), transparent 60%)', filter: 'blur(80px)', zIndex: 0 }} />
                <div style={{ position: 'absolute', bottom: '0%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255, 0, 204, 0.1), transparent 60%)', filter: 'blur(80px)', zIndex: 0 }} />

                <div style={styles.heroContent}>
                    <div style={styles.tickerPill}>
                        <div className="ticker-anim" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            {activities[currentActivity].icon}
                            <span style={{fontSize: '0.9rem', color: '#eee'}}>
                                <strong>{activities[currentActivity].user}</strong> {activities[currentActivity].action}
                            </span>
                        </div>
                    </div>

                    <h1 style={styles.heroTitle}>
                        Master Your <br/>
                        <span>Coursework.</span>
                    </h1>
                    <p style={styles.heroSubtitle}>
                        Join the fastest-growing community of students sharing handwritten notes, project insights, and exam strategies.
                    </p>
                    
                    <div style={styles.btnGroup}>
                        <Link to="/search" style={styles.primaryBtn} 
                              onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'} 
                              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                            <FaRocket style={{marginRight:'10px'}}/> Start Learning
                        </Link>
                        <Link to="/upload" style={styles.secondaryBtn}>
                            <FaFeatherAlt style={{marginRight:'10px'}}/> Share Notes
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- COMPACT STATS GRID (Side-by-Side Mobile) --- */}
            {!loadingStats && (
                <div style={styles.statsContainer}>
                    <div style={styles.statItem}>
                        <span className="stat-value" style={{color: '#ff00cc'}}>
                            {stats.totalNotes.toLocaleString()}+
                        </span>
                        <span className="stat-label">Notes</span>
                    </div>
                    
                    <div style={styles.statItem}>
                        <span className="stat-value" style={{color: '#00d4ff'}}>
                            {stats.totalUsers.toLocaleString()}+
                        </span>
                        <span className="stat-label">Users</span>
                    </div>

                    <div style={styles.statItem}>
                        <span className="stat-value" style={{color: '#ffcc00'}}>
                            {stats.downloadsThisMonth.toLocaleString()}+
                        </span>
                        <span className="stat-label">Downloads</span>
                    </div>
                </div>
            )}

            {/* --- EDITOR'S PICKS --- */}
            <section style={{marginBottom: '6rem'}}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Editor's Picks</h2>
                    <p style={{color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>Hand-picked quality notes for this week</p>
                </div>
                {loadingFeatured ? (
                    <div style={{textAlign: 'center'}}>Loading...</div>
                ) : featuredNotes.length > 0 ? (
                    <div className="responsive-grid">
                        {featuredNotes.map(note => <NoteCard key={note._id} note={note} />)}
                    </div>
                ) : (
                    <p style={{textAlign: 'center', opacity: 0.5}}>No featured notes.</p>
                )}
            </section>

            {/* --- ACADEMIC LIBRARY --- */}
            <section style={{marginBottom: '6rem'}} id="notes-library">
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Academic Library</h2>
                </div>

                <button 
                    style={styles.filterToggle} 
                    onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
                >
                    <FaFilter /> {isFilterBarOpen ? 'Hide Filters' : 'Filter Library'} 
                </button>

                <div style={{ display: isFilterBarOpen ? 'block' : 'none', marginBottom: '2rem', transition: 'all 0.3s' }}>
                    <FilterBar onFilterSubmit={handleFilterSubmit} />
                </div>

                <div style={styles.controlsHeader}>
                    <div style={{fontWeight: '600', color: '#fff'}}>Showing {notes.length} results</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <label htmlFor="sort-select" style={{color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem'}}>Sort:</label>
                        <select 
                            id="sort-select" 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            style={styles.select}
                        >
                            <option value="uploadDate">Newest</option>
                            <option value="highestRated">Top Rated</option>
                            <option value="mostDownloaded">Popular</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{textAlign: 'center', padding: '2rem'}}>Searching library...</div>
                ) : notes.length > 0 ? (
                    <>
                        <div className="responsive-grid">
                            {notes.map(note => <NoteCard key={note._id} note={note} />)}
                        </div>
                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </>
                ) : (
                    <p style={{textAlign: 'center', opacity: 0.5, padding: '2rem'}}>No notes found.</p>
                )}
            </section>

            {/* --- FEATURED BLOGS --- */}
            <section style={{marginBottom: '6rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem'}}>
                    <div>
                        <h2 style={{fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem'}}>Featured Insights</h2>
                        <p style={{color: 'rgba(255,255,255,0.5)', margin: 0}}>Latest study tips and tech trends</p>
                    </div>
                    <Link to="/blogs" style={{color: '#00d4ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px'}}>
                        View All <FaArrowRight />
                    </Link>
                </div>

                {loadingFeaturedBlogs ? (
                    <div style={{textAlign: 'center'}}>Loading blogs...</div>
                ) : featuredBlogs.length > 0 ? (
                    <div className="blog-grid">
                        {featuredBlogs.map(blog => <BlogCard key={blog._id} blog={blog} />)}
                    </div>
                ) : (
                    <p style={{textAlign: 'center', opacity: 0.5}}>No blogs available.</p>
                )}
            </section>

            {/* --- TOP CONTRIBUTORS --- */}
            <section style={{marginBottom: '4rem'}}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}><FaUserAstronaut style={{marginRight: '10px'}}/>Hall of Fame</h2>
                </div>
                {loadingContributors ? (
                    <div style={{textAlign: 'center'}}>Loading leaderboard...</div>
                ) : topContributors.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {topContributors.map((contributor, index) => {
                            const badgeStyle = getContributorBadge(index);
                            return (
                                <Link 
                                    to={`/profile/${contributor._id}`} 
                                    key={contributor._id} 
                                    className="contributor-card"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.5rem',
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: badgeStyle.border,
                                        boxShadow: badgeStyle.shadow,
                                        textDecoration: 'none',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Rank Number BG */}
                                    <div style={{position: 'absolute', right: '-10px', bottom: '-20px', fontSize: '6rem', fontWeight: '900', color: 'rgba(255,255,255,0.03)', zIndex: 0}}>
                                        {index + 1}
                                    </div>

                                    <div style={{position: 'relative', zIndex: 1}}>
                                        <img 
                                            src={optimizeCloudinaryUrl(contributor.avatar, { width: 120, height: 120, isProfile: true })} 
                                            alt={contributor.name} 
                                            style={{width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${badgeStyle.color}`}}
                                        />
                                        {badgeStyle.icon && (
                                            <div style={{position: 'absolute', bottom: '-5px', right: '-5px', background: '#1a1a1a', borderRadius: '50%', padding: '5px', color: badgeStyle.color, border: `1px solid ${badgeStyle.color}`}}>
                                                {badgeStyle.icon}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{zIndex: 1}}>
                                        <h4 style={{margin: '0 0 5px 0', color: '#fff', fontSize: '1.2rem'}}>{contributor.name}</h4>
                                        <p style={{margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                            <FaStar color="#ffcc00"/> {contributor.noteCount} Contributions
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{textAlign: 'center', opacity: 0.5}}>Leaderboard is empty.</p>
                )}
            </section>
        </main>
    );
};

export default HomePage;
