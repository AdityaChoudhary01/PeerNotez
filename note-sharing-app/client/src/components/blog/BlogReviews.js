import React, { useState } from 'react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import StarRating from '../common/StarRating';
import { Link } from 'react-router-dom';
import { FaReply, FaPaperPlane } from 'react-icons/fa';

// Utility for formatting dates
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

// --- INTERNAL CSS: HOLOGRAPHIC REVIEWS ---
const styles = {
    sectionTitle: {
        fontSize: '1.8rem',
        marginBottom: '2rem',
        background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: '700'
    },
    reviewCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    replyCard: {
        marginLeft: '3rem',
        marginTop: '1rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderLeft: '2px solid rgba(0, 212, 255, 0.3)',
        padding: '1rem',
        borderRadius: '0 12px 12px 0'
    },
    authorHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem'
    },
    avatar: {
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        marginRight: '15px',
        border: '2px solid rgba(0, 212, 255, 0.5)',
        objectFit: 'cover'
    },
    authorInfo: {
        display: 'flex',
        flexDirection: 'column'
    },
    authorName: {
        fontWeight: '700',
        color: '#fff',
        fontSize: '1rem'
    },
    date: {
        fontSize: '0.8rem',
        color: 'rgba(255, 255, 255, 0.5)'
    },
    content: {
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 1.6,
        marginBottom: '1rem',
        fontFamily: "'Spline Sans', sans-serif"
    },
    replyBtn: {
        background: 'transparent',
        border: 'none',
        color: '#00d4ff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.9rem',
        fontWeight: '600',
        padding: 0,
        marginTop: '0.5rem'
    },
    replyForm: {
        marginTop: '1rem',
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
    },
    textArea: {
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        borderRadius: '8px',
        padding: '10px',
        fontFamily: 'inherit',
        resize: 'vertical',
        marginBottom: '10px',
        outline: 'none',
        minHeight: '80px'
    },
    submitBtn: {
        background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
        color: '#fff',
        border: 'none',
        padding: '8px 20px',
        borderRadius: '50px',
        cursor: 'pointer',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem'
    },
    mainForm: {
        marginTop: '3rem',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600'
    },
    replyingTo: {
        color: '#ff00cc',
        fontWeight: '600',
        marginLeft: '4px'
    }
};

