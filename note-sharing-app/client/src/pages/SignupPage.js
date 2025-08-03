import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // --- IMPORT LINK ---
import { Helmet } from 'react-helmet'; // --- IMPORT HELMET ---
import useAuth from '../hooks/useAuth';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(name, email, password);
            navigate('/');
        } catch (error) {
            console.error('Failed to sign up', error);
            alert('User already exists or invalid data.');
        }
    };
    
    return (
        <div className="auth-card">
            <Helmet>
                <title>Sign Up for Peernotez | Join Our Community</title>
            </Helmet>

            <h1 className="visually-hidden">Sign Up for PeerNotez – Join Thousands of Students Sharing Notes Worldwide</h1>

            <form onSubmit={handleSubmit} className="auth-form">
                <h2 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span role="img" aria-label="signup">📝</span> Sign Up
                </h2>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className="auth-input" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="auth-input" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="auth-input" />
                <button type="submit" className="auth-btn">Sign Up</button>
                <div className="auth-hint">Already have an account? <Link to="/login">Login</Link></div>
            </form>

            <div className="auth-footer" style={{marginTop: '1rem', textAlign: 'center'}}>
                <Link to="/">Return to Homepage</Link>
            </div>
        </div>
    );
};

export default SignupPage;
