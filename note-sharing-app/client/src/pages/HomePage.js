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
    FaFilter, FaDownload, FaTimes, 
    FaStar, FaUserAstronaut, FaArrowRight, FaSearch, FaBolt, FaLayerGroup 
} from 'react-icons/fa';

const DOWNLOAD_LINK = 'https://github.com/AdityaChoudhary01/PeerNotez/releases/download/v1.0.3/PeerNotez.apk';

// --- Helper: Scroll Reveal Animation ---
const FadeInSection = ({ children, delay = 0 }) => {
    const [isVisible, setVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => setVisible(entry.isIntersecting));
        });
        const currentRef = domRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);

    return (
        <div
            ref={domRef}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s, transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s`
            }}
        >
            {children}
        </div>
    );
};

const HomePage = () => {
    // --- Data State ---
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('uploadDate');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // --- Featured State ---
    const [featuredNotes, setFeaturedNotes] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const [featuredBlogs, setFeaturedBlogs] = useState([]);
    const [loadingFeaturedBlogs, setLoadingFeaturedBlogs] = useState(true);
    const [stats, setStats] = useState({ totalNotes: 0, totalUsers: 0, downloadsThisMonth: 0 });
    const [topContributors, setTopContributors] = useState([]);
    const [loadingContributors, setLoadingContributors] = useState(true);

    // --- UI State ---
    const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
    const [showAppButton, setShowAppButton] = useState(true);
    const heroVisualRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    // --- Effects ---
    useEffect(() => {
        const fetchMainNotes = async () => {
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
        fetchMainNotes();
    }, [filters, sortBy, page]);

    useEffect(() => {
        const fetchStaticData = async () => {
            try {
                const [notesRes, blogsRes, statsRes, contribRes] = await Promise.all([
                    axios.get('/notes', { params: { isFeatured: true, limit: 3 } }),
                    axios.get('/blogs', { params: { isFeatured: true, limit: 3 } }),
                    axios.get('/notes/stats'),
                    axios.get('/users/top-contributors', { params: { limit: 6 } }) 
                ]);
                setFeaturedNotes(notesRes.data.notes);
                setFeaturedBlogs(blogsRes.data.blogs || []);
                setStats(statsRes.data);
                setTopContributors(contribRes.data.users);
            } catch (err) { console.error(err); }
            finally {
                setLoadingFeatured(false);
                setLoadingFeaturedBlogs(false);
                setLoadingContributors(false);
            }
        };
        fetchStaticData();
    }, []);

    const handleMouseMove = (e) => {
        if (!heroVisualRef.current) return;
        const { left, top, width, height } = heroVisualRef.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 35; // Reduced sensitivity
        const y = -(e.clientY - top - height / 2) / 35;
        setTilt({ x, y });
    };

    const handleFilterSubmit = (newFilters) => {
        const activeFilters = Object.fromEntries(Object.entries(newFilters).filter(([_, v]) => v !== ''));
        setPage(1);
        setFilters(activeFilters);
        setIsFilterBarOpen(false);
    };

    return (
        <main className="homepage-wrapper">
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

            {/* --- FIXED APP DOWNLOAD BUTTON --- */}
            {showAppButton && (
                <div className="fixed-app-prompt">
                    <button onClick={() => setShowAppButton(false)} className="close-btn" aria-label="Close download prompt"><FaTimes /></button>
                    <a href={DOWNLOAD_LINK} download className="download-fab" title="Download PeerNotez Android App">
                        <FaDownload className="bounce" />
                    </a>
                </div>
            )}

            {/* --- HERO SECTION --- */}
            <section className="aurora-hero" onMouseMove={handleMouseMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
                <div className="container hero-grid">
                    <div className="hero-text-content">
                        <div className="badge-pill">
                            <FaBolt color="var(--accent-4)" /> <span>V1.0.3 Live</span>
                        </div>
                        <h1 className="hero-title">
                            Unlock Your <br />
                            <span className="text-glow">Academic Potential</span>
                        </h1>
                        <p className="hero-subtitle">
                            Join India's fastest-growing student community. Access premium handwritten notes in a distraction-free, <strong>dark-mode environment</strong> designed for focus.
                        </p>
                        <div className="hero-actions">
                            <Link to="/search" className="liquid-btn primary">
                                <FaSearch />Start Exploring
                            </Link>
                            <Link to="/upload" className="liquid-btn secondary">
                                Upload Notes
                            </Link>
                        </div>
                        
                        <div className="hero-stats">
                            <div className="stat-mini">
                                <h3>{stats.totalNotes}+</h3>
                                <p>Notes</p>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-mini">
                                <h3>{stats.totalUsers}+</h3>
                                <p>Students</p>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-mini">
                                <h3>{stats.downloadsThisMonth}+</h3>
                                <p>Downloads</p>
                            </div>
                        </div>
                    </div>

                    <div 
                        className="hero-visual" 
                        ref={heroVisualRef}
                        style={{ transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}
                    >
                        {/* Darker Glass Cards */}
                        <div className="glass-stack-card card-1">
                            <div className="card-header-dots">
                                <div className="dot red"></div><div className="dot yellow"></div><div className="dot green"></div>
                            </div>
                            <div className="card-body-mock">
                                <h4><FaLayerGroup style={{color: 'var(--accent-3)', marginRight:'8px'}}/> Data Structures</h4>
                                <div className="code-lines">
                                    <div className="line l1"></div>
                                    <div className="line l2"></div>
                                    <div className="line l3"></div>
                                </div>
                            </div>
                        </div>
                        <div className="glass-stack-card card-2">
                             <FaUserAstronaut className="icon-float" />
                             <span>Aditya just uploaded<br/><strong style={{color: 'var(--accent-1)'}}>React Native Notes</strong></span>
                        </div>
                        <div className="glowing-orb"></div>
                    </div>
                </div>
            </section>

            {/* --- FEATURED NOTES --- */}
            <section className="section-wrapper container">
                <FadeInSection>
                    <div className="section-header">
                        <div>
                            <h2 className="section-title"><FaStar color="var(--accent-4)" style={{marginRight: '10px'}}/> Editor's Choice</h2>
                            <p className="section-desc">Curated high-quality notes for top performers.</p>
                        </div>
                    </div>

                    {loadingFeatured ? (
                        <div className="loading-grid"><div className="skeleton-card"></div><div className="skeleton-card"></div><div className="skeleton-card"></div></div>
                    ) : (
                        <div className="grid-3">
                            {featuredNotes.map(note => <NoteCard key={note._id} note={note} />)}
                        </div>
                    )}
                </FadeInSection>
            </section>

            {/* --- ACADEMIC LIBRARY --- */}
            <section className="section-wrapper container" id="library">
                <FadeInSection>
                    <div className="library-controls-glass">
                        <div className="controls-left">
                            <h2 className="section-title-simple">Academic Library</h2>
                            <button 
                                className={`filter-toggle-btn ${isFilterBarOpen ? 'active' : ''}`}
                                onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
                            >
                                <FaFilter /> {isFilterBarOpen ? 'Hide Filters' : 'Filters'}
                            </button>
                        </div>
                        <div className="controls-right">
                             <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="glass-select-sm"
                            >
                                <option value="uploadDate">✨ Newest First</option>
                                <option value="highestRated">🔥 Highest Rated</option>
                                <option value="mostDownloaded">🚀 Most Downloaded</option>
                            </select>
                        </div>
                    </div>

                    <div className={`filter-drawer ${isFilterBarOpen ? 'open' : ''}`}>
                         <FilterBar onFilterSubmit={handleFilterSubmit} />
                    </div>

                    {loading ? (
                         <div className="loading-grid">
                             {[1,2,3].map(i => <div key={i} className="skeleton-card"></div>)}
                         </div>
                    ) : notes.length > 0 ? (
                        <>
                            <div className="grid-3">
                                {notes.map(note => <NoteCard key={note._id} note={note} />)}
                            </div>
                            <div style={{marginTop: '3rem'}}>
                                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <FaUserAstronaut size={50} color="var(--accent-3)" />
                            <h3>No notes found here.</h3>
                            <p>Try adjusting your filters or be the first to upload!</p>
                        </div>
                    )}
                </FadeInSection>
            </section>

            {/* --- CONTRIBUTORS & BLOGS --- */}
            <section className="section-wrapper container">
                <div className="split-layout">
                    {/* Top Contributors */}
                    <FadeInSection>
                        <div className="glass-panel">
                            <div className="panel-header">
                                <h3><FaUserAstronaut style={{color: 'var(--accent-1)'}}/> Top Contributors</h3>
                                <span className="highlight-tag">Weekly</span>
                            </div>
                            
                            {loadingContributors ? (
                                <div className="loading-pulse" style={{ height: '200px' }}></div>
                            ) : (
                                <div className="contributors-list">
                                    {topContributors.map((user, index) => (
                                        <Link to={`/profile/${user._id}`} key={user._id} className="contributor-row">
                                            <div className="rank">#{index + 1}</div>
                                            <img 
                                                src={optimizeCloudinaryUrl(user.avatar, { width: 80, height: 80, isProfile: true })} 
                                                alt={user.name} 
                                                className="user-avatar"
                                            />
                                            <div className="user-info">
                                                <h5>{user.name}</h5>
                                                <span>{user.noteCount} Uploads</span>
                                            </div>
                                            <FaArrowRight className="arrow" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </FadeInSection>

                    {/* Latest Blogs */}
                    <FadeInSection delay={0.2}>
                        <div className="blogs-column">
                            <div className="panel-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>Latest Insights</h3>
                                <Link to="/blogs" className="view-all-link">View All <FaArrowRight /></Link>
                            </div>
                            
                            <div className="blogs-list-wrapper">
                                {loadingFeaturedBlogs ? (
                                    <div className="loading-pulse"></div>
                                ) : featuredBlogs.length > 0 ? (
                                    featuredBlogs.map(blog => (
                                        <div key={blog._id} className="compact-blog-wrapper">
                                            <BlogCard blog={blog} />
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-secondary)' }}>Coming soon...</p>
                                )}
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* --- PAGE SPECIFIC CSS (MIDNIGHT AURORA THEME) --- */}
            <style>{`
                /* Hero Section */
                .hero-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 3rem;
                    align-items: center;
                    min-height: 85vh;
                    position: relative;
                }
                .badge-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 16px;
                    background: rgba(255, 213, 0, 0.05);
                    border: 1px solid rgba(255, 213, 0, 0.2);
                    color: var(--accent-4);
                    border-radius: 50px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    backdrop-filter: blur(5px);
                }
                .hero-title {
                    font-size: 5.5rem;
                    line-height: 1.1;
                    margin-bottom: 1.5rem;
                    color: var(--text-primary);
                }
                .hero-subtitle {
                    font-size: 1.3rem;
                    color: var(--text-secondary);
                    margin-bottom: 2.5rem;
                    max-width: 500px;
                    font-weight: 600;
                }
                .liquid-btn {
                    display: inline-flex !important; /* Forces row layout */
                    align-items: center; /* Vertically centers the icon and text */
                    justify-content: center;
                    gap: 10px; /* Adds space between icon and text */
                }
                .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
                
                .hero-stats {
                    display: flex;
                    gap: 2.5rem;
                    margin-top: 4rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                .stat-mini h3 { 
                    font-size: 2rem; margin: 0; 
                    background: linear-gradient(to bottom, #fff, #888); 
                    -webkit-background-clip: text; 
                    -webkit-text-fill-color: transparent; 
                }
                .stat-mini p { color: var(--text-secondary); margin: 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; }
                .stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.1); }

                /* 3D Glass Visuals (Updated for Dark Theme) */
                .hero-visual { position: relative; height: 450px; perspective: 1200px; transition: transform 0.1s ease-out; }
                
                .glass-stack-card {
                    position: absolute;
                    /* Dark Obsidian Glass */
                    background: rgba(15, 15, 20, 0.6); 
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px;
                    padding: 1.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
                }
                .card-1 {
                    width: 320px; height: 200px; top: 15%; right: 10%; z-index: 2;
                    transform: rotateZ(-5deg);
                    animation: float 7s ease-in-out infinite;
                }
                .card-2 {
                    width: 290px; top: 55%; right: 25%; z-index: 3;
                    display: flex; align-items: center; gap: 15px;
                    background: rgba(20, 20, 35, 0.85); /* Slightly more opaque for readability */
                    border: 1px solid var(--accent-2);
                    transform: rotateZ(3deg);
                    animation: float 7s ease-in-out infinite 1.5s;
                }
                .card-header-dots { display: flex; gap: 8px; margin-bottom: 20px; }
                .dot { width: 10px; height: 10px; border-radius: 50%; opacity: 0.7; }
                .red { background: #ff5f56; } .yellow { background: #ffbd2e; } .green { background: #27c93f; }
                
                .code-lines { display: flex; flex-direction: column; gap: 8px; margin-top: 15px; }
                .line { height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; }
                .l1 { width: 70%; } .l2 { width: 90%; } .l3 { width: 50%; }

                .glowing-orb {
                    position: absolute; width: 350px; height: 350px;
                    background: radial-gradient(circle, var(--accent-2), transparent 70%);
                    filter: blur(90px); opacity: 0.3; z-index: 1; top: 20%; right: 5%;
                    pointer-events: none;
                }
                .icon-float { font-size: 2rem; color: var(--accent-3); filter: drop-shadow(0 0 10px var(--accent-3)); }

                /* Sections */
                .section-wrapper { margin-bottom: 6rem; }
                .section-title { font-size: 2rem; display: flex; align-items: center; }
                .section-title-simple { font-size: 2rem; margin: 0; }
                .section-desc { color: var(--text-secondary); margin-top: 5px; font-size: 1rem; }

                /* Library Controls (Dark Glass) */
                .library-controls-glass {
                    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;
                    background: var(--glass-surface);
                    border: 1px solid var(--glass-border);
                    padding: 1rem 2rem; border-radius: 20px; margin-bottom: 2rem;
                    box-shadow: var(--glass-shadow);
                }
                .filter-toggle-btn {
                    background: rgba(255,255,255,0.05); 
                    border: 1px solid rgba(255,255,255,0.1); 
                    color: var(--text-primary);
                    padding: 10px 20px; border-radius: 30px; cursor: pointer; display: flex; align-items: center; gap: 8px;
                    transition: 0.3s;
                    font-family: inherit;
                }
                .filter-toggle-btn.active, .filter-toggle-btn:hover { 
                    background: var(--accent-2); 
                    border-color: var(--accent-2); 
                    box-shadow: 0 0 15px rgba(61, 61, 179, 0.4);
                }
                .filter-drawer { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; }
                .filter-drawer.open { max-height: 600px; margin-bottom: 2rem; }
                
                .glass-select-sm {
                    background: rgba(0,0,0,0.4); 
                    color: var(--text-primary); 
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 10px 16px; border-radius: 12px; outline: none; cursor: pointer;
                    transition: 0.3s;
                }
                .glass-select-sm:focus { border-color: var(--accent-3); }

                /* Grids & Lists */
                .grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
                .split-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 2rem; align-items: start; }
                
                .glass-panel {
                    background: var(--glass-surface);
                    border: 1px solid var(--glass-border);
                    border-radius: 24px; padding: 2.5rem;
                    box-shadow: var(--glass-shadow);
                }
                .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .highlight-tag { 
                    font-size: 0.75rem; font-weight: 700; text-transform: uppercase; 
                    background: rgba(214, 0, 170, 0.2); color: var(--accent-1); 
                    padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(214, 0, 170, 0.3);
                }

                .contributor-row {
                    display: flex; align-items: center; gap: 1.2rem; padding: 14px;
                    border-radius: 16px; transition: all 0.3s ease; text-decoration: none; color: var(--text-primary);
                    border: 1px solid transparent;
                }
                .contributor-row:hover { 
                    background: rgba(255,255,255,0.03); 
                    border-color: rgba(255,255,255,0.05);
                    transform: translateX(8px); 
                }
                .rank { font-weight: 800; font-size: 1.2rem; color: rgba(255,255,255,0.2); width: 30px; font-family: 'Outfit', sans-serif; }
                .user-avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.1); }
                .user-info h5 { margin: 0; font-size: 1rem; font-weight: 600; }
                .user-info span { font-size: 0.8rem; color: var(--text-secondary); }
                .arrow { margin-left: auto; opacity: 0; transition: 0.3s; color: var(--accent-3); }
                .contributor-row:hover .arrow { opacity: 1; transform: translateX(5px); }
                
                .view-all-link { color: var(--accent-3); text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 5px; transition: 0.3s; }
                .view-all-link:hover { color: #fff; gap: 8px; }

                /* Compact Blog Wrapper */
                .compact-blog-wrapper {
                    margin-bottom: -10px;
                    transform: scale(0.85); 
                    transform-origin: top center;
                    width: 100%;
                }
                /* Ensures the card inside takes full width visually */
                .compact-blog-wrapper > div { width: 117% !important; margin-left: -8.5%; }

                /* FAB */
                .fixed-app-prompt { position: fixed; bottom: 30px; right: 30px; z-index: 1000; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
                .download-fab {
                    width: 60px; height: 60px; background: var(--btn-gradient); color: #fff;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    font-size: 1.5rem; box-shadow: 0 0 30px rgba(214, 0, 170, 0.5);
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .download-fab:hover { transform: scale(1.15); box-shadow: 0 0 40px rgba(0, 184, 230, 0.6); }
                .close-btn { background: rgba(0,0,0,0.6); border: none; color: #fff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; transition: 0.2s;}
                .close-btn:hover { background: #ff5f56; }
                .bounce { animation: bounce 2s infinite; }
                @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-6px);} 60% {transform: translateY(-3px);} }

                /* Loading Pulse */
                .loading-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
                .skeleton-card { height: 300px; background: rgba(255,255,255,0.03); border-radius: 20px; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 0.8; } 100% { opacity: 0.5; } }

                /* Responsive */
                @media (max-width: 1024px) {
                    .hero-grid { grid-template-columns: 1fr; text-align: center; min-height: auto; padding-top: 4rem; }
                    .hero-visual { display: none; }
                    .hero-actions { justify-content: center; }
                    .hero-stats { justify-content: center; margin-top: 3rem; }
                }
                @media (max-width: 768px) {
                    .split-layout { grid-template-columns: 1fr; gap: 2rem; }
                    .grid-3 { grid-template-columns: 1fr; }
                    .compact-blog-wrapper { transform: scale(1); margin-bottom: 2rem; }
                    .compact-blog-wrapper > div { width: 100% !important; margin-left: 0; }
                    .hero-title { font-size: 2.5rem; }
                }
            `}</style>
        </main>
    );
};

export default HomePage;
