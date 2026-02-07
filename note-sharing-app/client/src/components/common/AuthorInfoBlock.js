import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaUserCheck, FaCrown } from 'react-icons/fa'; 
import useAuth from '../../hooks/useAuth'; // Adjust path if necessary based on folder structure

const AuthorInfoBlock = ({ author }) => {
    // Current user context
    const { user, token, updateUser } = useAuth();
    
    // Determine if the current viewer is the author
    const isOwner = user?._id === author?._id;
    
    // Check if the current user is following the author (based on context)
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && author) {
            // Check the current user's following array
            // Ensure user.following exists to prevent crash
            const followingList = user.following || [];
            setIsFollowing(followingList.includes(author._id));
        }
    }, [user, author]);

    // --- INTERNAL CSS: HOLOGRAPHIC AUTHOR CARD ---
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
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15), transparent 70%)',
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
        avatarWrapper: {
            position: 'relative'
        },
        avatar: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '2px solid rgba(0, 212, 255, 0.6)',
            objectFit: 'cover',
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)'
        },
        details: {
            display: 'flex',
            flexDirection: 'column'
        },
        name: {
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        stats: {
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: "'Spline Sans', sans-serif"
        },
        badge: {
            fontSize: '0.7rem',
            background: 'linear-gradient(45deg, #ffd700, #ffaa00)',
            color: '#000',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: '8px',
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.4)'
        },
        btnWrapper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            zIndex: 2
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
            transition: 'all 0.3s ease',
            zIndex: 1
        },
        followBtn: {
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'
        },
        followingBtn: {
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff'
        },
        loginText: {
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '5px'
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
            // Ensure this endpoint matches your backend route
            const { data } = await axios.put(`/users/${author._id}/follow`, {}, config); 
            
            setIsFollowing(data.isFollowing); 
            
            // If the context provider allows updating the user object locally
            if(data.userFollowing && updateUser) {
                updateUser({ following: data.userFollowing }); 
            }

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to update follow status.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!author || isOwner) {
        return null;
    }

    return (
        <div 
            className="author-info-card"
            style={styles.card}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={styles.glow}></div>

            {/* Link wrapper directs to the Public Profile */}
            <Link to={`/profile/${author._id}`} style={styles.link} className="author-link-wrapper">
                <div style={styles.avatarWrapper}>
                    <img 
                        src={author.avatar || 'https://via.placeholder.com/60'} 
                        alt={`Avatar of ${author.name}`} 
                        style={styles.avatar}
                    />
                </div>
                <div style={styles.details}>
                    <div style={styles.name}>
                        {author.name}
                        {author.noteCount >= 50 && (
                            <span style={styles.badge} title="Power Uploader">
                                <FaCrown /> Elite
                            </span>
                        )}
                    </div>
                    <span style={styles.stats}>
                        {author.noteCount > 0 && `${author.noteCount} Notes`} 
                        {author.noteCount > 0 && author.blogCount > 0 && ` • `}
                        {author.blogCount > 0 && `${author.blogCount} Blogs`} 
                        {(author.noteCount === 0 && author.blogCount === 0) && "New Contributor"}
                    </span>
                </div>
            </Link>
            
            <div style={styles.btnWrapper} className="author-action-wrapper">
                <button 
                    onClick={handleFollowToggle} 
                    style={isFollowing ? {...styles.btn, ...styles.followingBtn} : {...styles.btn, ...styles.followBtn}}
                    disabled={loading}
                    onMouseEnter={(e) => !isFollowing && (e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.5)')}
                    onMouseLeave={(e) => !isFollowing && (e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)')}
                >
                    {loading ? 'Updating...' : (
                        isFollowing ? <><FaUserCheck /> Following</> : <><FaUserPlus /> Follow</>
                    )}
                </button>
                {!user && <span style={styles.loginText}>Log in to follow</span>}
            </div>

            {/* RESPONSIVE STYLES */}
            <style>{`
                @media (max-width: 600px) {
                    .author-info-card {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 1rem;
                        padding: 1rem !important;
                    }
                    .author-link-wrapper {
                        width: 100%;
                    }
                    .author-action-wrapper {
                        width: 100%;
                        align-items: stretch !important; /* Make button full width */
                        margin-top: 0.5rem;
                    }
                    .author-action-wrapper button {
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default AuthorInfoBlock;
