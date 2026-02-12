import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FaBookReader, FaGavel, FaBan, FaShieldAlt } from 'react-icons/fa';

const TermsOfServicePage = () => {
    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            minHeight: '80vh',
            maxWidth: '1000px',
            margin: '0 auto',
            paddingLeft: '1rem',
            paddingRight: '1rem'
        },
        header: {
            textAlign: 'center',
            marginBottom: '4rem',
            position: 'relative'
        },
        title: {
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px'
        },
        subtitle: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.1rem',
            maxWidth: '600px',
            margin: '0 auto'
        },
        sectionCard: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '3rem',
            marginBottom: '3rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        },
        sectionHeading: {
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '1rem'
        },
        subHeading: {
            fontSize: '1.3rem',
            fontWeight: '600',
            color: '#00d4ff', // Cyan accent
            marginTop: '2rem',
            marginBottom: '1rem'
        },
        paragraph: {
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.8,
            marginBottom: '1rem',
            fontSize: '1rem'
        },
        list: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        listItem: {
            background: 'rgba(255, 255, 255, 0.02)',
            borderLeft: '3px solid #ff00cc', // Pink accent
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '0 12px 12px 0',
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: 1.6
        },
        highlight: {
            color: '#fff',
            fontWeight: '700'
        },
        warningBox: {
            background: 'rgba(255, 0, 85, 0.1)',
            border: '1px solid rgba(255, 0, 85, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: '#ff0055',
            fontWeight: '600',
            marginTop: '2rem',
            textAlign: 'center'
        },
        link: {
            color: '#ff00cc',
            textDecoration: 'none',
            fontWeight: '700',
            transition: 'color 0.2s'
        }
    };

    return (
        <div className='wrapper' style={styles.wrapper}>
         <Helmet>
                <title>Terms of Service | PeerNotez</title>
                <meta name="description" content="The official Terms of Service and User Agreement for PeerNotez." />
                <link rel="canonical" href="https://peernotez.netlify.app/terms" />
            </Helmet>
            
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.title}>
                    <FaBookReader /> Terms of Service
                </h1>
                <p style={styles.subtitle}>
                    Last Updated: October 16, 2025.<br/>This document is a legal agreement between you and PeerNotez.
                </p>
            </header>

            {/* Section 1: Acceptance */}
            <section className='section-card' style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaGavel style={{color: '#00ffaa'}} /> 1. Acceptance of Terms</h2>
                <div style={styles.paragraph}>
                    <p>
                        By accessing or using the PeerNotez website and mobile application (the "Service"), you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and our <Link to="/dmca" style={styles.link}>DMCA Policy</Link>. If you disagree with any part of the terms, you may not access the Service.
                    </p>
                </div>
            </section>
            
            {/* Section 2: User Content */}
            <section className='section-card' style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaShieldAlt style={{color: '#ff00cc'}} /> 2. User-Generated Content & Copyright</h2>
                
                <p style={styles.paragraph}>
                    The Service allows you to upload, post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content").
                </p>
                
                <h3 style={styles.subHeading}>Your Warranties to Us:</h3>
                <ul style={styles.list}>
                    <li style={styles.listItem}>
                        You warrant that you own the intellectual property rights to the Content you post or that you have the right to grant us the license set forth below.
                    </li>
                    <li style={styles.listItem}>
                        You warrant that the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.
                    </li>
                </ul>

                <h3 style={styles.subHeading}>Content We Prohibit:</h3>
                <ul style={styles.list}>
                    <li style={styles.listItem}>
                        <span style={styles.highlight}>Copyright Infringement:</span> Any material copied directly from a textbook, published work, or official test bank without explicit permission.
                    </li>
                    <li style={styles.listItem}>
                        Content that is defamatory, obscene, or unlawful.
                    </li>
                </ul>

                <div style={styles.warningBox}>
                    <p>
                        <strong>Liability Shift (Indemnification):</strong> You agree to defend, indemnify, and hold harmless PeerNotez from any claims, damages, obligations, losses, liabilities, costs or debt, and expenses arising from any claim that your Content infringed the rights of a third party.
                    </p>
                </div>
            </section>

            {/* Section 3: Termination */}
            <section className='section-card' style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaBan style={{color: '#ffdd00'}} /> 3. Termination and Governing Law</h2>
                
                <h3 style={styles.subHeading}>Termination</h3>
                <p style={styles.paragraph}>
                    We may terminate or suspend your account immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms, particularly the <span style={styles.highlight}>Repeat Infringer Policy</span>.
                </p>

                <h3 style={styles.subHeading}>Governing Law</h3>
                <p style={styles.paragraph}>
                    These Terms shall be governed and construed in accordance with the laws of <span style={styles.highlight}>India</span>, without regard to its conflict of law provisions.
                </p>
            </section>
            <style>{`
                @media (max-width: 600px) {
                   .wrapper{
                   padding:1rem 0.1rem !important;
                   }
                   .section-card{
                   padding: 1rem !important;
                   }
                }
            `}</style>
        </div>
    );
};

export default TermsOfServicePage;
