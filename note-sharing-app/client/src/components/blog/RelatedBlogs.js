import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BlogCard from './BlogCard';
import { FaCompass } from 'react-icons/fa';

const RelatedBlogs = ({ currentBlogId }) => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- INTERNAL CSS: HOLOGRAPHIC STYLE ---
    const styles = {
        section: {
            marginTop: '4rem',
            marginBottom: '4rem',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden' // Ensure scrollbar doesn't break container
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem'
        },
        icon: {
            color: '#00d4ff', // Cyan accent
            filter: 'drop-shadow(0 0 5px rgba(0, 212, 255, 0.5))'
        },
        // DEFAULT GRID (Desktop)
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
        }
    };

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const { data } = await axios.get(`/blogs/related/${currentBlogId}`);
                setBlogs(data);
            } catch (error) {
                console.error('Error fetching related blogs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (currentBlogId) {
            fetchRelated();
        }
    }, [currentBlogId]);

    if (loading || blogs.length === 0) return null;

    return (
        <div style={styles.section} className="related-blogs-section">
            <h3 style={styles.title}>
                <FaCompass style={styles.icon} /> Read Next
            </h3>
            
            <div className="related-blogs-grid" style={styles.grid}>
                {blogs.map(blog => (
                    <div key={blog._id} className="related-blog-card-wrapper">
                        <BlogCard blog={blog} />
                    </div>
                ))}
            </div>

            <style>{`
                /* MOBILE: Horizontal Scroll Snap */
                @media (max-width: 768px) {
                    .related-blogs-section {
                        padding: 1.5rem 1rem !important; /* Reduce padding */
                    }
                    
                    .related-blogs-grid {
                        display: flex !important; /* Override grid */
                        overflow-x: auto;
                        scroll-snap-type: x mandatory;
                        gap: 1rem !important;
                        padding-bottom: 1rem; /* Space for scrollbar */
                        -webkit-overflow-scrolling: touch;
                    }

                    /* Hide scrollbar for cleaner look (optional, remove if you want scrollbar) */
                    .related-blogs-grid::-webkit-scrollbar {
                        height: 6px;
                    }
                    .related-blogs-grid::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.05);
                        border-radius: 3px;
                    }
                    .related-blogs-grid::-webkit-scrollbar-thumb {
                        background: rgba(255,255,255,0.2);
                        border-radius: 3px;
                    }

                    .related-blog-card-wrapper {
                        flex: 0 0 85%; /* Show 85% of card to hint at scrolling */
                        scroll-snap-align: center;
                        min-width: 280px; /* Ensure cards don't get too small */
                    }
                }
            `}</style>
        </div>
    );
};

export default RelatedBlogs;
