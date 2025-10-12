import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import NoteCard from '../components/notes/NoteCard';
import Pagination from '../components/common/Pagination';
import EditNoteModal from '../components/notes/EditNoteModal';
import { Link } from 'react-router-dom';
import { FaRss, FaStar, FaEdit, FaList, FaTrashAlt } from 'react-icons/fa';

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
    const [totalNotesUploads, setTotalNotesUploads] = useState(0);

    const [currentPageSaved, setCurrentPageSaved] = useState(1);
    const [totalPagesSaved, setTotalPagesSaved] = useState(0);
    const [totalNotesSaved, setTotalNotesSaved] = useState(0);
    
    const [totalMyBlogs, setTotalMyBlogs] = useState(0);

    const [refetchIndex, setRefetchIndex] = useState(0);

    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    const [editingNote, setEditingNote] = useState(null);

    const { user, token, loading: authLoading, updateUser } = useAuth();


    // --- Handlers for New Collection Feature ---
    const fetchCollections = useCallback(async () => {
        if (!token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Using the new backend endpoint
            const { data } = await axios.get('/notes/collections', config); 
            setCollections(data);
        } catch (error) {
            console.error('Failed to fetch collections:', error.response?.data || error.message);
            setCollections([]);
        }
    }, [token]);

    const handleDeleteCollection = async (collectionId, name) => {
        if (window.confirm(`Are you sure you want to delete the collection: "${name}"? This cannot be undone.`)) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/notes/collections/${collectionId}`, config);
                alert(`Collection '${name}' deleted successfully.`);
                setRefetchIndex(prev => prev + 1); // Trigger refetch
            } catch (error) {
                console.error('Failed to delete collection', error.response?.data || error.message);
                alert('Failed to delete collection.');
            }
        }
    };
    // ---------------------------------------------
    
    // ... (Existing useEffects for blog count, tab changes, and data fetching) ...
    useEffect(() => {
        if (!token || authLoading) return;
        const fetchBlogCount = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/blogs/my-blogs?page=1&limit=1', config); 
                setTotalMyBlogs(data.totalBlogs || 0);
            } catch (error) {
                console.error('Failed to fetch blog count:', error);
            }
        };
        fetchBlogCount();
    }, [token, authLoading, refetchIndex]);


    useEffect(() => {
        // Reset page state when tabs change, and refetch data
        if (activeTab === 'uploads') {
            setCurrentPageUploads(1);
        } else if (activeTab === 'saved') {
            setCurrentPageSaved(1);
        }
        setRefetchIndex(prev => prev + 1);
    }, [activeTab]);

    // Main Data Fetcher
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
                    setTotalNotesUploads(data.totalNotes || 0);
                } else if (activeTab === 'saved') { 
                    const { data } = await axios.get(`/users/savednotes?page=${currentPageSaved}`, config);
                    setSavedNotes(data.notes || []);
                    setTotalPagesSaved(data.totalPages || 0);
                    setTotalNotesSaved(data.totalNotes || 0);
                } else if (activeTab === 'collections') {
                    // Fetch Collections when the tab is active
                    await fetchCollections(); 
                }
            } catch (error) {
                console.error(`Failed to fetch ${activeTab} data:`, error.response?.data || error.message);
                // Error handling simplified for brevity
            } finally {
                setLoadingNotes(false);
            }
        };

        fetchData();
    }, [token, authLoading, activeTab, currentPageUploads, currentPageSaved, refetchIndex, fetchCollections]); 
    
    // ... (Rest of existing handlers for name edit, avatar, note update/delete) ...

    useEffect(() => {
        if (user) {
            setNewName(user.name);
        }
    }, [user]);

    const handleEditClick = (note) => {
        setEditingNote(note); 
    };

    const handleUpdateNote = (updatedNote) => {
        setMyNotes(prevNotes =>
            prevNotes.map(note =>
                note._id === updatedNote._id ? updatedNote : note
            )
        );
        setEditingNote(null); 
        setRefetchIndex(prev => prev + 1);
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
    
    // End of existing handlers

    if (authLoading) return <div>Authenticating...</div>;

    const displayNotes = activeTab === 'uploads' ? myNotes : savedNotes;
    const currentTotalPages = activeTab === 'uploads' ? totalPagesUploads : totalPagesSaved;
    const currentPageState = activeTab === 'uploads' ? currentPageUploads : currentPageSaved;
    const setCurrentPageState = activeTab === 'uploads' ? setCurrentPageUploads : setCurrentPageSaved;
    const emptyMessage = activeTab === 'uploads' ? 'You have not uploaded any notes yet.' : 'You have no saved notes.';


    return (
        <div className="content-page">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-header-content"> {/* NEW WRAPPER */}
                    <div className="avatar-container">
                        <img src={user?.avatar || 'https://via.placeholder.com/140/3f4451/ffffff?text=P'} alt={user?.name} className="profile-avatar" />
                        <label htmlFor="avatar-upload" className="avatar-upload-label">📸 Change</label>
                        <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                    </div>
                    <div className="profile-info">
                        <div className="profile-info-main"> {/* NEW WRAPPER */}
                            {/* Name and Edit */}
                            {!isEditingName ? (
                                <div className="name-display">
                                    <h1>{user?.name}</h1>
                                    <button onClick={() => setIsEditingName(true)} className="edit-name-btn" title="Edit Name">
                                        <FaEdit />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleNameSave} className="name-edit-form">
                                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="name-edit-input" autoFocus />
                                    <button type="submit" className="save-btn">Save</button>
                                    <button type="button" onClick={() => setIsEditingName(false)} className="cancel-btn">Cancel</button>
                                </form>
                            )}
                            <p className="profile-email">{user?.email}</p> {/* Added class for targeting */}
                        </div>
                            
                        {/* Gamification Badges */}
                        {user?.badges?.length > 0 && (
                            <div className="user-badges-container"> 
                                {user.badges.map((badge, index) => (
                                    <span key={index} className="badge contributor-badge" title={badge.description}>
                                        <FaStar style={{marginRight: '0.4rem', color: 'gold'}} /> {badge.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div> {/* END profile-header-content */}
                
                {/* Feed Link */}
                <div className="profile-actions"> {/* This div is now a direct child of profile-header */}
                    <Link to="/feed" className="main-cta-button blog-post-btn">
                        <FaRss style={{marginRight: '0.5rem'}} /> My Personalized Feed
                    </Link>
                </div>

            </div> {/* END profile-header */}

            {/* Tabs */}
            <div className="profile-tabs">
                <button onClick={() => setActiveTab('uploads')} className={activeTab === 'uploads' ? 'active' : ''}>
                    My Uploads ({totalNotesUploads}) 
                </button>
                <button onClick={() => setActiveTab('saved')} className={activeTab === 'saved' ? 'active' : ''}>
                    Saved Notes ({totalNotesSaved}) 
                </button>
                {/* NEW: Collections Tab */}
                <button onClick={() => setActiveTab('collections')} className={activeTab === 'collections' ? 'active' : ''}>
                    Collections ({collections.length}) 
                </button>
                {/* Blog Tab Link */}
                <Link to="/blogs/my-blogs" className={`profile-tabs-link ${activeTab === 'blogs' ? 'active' : ''}`}> {/* Changed class name to avoid conflict */}
                    My Blogs ({totalMyBlogs}) 
                </Link>
            </div>

            {/* Content Section */}
            {activeTab !== 'blogs' && activeTab !== 'collections' && (
                <>
                    {loadingNotes ? (
                        <div>Loading notes...</div>
                    ) : (
                        <div>
                            <h2>{activeTab === 'uploads' ? 'My Uploaded Notes' : 'My Saved Notes'}</h2>
                            {displayNotes.length > 0 ? (
                                <>
                                    <div className="notes-grid">
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
                                <p>{emptyMessage}</p>
                            )}
                        </div>
                    )}
                </>
            )}
            
            {/* NEW: Collections Content */}
            {activeTab === 'collections' && (
                <div className="collections-section">
                    <h2>My Note Collections</h2>
                    {loadingNotes ? (
                        <div>Loading collections...</div>
                    ) : collections.length > 0 ? (
                        <div className="collection-list">
                            {collections.map(collection => (
                                <div key={collection._id} className="collection-item-summary">
                                    <div className="collection-info">
                                        <FaList style={{marginRight: '10px', color: '#4a90e2'}} />
                                        <Link to={`/collections/${collection._id}`} className="collection-name-link">
                                            {collection.name}
                                        </Link>
                                        <span className="note-count">({collection.notes.length} notes)</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteCollection(collection._id, collection.name)}
                                        className="delete-collection-btn"
                                        title="Delete Collection"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>You haven't created any collections yet. Start organizing your notes!</p>
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