// ----------------------------
// Single Reply Card Component
// ----------------------------
const ReplyCard = ({ reply, postId, onReviewAdded, user, token }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyComment, setReplyComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/blogs/${postId}/reviews`, {
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
    <div style={{...styles.reviewCard, ...styles.replyCard}}>
      <div style={styles.authorHeader}>
        <img
          src={reply.user?.avatar || 'https://via.placeholder.com/40'}
          alt={reply.user?.name || 'Deleted User'}
          style={{...styles.avatar, width: '35px', height: '35px'}}
        />
        <div style={styles.authorInfo}>
          <div style={styles.authorName}>
            {reply.user?.name || 'Deleted User'}
            {reply.parentUser?.name && (
              <span style={styles.replyingTo}> @{reply.parentUser.name}</span>
            )}
          </div>
          <span style={styles.date}>{formatDate(reply.createdAt)}</span>
        </div>
      </div>

      <div style={styles.content}>
        <p style={{margin: 0}}>{reply.comment}</p>

        {user && (
          <>
            <button 
                style={styles.replyBtn} 
                onClick={() => setIsReplying(prev => !prev)}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ff00cc'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#00d4ff'}
            >
              <FaReply /> {isReplying ? 'Cancel' : 'Reply'}
            </button>

            {isReplying && (
              <form onSubmit={handleReplySubmit} style={styles.replyForm}>
                <textarea
                  rows="2"
                  value={replyComment}
                  onChange={(e) => setReplyComment(e.target.value)}
                  placeholder={`Replying to ${reply.user?.name || 'this comment'}...`}
                  required
                  style={styles.textArea}
                />
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Sending...' : 'Post Reply'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};


// ----------------------------
// CommentThread Component
// ----------------------------
const CommentThread = ({ comment, postId, onReviewAdded, user, token }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyComment, setReplyComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/blogs/${postId}/reviews`, {
        comment: replyComment,
        parentReviewId: comment._id,
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

  // Extract all replies into a single flat array
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
    <div>
      {/* Main Top-Level Comment */}
      <div style={styles.reviewCard}>
        <div style={styles.authorHeader}>
          <img
            src={comment.user?.avatar || 'https://via.placeholder.com/45'}
            alt={comment.user?.name || 'Deleted User'}
            style={styles.avatar}
          />
          <div style={styles.authorInfo}>
            <strong style={styles.authorName}>{comment.user?.name || 'Deleted User'}</strong>
            <span style={styles.date}>{formatDate(comment.createdAt)}</span>
          </div>
        </div>

        <div style={styles.content}>
          {!comment.parentReviewId && comment.rating > 0 && (
             <div style={{marginBottom: '0.5rem'}}>
                <StarRating rating={comment.rating} readOnly />
             </div>
          )}
          <p style={{margin: 0}}>{comment.comment}</p>

          {user && (
            <>
              <button 
                style={styles.replyBtn} 
                onClick={() => setIsReplying(prev => !prev)}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ff00cc'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#00d4ff'}
              >
                <FaReply /> {isReplying ? 'Cancel' : 'Reply'}
              </button>

              {isReplying && (
                <form onSubmit={handleReplySubmit} style={styles.replyForm}>
                  <textarea
                    rows="2"
                    value={replyComment}
                    onChange={(e) => setReplyComment(e.target.value)}
                    placeholder="Type your reply..."
                    required
                    style={styles.textArea}
                  />
                  <button type="submit" disabled={loading} style={styles.submitBtn}>
                    {loading ? 'Sending...' : 'Post Reply'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Flattened Replies */}
      {allFlatReplies.map(reply => (
        <ReplyCard
          key={reply._id}
          reply={reply}
          postId={postId}
          onReviewAdded={onReviewAdded}
          user={user}
          token={token}
        />
      ))}
    </div>
  );
};

// ----------------------------
// Main BlogReviews Component
// ----------------------------
const BlogReviews = ({ blogId, reviews, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  // --- THREAD BUILDING LOGIC ---
  const buildCommentThreads = (flatReviews) => {
    const map = {};
    const rootComments = [];

    // Step 1: Map & Attach Parent User
    flatReviews.forEach(r => { 
        const parentComment = r.parentReviewId 
            ? flatReviews.find(p => p._id === r.parentReviewId) 
            : null;
        
        let parentUser = null;
        if (parentComment && parentComment.user) {
             parentUser = parentComment.user;
        } 

        map[r._id] = { ...r, replies: [], parentUser: parentUser }; 
    });

    // Step 2: Build Hierarchy
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

    return rootComments;
  };

  const commentThreads = buildCommentThreads(reviews);
  const alreadyReviewedTopLevel = reviews.some(r => r.user?._id === user?._id && !r.parentReviewId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please provide a star rating.');

    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/blogs/${blogId}/reviews`, { rating, comment }, config);
      setRating(0);
      setComment('');
      onReviewAdded();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={styles.sectionTitle}>Discussion ({reviews.length})</h2>

      <div>
        {commentThreads.length === 0 && <p style={{color: 'rgba(255,255,255,0.6)'}}>No comments yet. Start the discussion!</p>}
        {commentThreads.map(thread => (
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

      {user && !alreadyReviewedTopLevel && (
        <div style={styles.mainForm}>
          <h3 style={{marginBottom: '1.5rem', color: '#fff'}}>Leave a Review</h3>
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '1.5rem'}}>
              <label style={styles.label}>Your Rating</label>
              <StarRating rating={rating} setRating={setRating} />
            </div>
            <div style={{marginBottom: '1.5rem'}}>
              <label style={styles.label}>Your Comment</label>
              <textarea
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on this article..."
                required
                style={styles.textArea}
              />
            </div>
            <button type="submit" disabled={loading} style={{...styles.submitBtn, padding: '12px 30px', fontSize: '1rem'}}>
              {loading ? 'Submitting...' : <><FaPaperPlane /> Submit Review</>}
            </button>
          </form>
        </div>
      )}

      {!user && (
        <div style={{...styles.mainForm, textAlign: 'center'}}>
            <p>
                Please <Link to="/login" style={{ color: '#00d4ff', fontWeight: 'bold' }}>log in</Link> to share your feedback.
            </p>
        </div>
      )}
    </div>
  );
};

export default BlogReviews;
