import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ReactMarkdown from 'react-markdown';
import useAuth from '../hooks/useAuth';
import { FaFeatherAlt } from 'react-icons/fa';

const PostBlogPage = ({ existingBlog = null, onBlogUpdated = () => {}, onClose = () => {} }) => {
    const isEditing = !!existingBlog;
    const [formData, setFormData] = useState({
        title: existingBlog?.title || '',
        summary: existingBlog?.summary || '',
        content: existingBlog?.content || '',
        slug: existingBlog?.slug || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'title' && !isEditing) {
            // Auto-generate slug from title for new posts
            const newSlug = value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
            setFormData(prev => ({ ...prev, slug: newSlug }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const url = isEditing ? `/blogs/${existingBlog._id}` : '/blogs';
        const method = isEditing ? axios.put : axios.post;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await method(url, formData, config);
            
            alert(`Blog post ${isEditing ? 'updated' : 'created'} successfully!`);
            
            if (isEditing) {
                onBlogUpdated(data); 
                onClose(); // Close the modal upon update
            } else {
                // Navigate to the newly created public URL (which *is* SEO optimized)
                navigate(`/blogs/${data.slug}`);
            }
        } catch (err) {
            console.error('Blog submission failed', err);
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} blog.`);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Render Logic ---
    return (
        <div className="content-page">
             <Helmet>
                <title>{isEditing ? 'Edit Post' : 'New Post'} | PeerNotez Blog</title>
            </Helmet>
            
            <form onSubmit={handleSubmit} className="upload-form blog-post-form">
                <h2><FaFeatherAlt /> {isEditing ? 'Edit Blog Post' : 'Write a New Blog Post'}</h2>
                {error && <p className="error-message">{error}</p>}
                
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} placeholder="The Ultimate Guide to..." required />
                </div>
                
                <div className="form-group">
                    <label htmlFor="summary">Summary (Short Intro for Listing)</label>
                    <textarea id="summary" name="summary" value={formData.summary} onChange={handleChange} placeholder="A brief, enticing summary..." rows="2" required />
                </div>
                
                <div className="form-group">
                    <label htmlFor="slug">URL Slug (e.g., my-ultimate-guide)</label>
                    <input id="slug" name="slug" type="text" value={formData.slug} onChange={handleChange} placeholder="auto-generated from title" required />
                </div>

                <div className="form-group form-group-content">
                    <label htmlFor="content">Content (Supports Markdown)</label>
                    <textarea id="content" name="content" value={formData.content} onChange={handleChange} placeholder="Write your article content here using Markdown..." rows="15" required />
                </div>
                
                <div className="blog-preview-container">
                    <h3>Content Preview (Markdown Rendered)</h3>
                    <div className="markdown-preview-box markdown-content">
                         <ReactMarkdown>{formData.content || "Your Markdown preview will appear here."}</ReactMarkdown>
                    </div>
                </div>

                <div className="modal-actions" style={{justifyContent: 'center', marginTop: '2.5rem'}}>
                    <button type="submit" disabled={loading} className="blog-submit-btn">
                        {loading ? (isEditing ? 'Saving...' : 'Publishing...') : (isEditing ? 'Save Changes' : 'Publish Blog')}
                    </button>
                    {isEditing && (
                         <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default PostBlogPage;
