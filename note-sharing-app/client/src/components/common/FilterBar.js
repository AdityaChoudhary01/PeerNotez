import React, { useState } from 'react';

const FilterBar = ({ onFilterSubmit, className }) => {
    // Define the initial state for the filters
    const initialState = {
        title: '',
        university: '',
        course: '',
        subject: '',
        year: ''
    };

    const [filters, setFilters] = useState(initialState);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilterSubmit(filters);
    };

    // New function to clear the filters
    const handleClear = () => {
        setFilters(initialState); // Reset the local state to initial values
        onFilterSubmit({}); // Notify the parent component to clear all filters
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            <div className="filter-inputs">
                <input name="title" value={filters.title} onChange={handleChange} placeholder="Title" />
                <input name="university" value={filters.university} onChange={handleChange} placeholder="University" />
                <input name="course" value={filters.course} onChange={handleChange} placeholder="Course" />
                <input name="subject" value={filters.subject} onChange={handleChange} placeholder="Subject" />
                <input type="number" name="year" value={filters.year} onChange={handleChange} placeholder="Year" />
            </div>
            <div className="filter-buttons">
                {/* New button to clear filters */}
                <button type="button" onClick={handleClear} className="clear-btn">
                    Clear Filters
                </button>
                {/* Submit button to apply filters */}
                <button type="submit" className="apply-btn">
                    Apply Filters
                </button>
            </div>
        </form>
    );
};

export default FilterBar;
