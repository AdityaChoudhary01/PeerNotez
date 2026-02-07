import React, { useState } from 'react';
import { FaFilter, FaSearch } from 'react-icons/fa';

const NoteFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    university: '', course: '', subject: '', year: ''
  });

  // --- INTERNAL CSS: HOLOGRAPHIC FILTER ---
  const styles = {
    container: {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#fff',
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      paddingBottom: '0.8rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(0, 0, 0, 0.3)',
      color: '#fff',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontFamily: "'Spline Sans', sans-serif"
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '0.5rem'
    },
    submitBtn: {
      background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)',
      color: '#fff',
      border: 'none',
      padding: '10px 24px',
      borderRadius: '50px',
      cursor: 'pointer',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      fontSize: '0.95rem'
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  // Input Focus Effects
  const handleFocus = (e) => {
    e.target.style.borderColor = '#00d4ff';
    e.target.style.background = 'rgba(0, 0, 0, 0.5)';
    e.target.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.2)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    e.target.style.background = 'rgba(0, 0, 0, 0.3)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <form onSubmit={handleSubmit} style={styles.container}>
      <div style={styles.header}>
        <FaFilter style={{color: '#00d4ff'}} />
        <span>Quick Filter</span>
      </div>

      <div style={styles.grid}>
        <input 
          name="university" 
          value={filters.university} 
          onChange={handleChange} 
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="University..." 
          style={styles.input}
        />
        <input 
          name="course" 
          value={filters.course} 
          onChange={handleChange} 
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Course..." 
          style={styles.input}
        />
        <input 
          name="subject" 
          value={filters.subject} 
          onChange={handleChange} 
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Subject..." 
          style={styles.input}
        />
        <input 
          type="number" 
          name="year" 
          value={filters.year} 
          onChange={handleChange} 
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Year..." 
          style={styles.input}
        />
      </div>

      <div style={styles.buttonContainer}>
        <button 
          type="submit" 
          style={styles.submitBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)';
          }}
        >
          <FaSearch /> Apply Filters
        </button>
      </div>
    </form>
  );
};

export default NoteFilter;
