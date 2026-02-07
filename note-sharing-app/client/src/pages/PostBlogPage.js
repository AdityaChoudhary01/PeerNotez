import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ReactMarkdown from 'react-markdown';
import useAuth from '../hooks/useAuth';
import { FaFeatherAlt, FaSave, FaTimes, FaLink, FaAlignLeft, FaQuoteRight } from 'react-icons/fa';

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

    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
    const styles = {
        container: {
            padding: '2rem', // Desktop padding
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: '80vh'
        },
        formCard: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '3rem', // Desktop padding
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            color: '#fff'
        },
        header: {
            textAlign: 'center',
            marginBottom: '2.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '1.5rem'
        },
        title: {
            fontSize: '2rem',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
        },
        formGroup: {
            marginBottom: '1.5rem',
            position: 'relative'
        },
        label: {
            marginBottom: '0.5rem',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.95rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        input: {
            width: '100%',
            padding: '14px',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            fontFamily: 'inherit'
        },
        textarea: {
            width: '100%',
            padding: '14px',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '100px'
        },
        previewBox: {
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            marginTop: '1rem',
            maxHeight: '400px',
            overflowY: 'auto',
            color: 'rgba(255,255,255,0.9)'
        },
        submitBtn: {
            padding: '14px 40px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            border: 'none',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
            transition: 'transform 0.2s, opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        cancelBtn: {
            padding: '14px 30px',
            borderRadius: '50px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        actions: {
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '3rem',
            flexWrap: 'wrap'
        },
        errorMsg: {
            background: 'rgba(255, 0, 85, 0.1)',
            color: '#ff0055',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 0, 85, 0.2)',
            textAlign: 'center'
        },
        helperText: {
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '5px'
        }
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'title' && !isEditing) {
            const newSlug = value.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');
            setFormData(prev => ({ ...prev, slug: newSlug }));
        }
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = '#00d4ff';
        e.target.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.2)';
    };
    
    const handleBlur = (e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.boxShadow = 'none';
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
                onClose(); 
            } else {
                navigate(`/blogs/${data.slug}`);
            }
        } catch (err) {
            console.error('Blog submission failed', err);
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} blog.`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="post-blog-container" style={styles.container}>
             <Helmet>
                <title>{isEditing ? 'Edit Post' : 'New Post'} | PeerNotez Blog</title>
            </Helmet>
            
            <form onSubmit={handleSubmit} className="post-blog-form" style={styles.formCard}>
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        <FaFeatherAlt /> {isEditing ? 'Edit Blog Post' : 'Write New Article'}
                    </h2>
                    <p style={{color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem'}}>
                        Share your knowledge with the community.
                    </p>
                </div>

                {error && <div style={styles.errorMsg}>{error}</div>}
                
                <div style={styles.formGroup}>
                    <label htmlFor="title" style={styles.label}>
                        <FaQuoteRight style={{color: '#00d4ff'}} /> Title
                    </label>
                    <input 
                        id="title" 
                        name="title" 
                        type="text" 
                        value={formData.title} 
                        onChange={handleChange} 
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="e.g., The Ultimate Guide to React Hooks" 
                        required 
                        style={styles.input}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label htmlFor="summary" style={styles.label}>
                        <FaAlignLeft style={{color: '#bc13fe'}} /> Summary (Teaser)
                    </label>
                    <textarea 
                        id="summary" 
                        name="summary" 
                        value={formData.summary} 
                        onChange={handleChange} 
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="A brief, engaging summary displayed in the feed..." 
                        rows="2" 
                        required 
                        style={styles.textarea}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label htmlFor="slug" style={styles.label}>
                        <FaLink style={{color: '#00ffaa'}} /> URL Slug
                    </label>
                    <input 
                        id="slug" 
                        name="slug" 
                        type="text" 
                        value={formData.slug} 
                        onChange={handleChange} 
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="auto-generated-from-title" 
                        required 
                        style={{...styles.input, fontFamily: 'monospace', color: '#00d4ff'}}
                    />
                    <p style={styles.helperText}>This will be the URL of your post. Keep it lowercase and hyphenated.</p>
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="content" style={styles.label}>
                        <FaFeatherAlt style={{color: '#ff00cc'}} /> Content (Markdown Supported)
                    </label>
                    <textarea 
                        id="content" 
                        name="content" 
                        value={formData.content} 
                        onChange={handleChange} 
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="Write your article content here using Markdown..." 
                        rows="15" 
                        required 
                        style={{...styles.textarea, fontFamily: 'monospace'}}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <h3 style={{color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '0.5rem'}}>
                        Live Preview
                    </h3>
                    <div style={styles.previewBox} className="markdown-content">
                         <ReactMarkdown>{formData.content || "*Your content preview will appear here...*"}</ReactMarkdown>
                    </div>
                </div>

                <div style={styles.actions}>
                    {isEditing && (
                         <button 
                            type="button" 
                            style={styles.cancelBtn} 
                            onClick={onClose} 
                            disabled={loading}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <FaTimes /> Cancel
                        </button>
                    )}
                    <button 
                        type="submit" 
                        disabled={loading} 
                        style={{...styles.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer'}}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <FaSave /> {loading ? (isEditing ? 'Saving...' : 'Publishing...') : (isEditing ? 'Save Changes' : 'Publish Post')}
                    </button>
                </div>
            </form>

            <style>{`
                /* Responsive Padding Adjustment for Mobile */
                @media (max-width: 768px) {
                    .post-blog-container {
                        padding: 0.5rem !important; /* Reduced from 2rem to 0.5rem */
                    }
                    .post-blog-form {
                        padding: 1rem !important; /* Reduced from 3rem to 1rem */
                    }
                }
            `}</style>
        </div>
    );
};

export default PostBlogPage;
