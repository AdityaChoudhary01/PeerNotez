import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useAuth from '../hooks/useAuth';
import { FaEnvelope, FaLock, FaSignInAlt, FaLightbulb, FaRocket, FaGlobe } from 'react-icons/fa';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    // --- INTERNAL CSS: HOLOGRAPHIC LOGIN PAGE ---
    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem', // Minimal padding for mobile
            position: 'relative',
            overflow: 'hidden'
        },
        splitLayout: {
            display: 'flex',
            width: '100%',
            maxWidth: '1100px', // Slightly wider to accommodate content
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            minHeight: '600px',
            flexDirection: 'row'
        },
        imageSection: {
            flex: 1.2, // Give more space to the content side
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(255, 0, 204, 0.15))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '3rem',
            position: 'relative',
            color: '#fff',
            textAlign: 'left' // Align text left for better readability of list
        },
        promoTitle: {
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '1rem',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
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
            marginBottom: '1.5rem',
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.85)'
        },
        featureIcon: {
            color: '#00d4ff',
            fontSize: '1.2rem',
            background: 'rgba(0, 212, 255, 0.1)',
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
            fontSize: '0.95rem'
        },
        inputGroup: {
            position: 'relative',
            marginBottom: '1.5rem'
        },
        inputIcon: {
            position: 'absolute',
            left: '16px', // Adjusted left position
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#00d4ff',
            fontSize: '1.1rem',
            pointerEvents: 'none',
            zIndex: 10
        },
        input: {
            width: '100%',
            padding: '14px 14px 14px 50px', // INCREASED PADDING to 50px to clear icon
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s'
        },
        submitBtn: {
            width: '100%',
            padding: '14px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            border: 'none',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            marginTop: '1rem',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
            transition: 'transform 0.2s'
        },
        errorMsg: {
            color: '#ff0055',
            background: 'rgba(255, 0, 85, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            border: '1px solid rgba(255, 0, 85, 0.2)'
        },
        hint: {
            textAlign: 'center',
            marginTop: '2rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.95rem'
        },
        link: {
            color: '#ff00cc',
            textDecoration: 'none',
            fontWeight: '600',
            marginLeft: '5px'
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            console.error('Failed to login', err);
            setError('Invalid email or password.');
        }
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = '#00d4ff';
        e.target.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.2)';
    };
    const handleBlur = (e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={styles.container}>
            <Helmet>
                <title>Login | PeerNotez</title>
                <meta name="description" content="Log in to PeerNotez." />
            </Helmet>

            <div style={styles.splitLayout} className="login-split-layout">
                {/* Left Side - Expanded Content */}
                <div style={styles.imageSection} className="login-image-section">
                    <h2 style={styles.promoTitle}>Welcome Back!</h2>
                    <p style={styles.promoText}>
                        Your gateway to a smarter, collaborative learning experience.
                    </p>
                    
                    <ul style={styles.featureList}>
                        <li style={styles.featureItem}>
                            <div style={styles.featureIcon}><FaLightbulb /></div>
                            <span>Access curated study notes & guides</span>
                        </li>
                        <li style={styles.featureItem}>
                            <div style={styles.featureIcon}><FaGlobe /></div>
                            <span>Connect with a global student community</span>
                        </li>
                        <li style={styles.featureItem}>
                            <div style={styles.featureIcon}><FaRocket /></div>
                            <span>Share your knowledge and grow</span>
                        </li>
                    </ul>

                    {/* Abstract Blob */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '300px', height: '300px', background: 'radial-gradient(circle, #ff00cc 0%, transparent 60%)',
                        filter: 'blur(60px)', opacity: 0.15, zIndex: 0
                    }}></div>
                </div>

                {/* Right Side - Login Form */}
                <div style={styles.formSection}>
                    <h2 style={styles.formTitle}>
                        <FaSignInAlt style={{color: '#00d4ff'}} /> Sign In
                    </h2>
                    <p style={styles.formSubtitle}>Continue to PeerNotez</p>

                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <FaEnvelope style={styles.inputIcon} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder="Email Address"
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <FaLock style={styles.inputIcon} />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder="Password"
                                required
                                style={styles.input}
                            />
                        </div>

                        {error && <div style={styles.errorMsg}>{error}</div>}

                        <button 
                            type="submit" 
                            style={styles.submitBtn}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            Log In
                        </button>

                        <div style={styles.hint}>
                            New here? 
                            <Link to="/signup" style={styles.link}>Create Account</Link>
                        </div>
                    </form>
                </div>
            </div>
            
            <style>{`
                /* Mobile Responsive Adjustments */
                @media (max-width: 768px) {
                    .login-image-section { 
                        display: none !important; 
                    }
                    .login-split-layout { 
                        flex-direction: column !important; 
                        min-height: auto !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
