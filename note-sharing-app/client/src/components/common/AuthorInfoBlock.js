import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaUserCheck, FaCrown, FaInfoCircle } from 'react-icons/fa'; 
import useAuth from '../../hooks/useAuth'; 
import { optimizeCloudinaryUrl } from '../../utils/cloudinaryHelper';
import RoleBadge from './RoleBadge'; // Make sure this path is correct!

const AuthorInfoBlock = ({ author }) => {
    const { user, token, updateUser } = useAuth();
    
    // --- SUPER ADMIN LOGIC ---
    // If author is missing, default to false to prevent errors
    const MAIN_ADMIN_EMAIL = process.env.REACT_APP_MAIN_ADMIN_EMAIL;
    const isSuperAdmin = author?.email === MAIN_ADMIN_EMAIL;

    // Determine if the current viewer is the author
    const isOwner = user?._id === author?._id;
    
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && author && !isOwner) {
            const followingList = user.following || [];
            setIsFollowing(followingList.includes(author._id));
        }
    }, [user, author, isOwner]);

    // --- STYLES ---
    const styles = {
        card: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        },
        glow: {
            position: 'absolute',
            top: '-50%',
            left: '-20%',
            width: '200px',
            height: '200px',
            background: isOwner 
                ? 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)' 
                : 'radial-gradient(circle, rgba(0, 212, 255, 0.15), transparent 70%)',
            pointerEvents: 'none'
        },
        link: {
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            gap: '15px',
            zIndex: 1,
            cursor: 'pointer'
        },
        // Static style for Super Admin (disabled cursor)
        staticContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            zIndex: 1,
            cursor: 'default', // Arrow cursor
            pointerEvents: 'none' // Disables clicking entirely on this container
        },
        avatar: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: isOwner ? '2px solid #6366f1' : '2px solid rgba(0, 212, 255, 0.6)',
            objectFit: 'cover',
            boxShadow: isOwner ? '0 0 15px rgba(99, 102, 241, 0.3)' : '0 0 15px rgba(0, 212, 255, 0.3)',
            pointerEvents: 'auto' // Re-enable pointer events for the image itself if needed, but wrapper blocks link
        },
        name: {
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
        },
        stats: {
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: "'Spline Sans', sans-serif"
        },
        // Legacy Elite Badge
        eliteBadge: {
            fontSize: '0.7rem',
            background: 'linear-gradient(45deg, #bc13fe, #7a00cc)', 
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: '5px'
        },
        btnWrapper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            zIndex: 2
        },
        authorStatus: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            fontWeight: '600',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '8px 16px',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        btn: {
            padding: '10px 20px',
            borderRadius: '50px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
        },
        followBtn: {
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff'
        },
        followingBtn: {
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff'
        }
    };

    const handleFollowToggle = async () => {
        if (!user) {
            alert('Please log in to follow authors.');
            return;
        }
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put(`/users/${author._id}/follow`, {}, config); 
            setIsFollowing(data.isFollowing); 
            if(data.userFollowing && updateUser) {
                updateUser({ following: data.userFollowing }); 
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update follow status.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!author) return null;

    const optimizedAvatar = optimizeCloudinaryUrl(author.avatar || 'https://via.placeholder.com/60', { 
        width: 120, 
        height: 120, 
        isProfile: true 
    });

    // --- CONDITIONAL RENDERER ---
    // If Super Admin, use 'div' (not clickable). Else use 'Link'.
    const ContentWrapper = isSuperAdmin ? 'div' : Link;
    
    // Props based on type
    const wrapperProps = isSuperAdmin 
        ? { style: styles.staticContainer, className: "author-link-wrapper" }
        : { to: `/profile/${author._id}`, style: styles.link, className: "author-link-wrapper" };

    return (
        <div 
            className="author-info-card"
            style={styles.card}
            // Disable hover lift effect for Super Admin
            onMouseEnter={(e) => !isSuperAdmin && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !isSuperAdmin && (e.currentTarget.style.transform = 'translateY(0)')}
        >
            <div style={styles.glow}></div>

            <ContentWrapper {...wrapperProps}>
                <img 
                    src={optimizedAvatar} 
                    alt={`Avatar of ${author.name}`} 
                    loading="lazy"
                    style={styles.avatar}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={styles.name}>
                        {author.name}
                        
                        {/* 1. ROLE BADGE (Super Admin / Admin) */}
                        {/* Ensure 'author' object has 'role' and 'email' fields! */}
                        <RoleBadge user={author} />

                        {/* 2. ACTIVITY BADGE (Elite) */}
                        {author.noteCount >= 50 && (
                            <span style={styles.eliteBadge}><FaCrown /> Elite</span>
                        )}
                    </div>
                    
                    <span style={styles.stats}>
                        {author.noteCount > 0 && `${author.noteCount} Notes`} 
                        {author.noteCount > 0 && author.blogCount > 0 && ` • `}
                        {author.blogCount > 0 && `${author.blogCount} Blogs`} 
                        {(author.noteCount === 0 && author.blogCount === 0) && "New Contributor"}
                    </span>
                </div>
            </ContentWrapper>
            
            {/* ACTION BUTTONS */}
            {/* If Super Admin, HIDE the buttons completely */}
            {!isSuperAdmin && (
                <div style={styles.btnWrapper} className="author-action-wrapper">
                    {isOwner ? (
                        <div style={styles.authorStatus}>
                            <FaInfoCircle /> You are the Author
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={handleFollowToggle} 
                                style={isFollowing ? {...styles.btn, ...styles.followingBtn} : {...styles.btn, ...styles.followBtn}}
                                disabled={loading}
                                aria-label={isFollowing ? `Unfollow ${author.name}` : `Follow ${author.name}`}
                            >
                                {loading ? 'Updating...' : (
                                    isFollowing ? <><FaUserCheck /> Following</> : <><FaUserPlus /> Follow</>
                                )}
                            </button>
                            {!user && <span style={{fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '5px'}}>Log in to follow</span>}
                        </>
                    )}
                </div>
            )}

            <style>{`
                @media (max-width: 600px) {
                    .author-info-card { flex-direction: column; align-items: flex-start !important; gap: 1rem; padding: 1rem !important; }
                    .author-link-wrapper, .author-action-wrapper { width: 100%; }
                    .author-action-wrapper { align-items: stretch !important; margin-top: 0.5rem; }
                }
            `}</style>
        </div>
    );
};

export default AuthorInfoBlock;
