import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaSearch, FaRegComments, FaSpinner, FaTrash } from 'react-icons/fa';
import { ref, onValue, off, remove } from 'firebase/database';
import { db } from '../services/firebase';
import useAuth from '../hooks/useAuth';
import { optimizeCloudinaryUrl } from '../utils/cloudinaryHelper';
import RoleBadge from '../components/common/RoleBadge';

// --- SUB-COMPONENT: Individual Chat Item ---
const InboxItem = ({ chat, currentUserId, onDelete }) => {
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const longPressTimer = useRef(null);

    const isUnread = chat.unreadCount > 0;

    useEffect(() => {
        const statusRef = ref(db, `status/${chat.partnerId}`);
        const listener = onValue(statusRef, (snapshot) => {
            setStatus(snapshot.val());
        });
        return () => off(statusRef, 'value', listener);
    }, [chat.partnerId]);

    const getStatusText = () => {
        if (!status) return '';
        if (status.state === 'online') return 'Online';
        
        const diff = Date.now() - status.last_changed;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Active just now';
        if (minutes < 60) return `Active ${minutes}m ago`;
        if (hours < 24) return `Active ${hours}h ago`;
        return `Active ${days}d ago`;
    };

    const isOnline = status?.state === 'online';

    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => {
            if (window.confirm(`Delete conversation with ${chat.partnerName}?`)) {
                onDelete(chat.partnerId);
            }
        }, 800);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (window.confirm(`Delete conversation with ${chat.partnerName}?`)) {
            onDelete(chat.partnerId);
        }
    };

    return (
        <div 
            className="list-item-hover"
            onClick={() => navigate(`/chat/${chat.partnerId}`)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                borderRadius: '16px', 
                background: isUnread ? 'rgba(0, 212, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: isUnread ? '1px solid rgba(0, 212, 255, 0.2)' : '1px solid transparent', 
                cursor: 'pointer', transition: 'all 0.2s ease',
                marginBottom: '0.5rem', position: 'relative'
            }}
        >
            <div style={{ position: 'relative' }}>
                <img 
                    src={optimizeCloudinaryUrl(chat.partnerAvatar, { width: 60, height: 60, isProfile: true }) || `https://api.dicebear.com/7.x/initials/svg?seed=${chat.partnerName}`} 
                    alt={chat.partnerName} 
                    style={{ 
                        width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', 
                        border: isUnread ? '2px solid #00d4ff' : (isOnline ? '2px solid #00ffaa' : '2px solid rgba(255,255,255,0.1)') 
                    }}
                />
                {isOnline && (
                    <div style={{
                        position: 'absolute', bottom: '2px', right: '2px',
                        width: '12px', height: '12px', borderRadius: '50%',
                        background: '#00ffaa', border: '2px solid #121220'
                    }}/>
                )}
            </div>
            
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                        color: '#fff', fontWeight: isUnread ? '800' : '600', 
                        fontSize: '1rem', display: 'flex', alignItems: 'center'
                    }}>
                        {chat.partnerName}
                        <RoleBadge user={chat.partnerDetails} />
                    </span>
                    <span style={{ 
                        fontSize: '0.75rem', 
                        color: isOnline ? '#00ffaa' : 'rgba(255,255,255,0.4)',
                        fontWeight: isUnread ? '600' : '400' 
                    }}>
                        {isOnline ? 'Online' : getStatusText()}
                    </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <div style={{
                        color: isUnread ? '#fff' : 'rgba(255, 255, 255, 0.6)', 
                        fontSize: '0.9rem', whiteSpace: 'nowrap', 
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        fontWeight: isUnread ? '700' : '400', flex: 1
                    }}>
                        {chat.lastMessage}
                    </div>

                    {isHovered && (
                        <button 
                            className="delete-chat-btn"
                            onClick={handleDeleteClick}
                            style={{
                                background: 'none', border: 'none', color: '#ff0055', 
                                cursor: 'pointer', fontSize: '1rem', marginLeft: '10px',
                                display: window.matchMedia('(hover: hover)').matches ? 'block' : 'none'
                            }}
                            title="Delete Chat"
                        >
                            <FaTrash />
                        </button>
                    )}

                    {isUnread && (
                        <div style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: '#00d4ff', marginLeft: '10px',
                            boxShadow: '0 0 8px rgba(0, 212, 255, 0.6)'
                        }} />
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
const ChatListPage = () => {
    const { user: currentUser } = useAuth(); 
    const navigate = useNavigate();
    
    const [inbox, setInbox] = useState([]);
    const [searchResults, setSearchResults] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!currentUser?._id) return;

        const inboxRef = ref(db, `user_chats/${currentUser._id}`);
        
        const unsubscribe = onValue(inboxRef, async (snapshot) => {
            const data = snapshot.val();
            
            if (data) {
                const rawChats = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);

                const enrichedChats = await Promise.all(rawChats.map(async (chat) => {
                    try {
                        const { data: userProfile } = await axios.get(`/users/${chat.partnerId}/profile`);
                        return {
                            ...chat,
                            partnerName: userProfile.name,
                            partnerAvatar: userProfile.avatar,
                            partnerDetails: userProfile
                        };
                    } catch (err) {
                        // --- OPTION 1: PERMANENT AUTO-CLEANUP ---
                        if (err.response && err.response.status === 404) {
                            console.warn(`Deleting orphaned chat reference for: ${chat.partnerId}`);
                            const orphanRef = ref(db, `user_chats/${currentUser._id}/${chat.partnerId}`);
                            remove(orphanRef); // Removes from Firebase
                        }
                        return null; // Filter these out of the UI
                    }
                }));

                // Set only valid, non-null chats
                setInbox(enrichedChats.filter(chat => chat !== null));
            } else {
                setInbox([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length > 0) {
                setIsSearching(true);
                try {
                    const { data } = await axios.get(`/users/search?q=${searchTerm}`);
                    setSearchResults(data.users || []);
                } catch (err) {
                    console.error("Search failed", err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500); 

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleDeleteChat = async (partnerId) => {
        try {
            const chatRef = ref(db, `user_chats/${currentUser._id}/${partnerId}`);
            await remove(chatRef);
        } catch (error) {
            console.error("Failed to delete chat", error);
            alert("Failed to delete chat. Please try again.");
        }
    };

    const styles = {
        page: { maxWidth: '600px', margin: '0 auto', minHeight: '80vh', padding: '1rem', position: 'relative' },
        header: { marginBottom: '1.5rem', textAlign: 'center' },
        title: { fontSize: '1.5rem', fontWeight: '700', color: '#fff', margin: 0 },
        searchBox: { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', position: 'relative', zIndex: 20 },
        searchInput: { background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '1rem', fontFamily: 'inherit' },
        sectionTitle: { fontSize: '0.85rem', fontWeight: 'bold', color: '#00d4ff', textTransform: 'uppercase', marginBottom: '10px', paddingLeft: '5px' },
        listContainer: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
        searchItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid transparent', textDecoration: 'none', transition: 'all 0.2s ease', cursor: 'pointer' },
        avatar: { width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255, 255, 255, 0.1)' },
        info: { flex: 1, overflow: 'hidden' },
        name: { color: '#fff', fontWeight: '600', fontSize: '1rem', marginBottom: '4px', display: 'block' },
        preview: { color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' },
        emptyState: { textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255, 255, 255, 0.5)' }
    };

    return (
        <div style={styles.page}>
            <Helmet>
                <title>Chats | PeerNotez</title>
            </Helmet>

            <div style={styles.header}>
                <h1 style={styles.title}>Chats</h1>
            </div>

            <div style={styles.searchBox}>
                <FaSearch style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                <input 
                    type="text" 
                    placeholder="Search people..." 
                    style={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isSearching && <FaSpinner className="fa-spin" color="#00d4ff" />}
            </div>

            <div style={styles.listContainer}>
                {searchTerm.trim().length > 0 ? (
                    <>
                        <div style={styles.sectionTitle}>Global Search Results</div>
                        {searchResults.length > 0 ? (
                            searchResults.map(user => (
                                <div 
                                    key={user._id} 
                                    style={styles.searchItem}
                                    className="list-item-hover"
                                    onClick={() => navigate(`/chat/${user._id}`)}
                                >
                                    <img 
                                        src={optimizeCloudinaryUrl(user.avatar, { width: 60, height: 60, isProfile: true }) || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                                        alt={user.name} 
                                        style={styles.avatar}
                                    />
                                    <div style={styles.info}>
                                        <span style={styles.name}>{user.name}</span>
                                        <div style={styles.preview}>
                                            {user.university || 'Student'} • Tap to chat
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !isSearching && <div style={styles.emptyState}>No users found.</div>
                        )}
                    </>
                ) : (
                    <>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                                <FaSpinner className="fa-spin" /> Loading conversations...
                            </div>
                        ) : inbox.length > 0 ? (
                            inbox.map(chat => (
                                <InboxItem 
                                    key={chat.partnerId} 
                                    chat={chat} 
                                    currentUserId={currentUser._id}
                                    onDelete={handleDeleteChat}
                                />
                            ))
                        ) : (
                            <div style={styles.emptyState}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}><FaRegComments /></div>
                                <h3>No messages yet</h3>
                                <p>Search for a user above to start chatting!</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .list-item-hover:hover {
                    background: rgba(255, 255, 255, 0.08) !important;
                    transform: translateX(5px);
                }
                .delete-chat-btn:hover {
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
};

export default ChatListPage;
