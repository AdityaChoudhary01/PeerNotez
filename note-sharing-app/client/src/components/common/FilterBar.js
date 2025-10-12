import React, { useState } from 'react';

const FilterBar = ({ onFilterSubmit, className }) => {
    const [filters, setFilters] = useState({
        title: '',
        university: '',
        course: '',
        subject: '',
        year: ''
    });

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
        // The backend uses '0' as a way to ignore the filter, but an empty string 
        // should also be discarded here.
        const cleanedFilters = Object.keys(filters).reduce((acc, key) => {
            const value = filters[key].trim();
            // Only include non-empty filters
            if (value && value !== '0') {
                // 2. CRITICAL FIX: Ensure values containing commas are URL-encoded
                // This prevents the comma from being misinterpreted as a URL query delimiter.
                acc[key] = value.includes(',') ? encodeURIComponent(value) : value;
            }
            return acc;
        }, {});

        // 3. Pass the cleaned and encoded filters to the parent function
        onFilterSubmit(cleanedFilters);
    };

    return (
        <form 
            onSubmit={handleSubmit} 
            className={className || "filter-bar"} 
        >
            
            <div className="filter-inputs">
                {/* Updated placeholders to instruct users on multi-select */}
                <input name="title" value={filters.title} onChange={handleChange} placeholder="Title" />
                <input name="university" value={filters.university} onChange={handleChange} placeholder="University (CSV)" title="Enter multiple universities separated by commas (e.g., Aktu, Harvard)" />
                <input name="course" value={filters.course} onChange={handleChange} placeholder="Course (CSV)" title="Enter multiple courses separated by commas" />
                <input name="subject" value={filters.subject} onChange={handleChange} placeholder="Subject (CSV)" title="Enter multiple subjects separated by commas" />
                <input type="number" name="year" value={filters.year} onChange={handleChange} placeholder="Year" title="Enter a single year" />
            </div>
            <div className="filter-buttons">
                <button type="button" onClick={handleClear} className="clear-btn">Clear Filters</button>
                <button type="submit" className="apply-btn">Apply Filters</button>
            </div>
        </form>
    );
};

export default FilterBar;
