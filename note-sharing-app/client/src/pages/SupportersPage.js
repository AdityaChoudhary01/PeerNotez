/* src/pages/SupportersPage.js */

import React from 'react';
import { Helmet } from 'react-helmet';
import { FaUniversity, FaMapMarkerAlt, FaQuoteLeft, FaHandHoldingHeart, FaStar } from 'react-icons/fa';

// --- Utility Functions (Preserved Functionality) ---
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
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}+${lastName}&backgroundColor=00f2fe,b388ff,ff0080` 
    };
};

const supportersData = Array.from({ length: 40 }, (_, index) => generateRandomSupporter(index));

const SupportersPage = () => {
    // --- MODERN STYLES ---
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
            fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
            fontWeight: '900',
            fontFamily: 'var(--font-display)',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            lineHeight: 1.1
        },
        subtitle: {
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            maxWidth: '850px',
            margin: '0 auto 1.5rem',
            lineHeight: 1.6,
            fontFamily: 'var(--font-primary)'
        },
        callout: {
            color: 'var(--neon-blue)',
            fontSize: '0.9rem',
            fontWeight: '700',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        storySection: {
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--glass-border)',
            padding: 'clamp(1.5rem, 5vw, 4rem)',
            marginBottom: '5rem',
            textAlign: 'center',
            boxShadow: 'var(--glass-shadow)',
            position: 'relative',
            overflow: 'hidden'
        },
        sectionHeading: {
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: '800',
            fontFamily: 'var(--font-display)',
            color: '#fff',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
        },
        storyText: {
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            lineHeight: 1.8,
            maxWidth: '1000px',
            margin: '0 auto'
        },
        grid: {
            display: 'grid',
            // Default: 2 columns for mobile, 3 for tablets, 4 for desktops
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'clamp(0.75rem, 2vw, 2rem)'
        },
        card: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--glass-border)',
            padding: 'clamp(1rem, 3vw, 2rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        },
        avatar: {
            width: 'clamp(50px, 10vw, 90px)',
            height: 'clamp(50px, 10vw, 90px)',
            borderRadius: '50%',
            marginBottom: '1rem',
            border: '3px solid var(--glass-border)',
            boxShadow: '0 8px 15px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.3s ease'
        },
        name: {
            fontSize: 'clamp(0.9rem, 2.5vw, 1.4rem)',
            fontWeight: '800',
            fontFamily: 'var(--font-display)',
            color: '#fff',
            marginBottom: '0.5rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%'
        },
        meta: {
            fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            alignItems: 'center',
            width: '100%'
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        amount: {
            fontSize: 'clamp(0.9rem, 2.5vw, 1.25rem)',
            fontWeight: '900',
            color: 'var(--neon-green)',
            marginBottom: '1rem',
            background: 'rgba(0, 255, 159, 0.1)',
            padding: '4px 12px',
            borderRadius: '50px',
            border: '1px solid rgba(0, 255, 159, 0.2)',
            fontFamily: 'var(--font-accent)'
        },
        quote: {
            fontStyle: 'italic',
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '1.5rem',
            fontSize: 'clamp(0.75rem, 1.8vw, 1rem)',
            position: 'relative',
            padding: '0 5px',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
        },
        date: {
            fontSize: 'clamp(0.65rem, 1.2vw, 0.8rem)',
            color: 'rgba(255, 255, 255, 0.35)',
            marginTop: 'auto',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            width: '100%',
            paddingTop: '0.8rem',
            fontFamily: 'var(--font-primary)'
        },
        glowBar: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'var(--gradient-primary)',
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
                <h1 style={styles.title} className="fade-in">
                    <FaHandHoldingHeart style={{color: 'var(--neon-pink)'}} /> Wall of Fame
                </h1>
                <p style={styles.subtitle}>
                    A heartfelt tribute to the visionaries who fuel the open education movement. Your generosity keeps PeerNotez independent, ad-free, and thriving.
                </p>
                <p style={styles.callout}>
                    <FaStar /> Empowering {supportersData.length}+ Global Learners <FaStar />
                </p>
            </header>

            <section style={styles.storySection} className="scale-in">
                {/* Decorative Aurora Background */}
                <div style={{
                    position: 'absolute', top: '-50%', left: '-20%', width: '140%', height: '200%',
                    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 50%)',
                    zIndex: -1, pointerEvents: 'none'
                }} />

                <h2 style={styles.sectionHeading}>The Mission We Share</h2>
                <div style={styles.storyText}>
                    <p>
                        PeerNotez was founded on a singular belief: <strong>knowledge should be a shared human right, not a commodity.</strong> Every server update, security patch, and new feature is made possible by this community.
                    </p>
                    <br/>
                    <p>
                        When you donate, you aren't just paying for hosting; you are providing a student in an underserved region with a free textbook alternative. You are giving a researcher the tools to collaborate. <strong>Thank you for being the foundation of PeerNotez.</strong>
                    </p>
                </div>
            </section>

            <section>
                <h2 style={styles.sectionHeading}>Latest Supporters 🌟</h2>
                <div style={styles.grid} className="supporters-grid">
                    {supportersData.map((supporter) => (
                        <div 
                            key={supporter.id} 
                            style={styles.card}
                            className="supporter-card holo-card"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                e.currentTarget.style.borderColor = 'var(--neon-blue)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                            }}
                        >
                            <div style={styles.glowBar}></div>
                            
                            <img src={supporter.avatar} alt={supporter.name} style={styles.avatar} />
                            
                            <h3 style={styles.name}>{supporter.name}</h3>
                            
                            <div style={styles.meta}>
                                <span style={styles.metaItem} title={supporter.university}>
                                    <FaUniversity style={{color: 'var(--neon-purple)'}} /> {supporter.university}
                                </span>
                                <span style={styles.metaItem}>
                                    <FaMapMarkerAlt style={{color: 'var(--neon-blue)'}} /> {supporter.city}
                                </span>
                            </div>
                            
                            <div style={styles.amount}>{supporter.amount}</div>
                            
                            <blockquote style={styles.quote}>
                                <FaQuoteLeft style={{fontSize: '0.7rem', color: 'var(--neon-blue)', marginRight: '5px', opacity: 0.5}} />
                                {supporter.message}
                            </blockquote>
                            
                            <div style={styles.date}>Member since {supporter.date}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Inline Media Queries for further grid control */}
            <style>{`
                @media (min-width: 900px) {
                    .supporters-grid {
                        grid-template-columns: repeat(3, 1fr) !important;
                    }
                }
                @media (min-width: 1200px) {
                    .supporters-grid {
                        grid-template-columns: repeat(4, 1fr) !important;
                    }
                }
                .supporter-card:hover h3 {
                    background: var(--gradient-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                    @media (max-width: 600px) {
                    .container {
                        padding: 0 15px !important;
                    }
                        h1 {
                        font-size: 2.5rem !important;
                    }
                    p {
                        font-size: 1.1rem !important;
                    }

                }
            `}</style>
        </div>
    );
};

export default SupportersPage;
