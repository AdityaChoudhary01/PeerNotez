import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for Portals
import axios from 'axios';
import { FaSave, FaTimes, FaSpinner, FaEdit } from 'react-icons/fa';

const EditNoteModal = ({ note, token, onUpdate, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        university: '',
        course: '',
        subject: '',
        year: '',
        description: '', // Restored description field
    });
    const [loading, setLoading] = useState(false);

    // --- INTERNAL CSS: HOLOGRAPHIC MODAL ---
    const styles = {
        backdrop: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999, 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
        },
        modal: {
            background: 'rgba(25, 20, 50, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        },
        header: {
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, rgba(0, 212, 255, 0.1), transparent)',
            flexShrink: 0
        },
        title: {
            margin: 0,
            fontSize: '1.4rem',
            color: '#fff',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        closeBtn: {
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            transition: 'color 0.2s',
            padding: '5px'
        },
        body: {
            padding: '2rem',
            overflowY: 'auto',
            flexGrow: 1 
        },
        inputGroup: {
            marginBottom: '1.2rem'
        },
        label: {
            display: 'block',
            marginBottom: '6px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem',
            fontWeight: '600'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.3)',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s ease',
            fontFamily: "'Spline Sans', sans-serif"
        },
        textArea: {
            minHeight: '100px',
            resize: 'vertical'
        },
        footer: {
            padding: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            background: 'rgba(0, 0, 0, 0.2)',
            flexShrink: 0
        },
        saveBtn: {
            padding: '12px 24px',
            borderRadius: '50px',
            border: 'none',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
            transition: 'transform 0.2s'
        },
        cancelBtn: {
            padding: '12px 24px',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'transparent',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
        }
    };

    useEffect(() => {
        if (note) {
            setFormData({
                title: note.title || '',
                university: note.university || '',
                course: note.course || '',
                subject: note.subject || '',
                year: note.year || '',
                description: note.description || '', // Map description from note
            });
        }
    }, [note]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = '#00d4ff';
        e.target.style.background = 'rgba(0, 0, 0, 0.5)';
        e.target.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.2)';
    };

    const handleBlur = (e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.background = 'rgba(0, 0, 0, 0.3)';
        e.target.style.boxShadow = 'none';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- RESTORED VALIDATION ---
        if (formData.description.length < 20) {
            alert('Description must be at least 20 characters long.');
            return;
        }

        setLoading(true);
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };
        try {
            const { data } = await axios.put(`/notes/${note._id}`, formData, config);
            alert('Note updated successfully!');
            onUpdate(data);
        } catch (error) {
            console.error('Failed to update note', error);
            alert(error.response?.data?.message || 'Failed to update note. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!note) return null;

    return ReactDOM.createPortal(
        <div style={styles.backdrop} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}><FaEdit style={{color: '#00d4ff'}} /> Edit Note Details</h2>
                    <button 
                        style={styles.closeBtn} 
                        onClick={onClose}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden'}}>
                    <div style={styles.body}>
                        <div style={styles.inputGroup}>
                            <label htmlFor="title" style={styles.label}>Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                required
                                style={styles.input}
                            />
                        </div>

                        {/* --- RESTORED DESCRIPTION FIELD --- */}
                        <div style={styles.inputGroup}>
                            <label htmlFor="description" style={styles.label}>Description (Min. 20 chars)</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                required
                                style={{...styles.input, ...styles.textArea}}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="university" style={styles.label}>University</label>
                            <input
                                type="text"
                                id="university"
                                name="university"
                                value={formData.university}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="course" style={styles.label}>Course</label>
                            <input
                                type="text"
                                id="course"
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="subject" style={styles.label}>Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="year" style={styles.label}>Year</label>
                            <input
                                type="number"
                                id="year"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                required
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.footer}>
                        <button 
                            type="button" 
                            style={styles.cancelBtn} 
                            onClick={onClose} 
                            disabled={loading}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            style={{...styles.saveBtn, opacity: loading ? 0.7 : 1}} 
                            disabled={loading}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {loading ? <FaSpinner className="spin" /> : <><FaSave /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>,
        document.body 
    );
};

export default EditNoteModal;
