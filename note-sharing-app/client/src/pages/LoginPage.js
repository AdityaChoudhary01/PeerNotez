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
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)',
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
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(102, 126, 234, 0.3))'
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
            marginBottom: '1.5rem',
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.9)'
        },
        featureIcon: {
            color: 'var(--neon-blue)',
            fontSize: '1.2rem',
            background: 'rgba(0, 242, 254, 0.1)',
            padding: '10px',
            borderRadius: '12px',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(0, 242, 254, 0.2)',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.1)'
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
            marginBottom: '1.5rem'
        },
        inputIcon: {
            position: 'absolute',
            left: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--neon-blue)',
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
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'var(--font-primary)'
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
            marginTop: '1rem',
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
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            border: '1px solid rgba(255, 0, 128, 0.2)',
            animation: 'fadeIn 0.4s ease'
        },
        hint: {
            textAlign: 'center',
            marginTop: '2.5rem',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.95rem'
        },
        link: {
            color: 'var(--neon-purple)',
            textDecoration: 'none',
            fontWeight: '600',
            marginLeft: '8px',
            transition: 'all 0.3s ease'
        }
    };

    return (
        <div style={styles.container}>
            <Helmet>
                <title>Login | PeerNotez</title>
                <meta name="description" content="Log in to PeerNotez." />
     <link rel="canonical" href="https://peernotez.netlify.app/login" />
            </Helmet>

            <div style={styles.splitLayout} className="login-split-layout">
                {/* Image/Promo Section */}
                <div style={styles.imageSection} className="login-image-section">
                    <h2 style={styles.promoTitle}>Welcome Back!</h2>
                    <p style={styles.promoText}>
                        Continue your journey towards academic excellence with the world's most modern student community.
                    </p>
                    
                    <ul style={styles.featureList}>
                        <li style={styles.featureItem}>
                            <div style={styles.featureIcon}><FaLightbulb /></div>
                            <span>Personalized Study Insights</span>
                        </li>
                        <li style={styles.featureItem}>
                            <div style={styles.featureIcon}><FaGlobe /></div>
                            <span>Global Network of Scholars</span>
                        </li>
                        <li style={styles.featureItem}>
                            <div style={styles.featureIcon}><FaRocket /></div>
                            <span>Seamless Content Management</span>
                        </li>
                    </ul>

                    {/* Decorative Background Blob */}
                    <div style={{
                        position: 'absolute', bottom: '-50px', right: '-50px',
                        width: '300px', height: '300px', background: 'radial-gradient(circle, var(--neon-purple) 0%, transparent 70%)',
                        filter: 'blur(80px)', opacity: 0.2, zIndex: 0
                    }}></div>
                </div>

                {/* Login Form Section */}
                <div className='form-section' style={styles.formSection}>
                    <h2 style={styles.formTitle}>
                        <FaSignInAlt style={{color: 'var(--neon-blue)'}} /> Sign In
                    </h2>
                    <p style={styles.formSubtitle}>Log in to manage your notes</p>

                    <form onSubmit={handleSubmit}>
                        {error && <div style={styles.errorMsg}>{error}</div>}

                        <div style={styles.inputGroup}>
                            <FaEnvelope style={styles.inputIcon} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Email Address"
                                required
                                style={styles.input}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--neon-blue)';
                                    e.target.style.boxShadow = '0 0 20px rgba(0, 242, 254, 0.2)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--glass-border)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                                }}
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
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--neon-blue)';
                                    e.target.style.boxShadow = '0 0 20px rgba(0, 242, 254, 0.2)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--glass-border)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                                }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            style={styles.submitBtn}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-3px) scale(1.02)';
                                e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            Log In
                        </button>

                        <div style={styles.hint}>
                            Don't have an account? 
                            <Link to="/signup" style={styles.link}>Create One</Link>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .login-image-section { 
                        display: none !important; 
                    }
                    .login-split-layout { 
                        min-height: auto !important;
                    }
                    .container {
                        width: 100%;
                        padding: 0.5rem 0rem;
                    }
                        .form-section{
                        padding:4rem 1rem !important;
                        }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
