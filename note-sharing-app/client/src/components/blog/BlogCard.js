import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEye, FaCalendarAlt } from 'react-icons/fa';
import StarRating from '../common/StarRating';

const BlogCard = ({ blog, showActions = false, onDelete = () => {}, onEdit = () => {} }) => {
    const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const views = blog.downloadCount.toLocaleString();

    return (
        <div className="blog-card blog-card-list">
            <Link to={`/blogs/${blog.slug}`} className="blog-title-button-link">
                <h3>{blog.title}</h3>
            </Link>
            
            <p className="blog-summary">{blog.summary}</p>
            
            <div className="blog-meta-list">
                <div className="blog-author-details">
                    <img 
                        src={blog.author?.avatar || 'https://via.placeholder.com/40'} 
                        alt={`Avatar of ${blog.author?.name}`} 
                        className="blog-author-avatar"
                    />
                    <p className="blog-author-name">
                        <FaUser className="meta-icon" /> <strong>{blog.author?.name || 'Deleted User'}</strong>
                    </p>
                </div>
                <div className="blog-rating-views">
                    <div className="blog-rating-display">
                        <StarRating rating={blog.rating} readOnly={true} />
                        <span>({blog.numReviews} reviews)</span>
                    </div>
                    <span className="blog-views">
                        <FaEye className="meta-icon" /> {views} views
                    </span>
                    <span className="blog-date">
                         <FaCalendarAlt className="meta-icon" /> {formattedDate}
                    </span>
                </div>
            </div>

            {showActions ? (
                <div className="owner-actions">
                    <button className="action-button edit-btn" onClick={() => onEdit(blog)}>Edit</button>
                    <button className="action-button delete-btn" onClick={() => onDelete(blog._id)}>Delete</button>
                </div>
            ) : (
                <Link to={`/blogs/${blog.slug}`} className="read-more-btn">
                    Read Full Article &rarr;
                </Link>
            )}
        </div>
    );
};

export default BlogCard;
