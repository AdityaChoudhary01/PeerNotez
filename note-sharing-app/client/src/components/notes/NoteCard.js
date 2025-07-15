import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';

const NoteCard = ({ note }) => {
  const { user, token, saveNote, unsaveNote } = useAuth();
  const isSaved = user?.savedNotes?.includes(note._id);

  const handleSaveToggle = async () => {
    if (!user) return; // Or prompt to login
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const endpoint = isSaved ? `/users/unsave/${note._id}` : `/users/save/${note._id}`;
    
    try {
      await axios.put(endpoint, {}, config);
      isSaved ? unsaveNote(note._id) : saveNote(note._id);
    } catch (error) {
      console.error('Failed to update saved notes', error);
    }
  };

  return (
    <div className="project-card">
      <Link to={`/view/${note._id}`}>
        <img 
          src={`https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload/w_400,h_300,c_pad,pg_1,f_auto,q_auto/${note.cloudinaryId}.jpg`} 
          alt={`Preview of ${note.title}`} 
          className="card-thumbnail" 
        />
      </Link>
      <div className="card-content">
        <h3 className="card-title">{note.title}</h3>
        <ul className="card-details">
          <li><strong>University:</strong> {note.university}</li>
          <li><strong>Course:</strong> {note.course}</li>
          <li><strong>Subject:</strong> {note.subject}</li>
          <li><strong>Year:</strong> {note.year}</li>
        </ul>
        <div className="card-actions">
          {user && (
            <button onClick={handleSaveToggle} className={`action-button save-btn ${isSaved ? 'saved' : ''}`}>
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
          <Link to={`/view/${note._id}`} className="action-button view-btn">View</Link>
          <a href={note.filePath} download={note.fileName} className="action-button download-btn">Download</a>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
