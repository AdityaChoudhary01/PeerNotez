import React from 'react';

const StarRating = ({ rating, setRating = null, readOnly = false }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`star-rating ${readOnly ? 'read-only' : ''}`}>
      {stars.map((star) => (
        <span
          key={star}
          className={star <= rating ? 'star filled' : 'star'}
          onClick={() => !readOnly && setRating(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
