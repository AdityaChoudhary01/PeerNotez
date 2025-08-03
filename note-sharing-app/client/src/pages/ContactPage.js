import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Sending...');
        try {
            const res = await axios.post('https://peernotez.onrender.com/api/contact', formData);
            setStatus(res.data.message);
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            setStatus(error.response.data.message || 'Failed to send message.');
        }
    };

    return (
        <div className="contact-page">
            <Helmet>
                <title>Contact Peernotez | Get in Touch</title>
            </Helmet>

            <h1>Contact the Peernotez Team</h1>
            
            <p>
                Have a question or feedback for PeerNotez? Fill out the form below to get in touch with us.
            </p>
            
            <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Your Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" rows="6" value={formData.message} onChange={handleChange} required></textarea>
                </div>
                <button type="submit" disabled={status === 'Sending...'}>
                    {status === 'Sending...' ? 'Sending...' : 'Send Message'}
                </button>
            </form>
            
            {status && <p className="form-status">{status}</p>}

            <p>
                <Link to="/">Return to the Peernotez homepage</Link>
            </p>
        </div>
    );
};

export default ContactPage;
