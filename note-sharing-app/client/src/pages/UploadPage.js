import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const UploadForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        university: '',
        course: '',
        subject: '',
        year: ''
    });
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
        setError('');
        setUploading(true);

        const data = new FormData();
        // Append all form fields to the FormData object
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('file', file);

        try {
            // Send the request with the auth token in the header
            await axios.post('http://localhost:5001/api/notes/upload', data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            navigate('/'); // Redirect after successful upload
        } catch (err) {
            setError('Upload failed. Please check the file type and try again.');
            console.error('Upload failed', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="upload-form">
            <h2>Upload Your Notes</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
                <label>Note Title</label>
                <input name="title" onChange={handleChange} placeholder="e.g., Quantum Mechanics Chapter 3" required />
            </div>
            <div className="form-group">
                <label>University</label>
                <input name="university" onChange={handleChange} placeholder="e.g., Harvard University" required />
            </div>
            <div className="form-group">
                <label>Course</label>
                <input name="course" onChange={handleChange} placeholder="e.g., Bachelor of Science" required />
            </div>
            <div className="form-group">
                <label>Subject</label>
                <input name="subject" onChange={handleChange} placeholder="e.g., Physics" required />
            </div>
            <div className="form-group">
                <label>Year</label>
                <input type="number" name="year" onChange={handleChange} placeholder="e.g., 2" required />
            </div>
            <div className="form-group">
                <label>File (PDF, DOC, PPT)</label>
                <input type="file" onChange={handleFileChange} required />
            </div>
            <button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Note'}
            </button>
        </form>
    );
};

export default UploadForm;
