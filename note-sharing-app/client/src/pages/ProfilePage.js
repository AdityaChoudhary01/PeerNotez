import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import NoteCard from '../components/notes/NoteCard';
import Pagination from '../components/common/Pagination';
import EditNoteModal from '../components/notes/EditNoteModal';

const ProfilePage = () => {
  // State
  const [myNotes, setMyNotes] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('uploads');
  const [loadingNotes, setLoadingNotes] = useState(true);

  // Separate pagination states for 'My Uploads'
  const [currentPageUploads, setCurrentPageUploads] = useState(1);
  const [totalPagesUploads, setTotalPagesUploads] = useState(0);
  const [totalNotesUploads, setTotalNotesUploads] = useState(0);

  // Separate pagination states for 'Saved Notes'
  const [currentPageSaved, setCurrentPageSaved] = useState(1);
  const [totalPagesSaved, setTotalPagesSaved] = useState(0);
  const [totalNotesSaved, setTotalNotesSaved] = useState(0);

  // Removed [refetchIndex, setRefetchIndex] as it's no longer necessary with combined useEffect
  // and direct dependency on page states.

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const [editingNote, setEditingNote] = useState(null);

  const { user, token, loading: authLoading, updateUser } = useAuth(); // updateUser is used below

  useEffect(() => {
    if (user) {
      setNewName(user.name);
    }
  }, [user]);

  // Combined Effect for fetching notes and counts for BOTH tabs
  useEffect(() => {
    if (authLoading || !token) {
      console.warn("ProfilePage: No token found or auth loading, skipping data fetch.");
      setMyNotes([]);
      setSavedNotes([]);
      setTotalNotesUploads(0);
      setTotalNotesSaved(0);
      return;
    }

    const fetchAllData = async () => {
      setLoadingNotes(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        // --- Fetch My Uploads data ---
        const myNotesResponse = await axios.get(`/notes/mynotes?page=${currentPageUploads}`, config);
        setMyNotes(myNotesResponse.data.notes || []);
        setTotalPagesUploads(myNotesResponse.data.totalPages || 0);
        setTotalNotesUploads(myNotesResponse.data.totalNotes || 0);

        // --- Fetch Saved Notes data (regardless of active tab, to get the count) ---
        const savedNotesResponse = await axios.get(`/users/savednotes?page=${currentPageSaved}`, config);
        setSavedNotes(savedNotesResponse.data.notes || []);
        setTotalPagesSaved(savedNotesResponse.data.totalPages || 0);
        setTotalNotesSaved(savedNotesResponse.data.totalNotes || 0);

      } catch (error) {
        console.error("ProfilePage: Error fetching notes or counts:", error.response?.data || error.message);
        setMyNotes([]);
        setSavedNotes([]);
        setTotalNotesUploads(0);
        setTotalNotesSaved(0);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchAllData();
    // Dependencies: activeTab, currentPageUploads, currentPageSaved, token, authLoading
    // refetchIndex removed as its function is now covered by other dependencies
  }, [activeTab, currentPageUploads, currentPageSaved, token, authLoading]);


  // Effect specifically for handling tab changes (resets page for the new tab)
  useEffect(() => {
    if (activeTab === 'uploads' && currentPageUploads !== 1) {
      setCurrentPageUploads(1);
    } else if (activeTab === 'saved' && currentPageSaved !== 1) {
      setCurrentPageSaved(1);
    }
    // Now includes currentPageUploads and currentPageSaved as dependencies
  }, [activeTab, currentPageUploads, currentPageSaved]);


  // --- Functions to handle Editing Notes ---
  const handleEditClick = (note) => {
    console.log('Step 1: handleEditClick triggered with note:', note);
    setEditingNote(note);
  };

  const handleUpdateNote = (updatedNote) => {
    setMyNotes(prevNotes =>
      prevNotes.map(note =>
        note._id === updatedNote._id ? updatedNote : note
      )
    );
    setEditingNote(null);
    // Removed setRefetchIndex call here. The page/tab change will re-trigger the main fetch.
  };

  // Delete a note uploaded by user
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to permanently delete this note?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`/notes/${noteId}`, config);
        alert('Note deleted successfully.');

        // Rather than manual state manipulation, trigger re-fetch by changing page or activeTab
        // A full refetch of both lists will happen naturally due to useEffect dependencies
        if (activeTab === 'uploads') {
          // A simple way to trigger re-fetch without changing page if current page has other notes
          // If you were to only have one note and delete it, consider moving to previous page
          // For simplicity, just let the useEffect re-run on current page
          setCurrentPageUploads(prev => prev); // This might not trigger if prev is same, but combined useEffect covers it
        } else {
          // You might not want to delete saved notes in this tab, but if you do,
          // ensure saved notes logic is updated.
          setCurrentPageSaved(prev => prev);
        }

      } catch (error) {
        console.error('Failed to delete note', error.response?.data || error.message);
        alert('Failed to delete note.');
      }
    }
  };

  // Avatar upload handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
      const { data } = await axios.put('/users/profile/avatar', formData, config);
      updateUser(data); // Using updateUser here
      alert('Profile picture updated!');
    } catch (error) {
      console.error('Failed to upload avatar', error.response?.data || error.message);
      alert('Failed to upload profile picture.');
    }
  };

  // Update user name handler
  const handleNameSave = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put('/users/profile', { name: newName }, config);
      updateUser(data); // Using updateUser here
      setIsEditingName(false);
      alert('Name updated successfully!');
    } catch (error) {
      console.error('Failed to update name', error.response?.data || error.message);
      alert('Failed to update name.');
    }
  };

  if (authLoading) return <div>Authenticating...</div>;

  // Determine which data to display
  const displayNotes = activeTab === 'uploads' ? myNotes : savedNotes;
  const currentTotalPages = activeTab === 'uploads' ? totalPagesUploads : totalPagesSaved;
  const currentPageState = activeTab === 'uploads' ? currentPageUploads : currentPageSaved;
  const setCurrentPageState = activeTab === 'uploads' ? setCurrentPageUploads : setCurrentPageSaved;
  const emptyMessage = activeTab === 'uploads' ? 'You have not uploaded any notes yet.' : 'You have no saved notes.';


  return (
    <div className="content-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar-container">
          <img src={user?.avatar || 'https://via.placeholder.com/120/CCCCCC/FFFFFF?text=P'} alt={user?.name} className="profile-avatar" />
          <label htmlFor="avatar-upload" className="avatar-upload-label">📸 Change</label>
          <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
        </div>
        <div className="profile-info">
          {!isEditingName ? (
            <div className="name-display">
              <h1>{user?.name}</h1>
              <button onClick={() => setIsEditingName(true)} className="edit-name-btn">Edit</button>
            </div>
          ) : (
            <form onSubmit={handleNameSave} className="name-edit-form">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="name-edit-input" autoFocus />
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={() => setIsEditingName(false)} className="cancel-btn">Cancel</button>
            </form>
          )}
          <p>{user?.email}</p>
        </div>
      </div>

      {/* Tabs - Corrected to show individual counts */}
      <div className="profile-tabs">
        <button onClick={() => setActiveTab('uploads')} className={activeTab === 'uploads' ? 'active' : ''}>
          My Uploads ({totalNotesUploads}) {/* This will now be populated on initial load */}
        </button>
        <button onClick={() => setActiveTab('saved')} className={activeTab === 'saved' ? 'active' : ''}>
          Saved Notes ({totalNotesSaved}) {/* This will now be populated on initial load */}
        </button>
      </div>

      {/* Notes Section */}
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

      {/* Edit Modal */}
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
