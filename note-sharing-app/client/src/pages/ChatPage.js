import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaPaperPlane, FaArrowLeft, FaCircle, FaSpinner, FaTrash, FaBan } from 'react-icons/fa'; 

// Firebase Database hooks
import { ref, push, set, update, onValue, off, serverTimestamp, runTransaction } from 'firebase/database';

// ✅ FIXED: Removed 'onAuthStateChanged' as it's handled in AuthContext now
import { getAuth } from 'firebase/auth';

import { db } from '../services/firebase'; 
import useAuth from '../hooks/useAuth';
import { optimizeCloudinaryUrl } from '../utils/cloudinaryHelper';
import RoleBadge from '../components/common/RoleBadge';

const ChatPage = () => {
    const { userId: partnerId } = useParams();
    // Destructure firebaseLoading from useAuth
    const { user: currentUser, firebaseLoading } = useAuth(); 
    const navigate = useNavigate();
    const listRef = useRef(null);

    // Super Admin Config
    const MAIN_ADMIN_EMAIL = process.env.REACT_APP_MAIN_ADMIN_EMAIL;

    // --- State ---
    const [messages, setMessages] = useState([]);
    const [partner, setPartner] = useState(null);
    const [partnerStatus, setPartnerStatus] = useState(null); 
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const [hiddenTimestamp, setHiddenTimestamp] = useState(0);

    // 1. Generate Chat ID
    const chatId = currentUser && partnerId ? [currentUser._id, partnerId].sort().join("_") : null;

    // --- Safety Check: Ensure Firebase Auth is ready ---
    const auth = getAuth();
    // We check if the user is authenticated and the AuthContext has finished the firebase handshake
    const isFirebaseReady = auth.currentUser && !firebaseLoading;

    // 2. Fetch Partner Profile
    useEffect(() => {
        const fetchPartner = async () => {
            try {
                const { data } = await axios.get(`/users/${partnerId}/profile`);
                setPartner(data);
            } catch (err) {
                console.error("Partner not found", err);
                navigate('/chat');
            }
        };
        if (partnerId) fetchPartner();
    }, [partnerId, navigate]);

    // 3. Reset Unread Count & Get "Hidden" Timestamp
    useEffect(() => {
        if (!isFirebaseReady || !currentUser || !partnerId) return;
        
        const myInboxRef = ref(db, `user_chats/${currentUser._id}/${partnerId}`);
        const listener = onValue(myInboxRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setHiddenTimestamp(data.hiddenBefore || 0);
                if (data.unreadCount > 0) {
                    update(myInboxRef, { unreadCount: 0 }).catch(console.error);
                }
            }
        });

        return () => off(myInboxRef, 'value', listener);
    }, [currentUser, partnerId, isFirebaseReady]);

    // 4. Firebase Listeners (Messages & Status)
    useEffect(() => {
        if (!isFirebaseReady || !chatId) return;

        setLoading(true);
        const messagesRef = ref(db, `chats/${chatId}/messages`);
        
        const messagesListener = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedMessages = Object.entries(data)
                    .map(([key, val]) => ({ id: key, ...val }))
                    .filter(msg => msg.createdAt > hiddenTimestamp)
                    .sort((a, b) => a.createdAt - b.createdAt);
                setMessages(loadedMessages);
            } else {
                setMessages([]);
            }
            setLoading(false);
        });

        const statusRef = ref(db, `status/${partnerId}`);
        const statusListener = onValue(statusRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setPartnerStatus(data);
            else setPartnerStatus({ state: 'offline', last_changed: Date.now() });
        });

        return () => { 
            off(messagesRef, 'value', messagesListener); 
            off(statusRef, 'value', statusListener); 
        };
    }, [chatId, partnerId, hiddenTimestamp, isFirebaseReady]);

    // 5. Scroll Logic
    useEffect(() => {
        if (!loading && listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // 6. Exact Last Seen Helper
    const getLastSeenText = () => {
        if (!partnerStatus) return 'Offline';
        if (partnerStatus.state === 'online') return 'Online';

        const date = new Date(partnerStatus.last_changed);
        
        const timeFormatter = new Intl.DateTimeFormat('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });

        const dateFormatter = new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
        });

        return `Last seen at ${timeFormatter.format(date)}, ${dateFormatter.format(date)}`;
    };

    // 7. Send Message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId || !isFirebaseReady) return;

        const messageContent = newMessage;
        setNewMessage(''); 
        
        try {
            const timestamp = serverTimestamp();
            const messagesRef = ref(db, `chats/${chatId}/messages`);
            
            await push(messagesRef, { 
                text: messageContent, 
                senderId: currentUser._id, 
                createdAt: timestamp,
                isDeleted: false 
            });

            const myInboxRef = ref(db, `user_chats/${currentUser._id}/${partnerId}`);
            await set(myInboxRef, { 
                partnerId: partnerId, 
                lastMessage: messageContent, 
                timestamp: timestamp, 
                unreadCount: 0,
                hiddenBefore: hiddenTimestamp 
            });

            const partnerInboxRef = ref(db, `user_chats/${partnerId}/${currentUser._id}`);
            await runTransaction(partnerInboxRef, (currentData) => {
                if (currentData) {
                    return { ...currentData, lastMessage: messageContent, timestamp: timestamp, unreadCount: (currentData.unreadCount || 0) + 1 };
                } else {
                    return { partnerId: currentUser._id, lastMessage: messageContent, timestamp: timestamp, unreadCount: 1 };
                }
            });
        } catch (error) { 
            console.error("Failed to send", error); 
            setNewMessage(messageContent); 
        }
    };

    // 8. Delete Message (Soft Delete)
    const handleDeleteMessage = async (msgId) => {
        if (window.confirm("Delete this message for everyone?")) {
            try { 
                const msgRef = ref(db, `chats/${chatId}/messages/${msgId}`);
                await update(msgRef, {
                    text: "🚫 This message was deleted",
                    isDeleted: true
                });
            } catch (error) { console.error(error); }
        }
    };

    // 9. Delete Chat (Clear History)
    const handleDeleteChat = async () => {
        if (window.confirm("Clear chat history? This will hide current messages for you.")) {
            try { 
                const myChatRef = ref(db, `user_chats/${currentUser._id}/${partnerId}`);
                await update(myChatRef, {
                    hiddenBefore: serverTimestamp(),
                    lastMessage: "",
                    unreadCount: 0
                });
                navigate('/chat'); 
            } catch (error) { console.error(error); }
        }
    };

    const handleBack = () => navigate('/chat');
    const isPartnerSuperAdmin = partner?.email === MAIN_ADMIN_EMAIL;

    // --- RENDER LOADING ---
    if (!isFirebaseReady || !currentUser) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)' }}>
                <FaSpinner className="fa-spin" size={40} color="#00d4ff" style={{ marginBottom: '1rem' }} />
                <p>Establishing Secure Connection...</p>
            </div>
        );
    }

    const styles = {
        wrapper: { maxWidth: '900px', margin: '0 auto', height: '85vh', display: 'flex', flexDirection: 'column' },
        container: { flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', position: 'relative', marginBottom:'2rem' },
        header: { padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)' },
        headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
        backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center' },
        deleteChatBtn: { background: 'rgba(255, 0, 85, 0.1)', border: 'none', color: '#ff0055', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' },
        avatar: { width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: isPartnerSuperAdmin ? '2px solid #FFD700' : '2px solid rgba(255,255,255,0.1)' },
        nameContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
        msgList: { flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' },
        inputArea: { padding: '1.5rem', background: 'rgba(0, 0, 0, 0.2)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', gap: '1rem' },
        input: { flex: 1, padding: '12px 20px', borderRadius: '50px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', outline: 'none', fontSize: '1rem', fontFamily: 'inherit' },
        sendBtn: { width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
        messageRow: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%' },
        bubble: { maxWidth: '70%', padding: '12px 18px', borderRadius: '18px', fontSize: '0.95rem', lineHeight: '1.5', position: 'relative', wordWrap: 'break-word' },
        sent: { background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)', color: '#fff', borderBottomRightRadius: '4px' },
        received: { background: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderBottomLeftRadius: '4px' },
        deletedMsg: { background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', border: '1px solid rgba(255,255,255,0.1)' },
        msgDeleteBtn: { background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer', fontSize: '0.9rem', padding: '5px', opacity: 0, transition: 'opacity 0.2s' },
        statusIndicator: { fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', marginTop: '2px' }
    };

    return (
        <div style={styles.wrapper}>
            <Helmet>
                <title>{partner ? `Chat with ${partner.name}` : 'Chat'} | PeerNotez</title>
            </Helmet>

            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <button onClick={handleBack} style={styles.backBtn} aria-label="Back to inbox">
                            <FaArrowLeft />
                        </button>
                        
                        {partner ? (
                            <>
                                {isPartnerSuperAdmin ? (
                                    <img src={optimizeCloudinaryUrl(partner.avatar, {width: 45, height: 45, isProfile: true})} alt={partner.name} style={{...styles.avatar, cursor: 'default'}} />
                                ) : (
                                    <Link to={`/profile/${partner._id}`}>
                                        <img src={optimizeCloudinaryUrl(partner.avatar, {width: 45, height: 45, isProfile: true})} alt={partner.name} style={styles.avatar} />
                                    </Link>
                                )}

                                <div>
                                    <div style={styles.nameContainer}>
                                        <h3 style={{margin:0, fontSize:'1.1rem', color: '#fff'}}>{partner.name}</h3>
                                        <RoleBadge user={partner} />
                                    </div>

                                    <div style={{...styles.statusIndicator, color: partnerStatus?.state === 'online' ? '#00ffaa' : 'rgba(255,255,255,0.5)'}}>
                                        {partnerStatus?.state === 'online' && <FaCircle size={8} />} 
                                        {getLastSeenText()}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{color: 'rgba(255,255,255,0.5)'}}>Loading user...</div>
                        )}
                    </div>

                    <button onClick={handleDeleteChat} style={styles.deleteChatBtn} title="Clear History">
                        <FaTrash /> <span style={{display: window.innerWidth <= 600 ? 'none' : 'inline'}}>Clear Chat</span>
                    </button>
                </div>

                <div style={styles.msgList} className="custom-scroll" ref={listRef}>
                    {loading ? ( <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><FaSpinner className="fa-spin" size={30} color="#00d4ff" /></div> ) : messages.length === 0 ? (
                        <div style={{textAlign:'center', marginTop:'20%', color:'rgba(255,255,255,0.4)'}}>
                            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>👋</div>
                            <p>No messages yet.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMine = msg.senderId === currentUser._id;
                            const isHovered = hoveredMessage === msg.id;
                            
                            let bubbleStyle = isMine ? styles.sent : styles.received;
                            if (msg.isDeleted) bubbleStyle = { ...bubbleStyle, ...styles.deletedMsg };

                            return (
                                <div key={msg.id} style={{...styles.messageRow, flexDirection: isMine ? 'row-reverse' : 'row'}} onMouseEnter={() => setHoveredMessage(msg.id)} onMouseLeave={() => setHoveredMessage(null)}>
                                    <div style={{...styles.bubble, ...bubbleStyle}}>
                                        {msg.isDeleted && <FaBan style={{marginRight: '6px', fontSize: '0.8em'}} />}
                                        {msg.text}
                                    </div>
                                    
                                    {isMine && !msg.isDeleted && (
                                        <button onClick={() => handleDeleteMessage(msg.id)} style={{...styles.msgDeleteBtn, opacity: isHovered ? 1 : 0}} title="Unsend">
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <form style={styles.inputArea} onSubmit={handleSendMessage}>
                    <input type="text" placeholder="Message..." style={styles.input} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                    <button type="submit" style={styles.sendBtn}><FaPaperPlane /></button>
                </form>
            </div>
            <style>{`.custom-scroll::-webkit-scrollbar { width: 6px; } .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; } @media (hover: none) { button[title="Unsend"] { opacity: 1 !important; color: rgba(255,255,255,0.2); } }`}</style>
        </div>
    );
};

export default ChatPage;
