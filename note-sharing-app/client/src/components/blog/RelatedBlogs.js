import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BlogCard from './BlogCard';

const RelatedBlogs = ({ currentBlogId }) => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                // Use full URL
                const { data } = await axios.get(`https://peernotez.onrender.com/api/blogs/related/${currentBlogId}`);
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
        <div className="related-blogs-section" style={{ marginTop: '3rem', marginBottom: '2rem' }}>
            <h3 style={{ 
                color: 'var(--text-color)', 
                marginBottom: '1.5rem',
                borderBottom: '2px solid var(--primary-color)',
                paddingBottom: '0.5rem',
                display: 'inline-block'
            }}>
                Read Next
            </h3>
            
            <div className="blog-posts-grid">
                {blogs.map(blog => (
                    <BlogCard key={blog._id} blog={blog} />
                ))}
            </div>
        </div>
    );
};

export default RelatedBlogs;
