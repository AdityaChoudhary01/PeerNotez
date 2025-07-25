import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import NoteCard from '../components/notes/NoteCard';
import Pagination from '../components/common/Pagination';
import EditNoteModal from '../components/notes/EditNoteModal'; // <-- Import the new modal

const ProfilePage = () => {
  // State
  const [myNotes, setMyNotes] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('uploads');
  const [loadingNotes, setLoadingNotes] = useState(true);

  // Pagination states for 'My Uploads'
  const [currentPageUploads, setCurrentPageUploads] = useState(1);
  const [totalPagesUploads, setTotalPagesUploads] = useState(0);
  const [totalNotesUploads, setTotalNotesUploads] = useState(0);

  // Pagination states for 'Saved Notes'
  const [currentPageSaved, setCurrentPageSaved] = useState(1);
  const [totalPagesSaved, setTotalPagesSaved] = useState(0);
  const [totalNotesSaved, setTotalNotesSaved] = useState(0);

  // Refetch state
  const [refetchIndex, setRefetchIndex] = useState(0);

  // Editing user profile state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  // --- State for the Edit Note Modal ---
  const [editingNote, setEditingNote] = useState(null);

  const { user, token, loading: authLoading, updateUser } = useAuth();

  // Reset page for the *new* tab when tab changes
  useEffect(() => {
    if (activeTab === 'uploads') {
      setCurrentPageUploads(1);
    } else {
      setCurrentPageSaved(1);
    }
    // Also trigger a refetch when tab changes to ensure fresh data
    setRefetchIndex(prev => prev + 1);
  }, [activeTab]);

  // Fetch notes (uploads or saved) based on active tab and pagination
  useEffect(() => {
    if (authLoading || !token) return; // wait for auth

    const fetchData = async () => {
      setLoadingNotes(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        if (activeTab === 'uploads') {
          const { data } = await axios.get(`/notes/mynotes?page=${currentPageUploads}`, config);
          setMyNotes(data.notes || []);
          setTotalPagesUploads(data.totalPages || 0);
          setTotalNotesUploads(data.totalNotes || 0);
        } else { // activeTab === 'saved'
          const { data } = await axios.get(`/users/savednotes?page=${currentPageSaved}`, config);
          setSavedNotes(data.notes || []);
          setTotalPagesSaved(data.totalPages || 0);
          setTotalNotesSaved(data.totalNotes || 0);
        }
      } catch (error) {
        console.error(`Failed to fetch ${activeTab} notes:`, error.response?.data || error.message);
        // Clear notes and pagination info on error
        if (activeTab === 'uploads') {
          setMyNotes([]);
          setTotalPagesUploads(0);
          setTotalNotesUploads(0);
        } else {
          setSavedNotes([]);
          setTotalPagesSaved(0);
          setTotalNotesSaved(0);
        }
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchData();
  }, [token, authLoading, activeTab, currentPageUploads, currentPageSaved, refetchIndex]); // Add new pagination states to deps

  // Update newName when user changes
  useEffect(() => {
    if (user) {
      setNewName(user.name);
    }
  }, [user]);

  // --- Functions to handle Editing Notes ---
  const handleEditClick = (note) => {
    console.log('Step 1: handleEditClick triggered with note:', note);
    setEditingNote(note); // Open the modal by setting the note to edit
  };

  const handleUpdateNote = (updatedNote) => {
    // Update the note in the state to reflect changes without a full refetch
    setMyNotes(prevNotes =>
      prevNotes.map(note =>
        note._id === updatedNote._id ? updatedNote : note
      )
    );
    setEditingNote(null); // Close the modal
    // Trigger refetch for the uploads tab to ensure consistency,
    // especially if an update affected total counts or sorting.
    setRefetchIndex(prev => prev + 1);
  };

  // Delete a note uploaded by user
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to permanently delete this note?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`/notes/${noteId}`, config);
        alert('Note deleted successfully.');

        // Rather than manual state manipulation, rely on refetchIndex
        // The backend will handle pagination adjustments.
        setRefetchIndex(prev => prev + 1);

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
      updateUser(data);
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
      updateUser(data);
      setIsEditingName(false);
      alert('Name updated successfully!');
    } catch (error) {
      console.error('Failed to update name', error.response?.data || error.message);
      alert('Failed to update name.');
    }
  };

  if (authLoading) return <div>Authenticating...</div>;

  // Determine which data and pagination to show based on activeTab
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
          My Uploads ({totalNotesUploads}) {/* Corrected to show totalNotesUploads */}
        </button>
        <button onClick={() => setActiveTab('saved')} className={activeTab === 'saved' ? 'active' : ''}>
          Saved Notes ({totalNotesSaved}) {/* Corrected to show totalNotesSaved */}
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
                    showActions={activeTab === 'uploads'} // Only show actions for uploaded notes
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
