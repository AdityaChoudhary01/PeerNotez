import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ReactMarkdown from 'react-markdown';
import { FaArrowLeft, FaSearch, FaFeatherAlt } from 'react-icons/fa';
import BlogCard from '../components/blog/BlogCard';
import BlogReviews from '../components/blog/BlogReviews';
import Pagination from '../components/common/Pagination';
import StarRating from '../components/common/StarRating';

// --- FULL BLOG POST COMPONENT ---
const FullBlogContent = ({ blog, onRefetch }) => {
    const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const authorName = blog.author?.name || 'PeerNotez Contributor';
    const canonicalUrl = `https://peernotez.netlify.app/blogs/${blog.slug}`; // Assuming your deployment URL

    // Schema.org Article Markup for rich snippets
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
        },
        "headline": blog.title,
        "description": blog.summary,
        "image": "https://peernotez.netlify.app/logo512.png", // High-quality image for social sharing
        "datePublished": blog.createdAt,
        "dateModified": blog.updatedAt || blog.createdAt,
        "author": {
            "@type": "Person",
            "name": authorName
        },
        "publisher": {
            "@type": "Organization",
            "name": "PeerNotez",
            "logo": {
                "@type": "ImageObject",
                "url": "https://peernotez.netlify.app/logo192.png"
            }
        }
    };


    return (
        <div className="full-blog-container">
            <Helmet>
                <title>{`${blog?.title ? `${blog.title} | PeerNotez Blog` : 'Blog Post | PeerNotez'}`}</title> 
                <meta name="description" content={blog.summary} />
                <meta name="keywords" content={`PeerNotez, blog, ${blog.title}, ${blog.author?.name}, study tips, education, academic notes, student guide`} />
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph / Social Media Meta Tags */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={blog.title} />
                <meta property="og:description" content={blog.summary} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content="https://peernotez.netlify.app/logo512.png" />
                
                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={blog.title} />
                <meta name="twitter:description" content={blog.summary} />

                {/* Schema Markup */}
                <script type="application/ld+json">
                    {JSON.stringify(articleSchema)}
                </script>
            </Helmet>
            
            <Link to="/blogs" className="back-button"><FaArrowLeft /> Back to All Blogs</Link>

            <article className="blog-article-content">
                <h1 className="article-title">{blog.title}</h1>
                
                <div className="article-meta">
                    <div className="blog-author-details">
                        <img 
                            src={blog.author?.avatar || 'https://via.placeholder.com/44'} 
                            alt={`Avatar of ${authorName}`} 
                            className="blog-author-avatar"
                        />
                        <p className="blog-author-name">
                            By <strong>{authorName}</strong>
                        </p>
                    </div>
                    <div className="blog-rating-display blog-meta-rating">
                            <StarRating rating={blog.rating} readOnly={true} />
                            <span>({blog.numReviews} reviews)</span>
                    </div>
                    <span className="article-date">Published on: {formattedDate}</span>
                </div>

                <hr className="article-separator" />
                
                <div className="article-body markdown-content">
                    <ReactMarkdown>{blog.content}</ReactMarkdown>
                </div>
            </article>
            
            {/* SEO: Internal Link Section - Highlighting conversion to other pages */}
            <section className="blog-internal-links note-feedback-section">
                <h2>Continue Your Learning Journey</h2>
                <div className="cta-buttons-container" style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center'}}>
                    <Link to="/search" className="hero-cta-button primary">
                        <FaSearch style={{marginRight: '0.5rem'}} /> Find More Notes
                    </Link>
                    <Link to="/upload" className="hero-cta-button secondary">
                        <FaFeatherAlt style={{marginRight: '0.5rem'}} /> Write Your Own Blog
                    </Link>
                </div>
            </section>


            <div className="note-feedback-section blog-reviews-section">
                <BlogReviews blogId={blog._id} reviews={blog.reviews || []} onReviewAdded={onRefetch} />
            </div>
        </div>
    );
};


