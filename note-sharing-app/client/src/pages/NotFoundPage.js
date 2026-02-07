import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFoundPage = () => {
    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
    const styles = {
        wrapper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: '2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        },
        container: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4rem 2rem',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 1
        },
        icon: {
            fontSize: '4rem',
            color: '#ffcc00', // Warning yellow
            marginBottom: '1rem',
            filter: 'drop-shadow(0 0 15px rgba(255, 204, 0, 0.4))'
        },
        errorCode: {
            fontSize: 'clamp(6rem, 15vw, 10rem)',
            fontWeight: '900',
            background: 'linear-gradient(to bottom, #ff0055, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            lineHeight: 1,
            letterSpacing: '-5px',
            textShadow: '0 10px 30px rgba(255, 0, 85, 0.3)'
        },
        title: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '1rem'
        },
        message: {
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
            marginBottom: '2.5rem'
        },
        homeBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 35px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '1.1rem',
            boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
            transition: 'transform 0.2s'
        },
        // Decorative background elements
        blob1: {
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255, 0, 204, 0.15), transparent 70%)',
            filter: 'blur(60px)',
            zIndex: 0
        },
        blob2: {
            position: 'absolute',
            bottom: '20%',
            right: '20%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15), transparent 70%)',
            filter: 'blur(60px)',
            zIndex: 0
        }
    };

    return (
        <div style={styles.wrapper}>
            <Helmet>
                <title>404 - Page Not Found | PeerNotez</title>
                <meta name="robots" content="noindex" />
            </Helmet>
            
            {/* Background Blobs */}
            <div style={styles.blob1}></div>
            <div style={styles.blob2}></div>

            <div style={styles.container}>
                <FaExclamationTriangle style={styles.icon} />
                <h1 style={styles.errorCode}>404</h1>
                <h2 style={styles.title}>Oops! Page Not Found</h2>
                <p style={styles.message}>
                    The page you are looking for might have been moved, deleted, or possibly never existed.
                </p>
                
                <Link 
                    to="/" 
                    style={styles.homeBtn}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    <FaHome /> Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
