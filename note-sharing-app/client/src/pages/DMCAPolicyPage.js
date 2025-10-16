// client/src/pages/DMCAPolicyPage.js
import React from 'react';
import { Helmet } from 'react-helmet';
import { FaShieldAlt, FaTrashAlt } from 'react-icons/fa';

const DMCAPolicyPage = () => {
    // --- Compliance Data ---
    const designatedAgentEmail = "aadiwrld01@gmail.com"; // Placeholder - Use your dedicated email
    const takedownDeadline = "36 hours"; 

    return (
        <div className="content-page dmca-policy-wrapper">
            <Helmet>
                <title>DMCA & Copyright Policy | PeerNotez</title>
                <meta name="description" content="PeerNotez's official policy for handling copyright infringement claims (DMCA and Indian IT Act compliance)." />
            </Helmet>
            
            <header className="about-header">
                <h1 style={{borderBottom: 'none'}}>
                    <FaShieldAlt style={{color: 'var(--primary-color)'}} /> Copyright & Takedown Policy
                </h1>
                <p className="subtitle">
                    Protecting intellectual property and complying with global laws (DMCA & Indian IT Act, Sec 79).
                </p>
            </header>

            <section className="about-section primary-section">
                <h2 className="section-heading">1. Intermediary Liability & Safe Harbor</h2>
                <div className="section-content">
                    <p>
                        PeerNotez operates as an Online Service Provider (OSP) or Intermediary, hosting content uploaded by our users. We claim "Safe Harbor" protection under the US Digital Millennium Copyright Act (DMCA) and **Section 79 of the Indian IT Act, 2000**.
                    </p>
                    <p>
                        This means we are not liable for user-uploaded content, provided we respond to infringement notices efficiently.
                    </p>
                </div>
            </section>
            
            <hr />

            <section className="about-section secondary-section">
                <h2 className="section-heading">2. Designated Agent for Takedown Notices</h2>
                <div className="section-content">
                    <p>
                        To file a formal notice of copyright infringement, please contact our Designated Copyright Agent, who is authorized to receive and act upon Takedown Notices:
                    </p>
                    <div className="stat-card" style={{maxWidth: '400px', margin: '2rem auto', background: 'var(--input-background)', border: '1px solid var(--primary-color)'}}>
                        <h3 style={{color: 'var(--primary-color)', marginBottom: '0.5rem'}}>Designated Agent Contact</h3>
                        <p><strong>Email:</strong> <a href={`mailto:${designatedAgentEmail}`} style={{color: 'var(--warning-color)'}}>{designatedAgentEmail}</a></p>
                        <p style={{fontSize: '0.9rem', color: 'var(--subtle-text-color)'}}>Please ensure your notice is legally sufficient (see Point 3).</p>
                    </div>
                </div>
            </section>

            <hr />

            <section className="about-section tertiary-section">
                <h2 className="section-heading">3. Notice and Takedown Procedure</h2>
                <div className="section-content">
                    <h3 style={{color: 'var(--primary-color)'}}>Takedown Requirement:</h3>
                    <p>
                        Upon receiving a valid copyright complaint, we are legally required to remove or disable access to the allegedly infringing material within **{takedownDeadline}** (as per Indian IT Rules & Copyright Rules).
                    </p>
                    
                    <h3 style={{color: 'var(--warning-color)'}}>Required Information for a Valid Notice:</h3>
                    <ul className="core-principles-list">
                        <li><FaTrashAlt style={{marginRight: '0.5rem', color: 'var(--error-color)'}} /> A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.</li>
                        <li><FaTrashAlt style={{marginRight: '0.5rem', color: 'var(--error-color)'}} /> Identification of the copyrighted work claimed to have been infringed.</li>
                        <li><FaTrashAlt style={{marginRight: '0.5rem', color: 'var(--error-color)'}} /> Identification of the material on our platform (e.g., **The exact URL** on PeerNotez).</li>
                        <li><FaTrashAlt style={{marginRight: '0.5rem', color: 'var(--error-color)'}} /> Contact information for the complaining party.</li>
                        <li><FaTrashAlt style={{marginRight: '0.5rem', color: 'var(--error-color)'}} /> A statement that the information in the notice is accurate, made **under penalty of perjury**.</li>
                    </ul>
                </div>
            </section>

            <hr />

            <section className="about-section cta-section">
                <h2 className="section-heading">4. Repeat Infringer Policy</h2>
                <div className="section-content">
                    <p>
                        In compliance with global standards, we adopt a **Zero Tolerance Policy** for repeat infringers. Users who receive multiple valid copyright complaints against their account will face permanent account suspension.
                    </p>
                </div>
            </section>
        </div>
    );
};


export default DMCAPolicyPage;
