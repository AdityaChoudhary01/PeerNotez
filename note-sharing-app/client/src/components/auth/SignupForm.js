import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const SignupForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        try {
            await signup(name, email, password);
            navigate('/'); // Redirect to homepage on successful signup
        } catch (err) {
            setError('Failed to create account. The email might already be in use.');
            console.error('Signup error:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Create an Account</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
                <label htmlFor="signup-name">Full Name</label>
                <input
                    type="text"
                    id="signup-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input
                    type="email"
                    id="signup-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                    type="password"
                    id="signup-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                />
            </div>
            <button type="submit">Sign Up</button>
        </form>
    );
};

export default SignupForm;