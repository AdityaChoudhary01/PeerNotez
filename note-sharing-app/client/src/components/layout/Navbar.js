import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          PeerNotez 📚
        </Link>
        
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </div>

        <div className={menuOpen ? "nav-menu active" : "nav-menu"}>
          <form onSubmit={handleSearch} className="search-form-nav">
            <input
              type="text"
              className="search-input"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">Search</button>
          </form>

          <div className="navbar-links">
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link to="/donate" className="nav-link" onClick={() => setMenuOpen(false)}>Donate ❤️</Link>
          </div>
          
          <div className="navbar-auth">
            {user ? (
              <>
                {/* --- THIS BLOCK IS UPDATED --- */}
                <Link to="/upload" className="nav-button signup-btn" onClick={() => setMenuOpen(false)}>Upload</Link>
                <button onClick={handleLogout} className="nav-button logout-btn">Logout</button>
                <Link to="/profile" className="nav-link-avatar" onClick={() => setMenuOpen(false)}>
                  <img src={user.avatar} alt="Profile" className="navbar-avatar" />
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-button" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="nav-button signup-btn" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
