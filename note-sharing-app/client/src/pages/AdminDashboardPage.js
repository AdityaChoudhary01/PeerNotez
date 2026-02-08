import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Pagination from '../components/common/Pagination';
import { FaFeatherAlt, FaUsers, FaFileAlt, FaTools, FaTrash, FaUserShield, FaStar, FaEye, FaExclamationTriangle, FaImage } from 'react-icons/fa';

const AdminDashboardPage = () => {
    const [users, setUsers] = useState([]);
    const [notes, setNotes] = useState([]);
    const [blogs, setBlogs] = useState([]); 
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); 
    const { token, user: adminUser } = useAuth();
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [refetchIndex, setRefetchIndex] = useState(0);

    // --- INTERNAL CSS: HOLOGRAPHIC DASHBOARD ---
    const styles = {
        container: {
            paddingTop: '2rem',
            paddingBottom: '5rem'
        },
        header: {
            marginBottom: '3rem',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2rem'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px'
        },
        subtitle: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.1rem'
        },
        tabs: {
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3rem',
            flexWrap: 'wrap'
        },
        tabBtn: {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.7)',
            padding: '12px 24px',
            borderRadius: '50px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
        },
        activeTab: {
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.4)'
        },
        listContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        },
        listItem: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            transition: 'transform 0.2s, background 0.2s'
        },
        itemInfo: {
            flex: 1,
            minWidth: '200px'
        },
        itemTitle: {
            display: 'block',
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '4px'
        },
        itemMeta: {
            display: 'block',
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.6)'
        },
        avatar: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid rgba(0, 212, 255, 0.3)',
            marginRight: '1rem'
        },
        thumbnail: {
            width: '80px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginRight: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        // NEW: Placeholder for blogs without images
        placeholderThumb: {
            width: '80px',
            height: '60px',
            borderRadius: '8px',
            marginRight: '1rem',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        actions: {
            display: 'flex',
            gap: '10px'
        },
        actionBtn: {
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'opacity 0.2s',
            textDecoration: 'none'
        },
        deleteBtn: {
            background: 'rgba(255, 0, 85, 0.15)',
            color: '#ff0055'
        },
        roleBtn: {
            background: 'rgba(255, 204, 0, 0.15)',
            color: '#ffcc00'
        },
        viewBtn: {
            background: 'rgba(0, 212, 255, 0.15)',
            color: '#00d4ff'
        },
        featureBtn: {
            background: 'rgba(188, 19, 254, 0.15)',
            color: '#bc13fe'
        },
        badge: {
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            marginTop: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }
    };

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
                // Use relative path for proxy
                const { data } = await axios.get('/users', config);
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users", error);
                setError('Failed to fetch user data.');
                setUsers([]);
            } finally { setLoading(false); }
        };

        const fetchNotes = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`/notes?page=${currentPage}&limit=10`, config);
                setNotes(data.notes || []);
                setTotalPages(data.totalPages || 0);
            } catch (error) {
                console.error("Failed to fetch notes", error);
                setError('Failed to fetch notes data.');
                setNotes([]);
                setTotalPages(0);
            } finally { setLoading(false); }
        };

        const fetchBlogs = async () => {
             setLoading(true);
             try {
                 const { data } = await axios.get(`/blogs?page=${currentPage}&limit=10`, config); 
                 setBlogs(data.blogs || []);
                 setTotalPages(data.totalPages || 0);
             } catch (error) {
                 console.error("Failed to fetch blogs", error);
                 setError('Failed to fetch blog data.');
                 setBlogs([]);
                 setTotalPages(0);
             } finally { setLoading(false); }
        };

        if (token) {
            if (activeTab === 'users') fetchUsers();
            else if (activeTab === 'notes') fetchNotes();
            else if (activeTab === 'blogs') fetchBlogs();
        }
    }, [activeTab, token, currentPage, refetchIndex]);
    
    // --- Handlers (Delete, Role Change, Feature Toggle) ---
    // (Logic remains same, just updated API paths to relative for proxy)

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user permanently?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/users/${userId}`, config);
                setUsers(users.filter(u => u._id !== userId));
            } catch (error) { setError('Failed to delete user.'); }
        }
    };
    
    const handleRoleChange = async (userId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`/users/${userId}/role`, {}, config);
            setUsers(users.map(u => u._id === userId ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u));
        } catch (error) { setError('Failed to update user role.'); }
    };

    const handleDeleteNote = async (noteId) => {
        if (window.confirm('Delete this note?')) {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                await axios.delete(`/notes/${noteId}`, config);
                setRefetchIndex(prev => prev + 1);
            } catch(error) { setError('Failed to delete note.'); }
        }
    };
    
    const handleToggleFeatured = async (id, isCurrentlyFeatured, type) => {
        if (!window.confirm(`Toggle featured status?`)) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const endpoint = type === 'note' ? `/notes/${id}/toggle-featured` : `/blogs/${id}/toggle-featured`;
            
            const { data } = await axios.put(endpoint, {}, config);
            
            if (type === 'note') {
                setNotes(notes.map(item => item._id === id ? { ...item, isFeatured: data.isFeatured } : item));
            } else {
                setBlogs(blogs.map(item => item._id === id ? { ...item, isFeatured: data.isFeatured } : item));
            }
        } catch (error) { setError(`Failed to update status.`); }
    };

    const handleDeleteBlog = async (blogId) => {
        if (window.confirm('Delete this blog post?')) {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                await axios.delete(`/blogs/${blogId}`, config);
                setRefetchIndex(prev => prev + 1);
            } catch(error) { setError('Failed to delete blog post.'); }
        }
    };

    // --- Render Helpers ---

    const renderNoteItem = (note) => {
        let thumbnailUrl = '/images/icons/document-icon.png';
        if (note.cloudinaryId) {
             if (note.fileType.startsWith('image/') || note.fileType === 'application/pdf') {
                thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_150,h_100,c_fill,q_auto/${note.cloudinaryId}.jpg`;
             }
        }
        
        return (
            <div key={note._id} style={styles.listItem}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <img src={thumbnailUrl} alt="Thumbnail" style={styles.thumbnail} />
                    <div style={styles.itemInfo}>
                        <strong style={styles.itemTitle}>{note.title}</strong>
                        <span style={styles.itemMeta}>By: {note.user?.name || 'Unknown'}</span>
                        {note.isFeatured && <span style={{...styles.badge, background: '#bc13fe', borderColor: '#bc13fe'}}>Featured</span>}
                    </div>
                </div>
                <div style={styles.actions}>
                    {/* ENHANCED FEATURE BUTTON FOR NOTES (Matches Blogs) */}
                    <button
                        onClick={() => handleToggleFeatured(note._id, note.isFeatured, 'note')}
                        style={{...styles.actionBtn, ...styles.featureBtn}}
                    >
                        <FaStar /> {note.isFeatured ? 'Un-feature' : 'Feature'}
                    </button>
                    <Link to={`/view/${note._id}`} target="_blank" style={{...styles.actionBtn, ...styles.viewBtn}}>
                        <FaEye /> View
                    </Link>
                    <button onClick={() => handleDeleteNote(note._id)} style={{...styles.actionBtn, ...styles.deleteBtn}}>
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>
        );
    };

    const renderBlogItem = (blog) => {
        return (
            <div key={blog._id} style={styles.listItem}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {/* --- 🚀 NEW: BANNER IMAGE DISPLAY --- */}
                    {blog.coverImage ? (
                        <img src={blog.coverImage} alt="Banner" style={styles.thumbnail} />
                    ) : (
                        <div style={styles.placeholderThumb}>
                            <FaImage size={24} />
                        </div>
                    )}
                    
                    <div style={styles.itemInfo}>
                        <strong style={styles.itemTitle}>{blog.title}</strong>
                        <span style={styles.itemMeta}>By: {blog.author?.name || 'Unknown'}</span>
                        {blog.isFeatured && <span style={{...styles.badge, background: '#bc13fe', borderColor: '#bc13fe'}}>Featured</span>}
                    </div>
                </div>
                <div style={styles.actions}>
                    <button
                        onClick={() => handleToggleFeatured(blog._id, blog.isFeatured, 'blog')}
                        style={{...styles.actionBtn, ...styles.featureBtn}}
                    >
                        <FaStar /> {blog.isFeatured ? 'Un-feature' : 'Feature'}
                    </button>
                    <Link to={`/blogs/${blog.slug}`} target="_blank" style={{...styles.actionBtn, ...styles.viewBtn}}>
                        <FaEye /> View
                    </Link>
                    <button onClick={() => handleDeleteBlog(blog._id)} style={{...styles.actionBtn, ...styles.deleteBtn}}>
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <Helmet>
                <title>Admin Dashboard | PeerNotez</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <header style={styles.header}>
                <h1 style={styles.title}><FaTools /> Admin Dashboard</h1>
                <p style={styles.subtitle}>
                    Welcome, {adminUser?.name || 'Admin'}. Manage users, moderate content, and maintain the platform.
                </p>
            </header>

            <div style={styles.tabs}>
                <button 
                    onClick={() => setActiveTab('users')} 
                    style={activeTab === 'users' ? {...styles.tabBtn, ...styles.activeTab} : styles.tabBtn}
                >
                    <FaUsers /> Users
                </button>
                <button 
                    onClick={() => setActiveTab('notes')} 
                    style={activeTab === 'notes' ? {...styles.tabBtn, ...styles.activeTab} : styles.tabBtn}
                >
                    <FaFileAlt /> Notes
                </button>
                <button 
                    onClick={() => setActiveTab('blogs')} 
                    style={activeTab === 'blogs' ? {...styles.tabBtn, ...styles.activeTab} : styles.tabBtn}
                >
                    <FaFeatherAlt /> Blogs
                </button>
            </div>
            
            {loading ? (
                <div style={{textAlign: 'center', fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)'}}>Loading...</div>
            ) : error ? (
                <div style={{textAlign: 'center', color: '#ff0055', fontSize: '1.1rem'}}>
                    <FaExclamationTriangle /> {error}
                </div>
            ) : (
                <div style={styles.listContainer}>
                    {activeTab === 'users' ? (
                        <>
                            <h3 style={{color: '#fff', marginBottom: '1rem'}}>All Users ({users.length})</h3>
                            {users.map(user => (
                                <div key={user._id} style={styles.listItem}>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <img src={user.avatar || 'https://via.placeholder.com/50'} alt="Avatar" style={styles.avatar} />
                                        <div style={styles.itemInfo}>
                                            <strong style={styles.itemTitle}>{user.name}</strong>
                                            <span style={styles.itemMeta}>{user.email}</span>
                                            <span style={styles.badge}>{user.role}</span>
                                        </div>
                                    </div>
                                    <div style={styles.actions}>
                                        <button
                                            onClick={() => handleRoleChange(user._id)}
                                            style={{...styles.actionBtn, ...styles.roleBtn}}
                                            disabled={user._id === adminUser._id}
                                        >
                                            <FaUserShield /> {user.role === 'admin' ? 'Demote' : 'Promote'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            style={{...styles.actionBtn, ...styles.deleteBtn}}
                                            disabled={user._id === adminUser._id}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : activeTab === 'notes' ? (
                        <>
                            <h3 style={{color: '#fff', marginBottom: '1rem'}}>All Notes</h3>
                            {notes.length > 0 ? notes.map(note => renderNoteItem(note)) : <p>No notes found.</p>}
                            <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </>
                    ) : (
                        <>
                            <h3 style={{color: '#fff', marginBottom: '1rem'}}>All Blog Posts</h3>
                            {blogs.length > 0 ? blogs.map(blog => renderBlogItem(blog)) : <p>No blogs found.</p>}
                            <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </>
                    )}
                </div>
            )}
            {/* Inline CSS for Hover Effects */}
            <style>{`
                .admin-btn:hover { opacity: 0.8; transform: translateY(-2px); }
            `}</style>
        </div>
    );
};

export default AdminDashboardPage;
