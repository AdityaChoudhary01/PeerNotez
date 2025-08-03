import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const DonatePage = () => {
    // You would replace this with a URL to your actual QR code image
    const upiQRCodeUrl = 'https://res.cloudinary.com/dmtnonxtt/image/upload/v1752488580/GooglePay_QR_xtgkh4.png'; // Example QR Code

    return (
        <div className="content-page donate-page">
            <Helmet>
                <title>Support PeerNotez | Help Us Grow</title>
            </Helmet>

            <h1>Support PeerNotez: Your Contribution Makes a Difference</h1>
            
            <section className="donate-intro">
                <p>
                    PeerNotez is a passion project dedicated to helping students learn and share knowledge freely. If you find our platform useful, please consider supporting us. Your contribution, no matter the size, makes a huge difference!
                </p>
            </section>

            <section>
                <h2>How Your Support Helps PeerNotez</h2>
                <div className="support-grid">
                    <div className="support-item">
                        <h3>🌐 Server Costs</h3>
                        <p>Keeps the website online, fast, and accessible to everyone 24/7.</p>
                    </div>
                    <div className="support-item">
                        <h3>💡 New Features</h3>
                        <p>Allows for the development of new tools and improvements to the platform.</p>
                    </div>
                    <div className="support-item">
                        <h3>🚫 Ad-Free Experience</h3>
                        <p>Ensures the platform remains clean, focused, and free of advertisements.</p>
                    </div>
                </div>
            </section>

            <section className="donation-methods">
                <h2>Ways to Contribute</h2>
                <div className="donation-cards-row">
                  <div className="donation-card">
                      <h3>UPI (for users in India)</h3>
                      <p>Scan the QR code with any UPI app like Google Pay, PhonePe, or Paytm.</p>
                      <div className="qr-code-wrapper">
                         <img src={upiQRCodeUrl} alt="PeerNotez UPI QR Code" className="qr-code-img" />
                      </div>
                      <p><strong>UPI ID:</strong>adityanain55@oksbi</p>
                  </div>
                  <div className="donation-card">
                      <h3>Buy Me a Coffee</h3>
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.2rem'}}>
                          <img src="https://cdn.buymeacoffee.com/uploads/profile_pictures/2025/07/ZzlkIXLPpwCOJfAo.jpg@300w_0e.webp" alt="Aditya Choudhary" style={{width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.5rem', border: '2px solid #ffdd00'}} />
                          <div style={{fontWeight: 'bold', color: '#ffdd00', fontSize: '1.1rem'}}>Aditya Choudhary</div>
                          <div style={{color: '#a0a0c0', fontSize: '0.95rem', marginBottom: '0.5rem', textAlign: 'center'}}>Support my work and help keep NoteShare ad-free!</div>
                      </div>
                      <p>A simple and secure way to show your support using a card or other payment methods.</p>
                      <a href="https://coff.ee/adityachoudhary" target="_blank" rel="noopener noreferrer" className="bmac-button">
                          ☕ Buy Me a Coffee
                      </a>
                  </div>
                </div>
                <p>
                    <Link to="/">Return to the Peernotez homepage</Link>
                </p>
            </section>
        </div>
    );
};

export default DonatePage;
