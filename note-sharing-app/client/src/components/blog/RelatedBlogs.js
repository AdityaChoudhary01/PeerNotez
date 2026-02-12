import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BlogCard from './BlogCard';
import { FaCompass, FaSpinner } from 'react-icons/fa';

const RelatedBlogs = ({ currentBlogId }) => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- INTERNAL CSS: DEEP SPACE HOLOGRAPHIC THEME ---
    const styles = {
        section: {
            marginTop: '4rem',
            marginBottom: '4rem',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: '700',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem',
            fontFamily: "'Space Grotesk', sans-serif"
        },
        icon: {
            color: '#00d4ff',
            filter: 'drop-shadow(0 0 5px rgba(0, 212, 255, 0.5))',
            fontSize: '1.6rem'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
        },
        loadingContainer: {
            display: 'flex',
            justifyContent: 'center',
            padding: '3rem',
            color: '#00d4ff'
        }
    };

    useEffect(() => {
        const fetchRelated = async () => {
            if (!currentBlogId) return;
            setLoading(true);
            try {
                const { data } = await axios.get(`/blogs/related/${currentBlogId}`);
                setBlogs(data);
            } catch (error) {
                console.error('Error fetching related blogs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [currentBlogId]);

    // SEO & UX: Handle loading state or empty results
    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <FaSpinner className="fa-spin" size={30} />
            </div>
        );
    }

    if (blogs.length === 0) return null;

    return (
        <section style={styles.section} className="related-blogs-section" aria-labelledby="related-blogs-title">
            <h3 style={styles.title} id="related-blogs-title">
                <FaCompass style={styles.icon} aria-hidden="true" /> Read Next
            </h3>
            
            <div className="related-blogs-grid" style={styles.grid}>
                {blogs.map(blog => (
                    <article key={blog._id} className="related-blog-card-wrapper">
                        {/* BlogCard now internally calculates 'readingTime' 
                           based on 'blog.content' using the WPM logic 
                        */}
                        <BlogCard blog={blog} />
                    </article>
                ))}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .related-blogs-section {
                        padding: 1.5rem 1rem !important;
                        background: transparent !important;
                        border: none !important;
                        box-shadow: none !important;
                        backdrop-filter: none !important;
                    }
                    
                    .related-blogs-grid {
                        display: flex !important;
                        overflow-x: auto;
                        scroll-snap-type: x mandatory;
                        gap: 1rem !important;
                        padding-bottom: 1.5rem;
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: thin;
                    }

                    .related-blogs-grid::-webkit-scrollbar {
                        height: 4px;
                    }
                    .related-blogs-grid::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.05);
                        border-radius: 10px;
                    }
                    .related-blogs-grid::-webkit-scrollbar-thumb {
                        background: linear-gradient(90deg, #00d4ff, #ff00cc);
                        border-radius: 10px;
                    }

                    .related-blog-card-wrapper {
                        flex: 0 0 85%;
                        scroll-snap-align: center;
                        min-width: 280px;
                    }
                }
            `}</style>
        </section>
    );
};

export default RelatedBlogs;
