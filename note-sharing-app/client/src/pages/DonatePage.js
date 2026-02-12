/* src/pages/DonatePage.js */

import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FaServer, FaMagic, FaShieldAlt, FaBan, FaCoffee, FaHeart, FaRocket, FaGlobe } from 'react-icons/fa';

const DonatePage = () => {
    // 3D Tilt State for Hero Card
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const heroRef = useRef(null);

    const bmacProfileUrl = "https://res.cloudinary.com/dmtnonxtt/image/upload/v1770372018/ffls1v2ohyjhc67ikdpe.png";
    const bmacLink = "https://coff.ee/adityachoudhary";
    const hasSupporters = true;

    // --- MODERN STYLES ---
    const styles = {
        wrapper: {
            paddingTop: '1rem',
            paddingBottom: '3rem',
            overflowX: 'hidden',
            position: 'relative'
        },
        heroSection: {
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            marginBottom: '3rem',
            padding: '1rem',
            perspective: '1200px'
        },
        heroTitle: {
            fontSize: 'clamp(2.2rem, 7vw, 4.5rem)',
            fontWeight: '900',
            fontFamily: 'var(--font-display)',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            lineHeight: 1.1,
            letterSpacing: '-1px',
            filter: 'drop-shadow(0 0 30px rgba(102, 126, 234, 0.3))',
            transition: 'transform 0.1s ease-out'
        },
        heroSubtitle: {
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            color: 'rgba(255, 255, 255, 0.85)',
            maxWidth: '800px',
            lineHeight: 1.5,
            marginBottom: '2rem',
            padding: '0 10px',
            fontFamily: 'var(--font-primary)'
        },
        sectionHeading: {
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
            fontWeight: '800',
            fontFamily: 'var(--font-display)',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        grid: {
            display: 'grid',
            // Optimized Grid: Forces cards to fill space better on desktop
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            maxWidth: '1200px',
            margin: '0 auto 4rem',
            padding: '0 15px' 
        },
        bmacContainer: {
            maxWidth: '500px',
            margin: '0 15px 4rem', // Added margin for mobile side-spacing
            padding: '3rem 1.5rem',
            background: 'rgba(255, 221, 0, 0.05)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: 'var(--radius-xl)',
            border: '2px solid rgba(255, 221, 0, 0.2)',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // Centering helper for desktop
            marginLeft: 'auto',
            marginRight: 'auto'
        },
        bmacAvatar: {
            width: '100px',
            height: '100px',
            borderRadius: '20px',
            objectFit: 'cover',
            border: '3px solid #ffdd00',
            marginBottom: '1rem',
            boxShadow: '0 10px 25px rgba(255, 221, 0, 0.3)'
        },
        bmacBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: '#ffdd00',
            color: '#000',
            padding: '16px 20px',
            borderRadius: '50px',
            fontSize: '1.1rem',
            fontWeight: '800',
            fontFamily: 'var(--font-display)',
            textDecoration: 'none',
            boxShadow: '0 10px 30px rgba(255, 221, 0, 0.3)',
            transition: 'all 0.3s ease',
            width: '100%',
            maxWidth: '300px', // Prevent button from being too wide
            marginTop: '1.5rem'
        },
        communitySection: {
            textAlign: 'center',
            padding: '4rem 1.5rem',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-xl)',
            maxWidth: '1000px',
            margin: '0 15px auto', // Responsive margin
            marginLeft: 'auto',
            marginRight: 'auto'
        }
    };

    const handleMouseMove = (e) => {
        if (!heroRef.current || window.innerWidth < 768) return; // Disable tilt on mobile for performance
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 35;
        const y = -(e.clientY - top - height / 2) / 35;
        setTilt({ x, y });
    };

    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    const impactCards = [
        { icon: <FaServer />, title: "Server Power", color: "var(--neon-blue)", text: "Keeps PeerNotez online 24/7 with lightning speed and ultra-secure file hosting." },
        { icon: <FaMagic />, title: "New Innovation", color: "var(--neon-purple)", text: "Funds R&D for AI-powered search and smart collaborative features for students." },
        { icon: <FaShieldAlt />, title: "Data Safety", color: "var(--neon-yellow)", text: "Ensures periodic audits and encrypted backups to keep your academic work safe." },
        { icon: <FaBan />, title: "No Ads Ever", color: "var(--neon-pink)", text: "Your support keeps us independent, meaning no intrusive ads will ever block your learning." },
        { icon: <FaGlobe />, title: "Global Reach", color: "var(--neon-green)", text: "Helps us translate and scale resources for students in underserved regions." }
    ];

    return (
        <div style={styles.wrapper}>
            <Helmet>
                <title>Support PeerNotez | Help Open Education</title>
                <meta name="description" content="Support the future of collaborative learning. Help us keep PeerNotez ad-free and open for everyone." />
                <link rel="canonical" href="https://peernotez.netlify.app/donate" />
            </Helmet>

            {/* Hero Section */}
            <header 
                style={styles.heroSection}
                ref={heroRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div style={{
                    transition: 'transform 0.1s ease-out',
                    transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
                }}>
                    <h1 className="hero-title" style={styles.heroTitle}>
                        Fuel Our Mission.<br/>Stay Independent.
                    </h1>
                </div>
                <p className="hero-subtitle" style={styles.heroSubtitle}>
                    PeerNotez is built by students, for students. Your contribution ensures we stay 
                    <strong> 100% ad-free and free to use</strong> for the global academic community.
                </p>
                <Link to="/about" className="badge badge-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                    <FaRocket /> Our Vision
                </Link>
            </header>

            {/* Impact Grid */}
            <section style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={styles.sectionHeading}>
                    <FaHeart style={{color: 'var(--neon-pink)', animation: 'footerHeartbeat 1.5s infinite'}} /> 
                    <span style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)' }}>Transparent Impact</span>
                    <span>Your Donation at Work</span>
                </div>

                <div style={styles.grid}>
                    {impactCards.map((card, idx) => (
                        <div key={idx} className="holo-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '2.5rem', color: card.color, marginBottom: '1rem' }}>
                                {card.icon}
                            </div>
                            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.8rem', fontFamily: 'var(--font-display)' }}>{card.title}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontSize: '0.95rem' }}>{card.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Donation CTA (BMAC) */}
            <section style={styles.bmacContainer} className="fade-in">
                <div style={{
                    position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', 
                    background: 'radial-gradient(circle, rgba(255,221,0,0.1), transparent 70%)', filter: 'blur(50px)'
                }}></div>
                
                <h2 style={{color: '#fff', fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: '900', fontFamily: 'var(--font-display)'}}>
                    Donate via Coffee
                </h2>
                
                <img src={bmacProfileUrl} alt="Aditya Choudhary" style={styles.bmacAvatar} />
                
                <div style={{marginBottom: '1rem'}}>
                    <h3 style={{color: '#fff', margin: 0, fontSize: '1.4rem', fontWeight: '800'}}>Aditya Choudhary</h3>
                    <p style={{color: '#ffdd00', margin: '0.3rem 0 0', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase'}}>Lead Architect</p>
                </div>

                <p style={{color: 'rgba(255,255,255,0.8)', marginBottom: '1rem', fontSize: '0.95rem'}}>
                    Support the continuous growth and hosting from anywhere in the world.
                </p>

                <a 
                    href={bmacLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={styles.bmacBtn}
                >
                    <FaCoffee /> Buy me a coffee
                </a>
            </section>

            {/* Community Section */}
            <section style={{ paddingBottom: '4rem' }}>
                <div style={styles.communitySection}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                        Wall of Fame
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto 2.5rem', fontSize: '1rem' }}>
                        Donors are permanently featured on our Hall of Fame as a token of our appreciation for supporting student education.
                    </p>
                    
                    {hasSupporters ? (
                        <Link 
                            to="/supporters" 
                            className="btn-magnetic"
                            style={{ padding: '1rem 2.5rem', textDecoration: 'none', display: 'inline-block' }}
                        >
                            View Supporters ✨
                        </Link>
                    ) : (
                        <button disabled className="badge badge-warning" style={{ padding: '1rem 2.5rem', opacity: 0.6 }}>
                            No Supporters Yet 🥇
                        </button>
                    )}
                </div>
            </section>

            <style>{`
                @keyframes footerHeartbeat {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }
                @media (max-width: 600px) {
                    .holo-card {
                        padding: 1rem !important;
                    }
                        .container {
                        padding: 0 15px !important;
                    }
                  h1 {
                    font-size: 3.5rem !important;
                    line-height: 1.05;
                  }
                    p {
                    font-size: 1.1rem !important;
                  }
                      
                }
            `}</style>
        </div>
    );
};

export default DonatePage;
