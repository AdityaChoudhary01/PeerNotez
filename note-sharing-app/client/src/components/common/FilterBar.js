import React, { useState } from 'react';

const FilterBar = ({ onFilterSubmit }) => {
    const [filters, setFilters] = useState({
        title: '', // --- ADD THIS ---
        university: '',
        course: '',
        subject: '',
        year: ''
    });

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilterSubmit(filters);
    };

    return (
        <form onSubmit={handleSubmit} className="filter-bar">
            {/* --- ADD THIS INPUT FIELD --- */}
            <input name="title" value={filters.title} onChange={handleChange} placeholder="Title" />
            <input name="university" value={filters.university} onChange={handleChange} placeholder="University" />
            <input name="course" value={filters.course} onChange={handleChange} placeholder="Course" />
            <input name="subject" value={filters.subject} onChange={handleChange} placeholder="Subject" />
            <input type="number" name="year" value={filters.year} onChange={handleChange} placeholder="Year" />
            <button type="submit">Apply Filters</button>
        </form>
    );
};

export default FilterBar;