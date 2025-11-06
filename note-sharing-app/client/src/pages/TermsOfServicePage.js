// client/src/pages/TermsOfServicePage.js
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FaBookReader } from 'react-icons/fa';

const TermsOfServicePage = () => {
    return (
        <div className="content-page terms-of-service-wrapper">
            <Helmet>
                <title>Terms of Service | PeerNotez</title>
                <meta name="description" content="The official Terms of Service and User Agreement for PeerNotez." />
<link rel="canonical" href="https://peernotez.netlify.app/terms" />

            </Helmet>
            
            <header className="about-header">
                <h1 style={{borderBottom: 'none'}}>
                    <FaBookReader style={{color: 'var(--primary-color)'}} /> Terms of Service
                </h1>
                <p className="subtitle">
                    Last Updated: October 16, 2025. This document is a legal agreement between you and PeerNotez.
                </p>
            </header>

            <section className="about-section primary-section">
                <h2 className="section-heading">1. Acceptance of Terms</h2>
                <div className="section-content">
                    <p>
                        By accessing or using the PeerNotez website and mobile application (the "Service"), you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and our <Link to="/dmca" style={{color: 'var(--warning-color)'}}>DMCA Policy</Link>. If you disagree with any part of the terms, you may not access the Service.
                    </p>
                </div>
            </section>
            
            <hr />

            <section className="about-section secondary-section">
                <h2 className="section-heading">2. User-Generated Content & Copyright</h2>
                <div className="section-content">
                    <p>
                        The Service allows you to upload, post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content").
                    </p>
                    <h3>Your Warranties to Us:</h3>
                    <ul className="core-principles-list">
                        <li>You warrant that you own the intellectual property rights to the Content you post or that you have the right to grant us the license set forth below.</li>
                        <li>You warrant that the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.</li>
                    </ul>

                    <h3>Content We Prohibit:</h3>
                    <ul className="core-principles-list">
                        <li>**Copyright Infringement:** Any material copied directly from a textbook, published work, or official test bank without explicit permission.</li>
                        <li>Content that is defamatory, obscene, or unlawful.</li>
                    </ul>
                    <p style={{marginTop: '1.5rem', color: 'var(--error-color)', fontWeight: 'bold'}}>
                        **Liability Shift (Indemnification):** You agree to defend, indemnify, and hold harmless PeerNotez from any claims, damages, obligations, losses, liabilities, costs or debt, and expenses arising from any claim that your Content infringed the rights of a third party.
                    </p>
                </div>
            </section>

            <hr />

            <section className="about-section tertiary-section">
                <h2 className="section-heading">3. Termination and Governing Law</h2>
                <div className="section-content">
                    <h3>Termination</h3>
                    <p>
                        We may terminate or suspend your account immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms, particularly the **Repeat Infringer Policy**.
                    </p>
                    <h3>Governing Law</h3>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of **India**, without regard to its conflict of law provisions.
                    </p>
                </div>
            </section>
        </div>
    );
};


export default TermsOfServicePage;

