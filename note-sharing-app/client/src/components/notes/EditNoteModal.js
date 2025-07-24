import React, { useState, useEffect } from 'react';
import axios from 'axios';

// A simple modal component for editing note details
const EditNoteModal = ({ note, token, onUpdate, onClose }) => {
  // State to manage form inputs
  const [formData, setFormData] = useState({
    title: '',
    university: '',
    course: '',
    subject: '',
    year: '',
  });
  const [loading, setLoading] = useState(false);

  // When the 'note' prop changes, populate the form with its data
  useEffect(() => {
     console.log('Step 2: EditNoteModal received note:', note); 
    if (note) {
      setFormData({
        title: note.title || '',
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
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.put(`/notes/${note._id}`, formData, config);
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