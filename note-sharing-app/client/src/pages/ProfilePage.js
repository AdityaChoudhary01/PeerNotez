import React, { useState, useEffect } from 'react'; // Removed useCallback
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import NoteCard from '../components/notes/NoteCard';
import Pagination from '../components/common/Pagination';
import EditNoteModal from '../components/notes/EditNoteModal';
import { Link } from 'react-router-dom';
import { FaRss, FaStar, FaEdit, FaList, FaTrashAlt, FaUpload, FaBookmark, FaPenNib } from 'react-icons/fa';

const ProfilePage = () => {
    // Existing States
    const [myNotes, setMyNotes] = useState([]);
    const [savedNotes, setSavedNotes] = useState([]);
    const [activeTab, setActiveTab] = useState('uploads');
    const [loadingNotes, setLoadingNotes] = useState(true);
    
    // NEW STATE for Collections
    const [collections, setCollections] = useState([]); 

    const [currentPageUploads, setCurrentPageUploads] = useState(1);
    const [totalPagesUploads, setTotalPagesUploads] = useState(0);
    
    // Separate state for counts to ensure they update immediately
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

    const { user, token, loading: authLoading, updateUser } = useAuth();

    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            minHeight: '80vh'
        },
        headerCard: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '3rem',
            marginBottom: '3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        },
        avatarContainer: {
            position: 'relative',
            marginBottom: '1.5rem'
        },
        avatar: {
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
        },
        avatarLabel: {
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            background: '#00d4ff',
            color: '#000',
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        },
        userName: {
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        userEmail: {
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '1.5rem',
            fontSize: '1.1rem'
        },
        editBtn: {
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'color 0.2s'
        },
        badges: {
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem'
        },
        badge: {
            background: 'rgba(255, 215, 0, 0.1)',
            color: '#ffd700',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        tabs: {
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3rem',
            flexWrap: 'wrap'
        },
        tabBtn: {
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)',
            padding: '12px 24px',
            borderRadius: '50px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        activeTab: {
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            borderColor: 'transparent',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
        },
        collectionItem: {
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            transition: 'background 0.2s'
        },
        collectionLink: {
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        deleteBtn: {
            background: 'rgba(255, 0, 85, 0.1)',
            color: '#ff0055',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            transition: 'background 0.2s'
        },
        editInput: {
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '1.2rem',
            textAlign: 'center',
            marginBottom: '0.5rem'
        },
        saveBtn: {
            background: '#00d4ff',
            color: '#000',
            border: 'none',
            padding: '5px 15px',
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
            padding: '5px 15px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            margin: '0 5px'
        }
    };

    // --- 1. NEW: Fetch ALL Counts on Mount ---
    useEffect(() => {
        if (!token || authLoading) return;

        const fetchGlobalCounts = async () => {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                // Fetch counts concurrently for speed
                const [uploadsRes, savedRes, collectionsRes, blogsRes] = await Promise.all([
                    axios.get('/notes/mynotes?page=1&limit=1', config),
                    axios.get('/users/savednotes?page=1&limit=1', config),
                    axios.get('/notes/collections', config),
                    axios.get('/blogs/my-blogs?page=1&limit=1', config)
                ]);

                setTotalNotesUploads(uploadsRes.data.totalNotes || 0);
                setTotalNotesSaved(savedRes.data.totalNotes || 0);
                setCollections(collectionsRes.data); // We need the data for list anyway
                setTotalCollections(collectionsRes.data.length || 0);
                setTotalMyBlogs(blogsRes.data.totalBlogs || 0);

            } catch (error) {
                console.error("Error fetching profile stats:", error);
            }
        };

        fetchGlobalCounts();
    }, [token, authLoading, refetchIndex]);


    // --- 2. Main List Fetcher (Only fetches CURRENT tab content) ---
    useEffect(() => {
        if (authLoading || !token || activeTab === 'blogs') return;

        const fetchData = async () => {
            setLoadingNotes(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                if (activeTab === 'uploads') {
                    const { data } = await axios.get(`/notes/mynotes?page=${currentPageUploads}`, config);
                    setMyNotes(data.notes || []);
                    setTotalPagesUploads(data.totalPages || 0);
                    // Update count again just in case it changed
                    setTotalNotesUploads(data.totalNotes || 0); 
                } else if (activeTab === 'saved') { 
                    const { data } = await axios.get(`/users/savednotes?page=${currentPageSaved}`, config);
                    setSavedNotes(data.notes || []);
                    setTotalPagesSaved(data.totalPages || 0);
                    setTotalNotesSaved(data.totalNotes || 0);
                } 
                // Collections are already fetched in the global counts useEffect
            } catch (error) {
                console.error(`Failed to fetch ${activeTab} data:`, error.response?.data || error.message);
            } finally {
                setLoadingNotes(false);
            }
        };

        fetchData();
    }, [token, authLoading, activeTab, currentPageUploads, currentPageSaved, refetchIndex]); 

    // --- Handlers ---
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
        // Do NOT trigger refetch here to avoid double calling, only page reset
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
    const currentPageState = activeTab === 'uploads' ? currentPageUploads : currentPageSaved;
    const setCurrentPageState = activeTab === 'uploads' ? setCurrentPageUploads : setCurrentPageSaved;
    const emptyMessage = activeTab === 'uploads' ? 'You have not uploaded any notes yet.' : 'You have no saved notes.';

    return (
        <div style={styles.wrapper}>
            {/* Profile Header */}
            <div style={styles.headerCard}>
                <div style={styles.avatarContainer}>
                    <img src={user?.avatar || 'https://via.placeholder.com/140/3f4451/ffffff?text=P'} alt={user?.name} style={styles.avatar} />
                    <label htmlFor="avatar-upload" style={styles.avatarLabel}>📸 Change</label>
                    <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </div>
                
                {!isEditingName ? (
                    <div style={styles.userName}>
                        <h1>{user?.name}</h1>
                        <button onClick={() => setIsEditingName(true)} style={styles.editBtn} title="Edit Name">
                            <FaEdit />
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleNameSave} style={{marginBottom: '1rem'}}>
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} style={styles.editInput} autoFocus />
                        <br/>
                        <button type="submit" style={styles.saveBtn}>Save</button>
                        <button type="button" onClick={() => setIsEditingName(false)} style={styles.cancelBtn}>Cancel</button>
                    </form>
                )}
                
                <p style={styles.userEmail}>{user?.email}</p>
                
                {user?.badges?.length > 0 && (
                    <div style={styles.badges}> 
                        {user.badges.map((badge, index) => (
                            <span key={index} style={styles.badge} title={badge.description}>
                                <FaStar style={{color: 'gold'}} /> {badge.name}
                            </span>
                        ))}
                    </div>
                )}

                <Link to="/feed" style={{...styles.tabBtn, ...styles.activeTab, textDecoration: 'none', marginTop: '1rem'}}>
                    <FaRss /> My Personalized Feed
                </Link>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button 
                    onClick={() => setActiveTab('uploads')} 
                    style={{...styles.tabBtn, ...(activeTab === 'uploads' ? styles.activeTab : {})}}
                >
                    <FaUpload /> Uploads ({totalNotesUploads}) 
                </button>
                <button 
                    onClick={() => setActiveTab('saved')} 
                    style={{...styles.tabBtn, ...(activeTab === 'saved' ? styles.activeTab : {})}}
                >
                    <FaBookmark /> Saved ({totalNotesSaved}) 
                </button>
                <button 
                    onClick={() => setActiveTab('collections')} 
                    style={{...styles.tabBtn, ...(activeTab === 'collections' ? styles.activeTab : {})}}
                >
                    <FaList /> Collections ({totalCollections}) 
                </button>
                <Link 
                    to="/blogs/my-blogs" 
                    style={{...styles.tabBtn, textDecoration: 'none', ...(activeTab === 'blogs' ? styles.activeTab : {})}}
                >
                    <FaPenNib /> My Blogs ({totalMyBlogs}) 
                </Link>
            </div>

            {/* Content Section */}
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
            
            {/* Collections Content */}
            {activeTab === 'collections' && (
                <div className="collections-section">
                    <h2 style={{color: '#fff', fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center'}}>My Note Collections</h2>
                    {collections.length > 0 ? (
                        <div style={{maxWidth: '800px', margin: '0 auto'}}>
                            {collections.map(collection => (
                                <div key={collection._id} style={styles.collectionItem} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Link to={`/collections/${collection._id}`} style={styles.collectionLink}>
                                            <FaList style={{color: '#00d4ff'}} /> {collection.name}
                                        </Link>
                                        <span style={{marginLeft: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem'}}>({collection.notes.length} notes)</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteCollection(collection._id, collection.name)}
                                        style={styles.deleteBtn}
                                        title="Delete Collection"
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 0, 85, 0.2)'} 
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 0, 85, 0.1)'}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem'}}>You haven't created any collections yet. Start organizing your notes!</p>
                    )}
                </div>
            )}

            {/* --- Render the Edit Modal conditionally --- */}
            {editingNote && (
                <EditNoteModal
                    note={editingNote}
                    token={token}
                    onUpdate={handleUpdateNote}
                    onClose={() => setEditingNote(null)}
                />
            )}
        </div>
    );
};

export default ProfilePage;
