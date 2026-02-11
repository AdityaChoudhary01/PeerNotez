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
    FaStar, FaUserAstronaut, FaArrowRight, FaSearch, FaBolt 
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
                transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`
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
                    // Requested 6 contributors to fill the vertical space better
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
        const x = (e.clientX - left - width / 2) / 25;
        const y = -(e.clientY - top - height / 2) / 25;
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
                        <div className="badge-pill"><FaBolt color="#ffcc00" /> V1.0.3 Now Live</div>
                        <h1 className="hero-title">
                            Unlock Your <br />
                            <span className="text-glow">Academic Potential</span>
                        </h1>
                        <p className="hero-subtitle">
                            Join India's fastest-growing student community. Access premium handwritten notes, share your knowledge, and top your exams with <strong>PeerNotez</strong>.
                        </p>
                        <div className="hero-actions">
                            <Link to="/search" className="liquid-btn primary">
                                <FaSearch /> Start Exploring
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
                        <div className="glass-stack-card card-1">
                            <div className="card-header">
                                <div className="dot red"></div><div className="dot yellow"></div><div className="dot green"></div>
                            </div>
                            <div className="card-body">
                                <h4>Data Structures</h4>
                                <div className="progress-bar"><div className="fill" style={{width: '80%'}}></div></div>
                            </div>
                        </div>
                        <div className="glass-stack-card card-2">
                             <FaUserAstronaut className="icon-float" />
                             <span>Aditya just uploaded<br/><strong>React Native Notes</strong></span>
                        </div>
                        <div className="glowing-orb"></div>
                    </div>
                </div>
            </section>

            {/* --- FEATURED NOTES (Editor's Picks) --- */}
            <section className="section-wrapper container">
                <FadeInSection>
                    <div className="section-header">
                        <div>
                            <h2 className="text-gradient-header"><FaStar color="#ffcc00" style={{marginRight: '10px'}}/> Editor's Choice</h2>
                            <p style={{color: 'var(--text-secondary)', marginTop: '5px'}}>Curated high-quality notes for top performers.</p>
                        </div>
                    </div>

                    {loadingFeatured ? (
                        <div className="loading-pulse"></div>
                    ) : (
                        <div className="grid-3">
                            {featuredNotes.map(note => <NoteCard key={note._id} note={note} />)}
                        </div>
                    )}
                </FadeInSection>
            </section>

            {/* --- ACADEMIC LIBRARY (Main Content) --- */}
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

            {/* --- CONTRIBUTORS & BLOGS (Split Section) --- */}
            <section className="section-wrapper container">
                <div className="split-layout">
                    {/* Top Contributors */}
                    <FadeInSection>
                        <div className="glass-panel">
                            <div className="panel-header">
                                <h3><FaUserAstronaut /> Top Contributors</h3>
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
                                <Link to="/blogs" className="view-all-link">View All Blogs <FaArrowRight /></Link>
                            </div>
                            
                            <div className="blogs-list-wrapper">
                                {loadingFeaturedBlogs ? (
                                    <div className="loading-pulse"></div>
                                ) : featuredBlogs.length > 0 ? (
                                    featuredBlogs.map(blog => (
                                        // Wrapper scales down blog card to 80% to fit design balance
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

            {/* --- PAGE SPECIFIC CSS --- */}
            <style>{`
                /* Hero Specifics */
                .hero-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 2rem;
                    align-items: center;
                    min-height: 80vh;
                }
                .badge-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(255, 204, 0, 0.1);
                    border: 1px solid rgba(255, 204, 0, 0.3);
                    color: #ffcc00;
                    border-radius: 50px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                }
                .hero-stats {
                    display: flex;
                    gap: 2rem;
                    margin-top: 4rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }
                .stat-mini h3 { font-size: 1.8rem; margin: 0; background: linear-gradient(to bottom, #fff, #aaa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .stat-mini p { color: var(--text-secondary); margin: 0; font-size: 0.9rem; }
                .stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.1); }
                .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

                /* 3D Visuals */
                .hero-visual { position: relative; height: 400px; perspective: 1000px; transition: transform 0.1s ease-out; }
                .glass-stack-card {
                    position: absolute;
                    background: rgba(255,255,255,0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 20px;
                    padding: 1.5rem;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                }
                .card-1 {
                    width: 300px; height: 180px; top: 20%; right: 10%; z-index: 2;
                    transform: rotateZ(-5deg);
                    animation: float 6s ease-in-out infinite;
                }
                .card-2 {
                    width: 280px; top: 50%; right: 25%; z-index: 3;
                    display: flex; align-items: center; gap: 15px;
                    background: linear-gradient(135deg, rgba(40, 40, 80, 0.6), rgba(10, 10, 20, 0.8));
                    transform: rotateZ(5deg);
                    animation: float 6s ease-in-out infinite 1s;
                }
                .card-header { display: flex; gap: 8px; margin-bottom: 20px; }
                .dot { width: 10px; height: 10px; borderRadius: 50%; }
                .red { background: #ff5f56; } .yellow { background: #ffbd2e; } .green { background: #27c93f; }
                .progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; margin-top: 10px; overflow: hidden; }
                .fill { height: 100%; background: var(--accent-3); }
                .glowing-orb {
                    position: absolute; width: 300px; height: 300px;
                    background: radial-gradient(circle, var(--accent-1), transparent 70%);
                    filter: blur(60px); opacity: 0.4; z-index: 1; top: 20%; right: 10%;
                }

                /* Library Controls */
                .library-controls-glass {
                    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;
                    background: var(--glass-surface); border: 1px solid var(--glass-border);
                    padding: 1rem 1.5rem; border-radius: 16px; margin-bottom: 2rem;
                }
                .filter-toggle-btn {
                    background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff;
                    padding: 8px 16px; border-radius: 30px; cursor: pointer; display: flex; align-items: center; gap: 8px;
                    transition: 0.3s;
                }
                .filter-toggle-btn.active, .filter-toggle-btn:hover { background: rgba(255,255,255,0.1); border-color: var(--accent-3); }
                .filter-drawer { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; }
                .filter-drawer.open { max-height: 500px; margin-bottom: 2rem; }
                .glass-select-sm {
                    background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.2);
                    padding: 8px 12px; border-radius: 8px; outline: none; cursor: pointer;
                }

                /* Split Layout (Contributors/Blogs) */
                .split-layout { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 3rem; 
                    margin-top: 2rem; 
                    align-items: start; 
                }
                .glass-panel {
                    background: var(--glass-surface); border: 1px solid var(--glass-border);
                    border-radius: 24px; padding: 2rem;
                }
                .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .highlight-tag { font-size: 0.8rem; background: var(--accent-2); padding: 4px 10px; border-radius: 4px; }
                
                /* Compact Blog Card Wrapper */
                .compact-blog-wrapper {
                    margin-bottom: -15px; /* Pull items closer since scale creates gap */
                    transform: scale(0.8); /* Scale down to 80% */
                    transform-origin: top left;
                    width: 125%; /* Compensate width (100 / 0.8) so it fills container */
                }

                .contributor-row {
                    display: flex; align-items: center; gap: 1rem; padding: 12px;
                    border-radius: 12px; transition: 0.3s; text-decoration: none; color: #fff;
                    margin-bottom: 0.5rem;
                }
                .contributor-row:hover { background: rgba(255,255,255,0.05); transform: translateX(5px); }
                .rank { font-weight: 800; font-size: 1.2rem; color: rgba(255,255,255,0.3); width: 30px; }
                .user-avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid var(--glass-border); }
                .arrow { margin-left: auto; opacity: 0; transition: 0.3s; color: var(--accent-3); }
                .contributor-row:hover .arrow { opacity: 1; }

                /* Fixed FAB */
                .fixed-app-prompt {
                    position: fixed; bottom: 30px; right: 30px; z-index: 1000;
                    display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
                }
                .download-fab {
                    width: 60px; height: 60px; background: var(--accent-1); color: #fff;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    font-size: 1.5rem; box-shadow: 0 0 20px rgba(255, 0, 204, 0.6);
                    transition: transform 0.3s;
                }
                .download-fab:hover { transform: scale(1.1); }
                .close-btn {
                    background: rgba(0,0,0,0.5); border: none; color: #fff; width: 30px; height: 30px;
                    border-radius: 50%; cursor: pointer;
                }
                .bounce { animation: bounce 2s infinite; }
                @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-10px);} 60% {transform: translateY(-5px);} }

                /* Responsive */
                @media (max-width: 968px) {
                    .hero-grid { grid-template-columns: 1fr; text-align: center; }
                    .hero-visual { display: none; }
                    .hero-actions { justify-content: center; }
                    .hero-stats { justify-content: center; }
                    .split-layout { grid-template-columns: 1fr; }
                    .library-controls-glass { flex-direction: column; gap: 1rem; align-items: stretch; }
                    .controls-left, .controls-right { display: flex; justify-content: space-between; width: 100%; }
                }

                @media (max-width: 768px) {
                    .container {
                        padding-left: 10px !important;
                        padding-right: 10px !important;
                        width: 96% !important;
                    }
                    .hero-stats {
                        gap: 1rem;
                    }
                    .compact-blog-wrapper {
                        transform: scale(1); /* Reset scale on mobile */
                        width: 100%;
                        margin-bottom: 20px;
                    }
                }
            `}</style>
        </main>
    );
};

export default HomePage;
