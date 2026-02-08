import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ReactMarkdown from 'react-markdown';
import { FaArrowLeft, FaSpinner, FaSearch, FaFeatherAlt, FaPenNib } from 'react-icons/fa';
import BlogCard from '../components/blog/BlogCard';
import BlogReviews from '../components/blog/BlogReviews';
import RelatedBlogs from '../components/blog/RelatedBlogs'; 
import Pagination from '../components/common/Pagination';
import StarRating from '../components/common/StarRating';
import AuthorInfoBlock from '../components/common/AuthorInfoBlock';
import { optimizeCloudinaryUrl } from '../utils/cloudinaryHelper';

// --- INTERNAL CSS: HOLOGRAPHIC BLOG PAGE ---
const styles = {
    wrapper: {
        paddingTop: '2rem',
        paddingBottom: '5rem',
        overflowX: 'hidden',
        minHeight: '80vh'
    },
    header: {
        textAlign: 'center',
        marginBottom: '4rem',
        padding: '3rem 1rem',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    },
    title: {
        fontSize: 'clamp(2rem, 5vw, 4rem)', 
        fontWeight: '800',
        background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        flexWrap: 'wrap'
    },
    subtitle: {
        fontSize: '1.2rem',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: '2rem'
    },
    ctaBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 30px',
        borderRadius: '50px',
        background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: '700',
        fontSize: '1.1rem',
        boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
        transition: 'transform 0.3s'
    },
    controls: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '3rem',
        background: 'rgba(0,0,0,0.2)',
        padding: '1rem',
        borderRadius: '16px'
    },
    searchForm: {
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50px',
        padding: '5px 15px',
        flex: 1,
        maxWidth: '500px',
        border: '1px solid rgba(255,255,255,0.1)'
    },
    searchInput: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        padding: '10px',
        flex: 1,
        outline: 'none',
        fontSize: '1rem'
    },
    searchBtn: {
        background: 'transparent',
        border: 'none',
        color: '#00d4ff',
        cursor: 'pointer',
        fontSize: '1.1rem'
    },
    sortSelect: {
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '8px',
        outline: 'none',
        cursor: 'pointer'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
    },
    articleContainer: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 0'
    },
    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: 'rgba(255, 255, 255, 0.7)',
        textDecoration: 'none',
        marginBottom: '2rem',
        fontSize: '1rem',
        transition: 'color 0.2s',
        fontWeight: '600'
    },
    articleCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '3rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        marginBottom: '3rem',
        overflow: 'hidden'
    },
    articleBanner: {
        width: '100%',
        height: 'auto',
        maxHeight: '500px',
        objectFit: 'cover',
        borderRadius: '16px',
        marginBottom: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    },
    articleTitle: {
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: '800',
        color: '#fff',
        marginBottom: '1.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        textShadow: '0 0 30px rgba(0, 212, 255, 0.3)'
    },
    articleMeta: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '3rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.95rem'
    },
    authorRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    miniAvatar: {
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid rgba(0, 212, 255, 0.5)'
    },
    contentBody: {
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 1.8,
        fontSize: '1.15rem',
        fontFamily: "'Spline Sans', sans-serif"
    },
    secondarySection: {
        marginTop: '3rem',
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '16px'
    },
    authorBlockWrapper: {
        marginTop: '1.5rem',
        marginBottom: '2rem'
    }
};

