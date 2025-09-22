import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet'; // Import Helmet for SEO
import Pagination from '../components/common/Pagination';

const AdminDashboardPage = () => {
    const [users, setUsers] = useState([]);
    const [notes, setNotes] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // New state for error messages
    const { token, user: adminUser } = useAuth();
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [refetchIndex, setRefetchIndex] = useState(0);

    useEffect(() => {
        setCurrentPage(1);
        setError('');
    }, [activeTab]);

    useEffect(() => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        setError('');

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get('https://peernotez.netlify.app/api/users', config);
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users", error);
                setError('Failed to fetch user data. Please try again later.');
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        const fetchNotes = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`https://peernotez.netlify.app/api/notes?page=${currentPage}&limit=10`, config); // Added limit
                setNotes(data.notes || []);
                setTotalPages(data.totalPages || 0);
            } catch (error) {
                console.error("Failed to fetch notes", error);
                setError('Failed to fetch notes data. Please try again later.');
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
    }, [activeTab, token, currentPage, refetchIndex]);
    
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user permanently? This action cannot be undone.')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`https://peernotez.netlify.app/api/users/${userId}`, config);
                setUsers(users.filter(u => u._id !== userId));
                alert('User deleted successfully.');
            } catch (error) {
                setError('Failed to delete user.');
                console.error("Failed to delete user", error);
            }
        }
    };
    
    const handleRoleChange = async (userId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`https://peernotez.netlify.app/api/users/${userId}/role`, {}, config);
            setUsers(users.map(u => 
                u._id === userId ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u
            ));
        } catch (error) {
            setError('Failed to update user role.');
            console.error("Failed to update user role", error);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                await axios.delete(`https://peernotez.netlify.app/api/notes/${noteId}`, config);
                if (notes.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                } else {
                    setRefetchIndex(prev => prev + 1);
                }
                alert('Note deleted successfully.');
            } catch(error) {
                setError('Failed to delete note.');
                console.error("Failed to delete note", error);
            }
        }
    };
    
    const handleToggleFeatured = async (noteId, isCurrentlyFeatured) => {
        if (isCurrentlyFeatured && !window.confirm('Are you sure you want to un-feature this note?')) {
            return;
        } else if (!isCurrentlyFeatured && !window.confirm('Are you sure you want to feature this note? Only a few featured notes will be shown on the homepage.')) {
            return;
        }
        
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put(`https://peernotez.netlify.app/api/notes/${noteId}/toggle-featured`, {}, config);
            
            setNotes(notes.map(note => 
                note._id === noteId ? { ...note, isFeatured: data.isFeatured } : note
            ));
            
            alert(data.message);
        } catch (error) {
            setError('Failed to toggle featured status.');
            console.error('Failed to toggle featured status', error);
        }
    };

    const renderNoteItem = (note) => {
        let thumbnailUrl;
        const isWordDoc = note.fileType === 'application/msword' || note.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const isExcelDoc = note.fileType === 'application/vnd.ms-excel' || note.fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const isPptDoc = note.fileType === 'application/vnd.ms-powerpoint' || note.fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

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
                <img src={thumbnailUrl} alt="Note thumbnail" className="admin-note-thumbnail" />
                <div className="admin-item-info">
                    <strong className="admin-item-title">{note.title}</strong>
                    <span className="admin-item-meta">Uploaded by: {note.user?.name || 'N/A'}</span>
                    {note.isFeatured && <span className="admin-featured-badge">Featured</span>}
                </div>
                <div className="admin-item-actions">
                    <button
                        onClick={() => handleToggleFeatured(note._id, note.isFeatured)}
                        className={`admin-action-btn feature-btn ${note.isFeatured ? 'unfeature' : 'feature'}`}
                    >
                        <i className={`fas ${note.isFeatured ? 'fa-star-half' : 'fa-star'}`}></i>
                        {note.isFeatured ? ' Un-feature' : ' Feature'}
                    </button>
                    <Link to={`/view/${note._id}`} target="_blank" rel="noopener noreferrer" className="admin-action-btn view-btn">
                        <i className="fas fa-eye"></i> View
                    </Link>
                    <button onClick={() => handleDeleteNote(note._id)} className="admin-action-btn delete-btn">
                        <i className="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-dashboard-container">
            <Helmet>
                <title>Admin Dashboard | PeerNotez</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <header className="admin-header">
                <h1 className="admin-title"><i className="fas fa-tools"></i> Admin Dashboard</h1>
                <p className="admin-subtitle">
                    Welcome, {adminUser?.name || 'Admin'}. Manage users, moderate notes, and maintain the platform.
                </p>
            </header>

            <div className="admin-tabs">
                <button 
                    onClick={() => setActiveTab('users')} 
                    className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                >
                    <i className="fas fa-users"></i> Manage Users
                </button>
                <button 
                    onClick={() => setActiveTab('notes')} 
                    className={`admin-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                >
                    <i className="fas fa-file-alt"></i> Manage Notes
                </button>
            </div>
            
            {loading ? (
                <div className="admin-loading-state">
                    <i className="fas fa-spinner fa-spin"></i> Loading data...
                </div>
            ) : error ? (
                <div className="admin-error-state">
                    <i className="fas fa-exclamation-triangle"></i> {error}
                </div>
            ) : (
                activeTab === 'users' ? (
                    <div className="admin-list-container">
                        <h3 className="admin-section-heading">All Users ({users.length})</h3>
                        {users.map(user => (
                            <div key={user._id} className="admin-list-item">
                                <img src={user.avatar || 'https://via.placeholder.com/50'} alt={`${user.name} avatar`} className="admin-avatar" />
                                <div className="admin-item-info">
                                    <strong className="admin-item-title">{user.name}</strong>
                                    <span className="admin-item-meta">{user.email}</span>
                                    <span className="admin-user-role-badge">{user.role}</span>
                                </div>
                                <div className="admin-item-actions">
                                    <button
                                        onClick={() => handleRoleChange(user._id)}
                                        className="admin-action-btn role-btn"
                                        disabled={user._id === adminUser._id}
                                    >
                                        <i className="fas fa-user-shield"></i> {user.role === 'admin' ? 'Demote' : 'Promote'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className="admin-action-btn delete-btn"
                                        disabled={user._id === adminUser._id}
                                    >
                                        <i className="fas fa-user-minus"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="admin-list-container">
                        <h3 className="admin-section-heading">All Notes ({notes.length})</h3>
                        {notes.length > 0 ? notes.map(note => renderNoteItem(note)) : (
                            <p className="admin-no-results">No notes found.</p>
                        )}
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

