import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const UploadPage = () => {
    const [formData, setFormData] = useState({ 
        title: '', 
        description: '', 
        university: '', 
        course: '', 
        subject: '', 
        year: '' 
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { token } = useAuth();
    const navigate = useNavigate();

    // Create a ref for the hidden file input
    const fileInputRef = useRef(null);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = e => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a file.');

        if (formData.description.length < 20) {
            return alert('Please provide a description or summary of at least 20 characters. This helps students find your notes.');
        }

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
        // FIXED: Added 'form-container' class here. 
        // This links the form to your App.css styles for textareas/inputs.
        <form onSubmit={handleSubmit} className="upload-form form-container">
            <h1 className="visually-hidden">
                Upload Your Study Notes – Help Fellow Students Learn and Succeed
            </h1>

            <h2>Upload Your Notes</h2>
            
            <div className="form-group">
                <label htmlFor="title">Note Title</label>
                <input 
                    id="title" 
                    name="title" 
                    type="text" 
                    onChange={handleChange} 
                    placeholder="e.g., Quantum Mechanics Chapter 3" 
                    required 
                />
            </div>

            {/* FIXED: Removed inline styles. 'form-container' class on the form now handles the styling. */}
            <div className="form-group">
                <label htmlFor="description">Description / Summary</label>
                <textarea 
                    id="description" 
                    name="description" 
                    onChange={handleChange} 
                    placeholder="Describe the contents... e.g. 'Detailed handwritten notes covering Schrödinger's equation and wave functions.'" 
                    required 
                    rows="4" 
                />
                <small style={{ color: 'var(--subtle-text-color)', display: 'block', marginTop: '5px', fontSize: '0.85rem' }}>
                    Writing a good description helps your notes appear in Google Search results.
                </small>
            </div>

            <div className="form-group">
                <label htmlFor="university">University</label>
                <input id="university" name="university" type="text" onChange={handleChange} placeholder="e.g., Harvard University" required />
            </div>
            <div className="form-group">
                <label htmlFor="course">Course</label>
                <input id="course" name="course" type="text" onChange={handleChange} placeholder="e.g., Bachelor of Science" required />
            </div>
            <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input id="subject" name="subject" type="text" onChange={handleChange} placeholder="e.g., Physics" required />
            </div>
            <div className="form-group">
                <label htmlFor="year">Year</label>
                <input id="year" name="year" type="number" onChange={handleChange} placeholder="e.g., 2" required />
            </div>
            <div className="form-group">
                <label htmlFor="file">File (PDF, DOC, Image, etc.)</label>
                <div className="file-input-wrapper">
                    <input
                        id="file"
                        name="file"
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        required
                    />
                    <label htmlFor="file" className="custom-file-upload">
                        Choose File
                    </label>
                    <span className="file-name-display">
                        {file ? file.name : 'No file chosen'}
                    </span>
                </div>
            </div>
            <button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </form>
    );
};

export default UploadPage;
