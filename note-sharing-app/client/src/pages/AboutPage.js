import React, { useRef, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaRocket, FaUsers, FaGlobe, FaCode, FaLightbulb } from 'react-icons/fa';

const AboutPage = () => {
    // 3D Tilt State
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const heroRef = useRef(null);

    // Real Stats State
    const [stats, setStats] = useState({ totalNotes: 0, totalUsers: 0, totalDownloads: 0 });
    const [loading, setLoading] = useState(true);

    // Fetch Real Stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get('/notes/stats');
                // Assuming the API returns totalNotes, totalUsers, downloadsThisMonth (or totalDownloads if available)
                setStats({
                    totalNotes: data.totalNotes || 0,
                    totalUsers: data.totalUsers || 0,
                    totalDownloads: data.downloadsThisMonth || 0 // Using monthly downloads as proxy for activity
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // --- INTERNAL CSS: HOLOGRAPHIC ABOUT PAGE ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            overflowX: 'hidden'
        },
        header: {
            textAlign: 'center',
            marginBottom: '5rem',
            padding: '4rem 1rem',
            perspective: '1000px'
        },
        title: {
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            display: 'inline-block',
            transition: 'transform 0.1s ease-out'
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
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '3rem',
            marginBottom: '4rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        },
        sectionHeading: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        text: {
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.8,
            fontSize: '1.05rem',
            marginBottom: '1.5rem'
        },
        devProfileContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '2rem',
            textAlign: 'center'
        },
        devImage: {
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid #00d4ff',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
            marginBottom: '1rem'
        },
        devName: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '0.5rem'
        },
        devRole: {
            color: '#ff00cc',
            fontWeight: '600',
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
        },
        card: {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem',
            transition: 'transform 0.3s'
        },
        timeline: {
            position: 'relative',
            borderLeft: '2px solid rgba(0, 212, 255, 0.3)',
            paddingLeft: '2rem',
            marginLeft: '1rem'
        },
        timelineItem: {
            marginBottom: '2.5rem',
            position: 'relative'
        },
        timelineDot: {
            position: 'absolute',
            left: '-2.6rem',
            top: '0',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#00d4ff',
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
        },
        timelineYear: {
            fontSize: '1.2rem',
            fontWeight: '800',
            color: '#ff00cc',
            marginBottom: '0.5rem',
            display: 'block'
        },
        ctaBtn: {
            display: 'inline-block',
            padding: '14px 40px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '1.2rem',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
            transition: 'transform 0.3s',
            marginTop: '2rem'
        },
        statNumber: {
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(to bottom, #fff, #a0a0a0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
        }
    };

    // 3D Tilt Logic
    const handleMouseMove = (e) => {
        if (!heroRef.current) return;
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 25;
        const y = -(e.clientY - top - height / 2) / 25;
        setTilt({ x, y });
    };
    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    return (
        <div style={styles.wrapper}>
            <Helmet>
                <title>About PeerNotez | Mission, Vision, and Community</title>
                <meta 
                    name="description" 
                    content="Learn about PeerNotez's mission to provide free, high-quality academic resources and study materials. We are the leading community-driven note sharing platform, empowering student success globally. Discover our story and mission." 
                />
                <meta name="keywords" content="note sharing platform, academic resources, study materials, student community, free notes, PeerNotez mission, online learning" />
                <link rel="canonical" href="https://peernotez.netlify.app/about" />
            </Helmet>
            
            {/* Header with Tilt */}
            <header 
                style={styles.header} 
                ref={heroRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <h1 style={{
                    ...styles.title,
                    transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
                }}>
                    Our Story, Our Mission
                </h1>
                <p style={styles.subtitle}>PeerNotez: Empowering students through shared knowledge, built with passion and purpose.</p>
            </header>

            {/* Solo Endeavor Section with Developer Photo */}
            <section style={styles.glassSection}>
                <div style={styles.glowBar}></div>
                
                <h2 style={{...styles.sectionHeading, justifyContent: 'center', marginBottom: '2.5rem'}}>
                    <FaCode style={{color: '#00d4ff'}} /> Behind the Code
                </h2>

                <div style={styles.devProfileContainer}>
                    {/* Placeholder image: Replace 'developer.jpg' in your public/images folder */}
                    <img 
                        src="/images/developer.jpg" 
                        alt="Aditya Choudhary" 
                        style={styles.devImage} 
                        onError={(e) => {e.target.src = 'https://res.cloudinary.com/dmtnonxtt/image/upload/v1770372018/ffls1v2ohyjhc67ikdpe.png'}}
                    />
                    <div style={styles.devName}>Aditya Choudhary</div>
                    <div style={styles.devRole}>Lead Developer & Founder</div>
                </div>

                <div style={styles.text}>
                    <p style={{marginBottom: '1rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 1rem'}}>
                        PeerNotez is a project of passion, built from the ground up with a strong belief in the power of open education. My journey began with a simple frustration: the difficulty of finding and sharing reliable study materials.
                    </p>
                    <p style={{textAlign: 'center', maxWidth: '800px', margin: '0 auto'}}>
                        I handle everything from the front-end design and user experience to the back-end infrastructure and database management. This hands-on approach ensures that every feature is meticulously crafted with the end-user in mind.
                    </p>
                </div>
            </section>
            
            {/* Mission & Philosophy */}
            <section style={styles.glassSection}>
                <h2 style={styles.sectionHeading}><FaLightbulb style={{color: '#ffcc00'}} /> Our Mission and Philosophy</h2>
                <p style={styles.text}>
                    Our mission at PeerNotez is to create a collaborative, open, and accessible platform where students can freely share and discover academic resources. We believe education should be a community effort.
                </p>
                
                <div style={styles.grid}>
                    <div style={styles.card}>
                        <h3 style={{color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <FaUsers style={{color: '#ff00cc'}} /> Community First
                        </h3>
                        <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem'}}>Built on trust and mutual respect. We empower users to ensure a safe, helpful environment.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={{color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <FaGlobe style={{color: '#00d4ff'}} /> Open Access
                        </h3>
                        <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem'}}>Committed to keeping core features free. Study materials should never be behind a paywall.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={{color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <FaRocket style={{color: '#ffaa00'}} /> Evolving Platform
                        </h3>
                        <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem'}}>The platform is never "finished." I am dedicated to constantly adding new features based on user feedback.</p>
                    </div>
                </div>
            </section>

            {/* Timeline - Refined */}
            <section style={styles.glassSection}>
                <h2 style={styles.sectionHeading}>The Journey</h2>
                <div style={{marginTop: '2rem'}}>
                    <div style={styles.timeline}>
                        <div style={styles.timelineItem}>
                            <div style={styles.timelineDot}></div>
                            <span style={styles.timelineYear}>2024</span>
                            <p style={styles.text}>Official Launch. The platform opens to students globally, focusing on core note-sharing features.</p>
                        </div>
                        <div style={styles.timelineItem}>
                            <div style={styles.timelineDot}></div>
                            <span style={styles.timelineYear}>2025</span>
                            <p style={styles.text}>Expansion & Community Growth. Introduced peer ratings, blog insights, and reached significant user milestones.</p>
                        </div>
                        <div style={styles.timelineItem}>
                            <div style={{...styles.timelineDot, background: '#ff00cc', boxShadow: '0 0 15px #ff00cc'}}></div>
                            <span style={styles.timelineYear}>Future</span>
                            <p style={styles.text}>Developing AI-driven study aids, mobile apps, and deeper integration with university curriculums.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Real Stats Section */}
            <section style={{marginBottom: '4rem'}}>
                <h2 style={{...styles.sectionHeading, justifyContent: 'center', marginBottom: '3rem'}}>Our Impact</h2>
                <div style={styles.grid}>
                    <div style={{...styles.card, textAlign: 'center'}}>
                        <div style={styles.statNumber}>
                            {loading ? "..." : stats.totalUsers.toLocaleString()}
                        </div>
                        <p style={{color: '#00d4ff'}}>Active Users</p>
                    </div>
                    <div style={{...styles.card, textAlign: 'center'}}>
                        <div style={styles.statNumber}>
                            {loading ? "..." : stats.totalNotes.toLocaleString()}
                        </div>
                        <p style={{color: '#ff00cc'}}>Notes Shared</p>
                    </div>
                    <div style={{...styles.card, textAlign: 'center'}}>
                        {/* Assuming a static number for Universities as it's not in the simple stats API yet */}
                        <div style={styles.statNumber}>5+</div>
                        <p style={{color: '#ffaa00'}}>Universities</p>
                    </div>
                    <div style={{...styles.card, textAlign: 'center'}}>
                        <div style={styles.statNumber}>
                            {loading ? "..." : stats.totalDownloads.toLocaleString()}
                        </div>
                        <p style={{color: '#00ffaa'}}>Monthly Downloads</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{textAlign: 'center', padding: '3rem', background: 'rgba(0,0,0,0.2)', borderRadius: '24px'}}>
                <h2 style={{fontSize: '2.5rem', marginBottom: '1rem', color: '#fff'}}>Join the Movement</h2>
                <p style={{fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto'}}>
                    The journey of PeerNotez is just beginning. Whether you're looking for study materials or want to share your hard work, this is the place for you.
                </p>
                <Link 
                    to="/signup" 
                    style={styles.ctaBtn}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    Get Started Now <FaRocket style={{marginLeft: '10px'}} />
                </Link>
            </section>
        </div>
    );
};

export default AboutPage;
