import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // ✅ IMPORT AXIOS
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/peernotez-logo.png';
import { FaBars, FaTimes, FaSearch, FaSignOutAlt, FaPaperPlane } from 'react-icons/fa';
import { optimizeCloudinaryUrl } from '../../utils/cloudinaryHelper';
import { ref, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth'; // ✅ IMPORT getAuth for Token
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
  const auth = getAuth();
  
  // Database URL for REST API calls
  const DB_URL = process.env.REACT_APP_FIREBASE_DATABASE_URL;

  // --- Event Listeners ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // --- HYBRID NOTIFICATION LOGIC ---
  useEffect(() => {
    if (!user?._id) return;

    const isChatPage = location.pathname.startsWith('/chat');

    // Helper to calculate count from data object
    const calcCount = (data) => {
        if (!data) return 0;
        let total = 0;
        Object.values(data).forEach((chat) => {
            total += Number(chat.unreadCount) || 0;
        });
        return total;
    };

    if (isChatPage) {
        // SCENARIO A: User is in Chat (Connection is ALREADY open via ChatLayout)
        // We can safely use onValue (Real-time)
        const inboxRef = ref(db, `user_chats/${user._id}`);
        const unsubscribe = onValue(inboxRef, (snapshot) => {
            setUnreadCount(calcCount(snapshot.val()));
        });
        return () => unsubscribe();
    } else {
        // SCENARIO B: User is Browsing (Connection is CLOSED to save quota)
        // We use REST API (HTTP Request) to fetch count without opening a socket.
        const fetchUnreadREST = async () => {
            try {
                // We need the ID Token to authorize the REST request
                const token = await auth.currentUser?.getIdToken();
                if (!token || !DB_URL) return;

                const response = await axios.get(`${DB_URL}/user_chats/${user._id}.json?auth=${token}`);
                setUnreadCount(calcCount(response.data));
            } catch (error) {
                console.error("Notification fetch error:", error);
            }
        };

        fetchUnreadREST();
        // Optional: Poll every 2 minutes if you really want updates while browsing
        // const interval = setInterval(fetchUnreadREST, 120000);
        // return () => clearInterval(interval);
    }
  }, [user?._id, location.pathname, auth.currentUser, DB_URL]); 

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // --- Updated Styles ---
  const styles = {
    navWrapper: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: scrolled ? '0.5rem 0' : '0.8rem 0'
    },
    navContainer: {
      background: scrolled 
        ? 'rgba(10, 1, 24, 0.90)' 
        : 'rgba(10, 1, 24, 0.6)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '50px',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0.4rem 1.5rem', 
      boxShadow: scrolled 
        ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(102, 126, 234, 0.1)' 
        : '0 10px 30px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease'
    },
    navContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.5rem', 
      height: '46px'
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      flexShrink: 0
    },
    logo: {
      width: scrolled ? '100px' : '110px',
      height: scrolled ? '38px' : '44px',
      transition: 'all 0.3s ease',
      filter: 'drop-shadow(0 0 15px rgba(102, 126, 234, 0.6))'
    },
    navLinks: {
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      gap: '0.2rem', 
      flex: 1,
      justifyContent: 'center'
    },
    navLink: {
      padding: '0.5rem 1rem', 
      color: '#e0e0e0',
      textDecoration: 'none',
      borderRadius: '20px',
      fontWeight: '500',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      whiteSpace: 'nowrap'
    },
    navLinkActive: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      fontWeight: '600',
      boxShadow: '0 0 15px rgba(255, 255, 255, 0.05)'
    },
    adminLink: {
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      color: '#1a1a1a',
      fontWeight: '700',
      boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)',
      border: '1px solid rgba(255, 215, 0, 0.5)'
    },
    searchForm: {
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      background: 'rgba(0, 0, 0, 0.2)',
      padding: '3px',
      borderRadius: '50px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      transition: 'all 0.3s ease',
      minWidth: '220px', 
      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.2)'
    },
    searchInput: {
      background: 'transparent',
      border: 'none',
      color: '#fff',
      outline: 'none',
      flex: 1,
      fontSize: '0.85rem',
      padding: '0 10px',
      fontFamily: "'Inter', sans-serif', system-ui",
      minWidth: 0 // Allows flex shrink
    },
    searchButton: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      border: 'none',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      minWidth: '30px',
      minHeight: '30px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#fff',
      boxShadow: '0 2px 10px rgba(102, 126, 234, 0.4)'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem', 
      flexShrink: 0
    },
    iconButton: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      width: '38px', 
      height: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: '#fff',
      position: 'relative',
      textDecoration: 'none'
    },
    logoutButton: {
      background: 'rgba(255, 59, 48, 0.1)',
      border: '1px solid rgba(255, 59, 48, 0.3)',
      color: '#ff3b30',
      borderRadius: '50%',
      width: '38px',
      height: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    badge: {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      background: '#ff3b30',
      color: '#fff',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      fontSize: '0.6rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      border: '2px solid #0a0118'
    },
    userAvatar: {
      width: '38px',
      height: '38px',
      borderRadius: '50%',
      border: '2px solid rgba(102, 126, 234, 0.5)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      objectFit: 'cover',
      boxShadow: '0 0 15px rgba(102, 126, 234, 0.2)'
    },
    mobileMenuButton: {
      display: isMobile ? 'flex' : 'none',
      background: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '0'
    },
    mobileMenu: {
      position: 'fixed',
      top: 0,
      right: 0,
      width: '100%',
      maxWidth: '320px',
      height: '100vh',
      background: 'rgba(12, 12, 16, 0.95)',
      backdropFilter: 'blur(40px)',
      padding: '2rem',
      transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      zIndex: 1001,
      boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.7)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    },
    mobileMenuBackdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      opacity: menuOpen ? 1 : 0,
      pointerEvents: menuOpen ? 'auto' : 'none',
      transition: 'opacity 0.3s ease',
      zIndex: 1000
    },
    mobileLink: {
        padding: '1rem',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '16px',
        fontSize: '1.1rem',
        fontWeight: '500',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        border: '1px solid transparent',
        marginBottom: '0.5rem'
    }
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/blogs', label: 'Blogs' },
    { path: '/contact', label: 'Contact' },
    { path: '/donate', label: 'Donate' },
    { path: '/upload', label: 'Upload', authRequired: true },
    { path: '/admin', label: 'Admin', adminOnly: true }
  ];

  return (
    <>
      <div style={styles.navWrapper}>
        <div style={{...styles.navContainer, margin: isMobile ? '0 1rem' : '0 auto'}}>
          <div style={styles.navContent}>
            {/* Logo */}
            <Link to="/" style={styles.logoSection} onClick={() => setMenuOpen(false)}>
              <img src={logo} alt="PeerNotez" style={styles.logo} />
            </Link>

            {/* Desktop Navigation */}
            <div style={styles.navLinks}>
              {navLinks.map(link => {
                if (link.authRequired && !user) return null;
                if (link.adminOnly && user?.role !== 'admin') return null;

                let linkStyle = {
                    ...styles.navLink,
                    ...(isActive(link.path) ? styles.navLinkActive : {})
                };
                if (link.adminOnly) {
                    linkStyle = { ...linkStyle, ...styles.adminLink };
                }

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={linkStyle}
                    onMouseEnter={(e) => {
                      if (!link.adminOnly && !isActive(link.path)) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                      if (link.adminOnly) {
                          e.target.style.transform = 'translateY(-2px) scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!link.adminOnly && !isActive(link.path)) {
                        e.target.style.background = 'transparent';
                      }
                      if (link.adminOnly) {
                        e.target.style.transform = 'translateY(0) scale(1)';
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Search */}
            {!isMobile && (
              <form onSubmit={handleSearch} style={styles.searchForm}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                <button 
                  type="submit" 
                  style={styles.searchButton}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <FaSearch size={14} />
                </button>
              </form>
            )}

            {/* Right Section */}
            <div style={styles.rightSection}>
              {!isMobile && (
                  user ? (
                    <>
                      <Link to="/chat" style={styles.iconButton} title="Messages">
                        <FaPaperPlane size={14} />
                        {unreadCount > 0 && (
                          <span style={styles.badge}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                      
                      <Link to="/profile" title="View Profile">
                        <img
                          src={user.profilePicture || user.avatar 
                            ? optimizeCloudinaryUrl(user.profilePicture || user.avatar, { width: 80, height: 80 }) 
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=80`
                          }
                          alt={user.name}
                          width="38"
                          height="38"
                          decoding="async"
                          style={styles.userAvatar}
                        />
                      </Link>

                      <div 
                        onClick={handleLogout} 
                        style={styles.logoutButton}
                        title="Logout"
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 59, 48, 0.2)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 59, 48, 0.1)'}
                      >
                        <FaSignOutAlt size={14} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Link to="/login" style={styles.navLink}>Login</Link>
                      <Link 
                        to="/signup" 
                        style={{
                          ...styles.navLink,
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                          color: 'white'
                        }}
                      >
                        Sign Up
                      </Link>
                    </>
                  )
              )}

              {/* Mobile Menu Toggle - Always visible on mobile */}
              {isMobile && (
                <button style={styles.mobileMenuButton} onClick={() => setMenuOpen(!menuOpen)}>
                  {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobile && (
        <div 
          style={styles.mobileMenuBackdrop} 
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {isMobile && (
        <div style={styles.mobileMenu}>
           {/* Mobile Header */}
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>Menu</span>
              <div onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                  <FaTimes size={24} />
              </div>
           </div>

          {/* Mobile Search */}
          <div style={{marginBottom: '2rem'}}>
            <form onSubmit={handleSearch} style={{...styles.searchForm, display: 'flex', width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)'}}>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchButton}>
                <FaSearch size={14} />
              </button>
            </form>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '0.2rem'}}>
            {navLinks.map(link => {
              if (link.authRequired && !user) return null;
              if (link.adminOnly && user?.role !== 'admin') return null;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    ...styles.mobileLink,
                    background: isActive(link.path) ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                    border: isActive(link.path) ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent',
                    color: link.adminOnly ? '#FFD700' : '#fff'
                  }}
                >
                   {link.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <div style={{height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '1.5rem 0'}} />
                
                <Link to="/chat" onClick={() => setMenuOpen(false)} style={styles.mobileLink}>
                    <FaPaperPlane color="#667eea"/> 
                    <span>Messages</span>
                    {unreadCount > 0 && (
                        <span style={{background: '#ff3b30', color: 'white', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', marginLeft: 'auto'}}>
                            {unreadCount}
                        </span>
                    )}
                </Link>

                <Link to="/profile" onClick={() => setMenuOpen(false)} style={styles.mobileLink}>
                  <img 
                    src={user.profilePicture || user.avatar 
                        ? optimizeCloudinaryUrl(user.profilePicture || user.avatar, { width: 40, height: 40 }) 
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
                    }
                    width="24"
                    height="24"
                    decoding="async"
                    style={{width: '24px', height: '24px', borderRadius: '50%'}}
                    alt="profile"
                  />
                  Profile
                </Link>
                
                <div 
                    onClick={handleLogout} 
                    style={{...styles.mobileLink, color: '#ff3b30', marginTop: '1rem', background: 'rgba(255, 59, 48, 0.05)', cursor: 'pointer', justifyContent: 'center'}}
                >
                  <FaSignOutAlt /> Logout
                </div>
              </>
            ) : (
              <>
                <div style={{height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '1.5rem 0'}} />
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{...styles.mobileLink, justifyContent: 'center'}}>
                  Login
                </Link>
                <Link 
                    to="/signup" 
                    onClick={() => setMenuOpen(false)} 
                    style={{
                        ...styles.mobileLink, 
                        background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                        justifyContent: 'center',
                        marginTop: '0.5rem',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                    }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
