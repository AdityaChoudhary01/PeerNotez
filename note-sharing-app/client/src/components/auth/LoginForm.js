import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // --- INTERNAL CSS: HOLOGRAPHIC FORM ---
    const styles = {
        formCard: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '3rem',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            margin: '0 auto'
        },
        title: {
            textAlign: 'center',
            fontSize: '2rem',
            marginBottom: '2rem',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800'
        },
        inputGroup: {
            marginBottom: '1.5rem',
            position: 'relative'
        },
        icon: {
            position: 'absolute',
            top: '50%',
            left: '15px',
            transform: 'translateY(-50%)',
            color: 'rgba(255, 255, 255, 0.5)',
            zIndex: 1
        },
        input: {
            width: '100%',
            padding: '14px 14px 14px 45px', // Padding left for icon
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s ease',
            fontFamily: "'Spline Sans', sans-serif"
        },
        errorMsg: {
            background: 'rgba(255, 0, 85, 0.1)',
            border: '1px solid rgba(255, 0, 85, 0.3)',
            color: '#ff0055',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        submitBtn: {
            width: '100%',
            padding: '14px',
            border: 'none',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #ff00cc 100%)',
            color: '#fff',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem',
            marginLeft: '5px'
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Invalid email or password. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to handle focus styles manually since we are using inline styles
    const handleFocus = (e) => {
        e.target.style.borderColor = '#00d4ff';
        e.target.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.2)';
        e.target.style.background = 'rgba(0, 0, 0, 0.4)';
    };

    const handleBlur = (e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.boxShadow = 'none';
        e.target.style.background = 'rgba(0, 0, 0, 0.2)';
    };

    return (
        <form onSubmit={handleSubmit} style={styles.formCard}>
            <h2 style={styles.title}>Welcome Back</h2>
            
            {error && (
                <div style={styles.errorMsg}>
                    <span>⚠️</span> {error}
                </div>
            )}

            <div style={styles.inputGroup}>
                <label htmlFor="login-email" style={styles.label}>Email Address</label>
                <div style={{position: 'relative'}}>
                    <FaEnvelope style={styles.icon} />
                    <input
                        type="email"
                        id="login-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="you@example.com"
                        required
                        style={styles.input}
                    />
                </div>
            </div>

            <div style={styles.inputGroup}>
                <label htmlFor="login-password" style={styles.label}>Password</label>
                <div style={{position: 'relative'}}>
                    <FaLock style={styles.icon} />
                    <input
                        type="password"
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="••••••••"
                        required
                        style={styles.input}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                style={{
                    ...styles.submitBtn, 
                    opacity: loading ? 0.7 : 1, 
                    cursor: loading ? 'wait' : 'pointer'
                }}
                disabled={loading}
                onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
                {loading ? 'Authenticating...' : (
                    <>
                        Login <FaSignInAlt />
                    </>
                )}
            </button>
        </form>
    );
};

export default LoginForm;
