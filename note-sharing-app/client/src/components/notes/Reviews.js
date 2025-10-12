import React, { useState, useCallback } from 'react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth'; 
import StarRating from '../common/StarRating';
import { Link } from 'react-router-dom';
import { FaReply } from 'react-icons/fa';

// Helper function to format dates
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// --- Recursive Comment Component ---
const CommentThread = ({ comment, noteId, onReviewAdded, user, token, level = 0 }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyComment, setReplyComment] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleReplySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // FIX APPLIED HERE: The 'rating' field is REMOVED from the payload 
            await axios.post(`/notes/${noteId}/reviews`, { 
                comment: replyComment, 
                parentReviewId: comment._id,
            }, config);
            
            alert('Reply submitted successfully!');
            setReplyComment('');
            setIsReplying(false);
            onReviewAdded(); // Triggers parent refetch

        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit reply.');
        } finally {
            setLoading(false);
        }
    };
    
    const nestedReplies = comment.replies || [];

    return (
        <div className={`review-card level-${level}`}>
            <div className="review-author">
                <img src={comment.user?.avatar || 'https://via.placeholder.com/45/CCCCCC/FFFFFF?text=P'} alt={comment.user?.name || 'Deleted User'} className="review-avatar" />
                <div className="review-author-info">
                    <strong>{comment.user?.name || 'Deleted User'}</strong>
                    <span>{formatDate(comment.createdAt)}</span>
                </div>
            </div>
            
            <div className="review-content">
                {/* Only display rating on top-level comments with a rating > 0 */}
                {!comment.parentReviewId && comment.rating > 0 && <StarRating rating={comment.rating} readOnly={true} />} 
                <p>{comment.comment}</p>
                
                {user && level < 3 && ( // Limit nesting to 3 levels deep
                    <button className="reply-btn" onClick={() => setIsReplying(prev => !prev)}>
                        <FaReply /> {isReplying ? 'Cancel Reply' : 'Reply'}
                    </button>
                )}
            </div>

            {isReplying && (
                    <form onSubmit={handleReplySubmit} className="reply-form">
                        <textarea
                            rows="2"
                            value={replyComment}
                            onChange={(e) => setReplyComment(e.target.value)}
                            placeholder="Type your reply..."
                            required
                        />
                        
                        {/* Updated: Using reply-actions wrapper and reply-submit-btn class
                            to apply the dedicated CSS styles. 
                        */}
                        <div className="reply-actions">
                            <button 
                                type="submit" 
                                disabled={loading || !replyComment.trim()} // Also added check for empty comment
                                className="reply-submit-btn" 
                            >
                                {loading ? 'Sending...' : 'Post Reply'}
                            </button>
                        </div>
                    </form>
            )}

            <div className="nested-replies">
                {nestedReplies.map(reply => (
                    // Recursive call
                    <CommentThread 
                        key={reply._id} 
                        comment={reply} 
                        noteId={noteId} 
                        onReviewAdded={onReviewAdded} 
                        user={user}
                        token={token}
                        level={level + 1}
                    />
                ))}
            </div>
        </div>
    );
};
// ------------------------------------------------------------

// ------------------------------------------------------------
// --- Main Reviews Component ---
// ------------------------------------------------------------
const Reviews = ({ noteId, reviews, onReviewAdded }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, token } = useAuth();
    
    // Function to transform flat review array into nested threads
    const buildCommentThreads = useCallback((flatReviews) => {
        const commentMap = {};
        const rootComments = [];

        // Map every comment by its ID
        flatReviews.forEach(comment => {
            commentMap[comment._id] = { ...comment, replies: [] };
        });

        // Organize comments into root and nested structure
        Object.values(commentMap).forEach(comment => {
            if (comment.parentReviewId) {
                const parent = commentMap[comment.parentReviewId];
                if (parent) {
                    parent.replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });
        
        // Sort root comments by creation date (newest first)
        rootComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return rootComments;
    }, []);

    const commentThreads = buildCommentThreads(reviews);
    
    // Check if the user has already posted a top-level review/rating
    const alreadyReviewedTopLevel = reviews.some(r => r.user?._id === user?._id && !r.parentReviewId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (rating === 0) {
            alert('Please provide a star rating for a top-level review.');
            setLoading(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Note: parentReviewId is implicitly null/undefined here for top-level review
            await axios.post(`/notes/${noteId}/reviews`, { rating, comment }, config);
            
            alert('Review submitted successfully! Refreshing content...');
            onReviewAdded(); // Triggers parent component to refetch
            setRating(0);
            setComment('');

        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit review.');
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="reviews-section">
            <h2>Ratings & Reviews ({reviews.length})</h2>
            
            <div className="reviews-list">
                {commentThreads.length === 0 && <p className="no-reviews">No reviews yet. Be the first!</p>}
                {commentThreads.map((thread) => (
                    <CommentThread 
                        key={thread._id} 
                        comment={thread} 
                        noteId={noteId} 
                        onReviewAdded={onReviewAdded} 
                        user={user}
                        token={token}
                    />
                ))}
            </div>

            {/* Top-Level Review Form */}
            {user && !alreadyReviewedTopLevel && (
                <div className="review-form">
                    <h3>Write a Top-Level Review</h3>
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
                                placeholder="Share your thoughts on these notes and provide a rating..."
                                required
                            />
                        </div>
                        {/* Keeping the original class for the main form submission button, 
                            as you didn't provide specific CSS for it, but using a dedicated 
                            reply-actions container might be overkill here. */}
                        <button type="submit" className="action-button download-btn" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            )}
            {user && alreadyReviewedTopLevel && (
                <p className="no-reviews" style={{borderColor: 'var(--primary-color)'}}>
                    You have already posted a top-level review/rating. You can reply to any existing comment instead.
                </p>
            )}
            {!user && (
                <p className="no-reviews">Please <Link to="/login" style={{color: 'var(--primary-color)'}}>log in</Link> to submit a review or comment.</p>
            )}
        </div>
    );
};

export default Reviews;
