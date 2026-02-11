import React, { useState, useEffect, useRef, useMemo} from 'react';
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
  FaStar, FaUserAstronaut, FaArrowRight, FaBolt, FaCrown, FaMedal,
  FaFireAlt, FaRegClock, FaRegLightbulb
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

  const [isFilterBarOpen, setIsFilterBarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  const [showAppButton, setShowAppButton] = useState(true);

  // --- 3D Tilt & Animation State ---
  const heroRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // --- Ticker State ---
  const [currentActivity, setCurrentActivity] = useState(0);
  const activities = useMemo(() => ([
    { user: 'Aditya', action: 'uploaded React Notes', icon: <FaBolt color="#ffcc00" /> },
    { user: 'Sneha', action: 'shared DBMS PDF', icon: <FaStar color="#00d4ff" /> },
    { user: 'Rahul', action: 'just joined PeerNotez', icon: <FaRocket color="#ff00cc" /> }
  ]), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activities.length]);

  // --- Styling Objects ---
  const styles = {
    heroSection: {
      minHeight: '86vh',
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
      maxWidth: '1050px',
      width: '100%',
      padding: '0 1.5rem'
    },
    heroTitle: {
      fontSize: 'clamp(3rem, 6vw, 5.6rem)',
      fontWeight: '900',
      background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1.2rem',
      lineHeight: 1.05,
      letterSpacing: '-1px',
      textShadow: '0 10px 30px rgba(0,0,0,0.3)'
    },
    heroSubtitle: {
      fontSize: '1.15rem',
      color: 'rgba(255, 255, 255, 0.85)',
      maxWidth: '760px',
      margin: '0 auto 2.3rem',
      lineHeight: 1.65,
      fontWeight: '400'
    },
    btnGroup: { display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' },
    primaryBtn: {
      padding: '16px 40px',
      borderRadius: '50px',
      background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
      color: '#fff',
      textDecoration: 'none',
      fontWeight: '800',
      fontSize: '1.08rem',
      boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      position: 'relative',
      overflow: 'hidden'
    },
    secondaryBtn: {
      padding: '16px 40px',
      borderRadius: '50px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: '#fff',
      textDecoration: 'none',
      fontWeight: '800',
      fontSize: '1.08rem',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    tickerPill: {
      background: 'rgba(15, 12, 41, 0.6)',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '100px',
      padding: '8px 22px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '1.8rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      animation: 'fadeInDown 1s ease-out'
    },

    // Modern Stats Container (still same theme)
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      width: '100%',
      maxWidth: '980px',
      margin: '0 auto 6rem',
      padding: '1.1rem',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '22px',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
      position: 'relative',
      overflow: 'hidden'
    },
    statCard: {
      textAlign: 'center',
      borderRadius: '18px',
      padding: '1.1rem 0.8rem',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
      position: 'relative',
      overflow: 'hidden'
    },

    sectionHeader: { textAlign: 'center', marginBottom: '3rem', position: 'relative' },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: '800',
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
      fontWeight: '700',
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
      gap: '15px',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.14)'
    },
    select: {
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '10px',
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
    const controller = new AbortController();

    const fetchNotes = async () => {
      setLoading(true);
      try {
        const params = { ...filters, sort: sortBy, page: page };
        const { data } = await axios.get('/notes', { params, signal: controller.signal });
        setNotes(data.notes || []);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 0);
      } catch (error) {
        if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
          console.error("Failed to fetch notes", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
    return () => controller.abort();
  }, [filters, sortBy, page]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [notesRes, blogsRes, statsRes, contribRes] = await Promise.all([
          axios.get('/notes', { params: { isFeatured: true, limit: 3 }, signal: controller.signal }),
          axios.get('/blogs', { params: { isFeatured: true, limit: 3 }, signal: controller.signal }),
          axios.get('/notes/stats', { signal: controller.signal }),
          axios.get('/users/top-contributors', { signal: controller.signal })
        ]);

        setFeaturedNotes(notesRes.data?.notes || []);
        setLoadingFeatured(false);

        setFeaturedBlogs(blogsRes.data?.blogs || []);
        setLoadingFeaturedBlogs(false);

        setStats(statsRes.data || { totalNotes: 0, totalUsers: 0, downloadsThisMonth: 0 });
        setLoadingStats(false);

        setTopContributors(contribRes.data?.users || []);
        setLoadingContributors(false);
      } catch (err) {
        if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
          console.error(err);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const handleFilterSubmit = (newFilters) => {
    const activeFilters = Object.fromEntries(Object.entries(newFilters).filter(([_, v]) => v !== ''));
    setPage(1);
    setFilters(activeFilters);
    if (window.innerWidth < 768) setIsFilterBarOpen(false);
  };

  // --- Contributor Badge Helper ---
  const getContributorBadge = (index) => {
    if (index === 0) return { icon: <FaCrown />, color: '#FFD700', border: '1px solid #FFD700', shadow: '0 0 20px rgba(255, 215, 0, 0.3)' };
    if (index === 1) return { icon: <FaMedal />, color: '#C0C0C0', border: '1px solid #C0C0C0', shadow: 'none' };
    if (index === 2) return { icon: <FaMedal />, color: '#CD7F32', border: '1px solid #CD7F32', shadow: 'none' };
    return { icon: null, color: '#fff', border: '1px solid rgba(255,255,255,0.1)', shadow: 'none' };
  };

  return (
    <main className="homepage-content">
      {/* --- MERGED SEO DATA --- */}
      <Helmet>
        <title>PeerNotez | Discover & Share Student Handwritten Notes Online</title>
        <meta
          name="description"
          content="PeerNotez is a collaborative platform for students to share and discover handwritten notes, study materials, and academic insights. Boost your exam preparation today!"
        />
        <meta
          name="keywords"
          content="PeerNotez, handwritten notes, student notes, engineering notes, study materials, Aditya Choudhary, college notes app"
        />
        <link rel="canonical" href="https://peernotez.netlify.app/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://peernotez.netlify.app/" />
        <meta property="og:title" content="PeerNotez | The Ultimate Note Sharing Platform" />
        <meta
          property="og:description"
          content="Join thousands of students sharing quality handwritten notes globally. Find your course material on PeerNotez."
        />
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

        /* Modern section wrapper (no theme change, just cleaner spacing) */
        .pn-section {
          position: relative;
          margin-bottom: 6rem;
        }

        /* Mini section subtitle */
        .pn-subtitle {
          color: rgba(255,255,255,0.5);
          margin-top: 0.6rem;
          font-size: 1rem;
          line-height: 1.6;
        }

        /* Modern "glass card" wrappers to elevate existing NoteCard/BlogCard without editing them */
        .pn-card-shell {
          position: relative;
          border-radius: 18px;
          padding: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 18px 55px rgba(0,0,0,0.25);
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .pn-card-shell::before {
          content: "";
          position: absolute;
          inset: -2px;
          background: radial-gradient(circle at 20% 10%, rgba(0,212,255,0.18), transparent 45%),
                      radial-gradient(circle at 80% 90%, rgba(255,0,204,0.12), transparent 50%);
          filter: blur(20px);
          opacity: 0.9;
          pointer-events: none;
        }
        .pn-card-shell > * {
          position: relative;
          z-index: 1;
        }
        .pn-card-shell:hover {
          transform: translateY(-6px);
          border-color: rgba(0,212,255,0.22);
          box-shadow: 0 22px 65px rgba(0,0,0,0.34);
        }

        /* Featured Insights header bar - cleaner look */
        .pn-split-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-bottom: 3rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 1rem;
          gap: 16px;
          flex-wrap: wrap;
        }
        .pn-view-all {
          color: #00d4ff;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-weight: 700;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(0,212,255,0.25);
          background: rgba(0, 212, 255, 0.06);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .pn-view-all:hover {
          transform: translateY(-2px);
          background: rgba(0, 212, 255, 0.10);
        }

        /* Responsive Typography for Stats */
        .stat-value {
          font-size: 2.4rem;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 0.25rem;
          display: block;
          letter-spacing: -0.5px;
        }
        .stat-label {
          color: rgba(255,255,255,0.6);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }
        .stat-hint {
          margin-top: 0.35rem;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.55);
          display: inline-flex;
          align-items: center;
          gap: 7px;
          justify-content: center;
        }

        /* CTA buttons hover via CSS (avoid inline hover logic) */
        .pn-primary-btn:hover { transform: translateY(-3px); }
        .pn-secondary-btn:hover { transform: translateY(-3px); background: rgba(255,255,255,0.14); }

        /* Contributor hover */
        .contributor-card { transition: all 0.3s ease; }
        .contributor-card:hover {
          transform: translateY(-5px);
          background: rgba(255,255,255,0.08) !important;
        }

        /* Subtle section separators (theme consistent) */
        .pn-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent);
          margin: 3.5rem 0 0;
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
          .stat-value { font-size: 1.45rem; }
          .stat-label { font-size: 0.7rem; letter-spacing: 0px; }
          .stat-hint { font-size: 0.75rem; }
          .pn-card-shell { padding: 10px; border-radius: 16px; }
        }

        @keyframes float-ticker {
          0% { transform: translateY(0); opacity: 0; }
          10% { transform: translateY(-5px); opacity: 1; }
          90% { transform: translateY(-5px); opacity: 1; }
          100% { transform: translateY(-10px); opacity: 0; }
        }
        .ticker-anim { animation: float-ticker 4s ease-in-out infinite; }

        @keyframes shimmer {
          0% { transform: translateX(-40%); opacity: 0.0; }
          30% { opacity: 0.35; }
          100% { transform: translateX(120%); opacity: 0.0; }
        }
        .pn-shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -60%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
          transform: skewX(-12deg);
          animation: shimmer 5.5s ease-in-out infinite;
          pointer-events: none;
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
            <div className="ticker-anim" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {activities[currentActivity].icon}
              <span style={{ fontSize: '0.9rem', color: '#eee' }}>
                <strong>{activities[currentActivity].user}</strong> {activities[currentActivity].action}
              </span>
            </div>
          </div>

          <h1 style={styles.heroTitle}>
            Master Your <br />
            <span>Coursework.</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Join the fastest-growing community of students sharing handwritten notes, project insights, and exam strategies.
          </p>

          <div style={styles.btnGroup}>
            <Link to="/search" style={styles.primaryBtn} className="pn-primary-btn pn-shimmer">
              <FaRocket /> Start Learning <FaArrowRight style={{ opacity: 0.9 }} />
            </Link>

            <Link to="/upload" style={styles.secondaryBtn} className="pn-secondary-btn">
              <FaFeatherAlt /> Share Notes
            </Link>
          </div>
        </div>
      </section>

      {/* --- STATS GRID --- */}
      {!loadingStats && (
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <span className="stat-value" style={{ color: '#ff00cc' }}>
              {stats.totalNotes.toLocaleString()}+
            </span>
            <span className="stat-label">Notes</span>
            <span className="stat-hint"><FaRegLightbulb color="#ff00cc" /> curated study material</span>
          </div>

          <div style={styles.statCard}>
            <span className="stat-value" style={{ color: '#00d4ff' }}>
              {stats.totalUsers.toLocaleString()}+
            </span>
            <span className="stat-label">Users</span>
            <span className="stat-hint"><FaUserAstronaut color="#00d4ff" /> peer-driven learning</span>
          </div>

          <div style={styles.statCard}>
            <span className="stat-value" style={{ color: '#ffcc00' }}>
              {stats.downloadsThisMonth.toLocaleString()}+
            </span>
            <span className="stat-label">Downloads</span>
            <span className="stat-hint"><FaFireAlt color="#ffcc00" /> trending this month</span>
          </div>
        </div>
      )}

      {/* --- EDITOR'S PICKS --- */}
      <section className="pn-section">
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Editor's Picks</h2>
          <p className="pn-subtitle">Hand-picked quality notes for this week</p>
        </div>

        {loadingFeatured ? (
          <div style={{ textAlign: 'center' }}>Loading...</div>
        ) : featuredNotes.length > 0 ? (
          <div className="responsive-grid">
            {featuredNotes.map(note => (
              <div key={note._id} className="pn-card-shell">
                <NoteCard note={note} />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', opacity: 0.5 }}>No featured notes.</p>
        )}
      </section>

      {/* --- ACADEMIC LIBRARY --- */}
      <section className="pn-section" id="notes-library">
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Academic Library</h2>
          <p className="pn-subtitle">
            Filter by subject, semester, branch, and find exactly what you need.
          </p>
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
          <div style={{ fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaRegClock style={{ opacity: 0.9 }} />
            Showing {notes.length} results
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="sort-select" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 700 }}>
              Sort:
            </label>
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
          <div style={{ textAlign: 'center', padding: '2rem' }}>Searching library...</div>
        ) : notes.length > 0 ? (
          <>
            <div className="responsive-grid">
              {notes.map(note => (
                <div key={note._id} className="pn-card-shell">
                  <NoteCard note={note} />
                </div>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <p style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>No notes found.</p>
        )}
      </section>

      {/* --- FEATURED BLOGS --- */}
      <section className="pn-section">
        <div className="pn-split-header">
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
              Featured Insights
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Latest study tips and tech trends
            </p>
          </div>

          <Link to="/blogs" className="pn-view-all">
            View All <FaArrowRight />
          </Link>
        </div>

        {loadingFeaturedBlogs ? (
          <div style={{ textAlign: 'center' }}>Loading blogs...</div>
        ) : featuredBlogs.length > 0 ? (
          <div className="blog-grid">
            {featuredBlogs.map(blog => (
              <div key={blog._id} className="pn-card-shell">
                <BlogCard blog={blog} />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', opacity: 0.5 }}>No blogs available.</p>
        )}
      </section>

      {/* --- TOP CONTRIBUTORS --- */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <FaUserAstronaut style={{ marginRight: '10px' }} />
            Hall of Fame
          </h2>
          <p className="pn-subtitle">Top contributors leading the community this week</p>
        </div>

        {loadingContributors ? (
          <div style={{ textAlign: 'center' }}>Loading leaderboard...</div>
        ) : topContributors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {topContributors.map((contributor, index) => {
              const badgeStyle = getContributorBadge(index);
              const avatarUrl = optimizeCloudinaryUrl(contributor.avatar, { width: 120, height: 120, isProfile: true });

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
                    borderRadius: '18px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: badgeStyle.border,
                    boxShadow: badgeStyle.shadow,
                    textDecoration: 'none',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Rank Number BG */}
                  <div style={{ position: 'absolute', right: '-10px', bottom: '-20px', fontSize: '6rem', fontWeight: '900', color: 'rgba(255,255,255,0.03)', zIndex: 0 }}>
                    {index + 1}
                  </div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <img
                      src={avatarUrl}
                      alt={contributor.name}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${badgeStyle.color}`,
                        boxShadow: '0 0 24px rgba(0,0,0,0.25)'
                      }}
                    />
                    {badgeStyle.icon && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-6px',
                          right: '-6px',
                          background: 'rgba(15, 12, 41, 0.9)',
                          borderRadius: '50%',
                          padding: '6px',
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.color}`
                        }}
                      >
                        {badgeStyle.icon}
                      </div>
                    )}
                  </div>

                  <div style={{ zIndex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                      {contributor.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700 }}>
                      <FaStar color="#ffcc00" /> {contributor.noteCount} Contributions
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p style={{ textAlign: 'center', opacity: 0.5 }}>Leaderboard is empty.</p>
        )}
      </section>
    </main>
  );
};

export default HomePage;
