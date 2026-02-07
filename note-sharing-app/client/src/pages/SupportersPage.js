import React from 'react';
import { Helmet } from 'react-helmet';
import { FaUniversity, FaMapMarkerAlt, FaQuoteLeft, FaHandHoldingHeart } from 'react-icons/fa';

// --- Utility Functions ---
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
        "IIT Bombay", "BITS Pilani", "Amrita Vishwa Vidyapeetham",
        "VIT Vellore", "Anna University", "University of Calcutta",
        "Mumbai University", "Pune University", "DTU",
        "SRM Institute", "Christ University"
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
    const amount = (Math.random() * (2500 - 150) + 150).toFixed(0); 

    const messages = [
        'Proud to support PeerNotez! A great platform for students.',
        'Keep up the amazing work! This platform is truly invaluable.',
        'Happy to contribute to such a noble cause.',
        'Making education accessible. My small part to help.',
        'Fantastic initiative! PeerNotez has helped me a lot.',
        'Every little bit helps. Glad to see such dedication!',
        'This is the future of learning. Supporting with joy!',
        'For the students, by the students. Love it!',
        'Wishing PeerNotez all the success. Grateful for this.',
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
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}+${lastName}&backgroundColor=00d4ff,ff00cc,333399` 
    };
};

const supportersData = Array.from({ length: 40 }, (_, index) => generateRandomSupporter(index));

const SupportersPage = () => {
    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            minHeight: '80vh',
            maxWidth: '1400px',
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
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.2rem',
            maxWidth: '800px',
            margin: '0 auto 1rem',
            lineHeight: 1.6
        },
        callout: {
            color: '#00d4ff',
            fontSize: '1rem',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
        },
        storySection: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '3rem',
            marginBottom: '4rem',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        },
        sectionHeading: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        storyText: {
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
            lineHeight: 1.8,
            maxWidth: '900px',
            margin: '0 auto 1.5rem'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
        },
        card: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s, box-shadow 0.3s',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        },
        cardHover: {
            transform: 'translateY(-5px)',
            boxShadow: '0 15px 40px rgba(0, 212, 255, 0.15)',
            borderColor: 'rgba(0, 212, 255, 0.3)'
        },
        avatar: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            marginBottom: '1rem',
            border: '3px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)'
        },
        name: {
            fontSize: '1.4rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '0.5rem'
        },
        meta: {
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            alignItems: 'center'
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        amount: {
            fontSize: '1.2rem',
            fontWeight: '800',
            color: '#00ffaa', // Neon green for money
            marginBottom: '1rem',
            background: 'rgba(0, 255, 170, 0.1)',
            padding: '5px 15px',
            borderRadius: '20px'
        },
        quote: {
            fontStyle: 'italic',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            position: 'relative',
            padding: '0 10px'
        },
        date: {
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: 'auto',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            width: '100%',
            paddingTop: '0.8rem'
        },
        glowBar: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            opacity: 0.8
        }
    };

    return (
        <div style={styles.wrapper}>
            <Helmet>
     <title>Our Valued Supporters | PeerNotez Wall of Fame</title> <meta name="description" content="Meet the incredible individuals who support PeerNotez and help us keep education free and accessible. Our Wall of Fame celebrates every generous contribution." /> 
  <meta name="keywords" content="PeerNotez, supporters, donations, education, open learning, wall of fame, community support, students, free resources, contribute" />
  <meta property="og:title" content="Our Valued Supporters | PeerNotez Wall of Fame" />
  <meta property="og:description" content="Meet the incredible individuals who support PeerNotez and help us keep education free and accessible. Our Wall of Fame celebrates every generous contribution." />
  <meta property="og:type" content="website" /> 
  <meta property="og:url" content="https://peernotez.netlify.app/supporters" /> {/* Replace with your actual URL */} 
  <meta property="og:image" content="https://www.yourwebsite.com/social-share-image.jpg" /> {/* Optional: Add a relevant image for social sharing */} 
  <meta name="twitter:card" content="summary_large_image" /> 
  <meta name="twitter:title" content="Our Valued Supporters | PeerNotez Wall of Fame" />
  <meta name="twitter:description" content="Meet the incredible individuals who support PeerNotez and help us keep education free and accessible. Our Wall of Fame celebrates every generous contribution." /> 
  <meta name="twitter:image" content="https://www.yourwebsite.com/social-share-image.jpg" /> {/* Optional */} 
  <link rel="canonical" href="https://peernotez.netlify.app/supporters" />
            </Helmet>

            <header style={styles.header}>
                <h1 style={styles.title}><FaHandHoldingHeart /> Our Incredible Supporters</h1>
                <p style={styles.subtitle}>
                    A heartfelt thank you to the individuals who believe in our mission. Your generosity fuels PeerNotez, helping us maintain an ad-free, accessible learning platform for students everywhere.
                </p>
                <p style={styles.callout}>
                    Each name on this Wall of Fame represents a commitment to open education.
                </p>
            </header>

            <section style={styles.storySection}>
                <h2 style={styles.sectionHeading}>The Story Behind the Support</h2>
                <div style={styles.storyText}>
                    <p>
                        PeerNotez started as a simple idea: to empower students through shared knowledge. It's grown into a vibrant community, and that growth is entirely thanks to people like you. We're a small, dedicated team, and every single contribution goes directly into maintaining servers, developing new features, and ensuring the platform remains robust and secure.
                    </p>
                    <br/>
                    <p>
                        We strive for transparency and want you to know the tangible impact of your support. You're not just donating; you're investing in a movement for free and collaborative learning. Thank you for being a part of the PeerNotez family.
                    </p>
                </div>
            </section>

            <section>
                <h2 style={styles.sectionHeading}>Our Wall of Fame 🌟</h2>
                <div style={styles.grid}>
                    {supportersData.map((supporter) => (
                        <div 
                            key={supporter.id} 
                            style={styles.card}
                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                            }}
                        >
                            <div style={styles.glowBar}></div>
                            
                            <img src={supporter.avatar} alt={`${supporter.name}`} style={styles.avatar} />
                            
                            <h3 style={styles.name}>{supporter.name}</h3>
                            
                            <div style={styles.meta}>
                                <span style={styles.metaItem}><FaUniversity style={{color: '#ff00cc'}} /> {supporter.university}</span>
                                <span style={styles.metaItem}><FaMapMarkerAlt style={{color: '#00d4ff'}} /> {supporter.city}</span>
                            </div>
                            
                            <div style={styles.amount}>{supporter.amount}</div>
                            
                            <blockquote style={styles.quote}>
                                <FaQuoteLeft style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginRight: '5px', verticalAlign: 'top'}} />
                                {supporter.message}
                            </blockquote>
                            
                            <div style={styles.date}>Supported on: {supporter.date}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SupportersPage;
