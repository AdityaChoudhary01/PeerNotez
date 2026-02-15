/* src/components/layout/Footer.js */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaLinkedin, FaGithub, FaYoutube, FaInstagram, 
  FaHeart, FaRocket, FaEnvelope, FaSpinner, FaCheckCircle 
} from 'react-icons/fa';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Prevent empty submissions or multiple clicks while loading
    if (!email || status.loading) return;

    setStatus({ loading: true, success: false, error: null });

    try {
      /** * Sending a unique ID/Timestamp to the backend.
       * This ensures the email subject is unique every time, 
       * bypassing SMTP "Spam/Loop" protections that often cause 500 errors.
       */
      const requestId = Date.now();

      await axios.post('/contact', {
        name: "Newsletter Subscriber",
        email: email,
        message: `New subscription request. [Request ID: ${requestId}]`
      });

      // Success State
      setStatus({ loading: false, success: true, error: null });
      setEmail('');
      
      // Revert button back to normal after 5 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);

    } catch (err) {
      console.error("Subscription Error:", err.response?.data || err.message);
      
      // If the server responded with an error message, show it, otherwise show generic error
      const errorMessage = err.response?.data?.message || "Failed to join. Try again later.";
      
      setStatus({ 
        loading: false, 
        success: false, 
        error: errorMessage 
      });
    }
  };

  const styles = {
    footer: {
      position: 'relative',
      marginTop: '5rem',
      background: 'linear-gradient(180deg, transparent 0%, rgba(10, 1, 24, 0.8) 20%, rgba(18, 8, 40, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--glass-border)',
      color: '#fff',
      overflow: 'hidden'
    },
    glowEffect: {
      position: 'absolute',
      top: '-200px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '800px',
      height: '400px',
      background: 'radial-gradient(circle, rgba(102, 126, 234, 0.2), transparent 70%)',
      filter: 'blur(80px)',
      pointerEvents: 'none',
      animation: 'footerPulse 8s ease-in-out infinite'
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '5rem 2rem 2rem',
      position: 'relative',
      zIndex: 1
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '3rem',
      marginBottom: '3rem'
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    brandSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    logo: {
      fontSize: '2rem',
      fontWeight: '900',
      background: 'var(--gradient-primary)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontFamily: 'var(--font-display)',
      marginBottom: '0.5rem'
    },
    description: {
      fontSize: '0.95rem',
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: 1.6
    },
    socialLinks: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem'
    },
    socialIcon: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '1.25rem',
      transition: 'all var(--transition-elastic)',
      textDecoration: 'none'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, #f093fb, #4facfe)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontFamily: 'var(--font-display)'
    },
    linkList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    link: {
      color: 'rgba(255, 255, 255, 0.7)',
      textDecoration: 'none',
      fontSize: '0.95rem',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      width: 'fit-content'
    },
    divider: {
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      margin: '2rem 0'
    },
    bottomSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
      paddingTop: '2rem'
    },
    copyright: {
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.6)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid var(--glass-border)',
      borderRadius: '50px',
      fontSize: '0.85rem',
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '600'
    }
  };

  const socialLinks = [
    { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/aditya-kumar-38093a304/", gradient: 'linear-gradient(135deg, #0077b5, #00a0dc)', label: "LinkedIn" },
    { icon: <FaGithub />, url: "https://github.com/AdityaChoudhary01", gradient: 'linear-gradient(135deg, #333, #666)', label: "GitHub" },
    { icon: <FaYoutube />, url: "https://www.youtube.com/@AdeeChoudhary", gradient: 'linear-gradient(135deg, #ff0000, #ff4444)', label: "YouTube" },
    { icon: <FaInstagram />, url: "https://www.instagram.com/aditya_choudhary__021/", gradient: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', label: "Instagram" }
  ];

  return (
    <footer style={styles.footer}>
      <div style={styles.glowEffect} />
      
      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Brand Section */}
          <div style={styles.column}>
            <div style={styles.brandSection}>
              <div style={styles.logo}>PeerNotez</div>
              <p style={styles.description}>
                A collaborative ecosystem for students to share knowledge, discover academic insights, and build the future of learning together.
              </p>
              <div style={styles.socialLinks}>
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label} // FIX: Added accessible label
                    style={styles.socialIcon}
                    className="social-icon-hover"
                    onMouseEnter={(e) => {
                      e.target.style.background = social.gradient;
                      e.target.style.transform = 'translateY(-5px) scale(1.1)';
                      e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div style={styles.column}>
            <h3 style={styles.sectionTitle}>Explore</h3>
            <ul style={styles.linkList}>
              <li><Link to="/" style={styles.link} className="footer-link"><FaRocket style={{fontSize: '0.8rem', opacity: 0.6}} /> Home</Link></li>
              <li><Link to="/about" style={styles.link} className="footer-link"><FaRocket style={{fontSize: '0.8rem', opacity: 0.6}} /> About Mission</Link></li>
              <li><Link to="/blogs" style={styles.link} className="footer-link"><FaRocket style={{fontSize: '0.8rem', opacity: 0.6}} /> Blog & Insights</Link></li>
              <li><Link to="/upload" style={styles.link} className="footer-link"><FaRocket style={{fontSize: '0.8rem', opacity: 0.6}} /> Share Notes</Link></li>
              <li><Link to="/donate" style={styles.link} className="footer-link"><FaRocket style={{fontSize: '0.8rem', opacity: 0.6}} /> Support Us</Link></li>
            </ul>
          </div>

          {/* Legal & Help */}
          <div style={styles.column}>
            <h3 style={styles.sectionTitle}>Legal & Help</h3>
            <ul style={styles.linkList}>
              <li><Link to="/contact" style={styles.link} className="footer-link">Contact Support</Link></li>
              <li><Link to="/terms" style={styles.link} className="footer-link">Terms of Service</Link></li>
              <li><Link to="/privacy" style={styles.link} className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/dmca" style={styles.link} className="footer-link">DMCA Policy</Link></li>
            </ul>
          </div>

          {/* Connect Section */}
          <div style={styles.column}>
            <h3 style={styles.sectionTitle}>Connect</h3>
            <p style={styles.description}>
              <a href="mailto:aadiwrld01@gmail.com" style={{color: 'var(--neon-blue)', textDecoration: 'none'}}>aadiwrld01@gmail.com</a>
            </p>
            <p style={styles.description}>Greater Noida, UP, India</p>
            
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email..."
                  autoComplete="email"
                  aria-label="Email address"
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <button 
                  type="submit"
                  disabled={status.loading}
                  aria-label="Subscribe to newsletter" // FIX: Added accessible label
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: status.success ? '#00ffaa' : 'var(--gradient-primary)',
                    border: 'none',
                    borderRadius: '12px',
                    color: status.success ? '#000' : '#fff',
                    cursor: status.loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  {status.loading ? <FaSpinner className="fa-spin" /> : status.success ? <FaCheckCircle /> : <FaEnvelope />}
                </button>
              </div>
              
              {/* Status Notifications */}
              {status.error && (
                <span style={{fontSize: '0.75rem', color: '#ff0055', marginTop: '4px'}}>
                  {status.error}
                </span>
              )}
              {status.success && (
                <span style={{fontSize: '0.75rem', color: '#00ffaa', marginTop: '4px'}}>
                  Successfully subscribed!
                </span>
              )}
            </form>
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.bottomSection}>
          <div style={styles.copyright}>
            <span>© {new Date().getFullYear()} PeerNotez. Made with</span>
            <FaHeart color="#ff0080" style={{animation: 'footerHeartbeat 1.5s ease infinite'}} />
            <span>by Aditya Choudhary</span>
          </div>
          
          <div style={styles.badge}>
            <FaRocket color="var(--neon-blue)" />
            <span>Version 2.0</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes footerPulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
          50% { transform: translateX(-50%) scale(1.1); opacity: 0.4; }
        }
        @keyframes footerHeartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .footer-link:hover {
          color: var(--neon-blue) !important;
          transform: translateX(5px);
        }
        .social-icon-hover {
           transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
