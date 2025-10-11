import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import useAuth from '../hooks/useAuth';
import BlogCard from '../components/blog/BlogCard';
import PostBlogPage from './PostBlogPage';
import Pagination from '../components/common/Pagination';
import { FaBookOpen, FaUpload, FaHome } from 'react-icons/fa'; // Added FaHome, FaUpload
import { Link } from 'react-router-dom';

const MyBlogsPage = () => {
    const [myBlogs, setMyBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [refetchIndex, setRefetchIndex] = useState(0);
    const [editingBlog, setEditingBlog] = useState(null); 

    const { token, loading: authLoading } = useAuth();

    const fetchMyBlogs = useCallback(async () => {
        if (authLoading || !token) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`/blogs/my-blogs?page=${currentPage}`, config);
            setMyBlogs(data.blogs || []);
            setTotalPages(data.totalPages || 0);
            setTotalBlogs(data.totalBlogs || 0);
        } catch (error) {
            console.error('Failed to fetch my blogs:', error);
            setMyBlogs([]);
        } finally {
            setLoading(false);
        }
    }, [token, authLoading, currentPage]); // Dependency array optimized

    useEffect(() => {
        fetchMyBlogs();
    }, [fetchMyBlogs, refetchIndex]);

    const handleDeleteBlog = async (blogId) => {
        if (window.confirm('Are you sure you want to permanently delete this blog post?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/blogs/${blogId}`, config);
                alert('Blog post deleted successfully.');
                setRefetchIndex(prev => prev + 1);
            } catch (error) {
                console.error('Failed to delete blog', error);
                alert('Failed to delete blog.');
            }
        }
    };
    
    const handleBlogUpdated = () => {
        setEditingBlog(null); 
        setRefetchIndex(prev => prev + 1); 
    };

    if (authLoading) return <div>Authenticating...</div>;

    if (editingBlog) {
        return (
            <div className="modal-overlay">
                <div className="modal-content" style={{maxWidth: '1000px', padding: 0}}>
                    <PostBlogPage 
                        existingBlog={editingBlog} 
                        onBlogUpdated={handleBlogUpdated} 
                        onClose={() => setEditingBlog(null)}
                    />
                </div>
            </div>
        );
    }
    
    return (
        <div className="content-page my-blogs-page">
            <Helmet>
                {/* SEO: Prevent Search Engines from Indexing this Private Page */}
                
                {/* SEO: Optimized Title with Total Count */}
                <title>{`My Blogs (${totalBlogs ?? 0}) | PeerNotez`}</title>
                <meta name="description" content="Manage, edit, and view all the blog posts you have published on the PeerNotez platform." />
            </Helmet>

            <header className="profile-header">
                <div className="profile-info">
                    <h1><FaBookOpen /> My Blog Posts</h1>
                    <p>Manage and edit the articles you have contributed to the PeerNotez Blog.</p>
                </div>
                <Link to="/blogs/post" className="main-cta-button blog-post-btn">
                    Write New Post
                </Link>
            </header>
            
            <h2 className="admin-section-heading">All My Posts ({totalBlogs})</h2>

            {loading ? (
                <div>Loading your blog posts...</div>
            ) : myBlogs.length > 0 ? (
                <>
                    <div className="blog-posts-grid">
                        {myBlogs.map(blog => (
                            <BlogCard 
                                key={blog._id} 
                                blog={blog} 
                                showActions={true} 
                                onDelete={handleDeleteBlog}
                                onEdit={setEditingBlog}
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <Pagination 
                            page={currentPage} 
                            totalPages={totalPages} 
                            onPageChange={setCurrentPage} 
                        />
                    )}
                </>
            ) : (
                <p>
                    You have not published any blog posts yet. 
                    <Link to="/blogs/post" style={{color: 'var(--primary-color)', marginLeft: '0.5rem'}}>Start writing!</Link>
                </p>
            )}

            {/* SEO: Internal Linking to key site areas for UX and navigation */}
            <div style={{marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center'}}>
                <h3>Quick Navigation</h3>
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                    <Link to="/" className="nav-button" style={{borderColor: 'var(--success-color)', color: 'var(--success-color)'}}>
                        <FaHome style={{marginRight: '0.5rem'}} /> Go to Homepage
                    </Link>
                    <Link to="/upload" className="nav-button signup-btn">
                        <FaUpload style={{marginRight: '0.5rem'}} /> Upload Notes
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MyBlogsPage;
