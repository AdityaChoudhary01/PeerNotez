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
            border: '1px solid rgba(255, 255, 255, 0.05)'
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
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
        }
    };

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                // Changed to relative path to use the proxy (same as other components)
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
        <div style={styles.section}>
            <h3 style={styles.title}>
                <FaCompass style={styles.icon} /> Read Next
            </h3>
            
            <div style={styles.grid}>
                {blogs.map(blog => (
                    <BlogCard key={blog._id} blog={blog} />
                ))}
            </div>
        </div>
    );
};

export default RelatedBlogs;
