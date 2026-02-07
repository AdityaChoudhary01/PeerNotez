import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FaServer, FaMagic, FaShieldAlt, FaBan, FaCoffee, FaHeart } from 'react-icons/fa';

const DonatePage = () => {
    // 3D Tilt State for Hero Card
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const heroRef = useRef(null);

    const bmacProfileUrl = "https://res.cloudinary.com/dmtnonxtt/image/upload/v1770372018/ffls1v2ohyjhc67ikdpe.png";
    const bmacLink = "https://coff.ee/adityachoudhary";
    const hasSupporters = true;

    // --- INTERNAL CSS: HOLOGRAPHIC DONATE PAGE ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            overflowX: 'hidden'
        },
        heroSection: {
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            marginBottom: '4rem',
            padding: '2rem',
            perspective: '1000px'
        },
        heroTitle: {
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem',
            lineHeight: 1.2
        },
        heroSubtitle: {
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            maxWidth: '800px',
            lineHeight: 1.6,
            marginBottom: '2rem'
        },
        introText: {
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '750px',
            lineHeight: 1.8,
            margin: '0 auto 2rem'
        },
        sectionHeading: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '5rem',
            maxWidth: '1200px',
            margin: '0 auto 5rem'
        },
        card: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2rem',
            textAlign: 'center',
            transition: 'transform 0.3s'
        },
        icon: {
            fontSize: '2.5rem',
            marginBottom: '1rem',
            display: 'inline-block'
        },
        cardTitle: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '0.8rem'
        },
        cardText: {
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
            fontSize: '0.95rem'
        },
        // BMAC Focus Section
        bmacContainer: {
            maxWidth: '500px',
            margin: '0 auto 5rem',
            padding: '3rem',
            background: 'linear-gradient(135deg, rgba(255,221,0,0.1), rgba(0,0,0,0.4))',
            backdropFilter: 'blur(15px)',
            borderRadius: '30px',
            border: '2px solid rgba(255, 221, 0, 0.3)',
            boxShadow: '0 0 40px rgba(255, 204, 0, 0.15)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',       // Added flexbox
            flexDirection: 'column', // Stack vertically
            alignItems: 'center'   // Force center alignment
        },
        bmacAvatar: {
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid #ffdd00',
            marginBottom: '1.5rem',
            boxShadow: '0 0 20px rgba(255, 221, 0, 0.4)',
            display: 'block',      // Ensure block display
            margin: '0 auto 1.5rem' // Auto margins for centering
        },
        bmacBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: '#ffdd00',
            color: '#000',
            padding: '16px 32px',
            borderRadius: '50px',
            fontSize: '1.2rem',
            fontWeight: '800',
            textDecoration: 'none',
            boxShadow: '0 5px 20px rgba(255, 221, 0, 0.4)',
            transition: 'transform 0.2s',
            width: '100%',
            marginTop: '1.5rem'
        },
        communitySection: {
            textAlign: 'center',
            padding: '4rem 1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '24px'
        },
        wallBtn: {
            display: 'inline-block',
            padding: '14px 40px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '1.1rem',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
            transition: 'transform 0.3s',
            marginTop: '2rem'
        }
    };

    const handleMouseMove = (e) => {
        if (!heroRef.current) return;
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 25;
        const y = -(e.clientY - top - height / 2) / 25;
        setTilt({ x, y });
    };
    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    return (
        <div style={styles.wrapper}>
            <Helmet>
                <title>Support PeerNotez | Help Us Grow</title>
                <meta name="description" content="Support PeerNotez to keep education free and ad-free. Every coffee counts!" />
            </Helmet>

            {/* Hero Section */}
            <header 
                style={styles.heroSection}
                ref={heroRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <h1 style={{
                    ...styles.heroTitle,
                    transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
                }}>
                    Fuel Our Mission.<br/>Stay Independent.
                </h1>
                <p style={styles.heroSubtitle}>
                    Your support helps keep PeerNotez a <strong>free and powerful tool</strong> for students worldwide. 
                    Every contribution is an investment in open education.
                </p>
                <div style={styles.introText}>
                    <p>
                        PeerNotez is a labor of love, built to make education accessible without the distractions of ads or paywalls. 
                        Your contribution is more than just a transaction; it's an investment in a global community of learners.
                    </p>
                </div>
            </header>

            {/* Impact Grid */}
            <section>
                <h2 style={styles.sectionHeading}><FaHeart style={{color: '#ff0055'}} /> Your Support Goes a Long Way</h2>
                <div style={styles.grid}>
                    <div style={styles.card} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <FaServer style={{...styles.icon, color: '#00d4ff'}} />
                        <h3 style={styles.cardTitle}>Server Costs</h3>
                        <p style={styles.cardText}>Keeps the platform online, secure, and blazing fast for thousands of students, 24/7. Our biggest daily expense.</p>
                    </div>
                    <div style={styles.card} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <FaMagic style={{...styles.icon, color: '#bc13fe'}} />
                        <h3 style={styles.cardTitle}>R&D</h3>
                        <p style={styles.cardText}>Funds the development of innovative tools, from better search algorithms to collaborative study features.</p>
                    </div>
                    <div style={styles.card} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <FaShieldAlt style={{...styles.icon, color: '#ffcc00'}} />
                        <h3 style={styles.cardTitle}>Security</h3>
                        <p style={styles.cardText}>Helps us maintain the platform, fix bugs, and implement security updates to protect your data.</p>
                    </div>
                    <div style={styles.card} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <FaBan style={{...styles.icon, color: '#00ffaa'}} />
                        <h3 style={styles.cardTitle}>Ad-Free Forever</h3>
                        <p style={styles.cardText}>Ensures a distraction-free learning environment by keeping our platform completely free of ads.</p>
                    </div>
                </div>
            </section>

            {/* Main Donation CTA (BMAC) */}
            <section style={styles.bmacContainer}>
                <div style={{position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,221,0,0.2), transparent 70%)', filter: 'blur(40px)'}}></div>
                
                <h2 style={{color: '#fff', fontSize: '2rem', marginBottom: '2rem', fontWeight: '800'}}>Support PeerNotez Globally</h2>
                
                <img src={bmacProfileUrl} alt="Aditya Choudhary" style={styles.bmacAvatar} />
                
                <div style={{marginBottom: '1rem'}}>
                    <h3 style={{color: '#fff', margin: 0, fontSize: '1.5rem'}}>Aditya Choudhary</h3>
                    <p style={{color: '#ffdd00', margin: 0, fontSize: '0.9rem', fontWeight: '600'}}>Creator & Developer</p>
                </div>

                <p style={{color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem'}}>
                    The fastest, most secure way to support us from anywhere in the world.
                </p>

                <a 
                    href={bmacLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={styles.bmacBtn}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    <FaCoffee /> Buy me a coffee
                </a>
            </section>

            {/* Community Section */}
            <section style={styles.communitySection}>
                <h2 style={{...styles.sectionHeading, marginBottom: '1rem'}}>Join the Community of Supporters</h2>
                <p style={{color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto 2rem'}}>
                    Your support is deeply appreciated. Donors are permanently featured on our Wall of Fame to honor their contribution.
                </p>
                
                {hasSupporters ? (
                    <Link 
                        to="/supporters" 
                        style={styles.wallBtn}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        See Our Wall of Fame ✨
                    </Link>
                ) : (
                    <button disabled style={{...styles.wallBtn, background: 'rgba(255,255,255,0.1)', cursor: 'not-allowed', boxShadow: 'none'}}>
                        Be the First to Support! 🥇
                    </button>
                )}
            </section>
        </div>
    );
};

export default DonatePage;
