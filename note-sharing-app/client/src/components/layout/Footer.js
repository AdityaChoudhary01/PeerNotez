import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>About PeerNotez</h4>
          <p>A collaborative platform for students to share and discover academic notes, fostering a community of learning.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">🏠 Home</a></li>
            <li><a href="/about">ℹ️ About Us</a></li>
            <li><a href="/contact">📞 Contact</a></li>
            <li><a href="/upload">📤 Upload Notes</a></li>
            <li><a href="/donate">❤️ Donate</a></li>
            <li><a href="https://www.linkedin.com/in/aditya-kumar-38093a304/" target="_blank" rel="noopener noreferrer">🔗 LinkedIn</a></li>
            <li><a href="https://github.com/AdityaChoudhary01" target="_blank" rel="noopener noreferrer">🐙 GitHub</a></li>
            <li><a href="https://www.youtube.com/@AdeeChoudhary" target="_blank" rel="noopener noreferrer">▶️ YouTube</a></li>
            <li><a href="https://www.instagram.com/aditya_choudhary__021/" target="_blank" rel="noopener noreferrer">📸 Instagram</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: aadiwrld01@gmail.com</p>
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