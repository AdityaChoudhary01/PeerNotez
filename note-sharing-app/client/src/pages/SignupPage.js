import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
            <form onSubmit={handleSubmit} className="auth-form">
                <h2 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span role="img" aria-label="signup">📝</span> Sign Up
                </h2>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className="auth-input" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="auth-input" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="auth-input" />
                <button type="submit" className="auth-btn">Sign Up</button>
                <div className="auth-hint">Already have an account? <a href="/login">Login</a></div>
            </form>
        </div>
    );
};

export default SignupPage;