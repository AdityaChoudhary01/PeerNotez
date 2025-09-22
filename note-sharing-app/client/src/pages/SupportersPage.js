import React from 'react';
import { Helmet } from 'react-helmet';

// --- Utility Functions (Keep as is) ---
const getRandomDate = () => {
  const now = new Date();
  const past = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const randomDate = new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
  return randomDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getRandomUniversity = () => {
    const universities = [
        "Jawaharlal Nehru University", "Indian Institute of Science", "University of Delhi",
        "Banaras Hindu University", "Jamia Millia Islamia", "University of Hyderabad",
        "Aligarh Muslim University", "Manipal Academy of Higher Education",
        "Indian Institute of Technology Bombay", "BITS Pilani", "Amrita Vishwa Vidyapeetham",
        "Vellore Institute of Technology", "Anna University", "University of Calcutta",
        "Mumbai University", "Pune University", "Delhi Technological University",
        "SRM Institute of Science and Technology", "VIT University", "Christ University"
    ];
    return universities[Math.floor(Math.random() * universities.length)];
};

const generateRandomSupporter = (id) => {
    const maleNames = ['Aditya', 'Aarav', 'Advik', 'Arjun', 'Dhruv', 'Gaurav', 'Harsh', 'Kabir', 'Rohan', 'Vihaan', 'Aryan', 'Ishaan', 'Kian', 'Pranav', 'Reyansh'];
    const femaleNames = ['Ananya', 'Aaradhya', 'Avani', 'Ishika', 'Kavya', 'Meera', 'Priya', 'Riya', 'Saanvi', 'Yuvika', 'Disha', 'Jiya', 'Myra', 'Siya', 'Zara'];
    const lastNames = ['Sharma', 'Verma', 'Singh', 'Gupta', 'Patel', 'Das', 'Joshi', 'Choudhary', 'Rao', 'Reddy', 'Kumar', 'Mehta', 'Shah', 'Khan', 'Malhotra'];
    const cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow', 'Surat', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal'];

    const isMale = Math.random() > 0.5;
    const firstName = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const amount = (Math.random() * (2500 - 150) + 150).toFixed(0); // Increased range for variety

    const messages = [
        'Proud to support PeerNotez! A great platform for students.',
        'Keep up the amazing work! This platform is truly invaluable.',
        'Happy to contribute to such a noble cause. Thank you for this service!',
        'Making education accessible. My small part to help the community.',
        'Fantastic initiative! PeerNotez has helped me a lot.',
        'Every little bit helps. Glad to see such dedication!',
        'This is the future of learning. Supporting with joy!',
        'For the students, by the students. Love it!',
        'Wishing PeerNotez all the success. Grateful for this platform.',
        'A big thank you to the creator. Your efforts are appreciated!',
    ];

    return {
        id,
        name: `${firstName} ${lastName}`,
        amount: `₹${amount}`,
        date: getRandomDate(),
        university: getRandomUniversity(),
        city: cities[Math.floor(Math.random() * cities.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}+${lastName}` // Dynamic avatars
    };
};

const supportersData = Array.from({ length: 40 }, (_, index) => generateRandomSupporter(index)); // Increased number of supporters

const SupportersPage = () => {
    return (
        <div className="supporters-page-wrapper">
            <Helmet>
                <title>Our Valued Supporters | PeerNotez Wall of Fame</title>
                <meta name="description" content="Meet the incredible individuals who support PeerNotez and help us keep education free and accessible. Our Wall of Fame celebrates every generous contribution." />
                <meta name="keywords" content="PeerNotez, supporters, donations, education, open learning, wall of fame, community support, students, free resources, contribute" />
                <meta property="og:title" content="Our Valued Supporters | PeerNotez Wall of Fame" />
                <meta property="og:description" content="Meet the incredible individuals who support PeerNotez and help us keep education free and accessible. Our Wall of Fame celebrates every generous contribution." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.yourwebsite.com/supporters" /> {/* Replace with your actual URL */}
                <meta property="og:image" content="https://www.yourwebsite.com/social-share-image.jpg" /> {/* Optional: Add a relevant image for social sharing */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Our Valued Supporters | PeerNotez Wall of Fame" />
                <meta name="twitter:description" content="Meet the incredible individuals who support PeerNotez and help us keep education free and accessible. Our Wall of Fame celebrates every generous contribution." />
                <meta name="twitter:image" content="https://www.yourwebsite.com/social-share-image.jpg" /> {/* Optional */}
            </Helmet>

            <header className="page-header">
                <h1 className="header-title">Our Incredible Supporters</h1>
                <p className="header-subtitle">
                    A heartfelt thank you to the individuals who believe in our mission. Your generosity fuels PeerNotez, helping us maintain an ad-free, accessible learning platform for students everywhere.
                </p>
                <p className="header-callout">
                    Each name on this Wall of Fame represents a commitment to open education and a brighter future for learners.
                </p>
            </header>

            <section className="supporters-story-section">
                <h2 className="section-heading">The Story Behind the Support</h2>
                <div className="story-content">
                    <p>
                        PeerNotez started as a simple idea: to empower students through shared knowledge. It's grown into a vibrant community, and that growth is entirely thanks to people like you. We're a small, dedicated team, and every single contribution goes directly into maintaining servers, developing new features, and ensuring the platform remains robust and secure.
                    </p>
                    <p>
                        We strive for transparency and want you to know the tangible impact of your support. You're not just donating; you're investing in a movement for free and collaborative learning. Thank you for being a part of the PeerNotez family.
                    </p>
                </div>
            </section>

            <section className="supporters-wall-section">
                <h2 className="section-heading">Our Wall of Fame 🌟</h2>
                <p className="section-description">
                    Join us in celebrating these amazing individuals who have contributed to the PeerNotez mission. Their support makes all the difference!
                </p>
                <div className="supporters-grid">
                    {supportersData.map((supporter) => (
                        <div key={supporter.id} className="supporter-card">
                            <div className="supporter-avatar-container">
                                <img src={supporter.avatar} alt={`${supporter.name} avatar`} className="supporter-avatar" />
                            </div>
                            <div className="supporter-info">
                                <h3 className="supporter-name">{supporter.name}</h3>
                                <p className="supporter-details">
                                    <span className="detail-item university">{supporter.university}</span>
                                    <span className="detail-item city">{supporter.city}</span>
                                </p>
                                <p className="supporter-amount">Contributed: <strong>{supporter.amount}</strong></p>
                                <blockquote className="supporter-message">
                                    "{supporter.message}"
                                </blockquote>
                                <span className="supporter-date">Supported on: {supporter.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SupportersPage;
