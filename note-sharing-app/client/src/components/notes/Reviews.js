import React, { useState } from 'react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth'; // Corrected import path
import StarRating from '../common/StarRating';

const Reviews = ({ noteId, reviews }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const { user, token } = useAuth();
    
    // A default avatar for deleted users, hosted on Cloudinary
    const defaultAvatar = 'https://res.cloudinary.com/dmtnonxtt/image/upload/v1752478950/avatar-default_g5gzu2.png';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`/notes/${noteId}/reviews`, { rating, comment }, config);
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit review.');
        }
    };
    
    // Helper function to format dates
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="reviews-section">
            <h2>Ratings & Reviews ({reviews.length})</h2>
            
            <div className="reviews-list">
                {reviews.length === 0 && <p className="no-reviews">No reviews yet. Be the first!</p>}
                {reviews.map((review) => (
                    <div key={review._id} className="review-card">
                        <div className="review-author">
                            {/* --- ADDED SAFE CHECKS TO PREVENT ERRORS --- */}
                            <img src={review.user?.avatar || defaultAvatar} alt={review.user?.name || 'Deleted User'} className="review-avatar" />
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

            {user && (
                <div className="review-form">
                    <h3>Write a Review</h3>
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
                                placeholder="Share your thoughts on these notes..."
                                required
                            />
                        </div>
                        <button type="submit" className="action-button download-btn">Submit Review</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Reviews;
