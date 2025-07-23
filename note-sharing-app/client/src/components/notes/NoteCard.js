import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import StarRating from '../common/StarRating';

const NoteCard = ({ note, showActions = false, onEdit, onDelete }) => {
  const { user, token, saveNote, unsaveNote } = useAuth();
  const isSaved = user?.savedNotes?.includes(note._id);
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_300,c_pad,pg_1,f_auto,q_auto/${note.cloudinaryId}.jpg`;

  const handleSaveToggle = async () => {
    if (!user) {
      alert('Please log in to save notes.');
      return;
    }
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const endpoint = isSaved ? `/users/unsave/${note._id}` : `/users/save/${note._id}`;

    try {
      await axios.put(endpoint, {}, config);
      isSaved ? unsaveNote(note._id) : saveNote(note._id);
    } catch (error) {
      console.error('Failed to update saved notes', error);
    }
  };

  // --- SIMPLIFIED CLOUDINARY DOWNLOAD HANDLER ---
  const handleDownload = async () => {
  try {
    await axios.put(`/notes/${note._id}/download`);
    let publicId = note.cloudinaryId;
    let resourceType = note.resourceType || 'image'; // Save resource type at upload time if possible

    const cloudDownloadUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/fl_attachment/${publicId}`;
    window.open(cloudDownloadUrl, '_blank');
  } catch (error) {
    console.error("Failed to update download count, downloading directly.", error);
    let publicId = note.cloudinaryId;
    let resourceType = note.resourceType || 'image';
    const cloudDownloadUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/fl_attachment/${publicId}`;
    window.open(cloudDownloadUrl, '_blank');
  }
};

  return (
    <div className="project-card">
      <Link to={`/view/${note._id}`}>
        <img src={thumbnailUrl} alt={`Preview of ${note.title}`} className="card-thumbnail" />
      </Link>

      <div className="card-content">
        <h3 className="card-title">{note.title}</h3>

        <div className="card-rating">
          <StarRating rating={note.rating} readOnly={true} />
          <span>({note.numReviews} reviews)</span>
        </div>

        <ul className="card-details">
          <li><strong>University:</strong> {note.university}</li>
          <li><strong>Course:</strong> {note.course}</li>
          <li><strong>Subject:</strong> {note.subject}</li>
          <li><strong>Year:</strong> {note.year}</li>
        </ul>

        {showActions && (
          <div className="owner-actions">
            <button onClick={() => onEdit(note)} className="action-button edit-btn">Edit</button>
            <button onClick={() => onDelete(note._id)} className="action-button delete-btn">Delete</button>
          </div>
        )}

        <div className="card-actions">
          {user && (
            <button onClick={handleSaveToggle} className={`action-button save-btn ${isSaved ? 'saved' : ''}`}>
              {isSaved ? '✓ Saved' : 'Save'}
            </button>
          )}
          <Link to={`/view/${note._id}`} className="action-button view-btn">View</Link>
          <button onClick={handleDownload} className="action-button download-btn">
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
