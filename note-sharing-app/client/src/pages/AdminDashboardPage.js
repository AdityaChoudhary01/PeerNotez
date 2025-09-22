import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import Pagination from '../components/common/Pagination';

const AdminDashboardPage = () => {
    const [users, setUsers] = useState([]);
    const [notes, setNotes] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const { token, user: adminUser } = useAuth();
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

    // Add state to manage pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [refetchIndex, setRefetchIndex] = useState(0);

    // This effect reliably resets the page to 1 when you switch tabs
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // This effect now handles fetching data for the current page
    useEffect(() => {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get('/users', config);
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchNotes = async () => {
            setLoading(true);
            try {
                // The API call now includes the current page number
                const { data } = await axios.get(`/notes?page=${currentPage}`, config);
                // Update state based on the paginated response from the backend
                setNotes(data.notes || []);
                setTotalPages(data.totalPages || 0);
            } catch (error) {
                console.error("Failed to fetch notes", error);
                setNotes([]);
                setTotalPages(0);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            if (activeTab === 'users') {
                fetchUsers();
            } else {
                fetchNotes();
            }
        }
    // The effect re-runs when the page, tab, or refetch trigger changes
    }, [activeTab, token, currentPage, refetchIndex]);
    
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
            try {
                await axios.delete(`/notes/${noteId}`, config);
                // After delete, if it was the last item on the page, go to the previous page
                if (notes.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                } else {
                    // Otherwise, trigger a refetch of the current page
                    setRefetchIndex(prev => prev + 1);
                }
            } catch(error) {
                console.error("Failed to delete note", error);
                alert('Failed to delete note.');
            }
        }
    };

    // --- UPDATED RENDER FUNCTION ---
    const renderNoteItem = (note) => {
        let thumbnailUrl;

        const isWordDoc = note.fileType.includes('word');
        const isExcelDoc = note.fileType.includes('excel');
        const isPptDoc = note.fileType.includes('powerpoint');

        if (note.fileType.startsWith('image/')) {
            thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_120,h_90,c_fill,f_auto,q_auto/${note.cloudinaryId}.jpg`;
        } else if (note.fileType === 'application/pdf') {
            thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_120,h_90,c_pad,pg_1,f_jpg,q_auto/${note.cloudinaryId}.jpg`;
        } else if (isWordDoc) {
            thumbnailUrl = '/images/icons/word-icon.png';
        } else if (isExcelDoc) {
            thumbnailUrl = '/images/icons/excel-icon.png';
        } else if (isPptDoc) {
            thumbnailUrl = '/images/icons/ppt-icon.png';
        } else {
            thumbnailUrl = '/images/icons/document-icon.png';
        }
        
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
                        {notes.map(note => renderNoteItem(note))}
                        <Pagination 
                            page={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )
            )}
        </div>
    );
};

export default AdminDashboardPage;
