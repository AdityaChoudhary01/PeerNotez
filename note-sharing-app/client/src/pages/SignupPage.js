/* src/pages/SignupPage.js */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useAuth from '../hooks/useAuth';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaCheckCircle } from 'react-icons/fa';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
    const [isSignedUp, setIsSignedUp] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!agreedToTerms) {
            setError('You must agree to the Terms of Service & Privacy Policy.');
            return;
        }

        try {
            await signup(name, email, password);
            setIsSignedUp(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error('Failed to sign up', err);
            setError(err.response?.data?.message || 'User already exists or invalid data.');
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        },
        splitLayout: {
            display: 'flex',
            width: '100%',
            maxWidth: '1100px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            overflow: 'hidden',
            minHeight: '650px',
            position: 'relative',
            zIndex: 1
        },
        imageSection: {
            flex: 1.2,
            background: 'linear-gradient(135deg, rgba(255, 0, 128, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '4rem 3rem',
            position: 'relative',
            color: '#fff'
        },
        promoTitle: {
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '900',
            fontFamily: 'var(--font-display)',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, var(--neon-pink), var(--neon-blue))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(255, 0, 128, 0.3))'
        },
        promoText: {
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '2.5rem'
        },
        featureList: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        featureItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '1.2rem',
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.9)'
        },
        featureIcon: {
            color: 'var(--neon-pink)',
            fontSize: '1.2rem',
            background: 'rgba(255, 0, 128, 0.1)',
            padding: '10px',
            borderRadius: '12px',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 0, 128, 0.2)'
        },
        formSection: {
            flex: 1,
            padding: '4rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'rgba(10, 1, 24, 0.4)'
        },
        formTitle: {
            fontSize: '2.2rem',
            fontWeight: '800',
            fontFamily: 'var(--font-display)',
            color: '#fff',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        formSubtitle: {
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '2.5rem',
            fontSize: '1rem'
        },
        inputGroup: {
            position: 'relative',
            marginBottom: '1.2rem'
        },
        inputIcon: {
            position: 'absolute',
            left: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--neon-pink)',
            fontSize: '1.1rem',
            zIndex: 10
        },
        input: {
            width: '100%',
            padding: '16px 16px 16px 52px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s ease',
            fontFamily: 'var(--font-primary)'
        },
        checkboxGroup: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            margin: '1rem 0 1.5rem',
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.6)'
        },
        submitBtn: {
            width: '100%',
            padding: '16px',
            borderRadius: '50px',
            background: 'var(--gradient-primary)',
            color: '#fff',
            border: 'none',
            fontSize: '1.1rem',
            fontWeight: '700',
            fontFamily: 'var(--font-display)',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s var(--transition-elastic)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
        },
        errorMsg: {
            color: 'var(--neon-pink)',
            background: 'rgba(255, 0, 128, 0.1)',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            border: '1px solid rgba(255, 0, 128, 0.2)'
        },
        successBox: {
            textAlign: 'center',
            padding: '4rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem'
        }
    };

    if (isSignedUp) {
        return (
            <main style={styles.container}>
                <Helmet><title>Welcome to PeerNotez!</title></Helmet>
                <div style={{...styles.splitLayout, maxWidth: '600px', minHeight: 'auto'}}>
                    <div style={styles.successBox}>
                        <FaCheckCircle style={{fontSize: '5rem', color: 'var(--neon-green)', filter: 'drop-shadow(0 0 20px rgba(0, 255, 159, 0.4))'}} />
                        <h1 style={{fontSize: '2.5rem', fontWeight: '900', fontFamily: 'var(--font-display)'}}>Welcome, {name}! 🎉</h1>
                        <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem'}}>Your account is ready. Launching your learning journey...</p>
                        <Link to="/login" style={{...styles.submitBtn, textDecoration: 'none', textAlign: 'center'}}>Continue to Login</Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main style={styles.container}>
            <Helmet>
                <title>Sign Up for PeerNotez | Join Our Student Study Community</title>
                <meta name="description" content="Create a free PeerNotez account to share notes, find university study guides, and collaborate with students globally. Join the future of peer-to-peer learning." />
                <meta name="keywords" content="PeerNotez signup, share study notes, student community, college study guides, free academic resources" />
                <link rel="canonical" href="https://peernotez.netlify.app/signup" />
                {/* Open Graph / Social SEO */}
                <meta property="og:title" content="Sign Up for PeerNotez | Join Our Community" />
                <meta property="og:description" content="The best platform for students to share and find study materials." />
                <meta property="og:type" content="website" />
            </Helmet>

            <div style={styles.splitLayout} className="signup-split-layout">
                {/* Promo Side */}
                <div style={styles.imageSection} className="signup-image-section">
                    <h1 style={styles.promoTitle}>Start Learning</h1>
                    <p style={styles.promoText}>
                        Join thousands of students sharing knowledge and building the future of peer-to-peer education.
                    </p>
                    
                    <ul style={styles.featureList}>
                        <li style={styles.featureItem}>
                            <div style={styles.featureIcon}><FaUserPlus /></div>
                            <span>Personalized Student Dashboard</span>
                        </li>
                        <li style={styles.featureItem}>
                            <div style={styles.featureIcon}><FaLock /></div>
                            <span>Secure Content Encryption</span>
                        </li>
                        <li style={styles.featureItem}>
                            <div style={styles.featureIcon}><FaCheckCircle /></div>
                            <span>Verified Study Resources</span>
                        </li>
                    </ul>

                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '300px', height: '300px', background: 'radial-gradient(circle, var(--neon-blue) 0%, transparent 70%)',
                        filter: 'blur(80px)', opacity: 0.15, zIndex: 0
                    }}></div>
                </div>

                {/* Form Side */}
                <div className='form-section' style={styles.formSection}>
                    <h2 style={styles.formTitle}>
                        <FaUserPlus style={{color: 'var(--neon-pink)'}} /> Sign Up
                    </h2>
                    <p style={styles.formSubtitle}>Create your free account</p>

                    <form onSubmit={handleSubmit}>
                        {error && <div style={styles.errorMsg}>{error}</div>}

                        <div style={styles.inputGroup}>
                            <FaUser style={styles.inputIcon} />
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Full Name"
                                required
                                style={styles.input}
                                onFocus={(e) => e.target.style.borderColor = 'var(--neon-pink)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <FaEnvelope style={styles.inputIcon} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Email Address"
                                required
                                style={styles.input}
                                onFocus={(e) => e.target.style.borderColor = 'var(--neon-pink)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <FaLock style={styles.inputIcon} />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                style={styles.input}
                                onFocus={(e) => e.target.style.borderColor = 'var(--neon-pink)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>

                        <div style={styles.checkboxGroup}>
                            <input 
                                type="checkbox" 
                                id="terms" 
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                style={{ accentColor: 'var(--neon-pink)', width: '18px', height: '18px' }}
                                required
                            />
                            <label htmlFor="terms">
                                I agree to the <Link to="/terms" style={{color: 'var(--neon-blue)', textDecoration: 'none'}}>Terms</Link> & <Link to="/privacy" style={{color: 'var(--neon-blue)', textDecoration: 'none'}}>Privacy Policy</Link>.
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!agreedToTerms}
                            style={{...styles.submitBtn, opacity: agreedToTerms ? 1 : 0.6}}
                            onMouseEnter={(e) => agreedToTerms && (e.target.style.transform = 'translateY(-3px)')}
                            onMouseLeave={(e) => agreedToTerms && (e.target.style.transform = 'translateY(0)')}
                        >
                            Create Account
                        </button>

                        <div style={{textAlign: 'center', marginTop: '2rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem'}}>
                            Already a member? <Link to="/login" style={{color: 'var(--neon-blue)', textDecoration: 'none', fontWeight: '600'}}>Log In</Link>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .signup-image-section { display: none !important; }
                    .signup-split-layout { min-height: auto !important; }
                    .container {
                        width: 100%;
                        padding: 0.5rem 0rem;
                    }
                    .form-section{
                        padding:4rem 1rem !important;
                        }
                }
            `}</style>
        </main>
    );
};

export default SignupPage;
