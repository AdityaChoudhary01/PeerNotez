import React, { useState } from 'react';
import { FaFilter, FaTimes, FaSearch } from 'react-icons/fa';

const FilterBar = ({ onFilterSubmit, className }) => {
    const [filters, setFilters] = useState({
        title: '',
        university: '',
        course: '',
        subject: '',
        year: ''
    });

    // --- INTERNAL CSS: HOLOGRAPHIC FILTER BAR ---
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
            gap: '1.5rem'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#fff',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem',
            marginBottom: '0.5rem'
        },
        inputsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '0.95rem',
            fontFamily: "'Spline Sans', sans-serif",
            outline: 'none',
            transition: 'all 0.3s ease'
        },
        buttonGroup: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '0.5rem'
        },
        applyBtn: {
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
            transition: 'transform 0.2s'
        },
        clearBtn: {
            background: 'transparent',
            color: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '10px 24px',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
        }
    };

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleClear = () => {
        setFilters({
            title: '',
            university: '',
            course: '',
            subject: '',
            year: ''
        });
        // Submit an empty object to clear filters on the parent component
        onFilterSubmit({}); 
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Clean the filters: Remove any keys that have empty or '0' values.
        const cleanedFilters = Object.keys(filters).reduce((acc, key) => {
            const value = filters[key].trim();
            // Only include non-empty filters
            if (value && value !== '0') {
                // 2. CRITICAL FIX: Ensure values containing commas are URL-encoded
                acc[key] = value.includes(',') ? encodeURIComponent(value) : value;
            }
            return acc;
        }, {});

        // 3. Pass the cleaned and encoded filters to the parent function
        onFilterSubmit(cleanedFilters);
    };

    // Helper for input focus effects
    const handleFocus = (e) => {
        e.target.style.borderColor = '#00d4ff';
        e.target.style.background = 'rgba(0, 0, 0, 0.4)';
        e.target.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.1)';
    };

    const handleBlur = (e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.background = 'rgba(0, 0, 0, 0.2)';
        e.target.style.boxShadow = 'none';
    };

    return (
        <form 
            onSubmit={handleSubmit} 
            style={styles.container}
            className={className || "filter-bar"} 
        >
            <div style={styles.header}>
                <FaFilter style={{color: '#00d4ff'}} /> Filter Notes
            </div>
            
            <div style={styles.inputsGrid}>
                {/* Title */}
                <input 
                    name="title" 
                    value={filters.title} 
                    onChange={handleChange} 
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Search by Title..." 
                    style={styles.input}
                />
                
                {/* University */}
                <input 
                    name="university" 
                    value={filters.university} 
                    onChange={handleChange} 
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="University (e.g. AKTU, Harvard)" 
                    title="Enter multiple universities separated by commas" 
                    style={styles.input}
                />
                
                {/* Course */}
                <input 
                    name="course" 
                    value={filters.course} 
                    onChange={handleChange} 
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Course (e.g. B.Tech, MBA)" 
                    title="Enter multiple courses separated by commas" 
                    style={styles.input}
                />
                
                {/* Subject */}
                <input 
                    name="subject" 
                    value={filters.subject} 
                    onChange={handleChange} 
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Subject (e.g. Physics, Math)" 
                    title="Enter multiple subjects separated by commas" 
                    style={styles.input}
                />
                
                {/* Year */}
                <input 
                    type="number" 
                    name="year" 
                    value={filters.year} 
                    onChange={handleChange} 
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Year (e.g. 2024)" 
                    title="Enter a single year" 
                    style={styles.input}
                />
            </div>

            <div style={styles.buttonGroup}>
                <button 
                    type="button" 
                    onClick={handleClear} 
                    style={styles.clearBtn}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#ff0055';
                        e.currentTarget.style.color = '#ff0055';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    }}
                >
                    <FaTimes /> Clear
                </button>
                <button 
                    type="submit" 
                    style={styles.applyBtn}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <FaSearch /> Apply Filters
                </button>
            </div>
        </form>
    );
};

export default FilterBar;
