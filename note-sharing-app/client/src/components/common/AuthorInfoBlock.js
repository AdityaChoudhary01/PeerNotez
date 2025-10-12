import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaUserCheck, FaStar } from 'react-icons/fa'; 
import useAuth from '../../hooks/useAuth';

const AuthorInfoBlock = ({ author, contentId, contentType }) => {
    // Current user context
    const { user, token, updateUser } = useAuth();
    
    // Determine if the current viewer is the author
    const isOwner = user?._id === author?._id;
    
    // Check if the current user is following the author (based on context)
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (user && author) {
            // Check the current user's following array
            setIsFollowing(user.following?.includes(author._id));
        }
    }, [user, author]);

    const handleFollowToggle = async () => {
        if (!user) {
            alert('Please log in to follow authors.');
            return;
        }
        
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // CRITICAL FIX: Use the relative path. This hits the client's proxy (localhost:3000)
            // which then forwards the request to the backend (localhost:5001) during development.
            const { data } = await axios.put(`/users/${author._id}/follow`, {}, config); 
            
            // Update local state and context immediately
            setIsFollowing(data.isFollowing); 
            updateUser({ following: data.userFollowing }); 
            
            alert(data.message);

        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update follow status.');
        }
    };
    
    // Do not render if author data is missing or if user is the owner
    if (!author || isOwner) {
        return null;
    }

    return (
        <div className="author-info-block">
            <Link to={`/profile/${author._id}`} className="author-link">
                <img 
                    src={author.avatar || 'https://via.placeholder.com/60'} 
                    alt={`Avatar of ${author.name}`} 
                    className="author-avatar"
                />
                <div className="author-details">
                    <strong className="author-name">{author.name}</strong>
                    <span className="author-contributions">
                        {/* Display cached counts if available on the author object */}
                        {author.noteCount > 0 && `${author.noteCount} Notes`} 
                        {author.blogCount > 0 && ` | ${author.blogCount} Blogs`} 
                        {(author.noteCount === 0 && author.blogCount === 0) && "New Contributor"}
                    </span>
                    
                    {/* Placeholder for simple badges */}
                    {author.noteCount >= 50 && (
                         <span className="badge contributor-badge">
                            <FaStar style={{marginRight: '0.4rem', color: 'gold'}} /> Power Uploader
                        </span>
                    )}
                </div>
            </Link>
            
            <button 
                onClick={handleFollowToggle} 
                className={`action-button follow-btn ${isFollowing ? 'unfollow' : 'follow'}`}
                disabled={!user}
            >
                {isFollowing ? <><FaUserCheck /> Following</> : <><FaUserPlus /> Follow Author</>}
            </button>

            {!user && <p className="login-prompt">Log in to follow.</p>}
        </div>
    );
};
export default AuthorInfoBlock.js
