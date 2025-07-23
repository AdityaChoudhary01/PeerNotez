import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
    const [users, setUsers] = useState([]);
    const [notes, setNotes] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const { token, user: adminUser } = useAuth();
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

    useEffect(() => {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'users') {
                    const { data } = await axios.get('/users', config);
                    setUsers(data);
                } else {
                    const { data } = await axios.get('/notes', config);
                    // Ensure notes is always an array
                    setNotes(Array.isArray(data) ? data : Array.isArray(data.notes) ? data.notes : []);
                }
            } catch (error) {
                console.error("Failed to fetch admin data", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [activeTab, token]);
    
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user permanently?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/users/${userId}`, config);
                setUsers(users.filter(u => u._id !== userId));
                alert('User deleted successfully.');
            } catch (error) {
                alert('Failed to delete user.');
            }
        }
    };
    
    const handleRoleChange = async (userId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`/users/${userId}/role`, {}, config);
            setUsers(users.map(u => 
                u._id === userId ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u
            ));
        } catch (error) {
            alert('Failed to update user role.');
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/notes/${noteId}`, config);
            setNotes(notes.filter(n => n._id !== noteId));
        }
    };

    return (
        <div className="content-page">
            <h1>Admin Dashboard</h1>
            <div className="profile-tabs">
                <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>Manage Users</button>
                <button onClick={() => setActiveTab('notes')} className={activeTab === 'notes' ? 'active' : ''}>Manage Notes</button>
            </div>
            
            {loading ? (
                <div>Loading data...</div>
            ) : (
                activeTab === 'users' ? (
                    <div className="admin-list">
                        <h2>All Users ({users.length})</h2>
                        {users.map(user => (
                            <div key={user._id} className="admin-list-item">
                                <img src={user.avatar} alt={user.name} />
                                <div className="user-info">
                                    <strong>{user.name}</strong> ({user.role})<br />
                                    <span>{user.email}</span>
                                </div>
                                <div className="admin-user-actions">
                                    <button
                                        onClick={() => handleRoleChange(user._id)}
                                        className="action-button role-btn"
                                        disabled={user._id === adminUser._id}
                                    >
                                        {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className="action-button delete-btn"
                                        disabled={user._id === adminUser._id}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="admin-list">
                        <h2>All Notes ({notes.length})</h2>
                        {notes.map(note => {
                            const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_120,h_90,c_pad,pg_1/${note.cloudinaryId}.jpg`;
                            return (
                                <div key={note._id} className="admin-list-item">
                                    <img src={thumbnailUrl} alt="Thumbnail" className="admin-note-thumbnail" />
                                    <div className="user-info">
                                        <strong>{note.title}</strong><br />
                                        <span>Uploaded by: {note.user?.name || 'N/A'}</span>
                                    </div>
                                    <div className="admin-user-actions">
                                        <Link to={`/view/${note._id}`} target="_blank" rel="noopener noreferrer" className="action-button view-btn">View</Link>
                                        <button onClick={() => handleDeleteNote(note._id)} className="action-button delete-btn">Delete</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}
        </div>
    );
};

export default AdminDashboardPage;
