import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import StarRating from '../common/StarRating';

const NoteCard = ({ note, showActions = false, onEdit = () => {}, onDelete = () => {} }) => {
  const { user, token, saveNote, unsaveNote } = useAuth();
  const isSaved = user?.savedNotes?.includes(note._id);
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  let thumbnailUrl = '';
  
  const isWordDoc = note.fileType === 'application/msword' || note.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isExcelDoc = note.fileType === 'application/vnd.ms-excel' || note.fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const isPptDoc = note.fileType === 'application/vnd.ms-powerpoint' || note.fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

  if (note.fileType.startsWith('image/')) {
    thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_300,c_fill,f_auto,q_auto/${note.cloudinaryId}.jpg`;
  } else if (note.fileType === 'application/pdf') {
    thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_300,c_pad,pg_1,f_jpg,q_auto/${note.cloudinaryId}.jpg`;
  } else if (isWordDoc) {
    thumbnailUrl = '/images/icons/word-icon.png';
  } else if (isExcelDoc) {
    thumbnailUrl = '/images/icons/excel-icon.png';
  } else if (isPptDoc) {
    thumbnailUrl = '/images/icons/ppt-icon.png';
  } else if (note.fileType === 'text/plain') {
    thumbnailUrl = '/images/icons/text-icon.png';
  } else {
    // Generic fallback for any other raw file
    thumbnailUrl = '/images/icons/document-icon.png';
  }


  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (!user) return alert('Please log in to save notes.');

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const endpoint = isSaved ? `/users/unsave/${note._id}` : `/users/save/${note._id}`;

    try {
      await axios.put(endpoint, {}, config);
      isSaved ? unsaveNote(note._id) : saveNote(note._id);
    } catch (error) {
      console.error('Failed to update saved notes', error);
      alert('Failed to update saved notes.');
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      await axios.put(`/notes/${note._id}/download`);
    } catch (error) {
      console.error('Failed to update download count', error);
    }
    window.open(note.filePath, '_blank');
  };

  return (
    <div className="project-card">
      <Link to={`/view/${note._id}`} className="card-thumbnail-link">
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
            <button className="action-button edit-btn" onClick={() => onEdit(note)}>Edit</button>
            <button className="action-button delete-btn" onClick={() => onDelete(note._id)}>Delete</button>
          </div>
        )}

        <div className="card-actions">
          {user && (
            <button onClick={handleSaveToggle} className={`action-button save-btn ${isSaved ? 'saved' : ''}`}>
              {isSaved ? '✓ Saved' : 'Save'}
            </button>
          )}
          <Link to={`/view/${note._id}`} className="action-button view-btn">View</Link>
          <button onClick={handleDownload} className="action-button download-btn">Download</button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
