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

    // --- INTERNAL CSS: HOLOGRAPHIC SIGNUP PAGE ---
    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative',
            overflow: 'hidden'
        },
        splitLayout: {
            display: 'flex',
            width: '100%',
            maxWidth: '1100px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            minHeight: '650px', 
            flexDirection: 'row'
        },
        imageSection: {
            flex: 1.2,
            background: 'linear-gradient(135deg, rgba(255, 0, 204, 0.15), rgba(0, 212, 255, 0.15))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '3rem',
            position: 'relative',
            color: '#fff',
            textAlign: 'left'
        },
        promoTitle: {
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '1rem',
            background: 'linear-gradient(to right, #ff00cc, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        promoText: {
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2rem'
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
            color: 'rgba(255,255,255,0.85)'
        },
        featureIcon: {
            color: '#ff00cc',
            fontSize: '1.2rem',
            background: 'rgba(255, 0, 204, 0.1)',
            padding: '8px',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        formSection: {
            flex: 1,
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.25)'
        },
        formTitle: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        formSubtitle: {
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '2rem',
            fontSize: '0.9rem'
        },
        inputGroup: {
            position: 'relative',
            marginBottom: '1.2rem'
        },
        inputIcon: {
            position: 'absolute',
            left: '20px', 
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#ff00cc',
            fontSize: '1.2rem', 
            pointerEvents: 'none',
            zIndex: 10
        },
        input: {
            width: '100%',
            padding: '14px 14px 14px 50px', 
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            textIndent: '0', 
            transition: 'border-color 0.3s, box-shadow 0.3s'
        },
        checkboxGroup: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginTop: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.7)'
        },
        checkbox: {
            marginTop: '4px',
            cursor: 'pointer',
            accentColor: '#ff00cc',
            width: '18px',
            height: '18px'
        },
        submitBtn: {
            width: '100%',
            padding: '14px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #ff00cc 0%, #333399 100%)',
            color: '#fff',
            border: 'none',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 0, 204, 0.3)',
            transition: 'transform 0.2s, opacity 0.2s'
        },
        errorMsg: {
            color: '#ff0055',
            background: 'rgba(255, 0, 85, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            border: '1px solid rgba(255, 0, 85, 0.2)'
        },
        hint: {
            textAlign: 'center',
            marginTop: '1.5rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem'
        },
        link: {
            color: '#00d4ff', 
            textDecoration: 'none',
            fontWeight: '600',
            marginLeft: '5px'
        },
        successBox: {
            textAlign: 'center',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
        }
    };

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

    const handleFocus = (e) => {
        e.target.style.borderColor = '#ff00cc';
        e.target.style.boxShadow = '0 0 10px rgba(255, 0, 204, 0.2)';
    };
    const handleBlur = (e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.boxShadow = 'none';
    };

    // Success View
    if (isSignedUp) {
        return (
            <main style={styles.container}>
                <Helmet>
                    <title>Registration Successful | PeerNotez</title>
                    <link rel="canonical" href="https://peernotez.netlify.app/signup" />
                </Helmet>
                <div style={{...styles.splitLayout, maxWidth: '600px', minHeight: 'auto'}}>
                    <article style={styles.successBox}>
                        <FaCheckCircle aria-hidden="true" style={{fontSize: '4rem', color: '#00ffaa', filter: 'drop-shadow(0 0 15px rgba(0, 255, 170, 0.4))'}} />
                        <h1 style={{fontSize: '2rem', fontWeight: '800', color: '#fff'}}>Welcome, {name}! 🎉</h1>
                        <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem'}}>
                            Your account has been created successfully. Redirecting to login...
                        </p>
                        <Link aria-label="Go to login page" to="/login" style={{...styles.submitBtn, textAlign: 'center', textDecoration: 'none', background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)', boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'}}>
                            Go to Login Now
                        </Link>
                    </article>
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

            <article style={styles.splitLayout} className="signup-split-layout">
                {/* Left Side - Promo Content */}
                <section style={styles.imageSection} className="signup-image-section">
                    <h1 style={styles.promoTitle}>Join the Community</h1>
                    <p style={styles.promoText}>
                        Unlock a world of academic knowledge. Share study notes, find course guides, and learn together on the world's most innovative student platform.
                    </p>
                    
                    <ul style={styles.featureList} aria-label="PeerNotez Key Features">
                        <li style={styles.featureItem}>
                            <div style={styles.featureIcon} aria-hidden="true"><FaUserPlus /></div>
                            <span>Create a personalized student profile</span>
                        </li>
                        <li style={styles.featureItem}>
                            <div style={styles.featureIcon} aria-hidden="true"><FaLock /></div>
                            <span>Secure & private data protection</span>
                        </li>
                        <li style={styles.featureItem}>
                            <div style={styles.featureIcon} aria-hidden="true"><FaCheckCircle /></div>
                            <span>Totally free educational resources</span>
                        </li>
                    </ul>

                    {/* Abstract Blob Decoration */}
                    <div role="presentation" style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '300px', height: '300px', background: 'radial-gradient(circle, #00d4ff 0%, transparent 60%)',
                        filter: 'blur(60px)', opacity: 0.15, zIndex: 0
                    }}></div>
                </section>

                {/* Right Side - Signup Form */}
                <section style={styles.formSection}>
                    <header>
                        <h2 style={styles.formTitle}>
                            <FaUserPlus aria-hidden="true" style={{color: '#ff00cc'}} /> Create Account
                        </h2>
                        <p style={styles.formSubtitle}>Start your learning journey today.</p>
                    </header>

                    <form onSubmit={handleSubmit} aria-label="Signup registration form">
                        <div style={styles.inputGroup}>
                            <FaUser style={styles.inputIcon} aria-hidden="true" />
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder="Full Name"
                                aria-label="Enter your full name"
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <FaEnvelope style={styles.inputIcon} aria-hidden="true" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder="Email Address"
                                aria-label="Enter your email address"
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <FaLock style={styles.inputIcon} aria-hidden="true" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder="Create Password"
                                aria-label="Create a secure password"
                                required
                                style={styles.input}
                            />
                        </div>

                        {/* Consent Checkbox */}
                        <div style={styles.checkboxGroup}>
                            <input 
                                type="checkbox" 
                                id="terms-consent" 
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                style={styles.checkbox}
                                required
                            />
                            <label htmlFor="terms-consent">
                                I agree to the <Link to="/terms" target="_blank" style={styles.link}>Terms</Link>, <Link to="/privacy" target="_blank" style={styles.link}>Privacy</Link> & <Link to="/dmca" target="_blank" style={styles.link}>DMCA Policy</Link>.
                            </label>
                        </div>

                        {error && <div role="alert" style={styles.errorMsg}>{error}</div>}

                        <button 
                            type="submit" 
                            disabled={!agreedToTerms}
                            aria-live="polite"
                            style={{...styles.submitBtn, opacity: agreedToTerms ? 1 : 0.6, cursor: agreedToTerms ? 'pointer' : 'not-allowed'}}
                            onMouseEnter={(e) => agreedToTerms && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => agreedToTerms && (e.target.style.transform = 'translateY(0)')}
                        >
                            Sign Up Now
                        </button>

                        <div style={styles.hint}>
                            Already have an account? 
                            <Link to="/login" style={styles.link}>Log In</Link>
                        </div>
                    </form>
                </section>
            </article>
            
            <style>{`
                @media (max-width: 768px) {
                    .signup-image-section { display: none !important; }
                    .signup-split-layout { 
                        flex-direction: column !important; 
                        min-height: auto !important;
                    }
                }
            `}</style>
        </main>
    );
};

export default SignupPage;

