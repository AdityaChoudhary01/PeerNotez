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

  // Pagination and refetch state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);
  const [refetchIndex, setRefetchIndex] = useState(0);

  // Editing user profile state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  // --- State for the Edit Note Modal ---
  const [editingNote, setEditingNote] = useState(null);

  const { user, token, loading: authLoading, updateUser } = useAuth();

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Fetch notes (uploads or saved) with pagination on uploads tab
  useEffect(() => {
    if (authLoading || !token) return; // wait for auth

    const fetchData = async () => {
      setLoadingNotes(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        if (activeTab === 'uploads') {
          const { data } = await axios.get(`/notes/mynotes?page=${currentPage}`, config);
          setMyNotes(data.notes || []);
          setTotalPages(data.totalPages || 0);
          setTotalNotes(data.totalNotes || 0);
        } else {
          const { data } = await axios.get('/users/savednotes', config);
          setSavedNotes(data);
        }
      } catch (error) {
        console.error(`Failed to fetch ${activeTab}`, error);
        if (activeTab === 'uploads') {
          setMyNotes([]);
          setTotalPages(0);
        } else {
          setSavedNotes([]);
        }
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchData();
  }, [token, authLoading, activeTab, currentPage, refetchIndex]);

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
  };

  // Delete a note uploaded by user
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to permanently delete this note?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`/notes/${noteId}`, config);
        alert('Note deleted successfully.');
        if (myNotes.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          setRefetchIndex(prev => prev + 1);
        }
      } catch (error) {
        console.error('Failed to delete note', error);
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
      console.error('Failed to upload avatar', error);
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
    } catch (error) {
      console.error('Failed to update name', error);
      alert('Failed to update name.');
    }
  };

  if (authLoading) return <div>Authenticating...</div>;

  return (
    <div className="content-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar-container">
          <img src={user?.avatar} alt={user?.name} className="profile-avatar" />
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

      {/* Tabs */}
      <div className="profile-tabs">
        <button onClick={() => setActiveTab('uploads')} className={activeTab === 'uploads' ? 'active' : ''}>My Uploads ({totalNotes})</button>
        <button onClick={() => setActiveTab('saved')} className={activeTab === 'saved' ? 'active' : ''}>Saved Notes</button>
      </div>

      {/* Notes Section */}
      {loadingNotes ? (
        <div>Loading notes...</div>
      ) : (
        activeTab === 'uploads' ? (
          <div>
            <h2>My Uploaded Notes</h2>
            {myNotes.length > 0 ? (
              <>
                <div className="notes-grid">
                  {myNotes.map(note => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      showActions={true}
                      onDelete={handleDeleteNote}
                      onEdit={handleEditClick} // <-- Pass the edit handler here
                    />
                  ))}
                </div>
                <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </>
            ) : (
              <p>You have not uploaded any notes yet.</p>
            )}
          </div>
        ) : (
          <div>
            <h2>My Saved Notes</h2>
            {savedNotes.length > 0 ? (
              <div className="notes-grid">
                {savedNotes.map(note => (
                  <NoteCard key={note._id} note={note} showActions={false} />
                ))}
              </div>
            ) : (
              <p>You have no saved notes.</p>
            )}
          </div>
        )
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
