import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
    FaMapMarkerAlt, FaCalendarAlt, FaBook, FaRss, 
    FaUserPlus, FaUserCheck, FaSpinner, FaUniversity, FaTimes 
} from 'react-icons/fa';
import NoteCard from '../components/notes/NoteCard';
import BlogCard from '../components/blog/BlogCard';
import useAuth from '../hooks/useAuth';

const PublicProfilePage = () => {
    const { userId } = useParams();
    const { user: currentUser, token, updateUser } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [notes, setNotes] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [activeTab, setActiveTab] = useState('notes'); 
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [error, setError] = useState('');

    // --- Modal State ---
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', data: [] });
    const [modalLoading, setModalLoading] = useState(false);

    // Sync isFollowing state with the global Auth Context
    useEffect(() => {
        if (currentUser && userId) {
            const followingList = currentUser.following || [];
            setIsFollowing(followingList.includes(userId));
        }
    }, [currentUser, userId]);

    const fetchProfileData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: user } = await axios.get(`/users/${userId}/profile`);
            setProfile(user);
            
            const [notesRes, blogsRes] = await Promise.allSettled([
                axios.get(`/notes/user/${userId}`),
                axios.get(`/blogs/user/${userId}`)
            ]);

            setNotes(notesRes.status === 'fulfilled' ? notesRes.value.data.notes : []);
            setBlogs(blogsRes.status === 'fulfilled' ? blogsRes.value.data.blogs : []);

        } catch (err) {
            setError('User not found or connection error.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleFollowToggle = async () => {
        if (!currentUser) return alert("Please log in to follow.");
        setFollowLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put(`/users/${userId}/follow`, {}, config);
            
            setIsFollowing(data.isFollowing);
            
            if(data.userFollowing && updateUser) {
                updateUser({ following: data.userFollowing }); 
            }

            setProfile(prev => ({
                ...prev,
                followersCount: data.isFollowing ? (prev.followersCount || 0) + 1 : (prev.followersCount || 1) - 1
            }));
        } catch (err) {
            alert('Failed to update follow status.');
        } finally {
            setFollowLoading(false);
        }
    };

    // --- Fetch and Show Followers/Following List ---
    const openUserList = async (type) => {
        setModalConfig({ isOpen: true, type, data: [] });
        setModalLoading(true);
        try {
            // Adjust endpoint if your backend uses a different path for populated lists
            const { data } = await axios.get(`/users/${userId}/${type}`);
            setModalConfig(prev => ({ ...prev, data: data.users || [] }));
        } catch (err) {
            console.error("Failed to fetch list", err);
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><FaSpinner className="fa-spin" style={{ fontSize: '2rem', color: '#00d4ff' }} /></div>;
    if (error || !profile) return <div style={{ textAlign: 'center', padding: '5rem', color: '#fff' }}><h2>{error || "User Not Found"}</h2></div>;

    const isOwnProfile = currentUser?._id === profile._id;

    // --- SEO ENHANCEMENT: META STRINGS ---
    const seoTitle = `${profile.name} | Student Profile at PeerNotez`;
    const seoDescription = `View ${profile.name}'s academic contributions on PeerNotez. Exploring ${notes.length} notes and ${blogs.length} blogs from ${profile.university || 'their university'}.`;
    const profileUrl = `https://peernotez.netlify.app/profile/${userId}`;
    const profileImage = profile.avatar || `https://peernotez.netlify.app/logo192.png`;

    // --- SEO ENHANCEMENT: JSON-LD SCHEMA ---
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": profile.name,
        "url": profileUrl,
        "image": profileImage,
        "description": profile.bio || seoDescription,
        "affiliation": {
            "@type": "Organization",
            "name": profile.university || "PeerNotez Contributor"
        },
        "interactionStatistic": [
            {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/FollowAction",
                "userInteractionCount": profile.followersCount || 0
            }
        ]
    };

    return (
        <div className="profile-container">
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={profileUrl} />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="profile" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:image" content={profileImage} />
                <meta property="og:url" content={profileUrl} />
                
                {/* Twitter */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                <meta name="twitter:image" content={profileImage} />

                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>

            <div className="profile-header-card">
                <div className="gradient-overlay"></div>
                
                <div className="header-flex">
                    <div className="avatar-section">
                        <img 
                            src={profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}&backgroundColor=00d4ff`} 
                            alt={profile.name} 
                            className="main-avatar"
                        />
                    </div>

                    <div className="info-section">
                        <div className="title-row">
                            <div className="name-box">
                                <h1>{profile.name}</h1>
                                <span className="role-badge">Verified Contributor</span>
                            </div>
                            
                            {!isOwnProfile && (
                                <button 
                                    onClick={handleFollowToggle} 
                                    disabled={followLoading}
                                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                                >
                                    {followLoading ? '...' : (isFollowing ? <><FaUserCheck /> Following</> : <><FaUserPlus /> Follow</>)}
                                </button>
                            )}
                        </div>

                        <div className="meta-list">
                            {profile.university && <span><FaUniversity /> {profile.university}</span>}
                            {profile.location && <span><FaMapMarkerAlt /> {profile.location}</span>}
                            <span><FaCalendarAlt /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                        </div>

                        {profile.bio && <p className="bio-text">{profile.bio}</p>}

                        <div className="stats-grid">
                            <div className="stat"><span className="val">{notes.length}</span><span className="lab">Notes</span></div>
                            <div className="stat"><span className="val">{blogs.length}</span><span className="lab">Blogs</span></div>
                            
                            {/* CLICKABLE FOLLOWERS */}
                            <div className="stat clickable" onClick={() => openUserList('followers')}>
                                <span className="val">{profile.followersCount || 0}</span>
                                <span className="lab">Followers</span>
                            </div>
                            
                            {/* CLICKABLE FOLLOWING */}
                            <div className="stat clickable" onClick={() => openUserList('following')}>
                                <span className="val">{profile.followingCount || 0}</span>
                                <span className="lab">Following</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="tab-bar">
                <button onClick={() => setActiveTab('notes')} className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}><FaBook /> Notes</button>
                <button onClick={() => setActiveTab('blogs')} className={`tab-btn ${activeTab === 'blogs' ? 'active' : ''}`}><FaRss /> Blogs</button>
            </div>

            <div className="content-grid">
                {activeTab === 'notes' ? (
                    notes.length > 0 ? notes.map(note => <NoteCard key={note._id} note={note} />) : 
                    <div className="empty-notice">No notes available.</div>
                ) : (
                    blogs.length > 0 ? blogs.map(blog => <BlogCard key={blog._id} blog={blog} />) : 
                    <div className="empty-notice">No blog posts available.</div>
                )}
            </div>

            {/* --- LIST MODAL --- */}
            {modalConfig.isOpen && (
                <div className="modal-overlay" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
                    <div className="user-list-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{modalConfig.type.charAt(0).toUpperCase() + modalConfig.type.slice(1)}</h3>
                            <button className="close-btn" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}><FaTimes /></button>
                        </div>
                        <div className="modal-body">
                            {modalLoading ? (
                                <div className="modal-loader"><FaSpinner className="fa-spin" /></div>
                            ) : modalConfig.data.length > 0 ? (
                                modalConfig.data.map(u => (
                                    <Link to={`/profile/${u._id}`} key={u._id} className="user-item" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
                                        <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} alt={u.name} />
                                        <span>{u.name}</span>
                                    </Link>
                                ))
                            ) : (
                                <p className="empty-list">No users found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .profile-container { max-width: 1200px; margin: 0 auto; padding: 1rem; box-sizing: border-box; }
                .profile-header-card { 
                    background: rgba(255, 255, 255, 0.03); 
                    border: 1px solid rgba(255, 255, 255, 0.1); 
                    border-radius: 30px; padding: 2.5rem; position: relative; overflow: hidden; margin-bottom: 2rem;
                }
                .gradient-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: linear-gradient(90deg, #00d4ff, #ff00cc); }
                .header-flex { display: flex; gap: 3rem; align-items: flex-start; }
                .main-avatar { width: 160px; height: 160px; border-radius: 50%; border: 4px solid rgba(255, 255, 255, 0.1); object-fit: cover; box-shadow: 0 0 30px rgba(0, 212, 255, 0.2); }
                .info-section { flex: 1; }
                .title-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
                .name-box h1 { margin: 0; font-size: clamp(1.5rem, 4vw, 2.5rem); color: #fff; }
                .role-badge { color: #00d4ff; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
                .meta-list { display: flex; flex-wrap: wrap; gap: 1.5rem; color: rgba(255,255,255,0.5); margin: 1.5rem 0; font-size: 0.9rem; }
                .bio-text { color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 2rem; max-width: 800px; }
                .stats-grid { display: flex; gap: 3rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; }
                .val { display: block; font-size: 1.5rem; font-weight: 800; color: #fff; }
                .lab { font-size: 0.75rem; color: rgba(255,255,255,0.4); text-transform: uppercase; }
                
                .stat.clickable { cursor: pointer; transition: 0.2s; }
                .stat.clickable:hover .val { color: #00d4ff; }

                .follow-btn { padding: 12px 28px; border-radius: 50px; border: none; background: linear-gradient(135deg, #00d4ff, #333399); color: #fff; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
                .follow-btn.following { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }
                .tab-bar { display: flex; gap: 1rem; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 20px; width: fit-content; margin: 0 auto 2rem; border: 1px solid rgba(255,255,255,0.05); }
                .tab-btn { background: transparent; border: none; padding: 12px 25px; color: rgba(255,255,255,0.5); cursor: pointer; border-radius: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
                .tab-btn.active { background: rgba(255,255,255,0.1); color: #fff; }
                .content-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
                .empty-notice { grid-column: 1/-1; text-align: center; padding: 5rem; color: rgba(255,255,255,0.3); border: 2px dashed rgba(255,255,255,0.05); border-radius: 30px; }

                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); }
                .user-list-modal { background: #121220; border: 1px solid rgba(255,255,255,0.1); width: 90%; max-width: 400px; border-radius: 24px; overflow: hidden; animation: slideUp 0.3s ease-out; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .modal-header { padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
                .modal-header h3 { color: #fff; margin: 0; font-size: 1.2rem; }
                .close-btn { background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; }
                .modal-body { max-height: 400px; overflow-y: auto; padding: 1rem; }
                .user-item { display: flex; align-items: center; gap: 1rem; padding: 0.8rem; border-radius: 12px; text-decoration: none; color: #fff; transition: 0.2s; }
                .user-item:hover { background: rgba(255,255,255,0.05); }
                .user-item img { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #00d4ff; }
                .modal-loader { text-align: center; padding: 2rem; color: #00d4ff; font-size: 1.5rem; }
                .empty-list { text-align: center; color: rgba(255,255,255,0.4); padding: 2rem; }

                @media (max-width: 900px) {
                    .header-flex { flex-direction: column; align-items: center; text-align: center; gap: 1.5rem; }
                    .stats-grid { justify-content: center; gap: 1.5rem; width: 100%; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1.5rem; }
                    .meta-list { justify-content: center; }
                    .follow-btn { width: 100%; justify-content: center; order: 2; }
                    .profile-header-card { padding: 1.5rem; }
                }
                @media (max-width: 480px) {
                    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
                    .tab-bar { width: 100%; display: flex; }
                    .tab-btn { flex: 1; padding: 12px 10px; font-size: 0.85rem; }
                    .main-avatar { width: 120px; height: 120px; }
                }
            `}</style>
        </div>
    );
};

export default PublicProfilePage;
