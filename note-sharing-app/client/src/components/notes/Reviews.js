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

// --- New Helper: ReplyCard Component (defined above) ---
const ReplyCard = ({ reply, noteId, onReviewAdded, user, token, parentId }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyComment, setReplyComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/notes/${noteId}/reviews`, {
        comment: replyComment,
        parentReviewId: reply._id,
      }, config);

      setReplyComment('');
      setIsReplying(false);
      onReviewAdded();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit reply.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div key={reply._id} className="review-card level-1">
      <div className="review-author">
        <img
          src={reply.user?.avatar || 'https://via.placeholder.com/40'}
          alt={reply.user?.name || 'Deleted User'}
          className="review-avatar"
        />
        <div className="review-author-info">
          <strong>
            {reply.user?.name || 'Deleted User'}
            {reply.parentUser?.name && (
              <span className="replying-to"> @{reply.parentUser.name}</span>
            )}
          </strong>
          <span>{formatDate(reply.createdAt)}</span>
        </div>
      </div>

      <div className="review-content">
        <p>{reply.comment}</p>

        {user && (
          <>
            <button className="reply-btn" onClick={() => setIsReplying(prev => !prev)}>
              <FaReply /> {isReplying ? 'Cancel Reply' : 'Reply'}
            </button>

            {isReplying && (
              <form onSubmit={handleReplySubmit} className="reply-form">
                <textarea
                  rows="2"
                  value={replyComment}
                  onChange={(e) => setReplyComment(e.target.value)}
                  placeholder={`Replying to ${reply.user?.name || 'this comment'}...`}
                  required
                />
                <div className="reply-actions">
                  <button type="submit" disabled={loading} className="reply-submit-btn">
                    {loading ? 'Sending...' : 'Post Reply'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};


// --- Non-Recursive CommentThread Component (Handles one thread) ---
const CommentThread = ({ comment, noteId, onReviewAdded, user, token }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyComment, setReplyComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Submitting a reply directly to the top-level comment
            await axios.post(`/notes/${noteId}/reviews`, { 
                comment: replyComment, 
                parentReviewId: comment._id,
            }, config);
            
            setReplyComment('');
            setIsReplying(false);
            onReviewAdded(); // Triggers parent refetch

        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit reply.');
        } finally {
            setLoading(false);
        }
    };

    // Function to extract all replies (nested or direct) into a single flat array
    const flattenReplies = (replyList) => {
        let allReplies = [];
        if (!replyList) return allReplies;

        for (const reply of replyList) {
            allReplies.push(reply);
            allReplies = allReplies.concat(flattenReplies(reply.replies));
        }
        return allReplies;
    };
    
    const allFlatReplies = flattenReplies(comment.replies);

    return (
        <div className="review-card-thread">
            {/* 1. Main Top-Level Comment (Level 0) */}
            <div className="review-card level-0">
                <div className="review-author">
                    <img src={comment.user?.avatar || 'https://via.placeholder.com/45/CCCCCC/FFFFFF?text=P'} alt={comment.user?.name || 'Deleted User'} className="review-avatar" />
                    <div className="review-author-info">
                        <strong>{comment.user?.name || 'Deleted User'}</strong>
                        <span>{formatDate(comment.createdAt)}</span>
                    </div>
                </div>
                
                <div className="review-content">
                    {!comment.parentReviewId && comment.rating > 0 && <StarRating rating={comment.rating} readOnly={true} />} 
                    <p>{comment.comment}</p>
                    
                    {user && (
                        <>
                            <button className="reply-btn" onClick={() => setIsReplying(prev => !prev)}>
                                <FaReply /> {isReplying ? 'Cancel Reply' : 'Reply'}
                            </button>

                            {isReplying && (
                                <form onSubmit={handleReplySubmit} className="reply-form">
                                    <textarea
                                        rows="2"
                                        value={replyComment}
                                        onChange={(e) => setReplyComment(e.target.value)}
                                        placeholder="Type your reply to this comment..."
                                        required
                                    />
                                    <div className="reply-actions">
                                        <button 
                                            type="submit" 
                                            disabled={loading || !replyComment.trim()} 
                                            className="reply-submit-btn" 
                                        >
                                            {loading ? 'Sending...' : 'Post Reply'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 2. All Replies Flattened */}
            {allFlatReplies.map(reply => (
                <ReplyCard
                    key={reply._id}
                    reply={reply}
                    noteId={noteId}
                    onReviewAdded={onReviewAdded}
                    user={user}
                    token={token}
                    parentId={comment._id} // The top-level comment ID
                />
            ))}
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
    
    // --- UPDATED LOGIC FOR TARGETED USERNAME AND HIERARCHY ---
    const buildCommentThreads = useCallback((flatReviews) => {
        const map = {};
        const rootComments = [];

        // Step 1: Map all reviews and initialize replies array, attaching the immediate parent user
        flatReviews.forEach(r => { 
            // Find the user object of the direct parent *comment*
            const parentComment = r.parentReviewId 
                ? flatReviews.find(p => p._id === r.parentReviewId) 
                : null;
            
            let parentUser = null;
            
            // If the immediate parent comment is available in the current list, use its user data
            if (parentComment && parentComment.user) {
                 parentUser = parentComment.user;
            } 

            map[r._id] = { 
                ...r, 
                replies: [],
                // This property holds the user of the comment being replied to
                parentUser: parentUser 
            }; 
        });

        // Step 2: Build the hierarchy
        Object.values(map).forEach(r => {
            if (r.parentReviewId) {
                const parent = map[r.parentReviewId];
                if (parent) {
                    parent.replies.push(r);
                } else {
                    rootComments.push(r); 
                }
            } else {
                rootComments.push(r);
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
            await axios.post(`/notes/${noteId}/reviews`, { rating, comment }, config);
            
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
