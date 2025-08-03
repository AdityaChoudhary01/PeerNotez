import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>
            <Link to="/" className="footer-brand-link" className="linktag">
              About PeerNotez
            </Link>
          </h4>
          <p>
            A collaborative platform for students to share and discover academic notes, fostering a community of learning.
          </p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">🏠 Home</Link>
            </li>
            <li>
              <Link to="/about">ℹ️ About Us</Link>
            </li>
            <li>
              <Link to="/contact">📞 Contact</Link>
            </li>
            <li>
              <Link to="/upload">📤 Upload Notes</Link>
            </li>
            <li>
              <Link to="/donate">❤️ Donate</Link>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/aditya-kumar-38093a304/" target="_blank" rel="noopener noreferrer">
                🔗 LinkedIn
              </a>
            </li>
            <li>
              <a href="https://github.com/AdityaChoudhary01/PeerNotez" target="_blank" rel="noopener noreferrer">
                🐙 GitHub
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/@AdeeChoudhary" target="_blank" rel="noopener noreferrer">
                ▶️ YouTube
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/aditya_choudhary__021/" target="_blank" rel="noopener noreferrer">
                📸 Instagram
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: aadiwrld01@gmail.com</p>
          <p>Greater Noida, Uttar Pradesh, India</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} PeerNotez. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

