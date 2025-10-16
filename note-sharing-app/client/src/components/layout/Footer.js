// client/src/components/layout/Footer.js
import React from 'react';
import { FaLinkedin, FaGithub, FaYoutube, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3 className="footer-title">
            <a href="/" className="footer-logo-link">PeerNotez</a>
          </h3>
          <p className="footer-description">A collaborative platform for students to share and discover academic notes, fostering a community of learning.</p>
        </div>
        
        <div className="footer-links">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-nav-list">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/upload">Upload Notes</a></li>
            {/* --- NEW LEGAL LINKS ADDED HERE --- */}
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/dmca">DMCA & Copyright</a></li>
            <li><a href="/privacy">Privacy Policy</a></li> {/* <-- NEW LINK */}
          </ul>
        </div>
        
        <div className="footer-social">
          <h4 className="footer-heading">Follow Us</h4>
          <ul className="footer-social-list">
            <li><a href="https://www.linkedin.com/in/aditya-kumar-38093a304/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a></li>
            <li><a href="https://github.com/AdityaChoudhary01" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a></li>
            <li><a href="https://www.youtube.com/@AdeeChoudhary" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a></li>
            <li><a href="https://www.instagram.com/aditya_choudhary__021/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a></li>
          </ul>
        </div>
        
        <div className="footer-contact">
          <h4 className="footer-heading">Contact</h4>
          <p>Email: <a href="mailto:aadiwrld01@gmail.com">aadiwrld01@gmail.com</a></p>
          <p>Greater Noida, Uttar Pradesh, India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} PeerNotez. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
