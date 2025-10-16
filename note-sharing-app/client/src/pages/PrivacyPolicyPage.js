// client/src/pages/PrivacyPolicyPage.js
import React from 'react';
import { Helmet } from 'react-helmet';
import { FaLock, FaUserShield, FaEnvelopeOpenText } from 'react-icons/fa';

const PrivacyPolicyPage = () => {
    const contactEmail = "aadiwrld01@gmail.com"; 

    return (
        <div className="content-page privacy-policy-wrapper">
            <Helmet>
                <title>Privacy Policy | PeerNotez</title>
                <meta name="description" content="PeerNotez's official privacy policy, detailing how we collect, use, and protect your personal data." />
            </Helmet>
            
            <header className="about-header">
                <h1 style={{borderBottom: 'none'}}>
                    <FaLock style={{color: '#1abc9c'}} /> Privacy Policy
                </h1>
                <p className="subtitle">
                    Last Updated: October 16, 2025. Your data security is our priority.
                </p>
            </header>

            <section className="about-section primary-section">
                <h2 className="section-heading">1. Data Collection and Purpose</h2>
                <div className="section-content">
                    <p>
                        We, PeerNotez, act as the **Data Fiduciary** and collect personal data only when necessary to provide our Service (lawful purpose).
                    </p>
                    
                    <h3><FaUserShield /> Personal Data We Collect:</h3>
                    <ul className="core-principles-list">
                        <li>
                            <strong>User Provided Data:</strong> Name, Email Address, Hashed Password, and Profile Avatar (collected during sign-up or profile update).
                        </li>
                        <li>
                            <strong>Service Data:</strong> Notes/Blogs/Reviews/Comments uploaded (this content is public, but associated with your ID), Followed/Saved Notes lists (private).
                        </li>
                        <li>
                            <strong>Technical Data:</strong> IP address and device identifier (collected automatically for security, logging, and performance analysis).
                        </li>
                    </ul>

                    <h3 style={{marginTop: '2rem'}}>Purpose of Processing:</h3>
                    <p>
                        The collected data is used exclusively to: **(1)** Create and manage your account and profile. **(2)** Enable core service functionality (uploading, viewing, following). **(3)** Communicate with you regarding service updates or security alerts. **(4)** Maintain service security and comply with legal obligations.
                    </p>
                </div>
            </section>
            
            <hr />

            <section className="about-section secondary-section">
                <h2 className="section-heading">2. Data Storage, Security, and Third Parties</h2>
                <div className="section-content">
                    <p>
                        We implement reasonable safeguards to prevent unauthorized access, loss, or misuse of your data.
                    </p>
                    
                    <h3>Security Measures:</h3>
                    <ul className="core-principles-list">
                        <li>Passwords are stored using strong, one-way **hashing** (encryption).</li>
                        <li>Data is stored only for the duration necessary to serve the stated purpose.</li>
                    </ul>

                    <h3>Third-Party Sharing:</h3>
                    <p>
                        We do not sell or rent your personal data. We share data only with service providers necessary for platform operation:
                    </p>
                    <ul className="core-principles-list">
                        <li>
                            <strong>Cloudinary:</strong> Used for storing note files and profile avatars securely.
                        </li>
                        <li>
                            <strong>MongoDB (via Mongoose/Atlas):</strong> Used for storing user metadata, content indices, and other database information.
                        </li>
                    </ul>
                </div>
            </section>

            <hr />

            <section className="about-section tertiary-section">
                <h2 className="section-heading">3. Your Rights as a Data Principal</h2>
                <div className="section-content">
                    <p>
                        Under the DPDP Act and global regulations, you have several rights regarding your data. To exercise any of these rights, please contact us via the email below.
                    </p>
                    
                    <h3>User Rights (Data Principal Rights):</h3>
                    <ul className="core-principles-list">
                        <li>
                            **Right to Access:** You may request access to the personal data we hold about you.
                        </li>
                        <li>
                            **Right to Rectification/Correction:** You have the right to correct inaccurate or incomplete data (e.g., updating your name/email via your profile).
                        </li>
                        <li>
                            **Right to Erasure (Right to be Forgotten):** You may request the deletion of your account and all associated personal data (subject to legal retention requirements).
                        </li>
                        <li>
                            **Right to Withdraw Consent:** You may withdraw your consent for future data processing at any time (e.g., by deleting your account).
                        </li>
                    </ul>
                </div>
            </section>
            
            <hr />

            <section className="about-section cta-section">
                <h2 className="section-heading">Contact Us</h2>
                <div className="section-content">
                    <p>
                        If you have questions about this policy or wish to exercise your rights, please contact us:
                    </p>
                    <div className="stat-card" style={{maxWidth: '400px', margin: '2rem auto', background: 'var(--input-background)', border: '1px solid #1abc9c'}}>
                        <h3 style={{color: '#1abc9c', marginBottom: '0.5rem'}}>
                            <FaEnvelopeOpenText /> Privacy Contact
                        </h3>
                        <p><strong>Email:</strong> <a href={`mailto:${contactEmail}`} style={{color: 'var(--warning-color)'}}>{contactEmail}</a></p>
                    </div>
                </div>
            </section>
        </div>
    );
};


export default PrivacyPolicyPage;
