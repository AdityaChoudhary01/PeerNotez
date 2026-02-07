import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- INTERNAL CSS: HOLOGRAPHIC CONTACT PAGE ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            minHeight: '80vh'
        },
        header: {
            textAlign: 'center',
            marginBottom: '4rem',
            padding: '4rem 1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        },
        title: {
            fontSize: '3.5rem',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
        },
        subtitle: {
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '600px',
            margin: '0 auto'
        },
        mainContent: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '3rem',
            alignItems: 'start'
        },
        sectionCard: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2.5rem',
            height: '100%',
            transition: 'transform 0.3s'
        },
        infoItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1.5rem',
            marginBottom: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        },
        iconBox: {
            background: 'rgba(0, 212, 255, 0.1)',
            padding: '1rem',
            borderRadius: '12px',
            color: '#00d4ff',
            fontSize: '1.5rem',
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.2)'
        },
        infoTitle: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '0.5rem'
        },
        infoText: {
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
            fontSize: '1rem'
        },
        link: {
            color: '#ff00cc',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'block',
            marginTop: '0.5rem',
            fontSize: '1.1rem'
        },
        formLabel: {
            display: 'block',
            marginBottom: '0.8rem',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: '600',
            fontSize: '0.95rem'
        },
        input: {
            width: '100%',
            padding: '14px 16px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            marginBottom: '1.5rem',
            transition: 'border-color 0.3s'
        },
        submitBtn: {
            width: '100%',
            padding: '16px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            border: 'none',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
            transition: 'transform 0.2s'
        },
        successBox: {
            textAlign: 'center',
            padding: '3rem 1rem',
            animation: 'fadeIn 0.5s ease'
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('Sending...');
        setIsSubmitted(false);

        try {
            // Using relative path for proxy
            const res = await axios.post('/contact', formData);
            
            if (res.status === 200) {
                setStatus('Message sent successfully!');
                setIsSubmitted(true);
                setFormData({ name: '', email: '', message: '' }); 
            } else {
                setStatus('Failed to send message. Please try again.');
            }
        } catch (error) {
            setStatus(error.response?.data?.message || 'Failed to send message. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // Helper for input focus styles
    const handleInputFocus = (e) => e.target.style.borderColor = '#00d4ff';
    const handleInputBlur = (e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';

    return (
        <div style={styles.wrapper}>
            <Helmet>
                <title>Contact Us | PeerNotez</title>
            </Helmet>
            
            <header style={styles.header}>
                <h1 style={styles.title}>Get In Touch</h1>
                <p style={styles.subtitle}>
                    Have a question, feedback, or just want to say hello? We'd love to hear from you. We're here to help!
                </p>
            </header>

            <div style={styles.mainContent}>
                {/* --- Contact Info Column --- */}
                <section style={styles.sectionCard}>
                    <h2 style={{fontSize: '2rem', color: '#fff', marginBottom: '2rem'}}>Contact Channels</h2>
                    
                    <div style={styles.infoItem}>
                        <div style={styles.iconBox}><FaEnvelope /></div>
                        <div>
                            <h3 style={styles.infoTitle}>Email Support</h3>
                            <p style={styles.infoText}>For general inquiries & support:</p>
                            <a href="mailto:aadiwrld01@gmail.com" style={styles.link}>aadiwrld01@gmail.com</a>
                        </div>
                    </div>

                    <div style={styles.infoItem}>
                        <div style={{...styles.iconBox, color: '#ff00cc', background: 'rgba(255, 0, 204, 0.1)', boxShadow: '0 0 15px rgba(255, 0, 204, 0.2)'}}><FaMapMarkerAlt /></div>
                        <div>
                            <h3 style={styles.infoTitle}>Headquarters</h3>
                            <address style={{...styles.infoText, fontStyle: 'normal'}}>
                                PeerNotez HQ, Balaji Enclave<br />
                                Ghaziabad, UP, India - 201009
                            </address>
                        </div>
                    </div>

                    <div style={{...styles.infoItem, borderBottom: 'none', marginBottom: 0}}>
                        <div style={{...styles.iconBox, color: '#ffcc00', background: 'rgba(255, 204, 0, 0.1)', boxShadow: '0 0 15px rgba(255, 204, 0, 0.2)'}}><FaPhoneAlt /></div>
                        <div>
                            <h3 style={styles.infoTitle}>Phone Line</h3>
                            <p style={styles.infoText}>Mon-Fri, 9am - 6pm IST</p>
                            <a href="tel:+911234567890" style={{...styles.link, color: '#ffcc00'}}>+91 (1234) 567-890</a>
                        </div>
                    </div>
                </section>

                {/* --- Contact Form Column --- */}
                <section style={styles.sectionCard}>
                    <h2 style={{fontSize: '2rem', color: '#fff', marginBottom: '2rem'}}>Send a Message</h2>
                    
                    {isSubmitted ? (
                        <div style={styles.successBox}>
                            <FaCheckCircle style={{fontSize: '4rem', color: '#00ffaa', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 15px rgba(0, 255, 170, 0.4))'}} />
                            <h3 style={{color: '#fff', fontSize: '1.5rem', marginBottom: '1rem'}}>Message Sent!</h3>
                            <p style={styles.infoText}>Thank you for reaching out. We will get back to you shortly.</p>
                            <button 
                                onClick={() => setIsSubmitted(false)} 
                                style={{...styles.submitBtn, width: 'auto', padding: '10px 30px', margin: '2rem auto 0', background: 'rgba(255,255,255,0.1)'}}
                            >
                                Send Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="name" style={styles.formLabel}>Your Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    style={styles.input}
                                    placeholder="John Doe"
                                    required 
                                />
                            </div>
                            <div>
                                <label htmlFor="email" style={styles.formLabel}>Your Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    style={styles.input}
                                    placeholder="john@example.com"
                                    required 
                                />
                            </div>
                            <div>
                                <label htmlFor="message" style={styles.formLabel}>Message</label>
                                <textarea 
                                    id="message" 
                                    name="message" 
                                    rows="5" 
                                    value={formData.message} 
                                    onChange={handleChange} 
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    style={{...styles.input, resize: 'vertical', minHeight: '120px'}}
                                    placeholder="How can we help you today?"
                                    required
                                ></textarea>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}}
                                onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-3px)')}
                                onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                {loading ? 'Sending...' : <><FaPaperPlane /> Send Message</>}
                            </button>
                            
                            {status && !isSubmitted && (
                                <p style={{marginTop: '1rem', textAlign: 'center', color: status.includes('Failed') ? '#ff0055' : '#00d4ff'}}>
                                    {status}
                                </p>
                            )}
                        </form>
                    )}
                </section>
            </div>
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default ContactPage;
