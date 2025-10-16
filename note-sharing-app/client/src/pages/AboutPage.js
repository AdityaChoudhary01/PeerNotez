import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    return (
        <div className="about-page-wrapper">
            <Helmet>
                <title>PeerNotez: About Our Free Note Sharing Platform & Academic Resources</title>
                <meta 
                    name="description" 
                    content="Learn about PeerNotez's mission to provide free, high-quality academic resources and study materials. We are the leading community-driven note sharing platform, empowering student success globally. Discover our story and mission." 
                />
                <meta name="keywords" content="note sharing platform, academic resources, study materials, student community, free notes, PeerNotez mission, online learning" />
                <link rel="canonical" href="https://www.peernotez.com/about" />
            </Helmet>
            
            <header className="about-header">
                {/* H1 should be the primary statement of the page's value */}
                <h1>PeerNotez: Your Free Global Academic Resources & Note Sharing Platform</h1>
                <p className="subtitle">Empowering student success through shared knowledge, built with passion and dedication.</p>
            </header>

            <section className="about-section primary-section">
                {/* H2 should target secondary keywords: "Behind the Code" and "Solo Development" */}
                <h2 className="section-heading">Behind the Code: The Solo Journey of Building a Free Note Sharing Platform</h2>
                <div className="section-content">
                    <p>
                        PeerNotez is a labor of passion, built from the ground up by a single developer with a strong belief in the power of open education. My journey began with a simple frustration: the difficulty of finding and sharing reliable **study materials** and **academic resources** online. I envisioned a platform that was intuitive, **community-driven**, and **free for all** students. This project is my answer to that problem, a testament to what a single developer can achieve with dedication and a clear vision.
                    </p>
                    <p>
                        I handle everything from the front-end design and user experience to the back-end infrastructure and database management. This meticulous approach ensures that every feature is crafted with the end-user in mind, focusing on simplicity, performance, and accessibility, making PeerNotez the premier **note sharing platform** it is today.
                    </p>
                </div>
            </section>
            
            <hr />

            <section className="about-section secondary-section">
                <h2 className="section-heading">Our Mission and Core Philosophy</h2>
                <div className="section-content">
                    <p>
                        Our mission at PeerNotez is simple: to create a collaborative, open, and accessible platform where students can freely share and discover high-quality **academic resources**. We believe education should be a community effort, and by sharing knowledge, we can all learn and grow together. Our goal is to break down financial barriers to learning and foster a global **student community**.
                    </p>
                    <h3>Core Principles of PeerNotez:</h3>
                    <ul className="core-principles-list">
                        <li>
                            <strong>Community First:</strong> We are built on trust and mutual respect. We empower users to govern the platform and ensure a safe, helpful environment for everyone seeking **study materials**.
                        </li>
                        <li>
                            <strong>Open & Free Access:</strong> We are committed to keeping all essential **note sharing** features free for every user. Access to crucial resources should never be behind a paywall.
                        </li>
                        <li>
                            <strong>Continuous Improvement:</strong> The platform is never "finished." I am dedicated to a dynamic and evolving product, constantly adding new features and refining the **note sharing platform** based on user feedback.
                        </li>
                    </ul>
                </div>
            </section>

            <hr />

            <section className="about-section tertiary-section">
                <h2 className="section-heading">The PeerNotez Journey: A Timeline of Growth</h2>
                <div className="section-content">
                    <ul className="timeline-list">
                        <li>
                            <strong>2021:</strong> The concept is born. I write the very first lines of code, setting the foundation for what will become the **PeerNotez note sharing service**.
                        </li>
                        <li>
                            <strong>2022:</strong> Alpha launch. A small group of university students provides valuable feedback, validating the platform's core idea.
                        </li>
                        <li>
                            <strong>2023:</strong> Public beta. The platform opens to the public, introducing online **academic resource previews** and expanding to dozens of universities.
                        </li>
                        <li>
                            <strong>2024:</strong> Official V1.0 launch. We celebrate our first 10,000 users and debut advanced search and peer-rating systems.
                        </li>
                        <li>
                            <strong>2025:</strong> Milestone Achieved. PeerNotez grows to a **community of over 100,000 students**, with notes from thousands of institutions worldwide.
                        </li>
                    </ul>
                </div>
            </section>
            
            <hr />

            <section className="about-section stats-section">
                <h2 className="section-heading">Our Impact: By the Numbers</h2>
                <div className="stats-container">
                    <div className="stat-card">
                        <h3>100,000+</h3>
                        <p>Active Users</p>
                    </div>
                    <div className="stat-card">
                        <h3>50,000+</h3>
                        <p>Academic Resources Shared</p>
                    </div>
                    <div className="stat-card">
                        <h3>1,000+</h3>
                        <p>Universities Represented</p>
                    </div>
                    <div className="stat-card">
                        <h3>2,000,000+</h3>
                        <p>Study Materials Downloads</p>
                    </div>
                </div>
            </section>

            <hr />

            <section className="about-section cta-section">
                <h2 className="section-heading">Ready to Find Your Next Study Materials?</h2>
                <div className="section-content">
                    <p>
                        The journey of PeerNotez is just beginning. Every new user and every shared note contributes to a growing global library of knowledge.
                    </p>
                    <p>
                        Whether you're looking for **academic resources** or want to share your hard work, PeerNotez is the ultimate **note sharing platform** for you.
                    </p>
                    <Link to="/signup" className="call-to-action-link">Join the PeerNotez Student Community Today</Link>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
