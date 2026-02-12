import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import NoteCard from '../components/notes/NoteCard';
import Pagination from '../components/common/Pagination';
import EditNoteModal from '../components/notes/EditNoteModal';
import { Link } from 'react-router-dom';
import { FaRss, FaStar, FaEdit, FaList, FaTrashAlt, FaUpload, FaBookmark, FaPenNib } from 'react-icons/fa';
import { optimizeCloudinaryUrl } from '../utils/cloudinaryHelper';
import RoleBadge from '../components/common/RoleBadge';

const ProfilePage = () => {
    const [myNotes, setMyNotes] = useState([]);
    const [savedNotes, setSavedNotes] = useState([]);
    const [activeTab, setActiveTab] = useState('uploads');
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [collections, setCollections] = useState([]); 

    const [currentPageUploads, setCurrentPageUploads] = useState(1);
    const [totalPagesUploads, setTotalPagesUploads] = useState(0);
    
    const [totalNotesUploads, setTotalNotesUploads] = useState(0);
    const [totalNotesSaved, setTotalNotesSaved] = useState(0);
    const [totalCollections, setTotalCollections] = useState(0);
    const [totalMyBlogs, setTotalMyBlogs] = useState(0);

    const [currentPageSaved, setCurrentPageSaved] = useState(1);
    const [totalPagesSaved, setTotalPagesSaved] = useState(0);

    const [refetchIndex, setRefetchIndex] = useState(0);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [editingNote, setEditingNote] = useState(null);

    // Responsive State
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobile = windowWidth < 768;

    const { user, token, loading: authLoading, updateUser } = useAuth();

    // --- RESPONSIVE LISTENER ---
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- INTERNAL CSS ---
    const styles = {
        wrapper: {
            paddingTop: isMobile ? '1rem' : '2rem',
            paddingBottom: '5rem',
            paddingLeft: isMobile ? '0.5rem' : '2rem',
            paddingRight: isMobile ? '0.5rem' : '2rem',
            minHeight: '80vh',
            maxWidth: '100vw',
            overflowX: 'hidden'
        },
        headerCard: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            borderRadius: isMobile ? '16px' : '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: isMobile ? '1.5rem 1rem' : '3rem', // Reduced padding on mobile
            marginBottom: isMobile ? '1.5rem' : '3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            width: '100%',
            boxSizing: 'border-box'
        },
        avatarContainer: {
            position: 'relative',
            marginBottom: '1rem'
        },
        avatar: {
            width: isMobile ? '100px' : '140px', // Smaller avatar on mobile
            height: isMobile ? '100px' : '140px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
        },
        avatarLabel: {
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            background: '#00d4ff',
            color: '#000',
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        },
        userName: {
            fontSize: isMobile ? '1.5rem' : '2.5rem', // reduced font size
            fontWeight: '800',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap', // Allow wrapping
            wordBreak: 'break-word', // Prevent overflow
            lineHeight: 1.2,
            maxWidth: '100%'
        },
        userEmail: {
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '1.5rem',
            fontSize: isMobile ? '0.9rem' : '1.1rem',
            wordBreak: 'break-all' // Ensure long emails don't break layout
        },
        editBtn: {
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'color 0.2s',
            flexShrink: 0
        },
        badges: {
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '1.5rem'
        },
        badge: {
            background: 'rgba(255, 215, 0, 0.1)',
            color: '#ffd700',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        tabs: {
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '0.5rem' : '1rem', // Reduced gap
            marginBottom: '2rem',
            flexWrap: 'wrap'
        },
        tabBtn: {
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)',
            padding: isMobile ? '8px 16px' : '12px 24px', // Smaller buttons on mobile
            borderRadius: '50px',
            cursor: 'pointer',
            fontSize: isMobile ? '0.85rem' : '1rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flex: isMobile ? '1 1 auto' : 'unset', // Allow buttons to grow evenly on mobile
            justifyContent: 'center'
        },
        activeTab: {
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            borderColor: 'transparent',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'
        },
        grid: {
            display: 'grid',
            // Changed minmax from 300px to 260px to fit smaller screens without scroll
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: isMobile ? '1rem' : '2rem'
        },
        collectionItem: {
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: isMobile ? '1rem' : '1.5rem',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row', // Stack on mobile
            gap: isMobile ? '1rem' : '0',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: '1rem',
            transition: 'background 0.2s',
            width: '100%',
            boxSizing: 'border-box'
        },
        collectionLink: {
            color: '#fff',
            textDecoration: 'none',
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            wordBreak: 'break-word'
        },
        deleteBtn: {
            background: 'rgba(255, 0, 85, 0.1)',
            color: '#ff0055',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            transition: 'background 0.2s',
            alignSelf: isMobile ? 'flex-end' : 'auto' // Align right on mobile stack
        },
        editInput: {
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: isMobile ? '1rem' : '1.2rem',
            textAlign: 'center',
            marginBottom: '0.5rem',
            width: '100%',
            maxWidth: '300px',
            boxSizing: 'border-box'
        },
        saveBtn: {
            background: '#00d4ff',
            color: '#000',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.9rem',
            margin: '0 5px'
        },
        cancelBtn: {
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            margin: '0 5px'
        }
    };

    useEffect(() => {
        if (!token || authLoading) return;

        const fetchGlobalCounts = async () => {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const [uploadsRes, savedRes, collectionsRes, blogsRes] = await Promise.all([
                    axios.get('/notes/mynotes?page=1&limit=1', config),
                    axios.get('/users/savednotes?page=1&limit=1', config),
                    axios.get('/notes/collections', config),
                    axios.get('/blogs/my-blogs?page=1&limit=1', config)
                ]);

                setTotalNotesUploads(uploadsRes.data.totalNotes || 0);
                setTotalNotesSaved(savedRes.data.totalNotes || 0);
                setCollections(collectionsRes.data); 
                setTotalCollections(collectionsRes.data.length || 0);
                setTotalMyBlogs(blogsRes.data.totalBlogs || 0);

            } catch (error) {
                console.error("Error fetching profile stats:", error);
            }
        };

        fetchGlobalCounts();
    }, [token, authLoading, refetchIndex]);

    useEffect(() => {
        if (authLoading || !token || activeTab === 'blogs' || activeTab === 'collections') return;

        const fetchData = async () => {
            setLoadingNotes(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                if (activeTab === 'uploads') {
                    const { data } = await axios.get(`/notes/mynotes?page=${currentPageUploads}`, config);
                    setMyNotes(data.notes || []);
                    setTotalPagesUploads(data.totalPages || 0);
                    setTotalNotesUploads(data.totalNotes || 0); 
                } else if (activeTab === 'saved') { 
                    const { data } = await axios.get(`/users/savednotes?page=${currentPageSaved}`, config);
                    setSavedNotes(data.notes || []);
                    setTotalPagesSaved(data.totalPages || 0);
                    setTotalNotesSaved(data.totalNotes || 0);
                } 
            } catch (error) {
                console.error(`Failed to fetch ${activeTab} data:`, error.response?.data || error.message);
            } finally {
                setLoadingNotes(false);
            }
        };

        fetchData();
    }, [token, authLoading, activeTab, currentPageUploads, currentPageSaved, refetchIndex]); 

    const handleDeleteCollection = async (collectionId, name) => {
        if (window.confirm(`Are you sure you want to delete the collection: "${name}"? This cannot be undone.`)) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/notes/collections/${collectionId}`, config);
                alert(`Collection '${name}' deleted successfully.`);
                setRefetchIndex(prev => prev + 1); 
            } catch (error) {
                console.error('Failed to delete collection', error.response?.data || error.message);
                alert('Failed to delete collection.');
            }
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (window.confirm('Are you sure you want to permanently delete this note?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/notes/${noteId}`, config);
                alert('Note deleted successfully.');
                setRefetchIndex(prev => prev + 1);
            } catch (error) {
                console.error('Failed to delete note', error.response?.data || error.message);
                alert('Failed to delete note.');
            }
        }
    };

    useEffect(() => {
        if (activeTab === 'uploads') setCurrentPageUploads(1);
        if (activeTab === 'saved') setCurrentPageSaved(1);
    }, [activeTab]);

    useEffect(() => {
        if (user) setNewName(user.name);
    }, [user]);

    const handleEditClick = (note) => setEditingNote(note);

    const handleUpdateNote = (updatedNote) => {
        setMyNotes(prev => prev.map(n => n._id === updatedNote._id ? updatedNote : n));
        setEditingNote(null); 
        setRefetchIndex(prev => prev + 1);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            const { data } = await axios.put('/users/profile/avatar', formData, config);
            updateUser(data); 
            alert('Profile picture updated!');
        } catch (error) {
            console.error('Failed to upload avatar', error.response?.data || error.message);
            alert('Failed to upload profile picture.');
        }
    };

    const handleNameSave = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put('/users/profile', { name: newName }, config);
            updateUser(data); 
            setIsEditingName(false);
            alert('Name updated successfully!');
        } catch (error) {
            console.error('Failed to update name', error.response?.data || error.message);
            alert('Failed to update name.');
        }
    };

    if (authLoading) return <div style={{textAlign: 'center', padding: '5rem', color: 'rgba(255,255,255,0.7)'}}>Authenticating...</div>;

    const displayNotes = activeTab === 'uploads' ? myNotes : savedNotes;
    const currentTotalPages = activeTab === 'uploads' ? totalPagesUploads : totalPagesSaved;
    const currentPageState = activeTab === 'uploads' ? currentPageUploads : currentPageUploads;
    const setCurrentPageState = activeTab === 'uploads' ? setCurrentPageUploads : setCurrentPageSaved;
    const emptyMessage = activeTab === 'uploads' ? 'You have not uploaded any notes yet.' : 'You have no saved notes.';

    return (
        <main style={styles.wrapper}>
            <header style={styles.headerCard}>
                <div style={styles.avatarContainer}>
                    <img 
                        /* OPTIMIZATION:
                           1. Use Cloudinary helper with correct object params: { width: 280, height: 280 }
                           2. Add lazy loading and async decoding
                        */
                        src={user?.avatar 
                            ? optimizeCloudinaryUrl(user.avatar, { width: 280, height: 280, isProfile: true }) 
                            : 'https://via.placeholder.com/140/3f4451/ffffff?text=P'
                        } 
                        alt={user?.name || "User profile"} 
                        loading="lazy"
                        decoding="async"
                        style={styles.avatar} 
                    />
                    <label htmlFor="avatar-upload" style={styles.avatarLabel} aria-label="Change profile picture">📸 Change</label>
                    <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </div>
                
                {!isEditingName ? (
                    <div style={styles.userName}>
                        <span>{user?.name}</span>
                        
                        {/* 1. ADMIN ROLE BADGE (Gold/Blue) */}
                        <RoleBadge user={user} />

                        <button 
                            onClick={() => setIsEditingName(true)} 
                            style={styles.editBtn} 
                            title="Edit Name"
                            aria-label="Edit display name"
                        >
                            <FaEdit aria-hidden="true" />
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleNameSave} style={{marginBottom: '1rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <input 
                            type="text" 
                            value={newName} 
                            onChange={e => setNewName(e.target.value)} 
                            style={styles.editInput} 
                            autoFocus 
                            aria-label="New name"
                        />
                        <div style={{marginTop: '5px'}}>
                            <button type="submit" style={styles.saveBtn}>Save</button>
                            <button type="button" onClick={() => setIsEditingName(false)} style={styles.cancelBtn}>Cancel</button>
                        </div>
                    </form>
                )}
                
                <p style={styles.userEmail}>{user?.email}</p>
                
                {/* 2. ACTIVITY BADGES (Purple/Elite) */}
                {user?.badges?.length > 0 && (
                    <div style={styles.badges}> 
                        {user.badges.map((badge, index) => (
                            <span key={index} style={styles.badge} title={badge.description}>
                                <FaStar style={{color: 'gold'}} aria-hidden="true" /> {badge.name}
                            </span>
                        ))}
                    </div>
                )}

                <Link to="/feed" style={{...styles.tabBtn, ...styles.activeTab, textDecoration: 'none', marginTop: '1rem', width: isMobile ? '100%' : 'auto'}}>
                    <FaRss aria-hidden="true" /> My Personalized Feed
                </Link>
            </header>

            <nav style={styles.tabs} aria-label="Profile section tabs">
                <button 
                    onClick={() => setActiveTab('uploads')} 
                    style={{...styles.tabBtn, ...(activeTab === 'uploads' ? styles.activeTab : {})}}
                    aria-current={activeTab === 'uploads' ? 'page' : undefined}
                >
                    <FaUpload aria-hidden="true" /> {isMobile ? 'Uploads' : `Uploads (${totalNotesUploads})`} 
                </button>
                <button 
                    onClick={() => setActiveTab('saved')} 
                    style={{...styles.tabBtn, ...(activeTab === 'saved' ? styles.activeTab : {})}}
                    aria-current={activeTab === 'saved' ? 'page' : undefined}
                >
                    <FaBookmark aria-hidden="true" /> {isMobile ? 'Saved' : `Saved (${totalNotesSaved})`}
                </button>
                <button 
                    onClick={() => setActiveTab('collections')} 
                    style={{...styles.tabBtn, ...(activeTab === 'collections' ? styles.activeTab : {})}}
                    aria-current={activeTab === 'collections' ? 'page' : undefined}
                >
                    <FaList aria-hidden="true" /> {isMobile ? 'Collections' : `Collections (${totalCollections})`}
                </button>
                <Link 
                    to="/blogs/my-blogs" 
                    style={{...styles.tabBtn, textDecoration: 'none', ...(activeTab === 'blogs' ? styles.activeTab : {})}}
                >
                    <FaPenNib aria-hidden="true" /> {isMobile ? 'Blogs' : `My Blogs (${totalMyBlogs})`}
                </Link>
            </nav>

            <section aria-live="polite">
                {activeTab !== 'blogs' && activeTab !== 'collections' && (
                    <>
                        {loadingNotes ? (
                            <div style={{textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)'}}>Loading notes...</div>
                        ) : (
                            <div>
                                <h2 style={{color: '#fff', fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center'}}>
                                    {activeTab === 'uploads' ? 'My Uploaded Notes' : 'My Saved Notes'}
                                </h2>
                                {displayNotes.length > 0 ? (
                                    <>
                                        <div style={styles.grid}>
                                            {displayNotes.map(note => (
                                                <NoteCard
                                                    key={note._id}
                                                    note={note}
                                                    showActions={activeTab === 'uploads'} 
                                                    onDelete={activeTab === 'uploads' ? handleDeleteNote : undefined}
                                                    onEdit={activeTab === 'uploads' ? handleEditClick : undefined}
                                                />
                                            ))}
                                        </div>
                                        {currentTotalPages > 1 && (
                                            <Pagination page={currentPageState} totalPages={currentTotalPages} onPageChange={setCurrentPageState} />
                                        )}
                                    </>
                                ) : (
                                    <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem'}}>{emptyMessage}</p>
                                )}
                            </div>
                        )}
                    </>
                )}
                
                {activeTab === 'collections' && (
                    <div className="collections-section">
                        <h2 style={{color: '#fff', fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center'}}>My Note Collections</h2>
                        {collections.length > 0 ? (
                            <div style={{maxWidth: '800px', margin: '0 auto'}}>
                                {collections.map(collection => (
                                    <div key={collection._id} style={styles.collectionItem} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                                            <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
                                                <Link to={`/collections/${collection._id}`} style={styles.collectionLink}>
                                                    <FaList style={{color: '#00d4ff', flexShrink: 0}} aria-hidden="true" /> 
                                                    <span>{collection.name}</span>
                                                </Link>
                                                <span style={{marginLeft: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', whiteSpace: 'nowrap'}}>
                                                    ({collection.notes.length} notes)
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteCollection(collection._id, collection.name)}
                                                style={styles.deleteBtn}
                                                title="Delete Collection"
                                                aria-label={`Delete collection ${collection.name}`}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 0, 85, 0.2)'} 
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 0, 85, 0.1)'}
                                            >
                                                <FaTrashAlt aria-hidden="true" />
                                            </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem'}}>You haven't created any collections yet. Start organizing your notes!</p>
                        )}
                    </div>
                )}
            </section>

            {editingNote && (
                <EditNoteModal
                    note={editingNote}
                    token={token}
                    onUpdate={handleUpdateNote}
                    onClose={() => setEditingNote(null)}
                />
            )}
        </main>
    );
};

export default ProfilePage;
