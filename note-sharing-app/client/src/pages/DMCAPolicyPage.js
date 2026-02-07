import React from 'react';
import { Helmet } from 'react-helmet';
import { FaShieldAlt, FaGavel, FaEnvelope, FaExclamationTriangle, FaFileContract, FaCheckCircle } from 'react-icons/fa';

const DMCAPolicyPage = () => {
    // --- Compliance Data ---
    const designatedAgentEmail = "aadiwrld01@gmail.com"; 
    const takedownDeadline = "36 hours"; 

    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
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
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
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
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.6
        },
        glassSection: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '3rem',
            marginBottom: '3rem',
            position: 'relative',
            overflow: 'hidden'
        },
        sectionHeading: {
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem'
        },
        text: {
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.8,
            fontSize: '1.05rem',
            marginBottom: '1rem'
        },
        agentCard: {
            background: 'rgba(0, 212, 255, 0.05)',
            border: '1px solid #00d4ff',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '2rem auto'
        },
        emailLink: {
            color: '#ff00cc',
            fontWeight: '700',
            fontSize: '1.2rem',
            textDecoration: 'none',
            display: 'block',
            marginTop: '0.5rem'
        },
        list: {
            listStyle: 'none',
            padding: 0
        },
        listItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '1rem',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1rem',
            background: 'rgba(255,255,255,0.02)',
            padding: '10px',
            borderRadius: '8px'
        },
        warningBox: {
            background: 'rgba(255, 0, 85, 0.1)',
            borderLeft: '4px solid #ff0055',
            padding: '1.5rem',
            borderRadius: '0 12px 12px 0',
            marginTop: '2rem'
        }
    };

    return (
        <div style={styles.wrapper}>
            <Helmet>
                <title>DMCA & Copyright Policy | PeerNotez</title>
                <meta name="robots" content="noindex, follow" />
                <meta name="description" content="PeerNotez's official policy for handling copyright infringement claims." />
            </Helmet>
            
            <header style={styles.header}>
                <h1 style={styles.title}>
                    <FaShieldAlt style={{color: '#00d4ff'}} /> Copyright & Takedown
                </h1>
                <p style={styles.subtitle}>
                    Protecting intellectual property and complying with global laws (DMCA & Indian IT Act, Sec 79).
                </p>
            </header>

            <section style={styles.glassSection}>
                <h2 style={styles.sectionHeading}><FaGavel style={{color: '#ffcc00'}} /> 1. Intermediary Liability & Safe Harbor</h2>
                <div style={styles.text}>
                    <p>
                        PeerNotez operates as an Online Service Provider (OSP) or Intermediary, hosting content uploaded by our users. We claim "Safe Harbor" protection under the US Digital Millennium Copyright Act (DMCA) and <strong>Section 79 of the Indian IT Act, 2000</strong>.
                    </p>
                    <p>
                        This means we are not liable for user-uploaded content, provided we respond to infringement notices efficiently and disable access to infringing material upon valid notification.
                    </p>
                </div>
            </section>
            
            <section style={styles.glassSection}>
                <h2 style={styles.sectionHeading}><FaEnvelope style={{color: '#00d4ff'}} /> 2. Designated Agent</h2>
                <div style={styles.text}>
                    <p style={{textAlign: 'center'}}>
                        To file a formal notice of copyright infringement, please contact our Designated Copyright Agent who is authorized to receive and act upon Takedown Notices:
                    </p>
                    <div style={styles.agentCard}>
                        <h3 style={{color: '#fff', marginBottom: '0.5rem'}}>Designated Agent Contact</h3>
                        <p style={{color: 'rgba(255,255,255,0.6)', marginBottom: '0'}}>Please email your takedown request to:</p>
                        <a href={`mailto:${designatedAgentEmail}`} style={styles.emailLink}>{designatedAgentEmail}</a>
                    </div>
                </div>
            </section>

            <section style={styles.glassSection}>
                <h2 style={styles.sectionHeading}><FaFileContract style={{color: '#ff00cc'}} /> 3. Notice and Takedown Procedure</h2>
                
                

                <div style={styles.text}>
                    <p>
                        Upon receiving a valid copyright complaint, we are legally required to remove or disable access to the allegedly infringing material within <strong>{takedownDeadline}</strong> (as per Indian IT Rules & Copyright Rules).
                    </p>
                    
                    <h3 style={{color: '#fff', marginTop: '2rem', marginBottom: '1rem'}}>Required Information for a Valid Notice:</h3>
                    <ul style={styles.list}>
                        <li style={styles.listItem}>
                            <FaCheckCircle style={{color: '#00ffaa', minWidth: '20px', marginTop: '4px'}} /> 
                            A physical or electronic signature of the copyright owner or authorized agent.
                        </li>
                        <li style={styles.listItem}>
                            <FaCheckCircle style={{color: '#00ffaa', minWidth: '20px', marginTop: '4px'}} /> 
                            Identification of the copyrighted work claimed to have been infringed.
                        </li>
                        <li style={styles.listItem}>
                            <FaCheckCircle style={{color: '#00ffaa', minWidth: '20px', marginTop: '4px'}} /> 
                            <strong>Exact URL</strong> or location of the infringing material on PeerNotez.
                        </li>
                        <li style={styles.listItem}>
                            <FaCheckCircle style={{color: '#00ffaa', minWidth: '20px', marginTop: '4px'}} /> 
                            Contact information (Address, Phone, Email) of the complaining party.
                        </li>
                        <li style={styles.listItem}>
                            <FaCheckCircle style={{color: '#00ffaa', minWidth: '20px', marginTop: '4px'}} /> 
                            A statement of good faith belief that the use is not authorized by the copyright owner.
                        </li>
                    </ul>
                </div>
            </section>

            <section style={{...styles.glassSection, borderColor: 'rgba(255, 0, 85, 0.3)'}}>
                <h2 style={styles.sectionHeading}><FaExclamationTriangle style={{color: '#ff0055'}} /> 4. Repeat Infringer Policy</h2>
                <div style={styles.text}>
                    <p>
                        In compliance with global standards, we adopt a <strong>Zero Tolerance Policy</strong> for repeat infringers.
                    </p>
                    <div style={styles.warningBox}>
                        <strong style={{color: '#ff0055', display: 'block', marginBottom: '0.5rem'}}>Account Termination Warning:</strong>
                        Users who receive multiple valid copyright complaints against their account will face permanent account suspension and deletion of all uploaded content.
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DMCAPolicyPage;
