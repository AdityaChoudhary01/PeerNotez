import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaCloudUploadAlt, FaFileAlt, FaUniversity, FaBook, FaLayerGroup, FaCalendarAlt } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

const UploadPage = () => {
    const [formData, setFormData] = useState({ title: '', university: '', course: '', subject: '', year: '' });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { token } = useAuth();
    const navigate = useNavigate();

    const fileInputRef = useRef(null);

    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
    const styles = {
        wrapper: {
            paddingTop: '2rem',
            paddingBottom: '5rem',
            minHeight: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingLeft: '1rem',
            paddingRight: '1rem'
        },
        formCard: {
            width: '100%',
            maxWidth: '700px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            // Padding handled via CSS class for response
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            color: '#fff'
        },
        header: {
            textAlign: 'center',
            marginBottom: '2rem'
        },
        title: {
            fontSize: 'clamp(1.8rem, 5vw, 2.2rem)',
            fontWeight: '800',
            background: 'linear-gradient(to right, #00d4ff, #ff00cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap'
        },
        subtitle: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1rem'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '0.5rem',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: '600',
            fontSize: '0.95rem'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit'
        },
        fileWrapper: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginTop: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '10px',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            flexWrap: 'wrap'
        },
        fileLabelBtn: {
            background: 'rgba(0, 212, 255, 0.15)',
            color: '#00d4ff',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
        },
        fileName: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            fontStyle: file ? 'normal' : 'italic',
            wordBreak: 'break-all'
        },
        submitBtn: {
            width: '100%',
            padding: '14px',
            marginTop: '1.5rem',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
            color: '#fff',
            border: 'none',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
            transition: 'transform 0.2s, opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        }
    };

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = e => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = '#00d4ff';
        e.target.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.2)';
    };
    const handleBlur = (e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.boxShadow = 'none';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a file.');

        setUploading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('file', file);

        try {
            await axios.post('https://peernotez.onrender.com/api/notes/upload', data, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Note uploaded successfully!');
            navigate('/');
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={styles.wrapper} className="upload-page-wrapper">
            <Helmet>
                <title>Upload Notes | PeerNotez</title>
            </Helmet>

            <form onSubmit={handleSubmit} style={styles.formCard} className="upload-form-card">
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        <FaCloudUploadAlt /> Upload Your Notes
                    </h2>
                    <p style={styles.subtitle}>Share your knowledge and help others grow.</p>
                </div>

                <div style={styles.formGroup} className="form-group">
                    <label htmlFor="title" style={styles.label}>
                        <FaFileAlt style={{color: '#00d4ff'}} /> Note Title
                    </label>
                    <input 
                        id="title" 
                        name="title" 
                        type="text" 
                        onChange={handleChange} 
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="e.g., Quantum Mechanics Chapter 3" 
                        required 
                        style={styles.input}
                    />
                </div>

                {/* Grid Row 1 */}
                <div className="form-row-grid">
                    <div style={styles.formGroup} className="form-group">
                        <label htmlFor="university" style={styles.label}>
                            <FaUniversity style={{color: '#ff00cc'}} /> University
                        </label>
                        <input 
                            id="university" 
                            name="university" 
                            type="text" 
                            onChange={handleChange} 
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder="e.g., Harvard" 
                            required 
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup} className="form-group">
                        <label htmlFor="course" style={styles.label}>
                            <FaBook style={{color: '#bc13fe'}} /> Course/Degree
                        </label>
                        <input 
                            id="course" 
                            name="course" 
                            type="text" 
                            onChange={handleChange} 
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder="e.g., B.Tech" 
                            required 
                            style={styles.input}
                        />
                    </div>
                </div>

                {/* Grid Row 2 */}
                <div className="form-row-grid subject-year-grid">
                    <div style={styles.formGroup} className="form-group">
                        <label htmlFor="subject" style={styles.label}>
                            <FaLayerGroup style={{color: '#00ffaa'}} /> Subject
                        </label>
                        <input 
                            id="subject" 
                            name="subject" 
                            type="text" 
                            onChange={handleChange} 
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder="e.g., Physics" 
                            required 
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup} className="form-group">
                        <label htmlFor="year" style={styles.label}>
                            <FaCalendarAlt style={{color: '#ffdd00'}} /> Year
                        </label>
                        <input 
                            id="year" 
                            name="year" 
                            type="number" 
                            onChange={handleChange} 
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder="e.g., 2" 
                            required 
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={styles.formGroup} className="form-group">
                    <label htmlFor="file" style={styles.label}>
                        <FaCloudUploadAlt style={{color: '#fff'}} /> Attach File (PDF, DOC, IMG)
                    </label>
                    <div style={styles.fileWrapper}>
                        <input
                            id="file"
                            name="file"
                            type="file"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            required
                            style={{display: 'none'}}
                        />
                        <label 
                            htmlFor="file" 
                            style={styles.fileLabelBtn}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(0, 212, 255, 0.25)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(0, 212, 255, 0.15)'}
                        >
                            Choose File
                        </label>
                        <span style={styles.fileName}>
                            {file ? file.name : 'No file chosen...'}
                        </span>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={uploading}
                    style={{...styles.submitBtn, opacity: uploading ? 0.7 : 1, cursor: uploading ? 'wait' : 'pointer'}}
                    onMouseEnter={(e) => !uploading && (e.target.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => !uploading && (e.target.style.transform = 'translateY(0)')}
                >
                    {uploading ? 'Uploading...' : <><FaCloudUploadAlt /> Upload Note</>}
                </button>
            </form>

            {/* RESPONSIVE STYLES */}
            <style>{`
                /* Default Desktop Styles */
                .upload-form-card {
                    padding: 3rem;
                }
                .form-row-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .subject-year-grid {
                    grid-template-columns: 2fr 1fr;
                }

                /* Mobile/Tablet Styles (Max Width 768px) */
                @media (max-width: 768px) {
                    /* Wrapper Padding */
                    .upload-page-wrapper {
                        padding-left: 0.5rem !important;
                        padding-right: 0.5rem !important;
                    }

                    /* Card Padding - Much tighter on mobile */
                    .upload-form-card {
                        padding: 1rem !important; 
                        border-radius: 16px !important;
                    }

                    /* Input Margins - Reduce vertical spacing */
                    .form-group {
                        margin-bottom: 1rem !important;
                    }

                    /* Stack Columns and remove Gap */
                    .form-row-grid, 
                    .subject-year-grid {
                        grid-template-columns: 1fr !important;
                        gap: 0 !important; 
                    }
                }
            `}</style>
        </div>
    );
};

export default UploadPage;

