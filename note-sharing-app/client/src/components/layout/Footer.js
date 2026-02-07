import React from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaGithub, FaYoutube, FaInstagram, FaHeart } from 'react-icons/fa';

const Footer = () => {
  // --- INTERNAL CSS: HOLOGRAPHIC FOOTER ---
  const styles = {
    footer: {
      position: 'relative',
      marginTop: 'auto',
      padding: '4rem 2rem 2rem',
      background: 'rgba(15, 12, 41, 0.6)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#fff',
      overflow: 'hidden'
    },
    glowEffect: {
      position: 'absolute',
      top: '-50%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '600px',
      height: '300px',
      background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15), transparent 70%)',
      pointerEvents: 'none',
      zIndex: 0
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '3rem',
      position: 'relative',
      zIndex: 1
    },
    brandTitle: {
      fontSize: '2rem',
      fontWeight: '800',
      background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem',
      display: 'inline-block'
    },
    description: {
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: '1.6',
      marginBottom: '1.5rem',
      fontSize: '0.95rem'
    },
    heading: {
      color: '#fff',
      fontSize: '1.2rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
      position: 'relative',
      display: 'inline-block'
    },
    linkList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    linkItem: {
      marginBottom: '0.8rem'
    },
    link: {
      color: 'rgba(255, 255, 255, 0.6)',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      fontSize: '0.95rem',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    socialContainer: {
      display: 'flex',
      gap: '15px',
      marginTop: '1rem'
    },
    socialIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      transition: 'all 0.3s ease',
      fontSize: '1.2rem'
    },
    bottomBar: {
      marginTop: '4rem',
      paddingTop: '2rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: '0.9rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'center'
    }
  };

  // Hover handlers would be applied via CSS classes or inline style swapping
  // For simplicity in inline-styles, we rely on standard CSS in App.css for hovers
  // but here we can add a class for the specific hover effects defined below

  return (
    <footer style={styles.footer}>
      {/* Decorative Glow */}
      <div style={styles.glowEffect}></div>

      <div style={styles.container}>
        
        {/* Brand Section */}
        <div>
          <Link to="/" style={{textDecoration: 'none'}}>
            <span style={styles.brandTitle}>PeerNotez</span>
          </Link>
          <p style={styles.description}>
            A collaborative ecosystem for students to share knowledge, discover academic insights, and build the future of learning together.
          </p>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem'}}>
             <span>Made with <FaHeart color="#ff0055" /> in India</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={styles.heading}>Explore</h4>
          <ul style={styles.linkList}>
            <li style={styles.linkItem}><Link to="/" className="footer-link" style={styles.link}>Home</Link></li>
            <li style={styles.linkItem}><Link to="/about" className="footer-link" style={styles.link}>About Mission</Link></li>
            <li style={styles.linkItem}><Link to="/blogs" className="footer-link" style={styles.link}>Blog & Insights</Link></li>
            <li style={styles.linkItem}><Link to="/upload" className="footer-link" style={styles.link}>Share Notes</Link></li>
            <li style={styles.linkItem}><Link to="/donate" className="footer-link" style={styles.link}>Support Us</Link></li>
          </ul>
        </div>

        {/* Legal & Help */}
        <div>
          <h4 style={styles.heading}>Legal & Help</h4>
          <ul style={styles.linkList}>
            <li style={styles.linkItem}><Link to="/contact" className="footer-link" style={styles.link}>Contact Support</Link></li>
            <li style={styles.linkItem}><Link to="/terms" className="footer-link" style={styles.link}>Terms of Service</Link></li>
            <li style={styles.linkItem}><Link to="/privacy" className="footer-link" style={styles.link}>Privacy Policy</Link></li>
            <li style={styles.linkItem}><Link to="/dmca" className="footer-link" style={styles.link}>DMCA Policy</Link></li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 style={styles.heading}>Connect</h4>
          <p style={{...styles.description, marginBottom: '0.5rem'}}>
            <a href="mailto:aadiwrld01@gmail.com" style={{color: '#00d4ff', textDecoration: 'none'}}>aadiwrld01@gmail.com</a>
          </p>
          <p style={styles.description}>Greater Noida, UP, India</p>
          
          <div style={styles.socialContainer}>
            {[
              { icon: <FaLinkedin />, link: "https://www.linkedin.com/in/aditya-kumar-38093a304/" },
              { icon: <FaGithub />, link: "https://github.com/AdityaChoudhary01" },
              { icon: <FaYoutube />, link: "https://www.youtube.com/@AdeeChoudhary" },
              { icon: <FaInstagram />, link: "https://www.instagram.com/aditya_choudhary__021/" }
            ].map((social, idx) => (
              <a 
                key={idx}
                href={social.link}
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.socialIcon}
                className="social-icon-hover" // Class for CSS hover effect
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} PeerNotez. All Rights Reserved.</p>
      </div>

      {/* Inline Style Injection for Hover Effects */}
      <style>{`
        .footer-link:hover {
          color: #00d4ff !important;
          padding-left: 5px;
        }
        .social-icon-hover:hover {
          background: linear-gradient(135deg, #00d4ff, #ff00cc) !important;
          border-color: transparent !important;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