// --- CUSTOM MARKDOWN RENDERERS ---
const markdownComponents = {
    h1: ({node, children, ...props}) => <h1 style={{fontSize: '2.5rem', fontWeight: '800', margin: '2.5rem 0 1.5rem', background: 'linear-gradient(to right, #00d4ff, #ff00cc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2}} {...props}>{children}</h1>,
    h2: ({node, children, ...props}) => <h2 style={{fontSize: '2rem', fontWeight: '700', color: '#fff', margin: '2.5rem 0 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem'}} {...props}>{children}</h2>,
    h3: ({node, children, ...props}) => <h3 style={{fontSize: '1.6rem', fontWeight: '600', color: '#00d4ff', margin: '2rem 0 1rem'}} {...props}>{children}</h3>,
    h4: ({node, children, ...props}) => <h4 style={{fontSize: '1.3rem', fontWeight: '600', color: '#ff00cc', margin: '1.5rem 0 0.8rem'}} {...props}>{children}</h4>,
    p: ({node, children, ...props}) => <p style={{fontSize: '1.15rem', lineHeight: '1.9', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '1.5rem'}} {...props}>{children}</p>,
    strong: ({node, children, ...props}) => <strong style={{color: '#fff', fontWeight: '700'}} {...props}>{children}</strong>,
    em: ({node, children, ...props}) => <em style={{color: 'rgba(255, 255, 255, 0.9)', fontStyle: 'italic'}} {...props}>{children}</em>,
    ul: ({node, children, ...props}) => <ul style={{marginLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'disc', color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.1rem', lineHeight: '1.8'}} {...props}>{children}</ul>,
    ol: ({node, children, ...props}) => <ol style={{marginLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'decimal', color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.1rem', lineHeight: '1.8'}} {...props}>{children}</ol>,
    li: ({node, children, ...props}) => <li style={{marginBottom: '0.5rem', paddingLeft: '0.5rem'}} {...props}>{children}</li>,
    blockquote: ({node, children, ...props}) => (
        <blockquote style={{
            borderLeft: '4px solid #00d4ff',
            padding: '1.5rem',
            margin: '2rem 0',
            background: 'rgba(0, 212, 255, 0.05)',
            borderRadius: '0 12px 12px 0',
            fontStyle: 'italic',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.1rem'
        }} {...props}>
            {children}
        </blockquote>
    ),
    code: ({node, inline, className, children, ...props}) => {
        return !inline ? (
            <div style={{
                background: '#151520',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                margin: '2rem 0',
                overflowX: 'auto',
                fontFamily: "'Fira Code', monospace",
                fontSize: '0.95rem',
                color: '#e0e0e0',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
            }}>
                <code className={className} {...props}>{children}</code>
            </div>
        ) : (
            <code style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                color: '#ffcc00',
                fontSize: '0.9em'
            }} {...props}>
                {children}
            </code>
        )
    },
    a: ({node, children, ...props}) => <a style={{color: '#00d4ff', textDecoration: 'underline', textUnderlineOffset: '4px', fontWeight: '500'}} {...props}>{children}</a>,
    img: ({node, alt, ...props}) => <img alt={alt || 'Blog image'} loading="lazy" style={{maxWidth: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', margin: '2rem 0', border: '1px solid rgba(255,255,255,0.1)'}} {...props} />,
    hr: ({node, ...props}) => <hr style={{border: '0', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)', margin: '4rem 0'}} {...props} />
};

// --- FULL BLOG POST COMPONENT ---
const FullBlogContent = ({ blog, onRefetch }) => {
    const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const authorName = blog.author?.name || 'PeerNotez Contributor';
    const canonicalUrl = `https://peernotez.netlify.app/blogs/${blog.slug}`;

    // Cloudinary Optimizations
    const optimizedBanner = optimizeCloudinaryUrl(blog.coverImage, { width: 1000, height: 500, crop: 'fill' });
    const optimizedMiniAvatar = optimizeCloudinaryUrl(blog.author?.avatar, { width: 90, height: 90, isProfile: true });

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
        "headline": blog.title,
        "description": blog.summary,
        "image": blog.coverImage || "https://peernotez.netlify.app/logo512.png",
        "datePublished": blog.createdAt,
        "dateModified": blog.updatedAt || blog.createdAt,
        "author": { "@type": "Person", "name": authorName },
        "publisher": {
            "@type": "Organization",
            "name": "PeerNotez",
            "logo": { "@type": "ImageObject", "url": "https://peernotez.netlify.app/logo192.png" }
        }
    };

    return (
        <main style={styles.articleContainer} className="blog-article-wrapper">
            <Helmet>
                <title>{`${blog?.title ? `${blog.title} | PeerNotez Blog` : 'Blog Post | PeerNotez'}`}</title> 
                <meta name="description" content={blog.summary} />
                <link rel="canonical" href={canonicalUrl} />
                <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
            </Helmet>
            
            <Link to="/blogs" style={styles.backLink} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                <FaArrowLeft aria-hidden="true" /> Back to All Blogs
            </Link>

            <article style={styles.articleCard} className="blog-article-card">
                {blog.coverImage && (
                    <img 
                        src={optimizedBanner} 
                        alt={`Banner for ${blog.title}`} 
                        style={styles.articleBanner} 
                    />
                )}

                <h1 style={styles.articleTitle}>{blog.title}</h1>
                
                <div style={styles.authorBlockWrapper}>
                    <AuthorInfoBlock author={blog.author} contentId={blog._id} contentType="blog" />
                </div>

                <div style={styles.articleMeta} className="blog-article-meta">
                    <div style={styles.authorRow}>
                        <img 
                            src={optimizedMiniAvatar || 'https://via.placeholder.com/44'} 
                            alt={`${authorName}'s avatar`} 
                            loading="lazy"
                            style={styles.miniAvatar}
                        />
                        <span>By <strong>{authorName}</strong></span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <StarRating rating={blog.rating} readOnly={true} size={14} />
                        <span>({blog.numReviews} reviews)</span>
                    </div>
                    <span>Published: {formattedDate}</span>
                </div>
                
                <div style={styles.contentBody}>
                    <ReactMarkdown components={markdownComponents}>
                        {blog.content}
                    </ReactMarkdown>
                </div>
            </article>

            <section style={styles.secondarySection} aria-labelledby="learning-journey-title">
                <h2 id="learning-journey-title" style={{color: '#fff', marginBottom: '1.5rem', fontSize: '1.5rem'}}>Continue Your Learning Journey</h2>
                <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center'}}>
                    <Link to="/search" style={styles.ctaBtn} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <FaSearch aria-hidden="true" /> Find More Notes
                    </Link>
                    <Link to="/blogs/post" style={{...styles.ctaBtn, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)'}} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <FaPenNib aria-hidden="true" /> Write Your Own Blog
                    </Link>
                </div>
            </section>

            <RelatedBlogs currentBlogId={blog._id} />

            <section style={{marginTop: '1rem'}} aria-label="Blog reviews and discussion">
                <BlogReviews blogId={blog._id} reviews={blog.reviews || []} onReviewAdded={onRefetch} />
            </section>

            <style>{`
                @media (max-width: 768px) {
                    .blog-article-wrapper {
                        padding-left: 1rem;
                        padding-right: 1rem;
                    }
                    .blog-article-card {
                        padding: 1.5rem !important;
                        border-radius: 16px !important;
                    }
                    .blog-article-meta {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 0.8rem !important;
                    }
                }
            `}</style>
        </main>
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
            fetchSingleBlog();
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
    
    if (slug) {
        if (loadingSingle || !singleBlog) {
             return (
                <div style={{textAlign: 'center', padding: '5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem'}} aria-live="polite">
                    <FaSpinner className="fa-spin" style={{marginRight: '10px'}} aria-hidden="true" /> Loading article...
                </div>
            );
        }
        return <FullBlogContent blog={singleBlog} onRefetch={handleRefetch} />;
    }

    return (
        <div style={styles.wrapper}>
            <Helmet>
                <title>PeerNotez Blog | Insights on Education and Tech</title>
                <meta name="description" content="Explore articles on study hacks, developer insights, community stories, and open education written by the PeerNotez community." />
                <link rel="canonical" href="https://peernotez.netlify.app/blogs" />
            </Helmet>

            <header style={styles.header} className="blog-list-header">
                <h1 style={styles.title}><FaFeatherAlt aria-hidden="true" /> The PeerNotez Blog</h1>
                <p style={styles.subtitle}>Deep dive into study hacks, developer insights, and community stories.</p>
                <Link to="/blogs/post" style={styles.ctaBtn} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <FaPenNib aria-hidden="true" /> Write a New Post
                </Link>
            </header>

            <section style={styles.controls} className="blog-list-controls" aria-label="Search and filter blogs">
                <form onSubmit={handleSearchSubmit} style={styles.searchForm} className="blog-search-form">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        aria-label="Search blog articles"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    <button type="submit" style={styles.searchBtn} aria-label="Perform search"><FaSearch /></button>
                </form>

                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <label htmlFor="blog-sort-select" style={{color: 'rgba(255,255,255,0.7)'}}>Sort by:</label>
                    <select 
                        id="blog-sort-select" 
                        value={sortBy} 
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                        }}
                        style={styles.sortSelect}
                    >
                        <option value="createdAt">Most Recent</option>
                        <option value="highestRated">Highest Rated</option>
                        <option value="mostViewed">Most Viewed</option>
                    </select>
                </div>
            </section>

            <main>
                {loading ? (
                    <div style={{textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.7)'}} aria-live="polite">Loading blog posts...</div>
                ) : blogs.length > 0 ? (
                    <>
                        <div style={styles.grid}>
                            {blogs.map(blog => <BlogCard key={blog._id} blog={blog} />)}
                        </div>
                        <Pagination 
                            page={page} 
                            totalPages={totalPages} 
                            onPageChange={setPage} 
                        />
                    </>
                ) : (
                    <p style={{textAlign: 'center', marginTop: '2rem', color: 'rgba(255,255,255,0.5)'}}>No blog posts found matching your criteria.</p>
                )}
            </main>

            <style>{`
                @media (max-width: 768px) {
                    .blog-list-header {
                        padding: 2rem 1rem !important;
                        margin-bottom: 2rem !important;
                    }
                    .blog-list-controls {
                        flex-direction: column;
                        align-items: stretch !important;
                        padding: 1.5rem !important;
                    }
                    .blog-search-form {
                        max-width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default BlogPage;
