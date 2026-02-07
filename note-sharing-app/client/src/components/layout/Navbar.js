import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/peernotez-logo.png'; 
import { FaBars, FaTimes, FaSearch, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const navigate = useNavigate();
  const location = useLocation();

  // --- INTERNAL CSS: HOLOGRAPHIC STYLE ---
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
      pointerEvents: 'none' // Allows clicking through the empty space around the navbar
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
      position: 'relative'
    },
    logo: {
      height: '40px',
      filter: 'brightness(1.2) drop-shadow(0 0 8px rgba(255,255,255,0.3))',
      transition: 'transform 0.3s ease'
    },
    desktopMenu: {
      display: 'flex',
      alignItems: 'center',
      gap: '25px',
      '@media (max-width: 768px)': {
        display: 'none'
      }
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
      fontFamily: "'Spline Sans', sans-serif"
    },
    activeLink: {
      opacity: 1,
      color: '#00d4ff',
      textShadow: '0 0 10px rgba(0, 212, 255, 0.4)'
    },
    activeIndicator: {
      position: 'absolute', 
      bottom: '-2px', 
      left: 0, 
      width: '100%', 
      height: '2px', 
      background: 'linear-gradient(90deg, #00d4ff, #ff00cc)', 
      borderRadius: '2px'
    },
    searchContainer: {
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50px',
        padding: '5px 15px',
        display: 'flex',
        alignItems: 'center',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.3s ease'
    },
    searchInput: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        padding: '5px',
        outline: 'none',
        fontSize: '0.9rem',
        width: '150px',
        fontFamily: "'Spline Sans', sans-serif"
    },
    authContainer: {
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px'
    },
    mobileToggle: {
      display: 'none',
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '1.5rem',
      cursor: 'pointer',
      zIndex: 1002
    },
    mobileMenu: {
      position: 'absolute',
      top: '80px',
      left: '0',
      right: '0',
      background: 'rgba(15, 12, 41, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      alignItems: 'center',
      opacity: menuOpen ? 1 : 0,
      transform: menuOpen ? 'translateY(0)' : 'translateY(-20px)',
      pointerEvents: menuOpen ? 'all' : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    },
    avatar: {
      width: '40px', 
      height: '40px', 
      borderRadius: '50%', 
      border: '2px solid rgba(255,255,255,0.8)', 
      objectFit: 'cover',
      boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
      cursor: 'pointer'
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
        transition: 'all 0.3s ease'
    }
  };

  // Handle Scroll Effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Handle Window Resize for Mobile/Desktop Switching
  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      
      // FIX: Close menu if switching to desktop mode
      if (!mobileView) {
        setMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return (
    <div style={styles.navWrapper}>
      <nav style={styles.glassBar}>
        {/* LOGO */}
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="PeerNotez" style={styles.logo} />
        </Link>

        {/* DESKTOP LINKS (Hidden on Mobile) */}
        {!isMobile && (
          <div style={styles.desktopMenu}>
            {['Home', 'About', 'Blogs', 'Contact', 'Donate'].map(item => {
               const path = item === 'Home' ? '/' : `/${item.toLowerCase()}`;
               const isActive = location.pathname === path;
               return (
                   <Link 
                    key={item} 
                    to={path} 
                    style={{...styles.link, ...(isActive ? styles.activeLink : {})}}
                   >
                       {item}
                       {isActive && <span style={styles.activeIndicator}/>}
                   </Link>
               );
            })}
            {user && user.role === 'admin' && (
              <Link to="/admin" style={{...styles.link, color: '#ffcc00'}}>Admin</Link>
            )}
          </div>
        )}

        {/* AUTH & ACTIONS */}
        <div style={styles.authContainer}>
            {/* Search Bar - Desktop */}
            {!isMobile && (
              <form onSubmit={handleSearch} style={styles.searchContainer}>
                  <FaSearch color="rgba(255,255,255,0.5)" size={12} />
                  <input 
                      type="text" 
                      placeholder="Search..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={styles.searchInput}
                  />
              </form>
            )}

            {/* Auth Buttons */}
            {!isMobile && (
               user ? (
                  <>
                    <Link to="/upload" className="liquid-btn" style={{padding: '8px 20px', fontSize: '0.9rem'}}>+ New</Link>
                    
                    <Link to="/profile" title="My Profile">
                        <img src={user.avatar} alt="Me" style={styles.avatar} />
                    </Link>

                    {/* --- DESKTOP LOGOUT BUTTON --- */}
                    <button 
                        onClick={handleLogout} 
                        style={styles.logoutBtnDesktop} 
                        title="Logout"
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 0, 85, 0.2)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 0, 85, 0.1)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <FaSignOutAlt />
                    </button>
                  </>
              ) : (
                  <>
                    <Link to="/login" style={{...styles.link, marginRight: '10px'}}>Login</Link>
                    <Link to="/signup" className="liquid-btn" style={{padding: '8px 24px', fontSize: '0.9rem'}}>Join</Link>
                  </>
              )
            )}

            {/* HAMBURGER TOGGLE (Visible on Mobile) */}
            <button 
              style={{...styles.mobileToggle, display: isMobile ? 'block' : 'none'}} 
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        <div style={styles.mobileMenu}>
          <form onSubmit={handleSearch} style={{...styles.searchContainer, width: '100%', justifyContent: 'center'}}>
              <FaSearch color="rgba(255,255,255,0.5)" size={14} />
              <input 
                  type="text" 
                  placeholder="Search notes..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{...styles.searchInput, width: '80%'}}
              />
          </form>

          {['Home', 'About', 'Blogs', 'Contact', 'Donate'].map(item => (
            <Link 
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{...styles.link, fontSize: '1.2rem'}}
            >
              {item}
            </Link>
          ))}
          
          {user && user.role === 'admin' && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} style={{...styles.link, color: '#ffcc00', fontSize: '1.2rem'}}>Admin Dashboard</Link>
          )}

          <div style={{width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0'}}></div>

          {user ? (
            <>
              <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                <img src={user.avatar} alt="Profile" style={styles.avatar} />
                <span style={{color: 'white', fontWeight: '600'}}>{user.name}</span>
              </div>
              <Link to="/profile" onClick={() => setMenuOpen(false)} style={styles.link}>My Profile</Link>
              <Link to="/upload" onClick={() => setMenuOpen(false)} className="liquid-btn" style={{width: '100%', textAlign: 'center'}}>Upload Note</Link>
              <button onClick={handleLogout} style={{...styles.link, background: 'none', border: 'none', color: '#ff0055', cursor: 'pointer', fontSize: '1.1rem'}}>Logout</button>
            </>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', alignItems: 'center'}}>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{...styles.link, fontSize: '1.1rem'}}>Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="liquid-btn" style={{width: '100%', textAlign: 'center'}}>Sign Up</Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
