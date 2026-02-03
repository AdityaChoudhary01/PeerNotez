import React, { useState, useEffect } from 'react';
import axios from 'axios';

// A simple modal component for editing note details
const EditNoteModal = ({ note, token, onUpdate, onClose }) => {
  // State to manage form inputs
  const [formData, setFormData] = useState({
    title: '',
    description: '', // Added description field
    university: '',
    course: '',
    subject: '',
    year: '',
  });
  const [loading, setLoading] = useState(false);

  // When the 'note' prop changes, populate the form with its data
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        description: note.description || '', // Populate existing description
        university: note.university || '',
        course: note.course || '',
        subject: note.subject || '',
        year: note.year || '',
      });
    }
  }, [note]);

  // Handle changes in form inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Ensure description is at least 20 chars
    if (formData.description.length < 20) {
        return alert('Description must be at least 20 characters long.');
    }

    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      // Use full production URL
      const { data } = await axios.put(`https://peernotez.onrender.com/api/notes/${note._id}`, formData, config);
      alert('Note updated successfully!');
      onUpdate(data); // Pass the updated note back to the parent component
    } catch (error) {
      console.error('Failed to update note', error);
      alert('Failed to update note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!note) return null; // Don't render if no note is being edited

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Note</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          {/* New Description Field */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
                rows="4"
                style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    fontFamily: 'inherit'
                }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="university">University</label>
            <input type="text" id="university" name="university" value={formData.university} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="course">Course</label>
            <input type="text" id="course" name="course" value={formData.course} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="year">Year</label>
            <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} required />
          </div>
          <div className="modal-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNoteModal;
