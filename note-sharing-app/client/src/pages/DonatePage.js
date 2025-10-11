import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const DonatePage = () => {
    const bmacProfileUrl = "https://cdn.buymeacoffee.com/uploads/profile_pictures/2025/07/ZzlkIXLPpwCOJfAo.jpg@300w_0e.webp";
    const bmacLink = "https://coff.ee/adityachoudhary";
    const hasSupporters = true;

    return (
        <div className="donate-page-wrapper">
            <Helmet>
                <title>Support PeerNotez | Help Us Grow</title>
            </Helmet>

            <header className="donate-hero-section">
                <h1 className="hero-title">Fuel Our Mission. Stay Independent.</h1>
                <p className="hero-subtitle">Your support helps keep PeerNotez a **free and powerful tool** for students worldwide. Every contribution is an investment in ad-free education.</p>
            </header>

            <section className="donate-intro-section">
                <p>
                    PeerNotez is a labor of love, a passion project born from a desire to make education more accessible. I believe that students deserve a platform built for them, without the distractions of ads or the limitations of paywalls. Your contribution is more than just a transaction; it's an investment in a global community of learners.
                </p>
                <p>
                    From the very first line of code, this platform has been designed to serve you. Your generous support is what allows us to continue this mission, empowering students and fostering a collaborative spirit around the world.
                </p>
            </section>
            
            <hr className="divider" /> {/* Added Divider */}

            <section className="donate-impact-section">
                <h2 className="section-heading">Your Support Goes a Long Way</h2>
                <div className="impact-cards-container">
                    <div className="impact-card">
                        <i className="fas fa-server impact-icon"></i>
                        <h3>Server Infrastructure</h3>
                        <p>Keeps the platform online, secure, and blazing fast for thousands of students, 24/7. **Our biggest cost.**</p>
                    </div>
                    <div className="impact-card">
                        <i className="fas fa-magic impact-icon"></i>
                        <h3>Next-Gen Features</h3>
                        <p>Funds the research and development of innovative tools, from AI search to collaborative features.</p>
                    </div>
                    <div className="impact-card">
                        <i className="fas fa-shield-alt impact-icon"></i>
                        <h3>Security & Maintenance</h3>
                        <p>Helps us maintain the platform, fix bugs, and implement security updates to protect your data.</p>
                    </div>
                    <div className="impact-card">
                        <i className="fas fa-ad impact-icon" style={{color: 'var(--success-color)'}}></i> {/* Changed icon to 'fa-ad' for emphasis */}
                        <h3>Ad-Free Forever</h3>
                        <p>Ensures a distraction-free learning environment by keeping our platform completely free of ads.</p>
                    </div>
                </div>
            </section>

            <hr className="divider" /> {/* Added Divider */}

            <section className="donate-methods-section">
                <h2 className="section-heading">Support PeerNotez Globally</h2>
                <div className="methods-cards-container single-method-focus"> {/* Added class for centering */}
                    
                    {/* UPI Card content REMOVED and replaced with a focused Buy Me a Coffee card */}
                    
                    <div className="method-card bmac-card focused-card"> {/* Added class for focus styling */}
                        <div className="card-header">
                            <i className="fas fa-mug-hot icon"></i>
                            <h3>Buy Me a Coffee</h3>
                        </div>
                        <p className="card-description">
                            The fastest, most flexible, and secure way to donate from anywhere in the world using your card or PayPal. **One-time or Monthly.**
                        </p>
                        <div className="bmac-profile large-profile">
                            <img src={bmacProfileUrl} alt="Aditya Choudhary" className="bmac-profile-img" />
                            <div className="bmac-profile-text">
                                <span className="profile-name">Aditya Choudhary</span>
                                <span className="profile-tagline">Creator & Developer of PeerNotez</span>
                            </div>
                        </div>
                        <a href={bmacLink} target="_blank" rel="noopener noreferrer" className="bmac-button large-button">
                            <i className="fas fa-coffee" style={{marginRight: '0.5rem'}}></i> Buy me a coffee
                        </a>
                        <p className="extra-info">Your small contribution covers a part of the platform's infrastructure costs for a day.</p>
                    </div>
                </div>
            </section>

            <hr className="divider" /> {/* Added Divider */}

            <section className="donate-community-section">
                <h2 className="section-heading">Join the Community of Supporters</h2>
                <p className="community-cta-text">
                    Your support is deeply appreciated. Donors are permanently featured on our **Wall of Fame** to honor their contribution in building a better learning platform for all. Thank you for being a part of this journey.
                </p>
                <div className="cta-buttons-container">
                    {hasSupporters ? (
                        <Link to="/supporters" className="main-cta-button">See Our Wall of Fame ✨</Link>
                    ) : (
                        <button disabled className="main-cta-button disabled">Be the First to Support! 🥇</button>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DonatePage;    

