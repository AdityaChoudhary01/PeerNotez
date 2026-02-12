import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaReply, FaPaperPlane } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import StarRating from '../common/StarRating';
import RoleBadge from '../common/RoleBadge'; // Import Badge
import { optimizeCloudinaryUrl } from '../../utils/cloudinaryHelper';

// Super Admin Config
const MAIN_ADMIN_EMAIL = process.env.REACT_APP_MAIN_ADMIN_EMAIL;

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

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
    authorNameLink: {
        fontWeight: '700',
        color: '#fff',
        fontSize: '1rem',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    authorNameStatic: {
        fontWeight: '700',
        color: '#fff',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'default'
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
        marginLeft: '4px',
        fontSize: '0.9rem'
    }
};

// --- ReplyCard Component ---
const ReplyCard = ({ reply, noteId, onReviewAdded, user, token }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyComment, setReplyComment] = useState('');
    const [loading, setLoading] = useState(false);

    // Check if reply author is Super Admin
    const isReplyAuthorSuperAdmin = reply.user?.email === MAIN_ADMIN_EMAIL;

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Ensure this endpoint matches your backend route for notes reviews
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

    // Avatar Logic
    const avatarUrl = optimizeCloudinaryUrl(reply.user?.avatar || 'https://via.placeholder.com/40', { width: 80, height: 80, isProfile: true });
    const avatarStyle = { ...styles.avatar, width: '35px', height: '35px', border: isReplyAuthorSuperAdmin ? '2px solid #FFD700' : '2px solid rgba(0, 212, 255, 0.5)' };

    return (
        <div style={{...styles.reviewCard, ...styles.replyCard}}>
            <div style={styles.authorHeader}>
                {/* Avatar */}
                {isReplyAuthorSuperAdmin ? (
                     <img src={avatarUrl} alt="Admin" style={{...avatarStyle, cursor: 'default'}} loading="lazy" />
                ) : (
                    <Link to={`/profile/${reply.user?._id}`}>
                        <img src={avatarUrl} alt={reply.user?.name} style={avatarStyle} loading="lazy" />
                    </Link>
                )}

                <div style={styles.authorInfo}>
                    {/* Name & Badge */}
                    {isReplyAuthorSuperAdmin ? (
                        <div style={styles.authorNameStatic}>
                            {reply.user?.name || 'Deleted User'}
                            <RoleBadge user={reply.user} />
                            {reply.parentUser?.name && <span style={styles.replyingTo}>@{reply.parentUser.name}</span>}
                        </div>
                    ) : (
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <Link to={`/profile/${reply.user?._id}`} style={styles.authorNameLink}>
                                {reply.user?.name || 'Deleted User'}
                            </Link>
                            <span style={{marginLeft: '8px'}}><RoleBadge user={reply.user} /></span>
                            {reply.parentUser?.name && <span style={styles.replyingTo}>@{reply.parentUser.name}</span>}
                        </div>
                    )}
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

// --- CommentThread Component ---
const CommentThread = ({ comment, noteId, onReviewAdded, user, token }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyComment, setReplyComment] = useState('');
    const [loading, setLoading] = useState(false);

    // Check if main comment author is Super Admin
    const isCommentAuthorSuperAdmin = comment.user?.email === MAIN_ADMIN_EMAIL;

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Ensure this endpoint matches your backend route for notes reviews
            await axios.post(`/notes/${noteId}/reviews`, {
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

    // Avatar Logic
    const avatarUrl = optimizeCloudinaryUrl(comment.user?.avatar || 'https://via.placeholder.com/45', { width: 90, height: 90, isProfile: true });
    const avatarStyle = { ...styles.avatar, border: isCommentAuthorSuperAdmin ? '2px solid #FFD700' : '2px solid rgba(0, 212, 255, 0.5)' };

    return (
        <div>
            <div style={styles.reviewCard}>
                <div style={styles.authorHeader}>
                    {/* Avatar */}
                    {isCommentAuthorSuperAdmin ? (
                         <img src={avatarUrl} alt="Admin" style={{...avatarStyle, cursor: 'default'}} loading="lazy" />
                    ) : (
                        <Link to={`/profile/${comment.user?._id}`}>
                            <img src={avatarUrl} alt={comment.user?.name} style={avatarStyle} loading="lazy" />
                        </Link>
                    )}

                    <div style={styles.authorInfo}>
                        {/* Name */}
                        {isCommentAuthorSuperAdmin ? (
                            <div style={styles.authorNameStatic}>
                                {comment.user?.name || 'Deleted User'}
                                <RoleBadge user={comment.user} />
                            </div>
                        ) : (
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <Link to={`/profile/${comment.user?._id}`} style={styles.authorNameLink}>
                                    {comment.user?.name || 'Deleted User'}
                                </Link>
                                <span style={{marginLeft: '8px'}}><RoleBadge user={comment.user} /></span>
                            </div>
                        )}
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

            {allFlatReplies.map(reply => (
                <ReplyCard
                    key={reply._id}
                    reply={reply}
                    noteId={noteId}
                    onReviewAdded={onReviewAdded}
                    user={user}
                    token={token}
                />
            ))}
        </div>
    );
};

// --- Main Reviews Component ---
const Reviews = ({ noteId, reviews, onReviewAdded }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, token } = useAuth();

    const buildCommentThreads = useCallback((flatReviews) => {
        if (!flatReviews) return [];
        const map = {};
        const rootComments = [];

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
        
        // Sort: Newest first
        rootComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return rootComments;
    }, []);

    const commentThreads = buildCommentThreads(reviews);
    
    // Check if user already posted a top-level review (no parentReviewId)
    const alreadyReviewedTopLevel = reviews 
        ? reviews.some(r => r.user?._id === user?._id && !r.parentReviewId)
        : false;

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
            // Ensure this matches your backend route
            await axios.post(`/notes/${noteId}/reviews`, { rating, comment }, config);
            
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
        <div>
            <h2 style={styles.sectionTitle}>Ratings & Reviews ({reviews ? reviews.length : 0})</h2>
            
            <div>
                {commentThreads.length === 0 && <p style={{color: 'rgba(255,255,255,0.6)'}}>No reviews yet. Be the first!</p>}
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

            {user && !alreadyReviewedTopLevel && (
                <div style={styles.mainForm}>
                    <h3 style={{marginBottom: '1.5rem', color: '#fff'}}>Write a Top-Level Review</h3>
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
                                placeholder="Share your thoughts on these notes and provide a rating..."
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

            {user && alreadyReviewedTopLevel && (
                 <div style={{...styles.mainForm, textAlign: 'center', borderColor: '#00d4ff'}}>
                    <p style={{color: '#00d4ff'}}>
                        You have already posted a top-level review/rating. You can reply to any existing comment instead.
                    </p>
                </div>
            )}

            {!user && (
                 <div style={{...styles.mainForm, textAlign: 'center'}}>
                    <p style={{color: 'rgba(255,255,255,0.8)'}}>
                        Please <Link to="/login" style={{ color: '#00d4ff', fontWeight: 'bold' }}>log in</Link> to submit a review or comment.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Reviews;
