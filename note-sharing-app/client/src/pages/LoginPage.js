import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useAuth from '../hooks/useAuth';

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
            setError('Invalid email or password. Please try again.');
        }
    };
    
    return (
        <div className="login-page-container">
            <Helmet>
                <title>Login to PeerNotez | Access Your Notes</title>
                <meta name="description" content="Log in to your PeerNotez account to access and share academic notes, study guides, and resources. Join our community of learners today." />
            </Helmet>
            
            <div className="login-content-wrapper">
                <div className="login-image-section">
                    <div className="login-image-overlay">
                        <h2 className="login-promo-title">Welcome Back to PeerNotez</h2>
                        <p className="login-promo-text">
                            Access your personalized dashboard, collaborate with peers, and get the resources you need to succeed.
                        </p>
                        <p className="login-promo-quote">
                            "The best way to predict the future is to create it."
                        </p>
                    </div>
                </div>
                
                <div className="login-form-section">
                    <div className="auth-card">
                        <h2 className="auth-title">
                            <i className="fas fa-sign-in-alt auth-icon"></i> Sign In
                        </h2>
                        
                        <p className="auth-subtitle">
                            Enter your credentials to continue your journey.
                        </p>
                        
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group input-with-icon">
                                <i className="fas fa-envelope input-icon"></i>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Email Address"
                                    required
                                    className="auth-input"
                                    aria-label="Email Address"
                                />
                            </div>
                            <div className="form-group input-with-icon">
                                <i className="fas fa-lock input-icon"></i>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                    className="auth-input"
                                    aria-label="Password"
                                />
                            </div>
                            
                            {error && <p className="auth-error">{error}</p>}
                            
                            <button type="submit" className="auth-btn">Log In</button>
                            
                            <div className="auth-hint">
                                Don't have an account? <Link to="/signup" className="auth-link">Create one now</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
