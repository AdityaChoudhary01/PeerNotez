import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, setRating = null, readOnly = false, size = 20 }) => {
    const stars = [1, 2, 3, 4, 5];
    const [hover, setHover] = useState(null);

    // --- INTERNAL CSS: GLOWING STARS ---
    const styles = {
        container: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
        },
        star: {
            cursor: readOnly ? 'default' : 'pointer',
            transition: 'color 0.2s, transform 0.2s',
            fontSize: `${size}px`
        }
    };

    return (
        <div style={styles.container} onMouseLeave={() => !readOnly && setHover(null)}>
            {stars.map((starValue) => {
                const isFilled = starValue <= (hover || rating);
                
                return (
                    <FaStar
                        key={starValue}
                        size={size}
                        style={{
                            ...styles.star,
                            color: isFilled ? '#ffcc00' : 'rgba(255, 255, 255, 0.2)',
                            filter: isFilled ? 'drop-shadow(0 0 5px rgba(255, 204, 0, 0.6))' : 'none',
                            transform: !readOnly && starValue <= hover ? 'scale(1.2)' : 'scale(1)'
                        }}
                        onMouseEnter={() => !readOnly && setHover(starValue)}
                        onClick={() => !readOnly && setRating(starValue)}
                    />
                );
            })}
        </div>
    );
};

export default StarRating;
