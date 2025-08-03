import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom'; // Assuming you use react-router-dom

const AboutPage = () => {
    return (
        <div className="content-page">
            <Helmet>
                <title>About PeerNotez | Mission, Vision, and Community</title>
            </Helmet>
            
            <h1>About PeerNotez</h1>
            
            <section>
                <h2>Our Mission</h2>
                <p>
                    Our mission at PeerNotez is to create a collaborative, open, and accessible platform where students can freely share and discover academic resources. We believe that education should be a community effort, and by sharing knowledge, we can all learn and grow together.
                </p>
                <p>
                    Learn more about what we do on the <Link to="/" className="linktag">Peernotez homepage</Link>.
                </p>
            </section>

            <section>
                <h2>What We Offer</h2>
                <ul>
                    <li><strong>Easy Uploads:</strong> Quickly upload your notes, documents, and study guides in various formats.</li>
                    <li><strong>Global Search:</strong> A powerful search bar to find notes by subject, university, course, or title.</li>
                    <li><strong>Online Previews:</strong> View PDFs, Office documents, and images directly in your browser on any device.</li>
                    <li><strong>Community Driven:</strong> All content is uploaded by students, for students.</li>
                </ul>
            </section>

            <section>
                <h2>Join Our Community</h2>
                <p>
                    Whether you're looking for study materials for an upcoming exam or want to share your hard work with others, PeerNotez is the place for you. Create an account to start uploading your notes today!
                </p>
            </section>
        </div>
    );
};

export default AboutPage;

