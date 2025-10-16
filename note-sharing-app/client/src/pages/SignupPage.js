// note-sharing-app/client/src/pages/SignupPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useAuth from '../hooks/useAuth';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // --- NEW STATE FOR CONSENT ---
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    // ----------------------------
    const [error, setError] = useState('');
    const [isSignedUp, setIsSignedUp] = useState(false); 
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // --- CRITICAL CHECK ---
        if (!agreedToTerms) {
            setError('You must agree to the Terms of Service and Privacy Policy to create an account.');
            return;
        }
        // ----------------------

        try {
            await signup(name, email, password);
            setIsSignedUp(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000); 
        } catch (err) {
            console.error('Failed to sign up', err);
            setError(err.response?.data?.message || 'User already exists or invalid data.');
        }
    };
    
    // Conditional rendering for the success message
    if (isSignedUp) {
        return (
            <div className="signup-page-container">
                <Helmet>
                    <title>Sign Up Successful! | PeerNotez</title>
                </Helmet>
                <div className="signup-success-message">
                    <h2 className="success-title">Welcome to PeerNotez, {name}! 🎉</h2>
                    <p className="success-text">Your account has been created successfully. You can now log in to access all features.</p>
                    <Link to="/login" className="main-cta-button">Go to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="signup-page-container">
            <Helmet>
                <title>Sign Up for PeerNotez | Join Our Community</title>
                <meta name="description" content="Create a free account on PeerNotez to start sharing and discovering academic notes, study materials, and resources with a global community of students." />
            </Helmet>
            
            <div className="signup-content-wrapper">
                <div className="signup-image-section">
                    <div className="signup-image-overlay">
                        <h2 className="signup-promo-title">Join the PeerNotez Community</h2>
                        <p className="signup-promo-text">
                            Unlock a world of knowledge and connect with students from around the globe. Share your notes, find study guides, and learn together.
                        </p>
                    </div>
                </div>
                
                <div className="signup-form-section">
                    <div className="auth-card">
                        <h2 className="auth-title">
                            <i className="fas fa-user-plus auth-icon"></i> Create Account
                        </h2>
                        
                        <p className="auth-subtitle">
                            Start your collaborative learning journey today.
                        </p>
                        
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group input-with-icon">
                                <i className="fas fa-user input-icon"></i>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Full Name"
                                    required
                                    className="auth-input"
                                    aria-label="Full Name"
                                />
                            </div>
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
                                    placeholder="Create a Password"
                                    required
                                    className="auth-input"
                                    aria-label="Create a Password"
                                />
                            </div>
                            
                            {error && <p className="auth-error">{error}</p>}

                            {/* --- NEW CONSENT CHECKBOX --- */}
                            <div className="form-group consent-group" style={{display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '-0.5rem'}}>
                                <input 
                                    type="checkbox" 
                                    id="terms-consent" 
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    style={{marginTop: '5px', width: '20px', height: '20px', flexShrink: 0}}
                                />
                                <label htmlFor="terms-consent" style={{fontSize: '0.9rem', color: 'var(--subtle-text-color)', marginBottom: 0}}>
                                    I agree to the <Link to="/terms" className="auth-link" target="_blank" rel="noopener noreferrer">Terms of Service</Link>, <Link to="/privacy" className="auth-link" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>, and the <Link to="/dmca" className="auth-link" target="_blank" rel="noopener noreferrer">DMCA Policy</Link>.
                                </label>
                            </div>
                            {/* ----------------------------- */}
                            
                            <button type="submit" className="auth-btn" disabled={!agreedToTerms}>Sign Up</button>
                            
                            <div className="auth-hint">
                                Already have an account? <Link to="/login" className="auth-link">Log In</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
