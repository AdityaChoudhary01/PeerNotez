import React, { useState } from 'react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth'; 
import StarRating from '../common/StarRating';
import { Link } from 'react-router-dom';
import { FaReply } from 'react-icons/fa';

// --- Recursive Comment Component ---
const CommentThread = ({ comment, postId, onReviewAdded, user, token, level = 0 }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyComment, setReplyComment] = useState('');
    const [loading, setLoading] = useState(false);
    
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    
    const handleReplySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // FIX APPLIED HERE: The 'rating' field is REMOVED from the payload 
            // for replies. This requires the Mongoose schema on the server
            // to have 'required: false' for the rating field.
            await axios.post(`/blogs/${postId}/reviews`, { 
                comment: replyComment, 
                parentReviewId: comment._id,
            }, config);
            
            alert('Reply submitted successfully! Refreshing...');
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
                <img src={comment.user?.avatar || 'https://via.placeholder.com/45'} alt={comment.user?.name || 'Deleted User'} className="review-avatar" />
                <div className="review-author-info">
                    <strong>{comment.user?.name || 'Deleted User'}</strong>
                    <span>{formatDate(comment.createdAt)}</span>
                </div>
            </div>
            <div className="review-content">
                {/* Only display rating on top-level comments */}
                {!comment.parentReviewId && comment.rating > 0 && <StarRating rating={comment.rating} readOnly={true} />} 
                <p>{comment.comment}</p>
                
                {user && level < 3 && ( // Limit nesting to 3 levels
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
                        <button type="submit" disabled={loading} className="action-button download-btn" style={{padding: '0.4rem 1rem', fontSize: '0.9rem'}}>
                            {loading ? 'Sending...' : 'Post Reply'}
                        </button>
                    </form>
            )}

            <div className="nested-replies">
                {nestedReplies.map(reply => (
                    // Recursive call
                    <CommentThread 
                        key={reply._id} 
                        comment={reply} 
                        postId={postId} 
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
// --- End Recursive Component ---

const BlogReviews = ({ blogId, reviews, onReviewAdded }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, token } = useAuth();
    
    // Function to transform flat review array into nested threads
    const buildCommentThreads = (flatReviews) => {
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
    };
    
    const commentThreads = buildCommentThreads(reviews);
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
            await axios.post(`/blogs/${blogId}/reviews`, { rating, comment }, config);
            
            alert('Review submitted successfully! Refreshing content...');
            onReviewAdded(); 
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
            <h2>Comments & Reviews ({reviews.length})</h2>
            
            <div className="reviews-list">
                {commentThreads.length === 0 && <p className="no-reviews">No comments yet. Be the first!</p>}
                {commentThreads.map((thread) => (
                    <CommentThread 
                        key={thread._id} 
                        comment={thread} 
                        postId={blogId} 
                        onReviewAdded={onReviewAdded} 
                        user={user}
                        token={token}
                    />
                ))}
            </div>

            {/* Top-Level Review Form */}
            {user && !alreadyReviewedTopLevel && (
                <div className="review-form">
                    <h3>Post a New Top-Level Review</h3>
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
                                placeholder="Share your thoughts and rate the article..."
                                required
                            />
                        </div>
                        <button type="submit" className="action-button download-btn" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            )}
            {user && alreadyReviewedTopLevel && (
                <p className="no-reviews" style={{borderColor: 'var(--primary-color)'}}>
                    You have already posted a top-level review. You can reply to any existing comment instead.
                </p>
            )}
            {!user && (
                <p className="no-reviews">Please <Link to="/login" style={{color: 'var(--primary-color)'}}>log in</Link> to submit a review or comment.</p>
            )}
        </div>
    );
};

export default BlogReviews;
