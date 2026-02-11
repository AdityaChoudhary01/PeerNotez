import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/peernotez-logo.png';
import { FaBars, FaTimes, FaSearch, FaSignOutAlt, FaPaperPlane } from 'react-icons/fa';
import { optimizeCloudinaryUrl } from '../../utils/cloudinaryHelper';
import { ref, onValue } from 'firebase/database';
import { db } from '../../services/firebase';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // --- INTERNAL CSS ---
  const styles = {
    navWrapper: {
      position: 'fixed',
      top: '20px',
      left: '0',
      right: '0',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      padding: '0 20px',
      pointerEvents: 'none',
    },
    glassBar: {
      pointerEvents: 'auto',
      width: '100%',
      maxWidth: '1200px',
      background: scrolled || menuOpen ? 'rgba(15, 12, 41, 0.85)' : 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 30px',
      height: '70px',
      transition: 'all 0.4s ease',
      position: 'relative',
    },
    logo: {
      height: '40px',
      filter: 'brightness(1.2) drop-shadow(0 0 8px rgba(255,255,255,0.3))',
      transition: 'transform 0.3s ease',
    },
    desktopMenu: {
      display: 'flex',
      alignItems: 'center',
      gap: '25px',
    },
    link: {
      color: '#fff',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '0.95rem',
      position: 'relative',
      padding: '5px 0',
      opacity: 0.8,
      transition: 'all 0.2s',
      fontFamily: "'Spline Sans', sans-serif",
    },
    activeLink: {
      opacity: 1,
      color: '#00d4ff',
      textShadow: '0 0 10px rgba(0, 212, 255, 0.4)',
    },
    activeIndicator: {
      position: 'absolute',
      bottom: '-2px',
      left: 0,
      width: '100%',
      height: '2px',
      background: 'linear-gradient(90deg, #00d4ff, #ff00cc)',
      borderRadius: '2px',
    },
    searchContainer: {
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '50px',
      padding: '5px 15px',
      display: 'flex',
      alignItems: 'center',
      border: '1px solid rgba(255,255,255,0.05)',
      transition: 'all 0.3s ease',
    },
    searchInput: {
      background: 'transparent',
      border: 'none',
      color: '#fff',
      padding: '5px',
      outline: 'none',
      fontSize: '0.9rem',
      width: '150px',
      fontFamily: "'Spline Sans', sans-serif",
    },
    authContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
    },
    mobileToggle: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '1.5rem',
      cursor: 'pointer',
      zIndex: 1002,
    },

    // ✅ FIXED: make mobile menu scrollable and capped to viewport
    mobileMenu: {
      position: 'absolute',
      top: '80px',
      left: '0',
      right: '0',
      background: 'rgba(15, 12, 41, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      paddingBottom: '2.5rem', // extra space so logout isn't stuck at the edge
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      alignItems: 'center',
      opacity: menuOpen ? 1 : 0,
      transform: menuOpen ? 'translateY(0)' : 'translateY(-20px)',
      pointerEvents: menuOpen ? 'all' : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',

      maxHeight: 'calc(100vh - 120px)', // ✅ keeps it inside screen
      overflowY: 'auto', // ✅ allows scrolling
      WebkitOverflowScrolling: 'touch', // ✅ smooth iOS scrolling
    },

    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.8)',
      objectFit: 'cover',
      boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
      cursor: 'pointer',
    },
    logoutBtnDesktop: {
      background: 'rgba(255, 0, 85, 0.1)',
      border: '1px solid rgba(255, 0, 85, 0.3)',
      color: '#ff0055',
      borderRadius: '50%',
      width: '38px',
      height: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    iconLink: {
      color: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px',
      borderRadius: '50%',
      transition: '0.3s',
      fontSize: '1.1rem',
      textDecoration: 'none',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: '-15px',
      right: '-15px',
      background: '#ff0055',
      color: 'white',
      borderRadius: '50%',
      padding: '2px 6px',
      fontSize: '0.7rem',
      fontWeight: 'bold',
      minWidth: '18px',
      textAlign: 'center',
      border: '2px solid #0f0c29',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    },

    mobileProfileLink: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      textDecoration: 'none',
      padding: '14px 14px',
      borderRadius: '16px',
      width: '100%',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      transition: '0.2s',
      textAlign: 'center',
    },
    mobileProfileName: {
      color: 'white',
      fontWeight: '700',
      opacity: 0.95,
      textAlign: 'center',
    },
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      if (!mobileView) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    const inboxRef = ref(db, `user_chats/${user._id}`);

    const unsubscribe = onValue(inboxRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let totalUnread = 0;
        Object.values(data).forEach((chat) => {
          totalUnread += chat.unreadCount || 0;
        });
        setUnreadCount(totalUnread);
      } else {
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}`);
      setSearchTerm('');
      setMenuOpen(false);
    }
  };

  const optimizedAvatar = user
    ? optimizeCloudinaryUrl(user.avatar, { width: 80, height: 80, isProfile: true })
    : null;

  return (
    <div style={styles.navWrapper}>
      <nav style={styles.glassBar}>
        {/* LOGO */}
        <Link to="/" onClick={() => setMenuOpen(false)} aria-label="PeerNotez Home">
          <img src={logo} alt="PeerNotez Logo" style={styles.logo} />
        </Link>

        {/* DESKTOP LINKS */}
        {!isMobile && (
          <div style={styles.desktopMenu}>
            {['Home', 'About', 'Blogs', 'Contact', 'Donate'].map((item) => {
              const path = item === 'Home' ? '/' : `/${item.toLowerCase()}`;
              const isActive = location.pathname === path;
              return (
                <Link
                  key={item}
                  to={path}
                  style={{ ...styles.link, ...(isActive ? styles.activeLink : {}) }}
                >
                  {item}
                  {isActive && <span style={styles.activeIndicator} />}
                </Link>
              );
            })}
            {user && user.role === 'admin' && (
              <Link to="/admin" style={{ ...styles.link, color: '#ffcc00' }}>
                Admin
              </Link>
            )}
          </div>
        )}

        {/* AUTH & ACTIONS */}
        <div style={styles.authContainer}>
          {!isMobile && (
            <form onSubmit={handleSearch} style={styles.searchContainer}>
              <FaSearch color="rgba(255,255,255,0.5)" size={12} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search..."
                aria-label="Search academic notes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </form>
          )}

          {!isMobile &&
            (user ? (
              <>
                <Link to="/upload" className="liquid-btn" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                  + New
                </Link>

                {/* MESSAGE ICON - DESKTOP */}
                <Link to="/chat" className="nav-icon-link" style={styles.iconLink} title="Messages">
                  <div style={{ position: 'relative', display: 'flex' }}>
                    <FaPaperPlane />
                    {unreadCount > 0 && (
                      <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                  </div>
                </Link>

                <Link to="/profile" title="My Profile">
                  <img src={optimizedAvatar} alt="My Avatar" loading="lazy" style={styles.avatar} />
                </Link>

                <button onClick={handleLogout} style={styles.logoutBtnDesktop} title="Logout">
                  <FaSignOutAlt />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ ...styles.link, marginRight: '10px' }}>
                  Login
                </Link>
                <Link to="/signup" className="liquid-btn" style={{ padding: '8px 24px', fontSize: '0.9rem' }}>
                  Join
                </Link>
              </>
            ))}

          {/* MOBILE TOGGLE */}
          {isMobile && (
            <button
              style={styles.mobileToggle}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
        </div>

        {/* MOBILE DROPDOWN MENU */}
        <div style={styles.mobileMenu}>
          <form
            onSubmit={handleSearch}
            style={{ ...styles.searchContainer, width: '100%', justifyContent: 'center' }}
          >
            <FaSearch color="rgba(255,255,255,0.5)" size={14} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...styles.searchInput, width: '80%' }}
            />
          </form>

          {['Home', 'About', 'Blogs', 'Contact', 'Donate'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{ ...styles.link, fontSize: '1.2rem' }}
            >
              {item}
            </Link>
          ))}

          <div
            style={{
              width: '100%',
              height: '1px',
              background: 'rgba(255,255,255,0.1)',
              margin: '10px 0',
            }}
          />

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                style={styles.mobileProfileLink}
                aria-label="Go to profile"
              >
                <img src={optimizedAvatar} alt="Profile" loading="lazy" style={styles.avatar} />
                <span style={styles.mobileProfileName}>{user.name}</span>
              </Link>

              <Link
                to="/chat"
                onClick={() => setMenuOpen(false)}
                style={{ ...styles.link, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaPaperPlane />
                  Messages
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: '#ff0055',
                        color: '#fff',
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
              </Link>

              <Link
                to="/upload"
                onClick={() => setMenuOpen(false)}
                className="liquid-btn"
                style={{ width: '100%', textAlign: 'center' }}
              >
                Upload Note
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  ...styles.link,
                  background: 'none',
                  border: 'none',
                  color: '#ff0055',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{ ...styles.link, fontSize: '1.1rem' }}>
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="liquid-btn"
                style={{ width: '100%', textAlign: 'center' }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
