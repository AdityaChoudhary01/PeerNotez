import React from 'react';
import { Link } from 'react-router-dom';

const NoteCard = ({ note }) => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  
  const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_300,c_pad,pg_1,f_auto,q_auto/${note.cloudinaryId}.jpg`;

  return (
    <div className="project-card">
      <Link to={`/view/${note._id}`}>
        <img src={thumbnailUrl} alt={`Preview of ${note.title}`} className="card-thumbnail" />
      </Link>
      
      <div className="card-content">
        <h3 className="card-title">{note.title}</h3>
        
        <ul className="card-details">
          <li><strong>University:</strong> {note.university}</li>
          <li><strong>Course:</strong> {note.course}</li>
          <li><strong>Subject:</strong> {note.subject}</li>
          <li><strong>Year:</strong> {note.year}</li>
        </ul>

        {/* --- NEW ACTIONS SECTION --- */}
        <div className="card-actions">
          <Link to={`/view/${note._id}`} className="action-button view-btn">View</Link>
          <a 
            href={note.filePath} 
            download={note.fileName} 
            className="action-button download-btn"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;