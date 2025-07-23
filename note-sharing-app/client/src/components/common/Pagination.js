import React from 'react';

const Pagination = ({ page, totalPages, onPageChange }) => {
    return (
        <div className="pagination-container">
            <button 
                onClick={() => onPageChange(page - 1)} 
                disabled={page <= 1}
                className="pagination-button"
            >
                &larr; Previous
            </button>
            
            <span className="pagination-info">
                Page {page} of {totalPages}
            </span>

            <button 
                onClick={() => onPageChange(page + 1)} 
                disabled={page >= totalPages}
                className="pagination-button"
            >
                Next &rarr;
            </button>
        </div>
    );
};

export default Pagination;