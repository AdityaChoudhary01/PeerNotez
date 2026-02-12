// client/src/pages/PrivacyPolicyPage.js
import React from 'react';
import { Helmet } from 'react-helmet';
import { FaLock, FaUserShield, FaEnvelopeOpenText, FaUserCheck, FaShieldAlt } from 'react-icons/fa'; // Removed FaServer

const PrivacyPolicyPage = () => {
    const contactEmail = "aadiwrld01@gmail.com"; 

    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            minHeight: '80vh',
            maxWidth: '1000px',
            margin: '0 auto',
            paddingLeft: '1rem',
            paddingRight: '1rem'
        },
        header: {
            textAlign: 'center',
            marginBottom: '4rem',
            position: 'relative'
        },
        title: {
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px'
        },
        subtitle: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.1rem',
            maxWidth: '600px',
            margin: '0 auto'
        },
        sectionCard: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '3rem',
            marginBottom: '3rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        },
        sectionHeading: {
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '1rem'
        },
        subHeading: {
            fontSize: '1.3rem',
            fontWeight: '600',
            color: '#00d4ff', // Cyan accent
            marginTop: '2rem',
            marginBottom: '1rem'
        },
        paragraph: {
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.8,
            marginBottom: '1rem',
            fontSize: '1rem'
        },
        list: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        listItem: {
            background: 'rgba(255, 255, 255, 0.02)',
            borderLeft: '3px solid #ff00cc', // Pink accent
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '0 12px 12px 0',
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: 1.6
        },
        highlight: {
            color: '#fff',
            fontWeight: '700'
        },
        contactCard: {
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(51, 51, 153, 0.2))',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            marginTop: '2rem'
        },
        emailLink: {
            color: '#ff00cc',
            fontWeight: '700',
            textDecoration: 'none',
            fontSize: '1.2rem',
            transition: 'color 0.2s'
        }
    };

    return (
        <div className='wrapper' style={styles.wrapper}>
            <Helmet>
                <title>Privacy Policy | PeerNotez</title>
                <meta name="description" content="PeerNotez's official privacy policy, detailing how we collect, use, and protect your personal data." />
                <link rel="canonical" href="https://peernotez.netlify.app/privacy" />
            </Helmet>
            
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.title}>
                    <FaLock /> Privacy Policy
                </h1>
                <p style={styles.subtitle}>
                    Last Updated: October 16, 2025.<br/>Your data security is our priority.
                </p>
            </header>

            {/* Section 1: Data Collection */}
            <section className='section-card' style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaUserShield style={{color: '#00ffaa'}} /> 1. Data Collection and Purpose</h2>
                
                <p style={styles.paragraph}>
                    We, PeerNotez, act as the <span style={styles.highlight}>Data Fiduciary</span> and collect personal data only when necessary to provide our Service (lawful purpose).
                </p>
                
                <h3 style={styles.subHeading}>Personal Data We Collect:</h3>
                <ul style={styles.list}>
                    <li style={styles.listItem}>
                        <span style={styles.highlight}>User Provided Data:</span> Name, Email Address, Hashed Password, and Profile Avatar (collected during sign-up or profile update).
                    </li>
                    <li style={styles.listItem}>
                        <span style={styles.highlight}>Service Data:</span> Notes, Blogs, Reviews, and Comments uploaded (this content is public, but associated with your ID), as well as Followed/Saved Notes lists.
                    </li>
                    <li style={styles.listItem}>
                        <span style={styles.highlight}>Technical Data:</span> IP address and device identifier (collected automatically for security, logging, and performance analysis).
                    </li>
                </ul>

                <h3 style={styles.subHeading}>Purpose of Processing:</h3>
                <p style={styles.paragraph}>
                    The collected data is used exclusively to: <strong>(1)</strong> Create and manage your account and profile. <strong>(2)</strong> Enable core service functionality (uploading, viewing, following). <strong>(3)</strong> Communicate with you regarding service updates or security alerts. <strong>(4)</strong> Maintain service security and comply with legal obligations.
                </p>
            </section>
            
            {/* Section 2: Security */}
            <section className='section-card' style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaShieldAlt style={{color: '#ff00cc'}} /> 2. Data Storage & Security</h2>
                
                <p style={styles.paragraph}>
                    We implement reasonable safeguards to prevent unauthorized access, loss, or misuse of your data.
                </p>
                
                <h3 style={styles.subHeading}>Security Measures:</h3>
                <ul style={styles.list}>
                    <li style={styles.listItem}>Passwords are stored using strong, one-way <span style={styles.highlight}>hashing</span> (encryption).</li>
                    <li style={styles.listItem}>Data is stored only for the duration necessary to serve the stated purpose.</li>
                </ul>

                <h3 style={styles.subHeading}>Third-Party Sharing:</h3>
                <p style={styles.paragraph}>
                    We do not sell or rent your personal data. We share data only with service providers necessary for platform operation:
                </p>
                <ul style={styles.list}>
                    <li style={styles.listItem}>
                        <span style={styles.highlight}>Cloudinary:</span> Used for storing note files and profile avatars securely.
                    </li>
                    <li style={styles.listItem}>
                        <span style={styles.highlight}>MongoDB (via Mongoose/Atlas):</span> Used for storing user metadata, content indices, and other database information.
                    </li>
                </ul>
            </section>

            {/* Section 3: Rights */}
            <section className='section-card' style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaUserCheck style={{color: '#00d4ff'}} /> 3. Your Rights as a Data Principal</h2>
                
                <p style={styles.paragraph}>
                    Under the DPDP Act and global regulations, you have several rights regarding your data. To exercise any of these rights, please contact us via the email below.
                </p>
                
                <ul style={styles.list}>
                    <li style={styles.listItem}>
                        <span style={styles.highlight}>Right to Access:</span> You may request access to the personal data we hold about you.
                    </li>
                    <li style={styles.listItem}>
                        <span style={styles.highlight}>Right to Rectification:</span> You have the right to correct inaccurate or incomplete data (e.g., updating your name/email via your profile).
                    </li>
                    <li style={styles.listItem}>
                        <span style={styles.highlight}>Right to Erasure:</span> You may request the deletion of your account and all associated personal data (subject to legal retention requirements).
                    </li>
                    <li style={styles.listItem}>
                        <span style={styles.highlight}>Right to Withdraw Consent:</span> You may withdraw your consent for future data processing at any time (e.g., by deleting your account).
                    </li>
                </ul>
            </section>
            
            {/* Section 4: Contact */}
            <section style={styles.sectionCard}>
                <h2 style={styles.sectionHeading}><FaEnvelopeOpenText style={{color: '#ffdd00'}} /> Contact Us</h2>
                
                <div style={styles.contactCard}>
                    <p style={styles.paragraph}>
                        If you have questions about this policy or wish to exercise your rights, please contact us:
                    </p>
                    <a href={`mailto:${contactEmail}`} style={styles.emailLink}>
                        {contactEmail}
                    </a>
                </div>
            </section>
            <style>{`
                @media (max-width: 600px) {
                   .wrapper{
                   padding:1rem 0.1rem !important;
                   }
                   .section-card{
                   padding: 1rem !important;
                   }
                }
            `}</style>
        </div>
    );
};

export default PrivacyPolicyPage;
