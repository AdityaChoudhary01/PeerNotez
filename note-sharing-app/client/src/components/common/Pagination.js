import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ page, totalPages, onPageChange }) => {
    
    // --- INTERNAL CSS: HOLOGRAPHIC PAGINATION ---
    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            padding: '1rem',
            marginTop: '2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50px',
            width: 'fit-content',
            margin: '2rem auto'
        },
        button: {
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            borderRadius: '50px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            outline: 'none'
        },
        buttonDisabled: {
            opacity: 0.5,
            cursor: 'not-allowed',
            background: 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.05)'
        },
        info: {
            fontSize: '1rem',
            fontWeight: '700',
            color: '#fff',
            textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '1px'
        }
    };

    // Don't render if there's only one page
    if (totalPages <= 1) return null;

    return (
        <div style={styles.container}>
            <button 
                onClick={() => onPageChange(page - 1)} 
                disabled={page <= 1}
                style={{
                    ...styles.button,
                    ...(page <= 1 ? styles.buttonDisabled : {})
                }}
                onMouseEnter={(e) => {
                    if(page > 1) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #00d4ff, #333399)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.4)';
                    }
                }}
                onMouseLeave={(e) => {
                    if(page > 1) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }
                }}
            >
                <FaChevronLeft /> Previous
            </button>
            
            <span style={styles.info}>
                {page} <span style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.8em'}}>of</span> {totalPages}
            </span>

            <button 
                onClick={() => onPageChange(page + 1)} 
                disabled={page >= totalPages}
                style={{
                    ...styles.button,
                    ...(page >= totalPages ? styles.buttonDisabled : {})
                }}
                onMouseEnter={(e) => {
                    if(page < totalPages) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #ff00cc, #333399)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 204, 0.4)';
                    }
                }}
                onMouseLeave={(e) => {
                    if(page < totalPages) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }
                }}
            >
                Next <FaChevronRight />
            </button>
        </div>
    );
};

export default Pagination;
