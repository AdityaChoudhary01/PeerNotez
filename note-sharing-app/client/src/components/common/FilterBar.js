import React, { useState } from 'react';

// The FilterBar no longer manages its own open/close state,
// as this is managed by the parent (HomePage) component.
const FilterBar = ({ onFilterSubmit, className }) => {
    const [filters, setFilters] = useState({
        title: '',
        university: '',
        course: '',
        subject: '',
        year: ''
    });

    // Removed: const [isFilterOpen, setIsFilterOpen] = useState(false);

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
        onFilterSubmit({}); 
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilterSubmit(filters);
        // Note: The parent component (HomePage) is responsible for closing the bar after submission 
        // if it detects a mobile view and needs to hide it.
    };

    return (
        // The className prop passed from HomePage now controls visibility
        <form 
            onSubmit={handleSubmit} 
            className={className || "filter-bar"} // Use the external className
        >
            {/* REMOVED: The redundant filter-toggle-container and its button */}
            
            <div className="filter-inputs">
                <input name="title" value={filters.title} onChange={handleChange} placeholder="Title" />
                <input name="university" value={filters.university} onChange={handleChange} placeholder="University" />
                <input name="course" value={filters.course} onChange={handleChange} placeholder="Course" />
                <input name="subject" value={filters.subject} onChange={handleChange} placeholder="Subject" />
                <input type="number" name="year" value={filters.year} onChange={handleChange} placeholder="Year" />
            </div>
            <div className="filter-buttons">
                <button type="button" onClick={handleClear} className="clear-btn">Clear Filters</button>
                <button type="submit" className="apply-btn">Apply Filters</button>
            </div>
        </form>
    );
};

export default FilterBar;
