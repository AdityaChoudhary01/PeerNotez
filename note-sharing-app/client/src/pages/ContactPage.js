import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Sending...');
        setIsSubmitted(false);

        try {
            // Replace with your actual backend endpoint
            const res = await axios.post('http://localhost:5001/api/contact', formData);
            
            if (res.status === 200) {
                setStatus('Message sent successfully!');
                setIsSubmitted(true);
                setFormData({ name: '', email: '', message: '' }); // Clear form
            } else {
                setStatus('Failed to send message. Please try again.');
            }
        } catch (error) {
            setStatus(error.response?.data?.message || 'Failed to send message. Please check your connection.');
        }
    };

    return (
        <div className="contact-page-wrapper">
            <Helmet>
                <title>Contact Us | PeerNotez</title>
            </Helmet>
            
            <header className="page-header">
                <h1>Get In Touch</h1>
                <p className="subtitle">
                    Whether you have a question, feedback, or just want to say hello, we'd love to hear from you. We're here to help!
                </p>
            </header>

            <div className="contact-main">
                <section className="contact-info">
                    <h2>Our Channels</h2>
                    <p>We're available through a variety of channels to ensure you can reach us conveniently.</p>
                    <div className="info-cards">
                        <div className="info-card">
                            <i className="fas fa-envelope icon"></i>
                            <h3>Email Support</h3>
                            <p>For general inquiries and support questions, email us at:</p>
                            <a href="mailto:aadiwrld01@gmail.com" className="info-link">aadiwrld01@gmail.com</a>
                        </div>
                        <div className="info-card">
                            <i className="fas fa-map-marker-alt icon"></i>
                            <h3>Corporate Address</h3>
                            <p>Our global headquarters are located at:</p>
                            <address>
                                PeerNotez Headquarters<br />
                                Balaji Enclave<br />
                                Ghaziabad, Uttar Pradesh, India<br />
                                201009<br />
                            </address>
                        </div>
                        <div className="info-card">
                            <i className="fas fa-phone-alt icon"></i>
                            <h3>Phone Line</h3>
                            <p>Speak directly with our team during business hours:</p>
                            <a href="tel:+1234567890" className="info-link">+91 (1234) 567-890</a>
                        </div>
                    </div>
                </section>

                <section className="contact-form-section">
                    <h2>Send Us a Message</h2>
                    {isSubmitted ? (
                        <div className="success-message">
                            <i className="fas fa-check-circle success-icon"></i>
                            <p>Thank you for reaching out! We have received your message and will get back to you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label htmlFor="name">Your Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Your Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Your Message</label>
                                <textarea 
                                    id="message" 
                                    name="message" 
                                    rows="6" 
                                    value={formData.message} 
                                    onChange={handleChange} 
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" disabled={status === 'Sending...'}>
                                {status === 'Sending...' ? 'Sending...' : 'Send Message'}
                            </button>
                            {status && <p className="form-status">{status}</p>}
                        </form>
                    )}
                </section>
            </div>

            <footer className="contact-footer">
                <div className="social-links">
                    <a href="https://linkedin.com/company/peernotez" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a href="https://twitter.com/peernotez" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://facebook.com/peernotez" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook-f"></i>
                    </a>
                </div>
                <p className="copyright">&copy; {new Date().getFullYear()} PeerNotez. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default ContactPage;