// --- MAIN BLOG LISTING PAGE ---
const BlogPage = () => {
    const { slug } = useParams(); 
    const [blogs, setBlogs] = useState([]);
    const [singleBlog, setSingleBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingSingle, setLoadingSingle] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [refetchIndex, setRefetchIndex] = useState(0); 

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, search: searchTerm, sort: sortBy };
            const { data } = await axios.get('/blogs', { params });
            setBlogs(data.blogs);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch blog posts", error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, sortBy]);
    
    // Fetch single blog post by slug
    const fetchSingleBlog = useCallback(async () => {
        if (!slug) return;
        setLoadingSingle(true);
        try {
            const { data } = await axios.get(`/blogs/${slug}`);
            setSingleBlog(data);
        } catch (error) {
            console.error("Failed to fetch single blog post", error);
            setSingleBlog(null);
        } finally {
            setLoadingSingle(false);
        }
    }, [slug]);

    useEffect(() => {
        if (slug) {
            // Include refetchIndex here to trigger reload when a review is added
            fetchSingleBlog(refetchIndex); 
        } else {
            setSingleBlog(null);
            fetchBlogs();
        }
    }, [slug, fetchBlogs, fetchSingleBlog, refetchIndex]); 

    const handleRefetch = () => setRefetchIndex(prev => prev + 1);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchBlogs();
    };
    
    // Schema.org WebPage Markup for the listing page
    const webpageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "PeerNotez Blog | Insights on Education and Tech",
        "description": "Explore articles on study hacks, developer insights, community stories, and open education written by the PeerNotez community.",
        "url": "https://peernotez.netlify.app/blogs",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://peernotez.netlify.app/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Blog",
                    "item": "https://peernotez.netlify.app/blogs"
                }
            ]
        }
    };


    if (slug) {
        if (loadingSingle || !singleBlog) {
             return (
                <div className="blog-page-wrapper loading-state">
                    <i className="fas fa-spinner fa-spin loading-icon"></i>
                    <p className="loading-message">Loading blog post...</p>
                </div>
            );
        }
        return <FullBlogContent blog={singleBlog} onRefetch={handleRefetch} />;
    }

    // List View Render
    return (
        <div className="blog-page-wrapper">
            <Helmet>
                <title>PeerNotez Blog | Insights on Education and Tech</title>
                <meta name="description" content="Explore articles on study hacks, developer insights, community stories, and open education written by the PeerNotez community." />
                <meta name="keywords" content="PeerNotez, blog, education, study tips, student community, tech blog, free learning" />
                <link rel="canonical" href="https://peernotez.netlify.app/blogs" />
                
                {/* Schema Markup for WebPage */}
                <script type="application/ld+json">
                    {JSON.stringify(webpageSchema)}
                </script>
            </Helmet>

            <header className="page-header blog-header">
                <h1 className="header-title"><FaFeatherAlt /> The PeerNotez Blog</h1>
                <p className="header-subtitle">Deep dive into study hacks, developer insights, and community stories.</p>
                <Link to="/blogs/post" className="main-cta-button blog-post-btn">Write a New Post</Link>
            </header>

            <section className="blog-controls-section">
                <form onSubmit={handleSearchSubmit} className="blog-search-form">
                    <input
                        type="text"
                        placeholder="Search articles by title or summary..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="blog-search-input"
                    />
                    <button type="submit" className="blog-search-button"><FaSearch /></button>
                </form>

                <div className="sort-container">
                    <label htmlFor="blog-sort-select">Sort by:</label>
                    <select 
                        id="blog-sort-select" 
                        value={sortBy} 
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                            fetchBlogs();
                        }}
                    >
                        <option value="createdAt">Most Recent</option>
                        <option value="highestRated">Highest Rated</option>
                        <option value="mostViewed">Most Viewed</option>
                    </select>
                </div>
            </section>


            <section className="blog-posts-list">
                {loading ? (
                    <div>Loading blog posts...</div>
                ) : blogs.length > 0 ? (
                    <>
                        <div className="blog-posts-grid">
                            {blogs.map(blog => <BlogCard key={blog._id} blog={blog} />)}
                        </div>
                        <Pagination 
                            page={page} 
                            totalPages={totalPages} 
                            onPageChange={setPage} 
                        />
                    </>
                ) : (
                    <p style={{textAlign: 'center', marginTop: '2rem'}}>No blog posts found matching your criteria.</p>
                )}
            </section>
        </div>
    );
};

export default BlogPage;
