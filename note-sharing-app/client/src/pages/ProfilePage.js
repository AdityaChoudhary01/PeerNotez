import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import NoteCard from '../components/notes/NoteCard';

const ProfilePage = () => {
    const [myNotes, setMyNotes] = useState([]);
    const [savedNotes, setSavedNotes] = useState([]);
    const [activeTab, setActiveTab] = useState('uploads');
    const [loadingNotes, setLoadingNotes] = useState(true);
    
    // --- State for editing name ---
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    
    const { user, token, loading: authLoading, updateUser } = useAuth();

    // Effect to fetch user's uploaded or saved notes
    useEffect(() => {
        if (authLoading || !token) {
            return; 
        }

        const fetchData = async () => {
            setLoadingNotes(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const endpoint = activeTab === 'uploads' ? '/notes/mynotes' : '/users/savednotes';
            
            try {
                const { data } = await axios.get(endpoint, config);
                if (activeTab === 'uploads') {
                    setMyNotes(data);
                } else {
                    setSavedNotes(data);
                }
            } catch (error) {
                console.error(`Failed to fetch ${activeTab}`, error);
            } finally {
                setLoadingNotes(false);
            }
        };

        fetchData();
    }, [token, authLoading, activeTab]);

    // Effect to set the initial value for the name edit form
    useEffect(() => {
        if (user) {
            setNewName(user.name);
        }
    }, [user]);


    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.put('/users/profile/avatar', formData, config);
            
            updateUser(data);
            alert('Profile picture updated!');
        } catch (error) {
            console.error('Failed to upload avatar', error);
            alert('Failed to upload profile picture.');
        }
    };

    // --- Function to handle saving the new name ---
    const handleNameSave = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put('/users/profile', { name: newName }, config);
            updateUser(data); // Update global user state
            setIsEditingName(false); // Close the edit form
        } catch (error) {
            console.error('Failed to update name', error);
            alert('Failed to update name.');
        }
    };

    if (authLoading) {
        return <div>Authenticating...</div>;
    }

    return (
        <div className="content-page">
        <h1 className="visually-hidden">Your PeerNotez Profile – View Your Uploaded Notes and Saved Resources</h1>

            <div className="profile-header">
                <div className="avatar-container">
                    <img src={user?.avatar} alt={user?.name} className="profile-avatar" />
                    <label htmlFor="avatar-upload" className="avatar-upload-label">
                        📸 Change
                    </label>
                    <input type="file" id="avatar-upload" onChange={handleAvatarUpload} accept="image/*" style={{ display: 'none' }} />
                </div>
                <div className="profile-info">
                    {/* --- Conditional rendering for name editing --- */}
                    {!isEditingName ? (
                        <div className="name-display">
                            <h1>{user?.name}</h1>
                            <button onClick={() => setIsEditingName(true)} className="edit-name-btn">Edit</button>
                        </div>
                    ) : (
                        <form onSubmit={handleNameSave} className="name-edit-form">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="name-edit-input"
                                autoFocus
                            />
                            <button type="submit" className="save-btn">Save</button>
                            <button type="button" onClick={() => setIsEditingName(false)} className="cancel-btn">Cancel</button>
                        </form>
                    )}
                    <p>{user?.email}</p>
                </div>
            </div>

            <div className="profile-tabs">
                <button onClick={() => setActiveTab('uploads')} className={activeTab === 'uploads' ? 'active' : ''}>My Uploads</button>
                <button onClick={() => setActiveTab('saved')} className={activeTab === 'saved' ? 'active' : ''}>Saved Notes</button>
            </div>

            {loadingNotes ? (
                <div>Loading notes...</div>
            ) : (
                activeTab === 'uploads' ? (
                    <div>
                        <h2>My Uploaded Notes</h2>
                        {myNotes.length > 0 ? (
                            <div className="notes-grid">
                                {myNotes.map(note => <NoteCard key={note._id} note={note} />)}
                            </div>
                        ) : <p>You have not uploaded any notes yet.</p>}
                    </div>
                ) : (
                    <div>
                        <h2>My Saved Notes</h2>
                        {savedNotes.length > 0 ? (
                            <div className="notes-grid">
                                {savedNotes.map(note => <NoteCard key={note._id} note={note} />)}
                            </div>
                        ) : <p>You have no saved notes.</p>}
                    </div>
                )
            )}
        </div>
    );
};

export default ProfilePage;
