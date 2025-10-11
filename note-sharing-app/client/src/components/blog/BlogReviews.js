import React, { useState } from 'react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth'; 
import StarRating from '../common/StarRating';
import { Link } from 'react-router-dom';

const BlogReviews = ({ blogId, reviews, onReviewAdded }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, token } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (rating === 0) {
            alert('Please provide a star rating.');
            setLoading(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`/blogs/${blogId}/reviews`, { rating, comment }, config);
            
            alert('Review submitted successfully! Refreshing content...');
            onReviewAdded(); // Triggers parent refetch
            setRating(0);
            setComment('');

        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit review. You may have already reviewed this blog.');
        } finally {
            setLoading(false);
        }
    };
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const alreadyReviewed = reviews.some(r => r.user?._id === user?._id);

    return (
        <div className="reviews-section">
            <h2>Comments & Reviews ({reviews.length})</h2>
            
            <div className="reviews-list">
                {reviews.length === 0 && <p className="no-reviews">No reviews yet. Be the first!</p>}
                {reviews.map((review) => (
                    <div key={review._id} className="review-card">
                        <div className="review-author">
                            <img src={review.user?.avatar || 'https://via.placeholder.com/45'} alt={review.user?.name || 'Deleted User'} className="review-avatar" />
                            <div className="review-author-info">
                                <strong>{review.user?.name || 'Deleted User'}</strong>
                                <span>{formatDate(review.createdAt)}</span>
                            </div>
                        </div>
                        <div className="review-content">
                            <StarRating rating={review.rating} readOnly={true} />
                            <p>{review.comment}</p>
                        </div>
                    </div>
                ))}
            </div>

            {user && !alreadyReviewed && (
                <div className="review-form">
                    <h3>Write a Review/Comment</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Your Rating</label>
                            <StarRating rating={rating} setRating={setRating} />
                        </div>
                        <div className="form-group">
                            <label>Your Comment</label>
                            <textarea
                                rows="4"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts on this article..."
                                required
                            />
                        </div>
                        <button type="submit" className="action-button download-btn" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            )}
            {user && alreadyReviewed && (
                <p className="no-reviews" style={{borderColor: 'var(--primary-color)'}}>
                    You have already submitted a review for this blog post.
                </p>
            )}
            {!user && (
                <p className="no-reviews">Please <Link to="/login" style={{color: 'var(--primary-color)'}}>log in</Link> to submit a review.</p>
            )}
        </div>
    );
};

export default BlogReviews;
