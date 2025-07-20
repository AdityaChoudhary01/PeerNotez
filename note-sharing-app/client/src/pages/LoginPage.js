import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            console.error('Failed to login', error);
            alert('Invalid credentials');
        }
    };
    
    return (
        <div className="auth-card">
        <h1 className="visually-hidden">Login to PeerNotez – Access Your Notes, Favorites, and Personalized Content</h1>

            <form onSubmit={handleSubmit} className="auth-form">
                <h2 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span role="img" aria-label="login">🔑</span> Login
                </h2>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="auth-input" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="auth-input" />
                <button type="submit" className="auth-btn">Login</button>
                <div className="auth-hint">Don't have an account? <a href="/signup">Sign Up</a></div>
            </form>
        </div>
    );
};

export default LoginPage;
