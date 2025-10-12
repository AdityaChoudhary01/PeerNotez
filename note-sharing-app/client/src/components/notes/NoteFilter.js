import React, { useState } from 'react';

const NoteFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    university: '', course: '', subject: '', year: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="filter-form">
      <input name="university" value={filters.university} onChange={handleChange} placeholder="University" />
      <input name="course" value={filters.course} onChange={handleChange} placeholder="Course" />
      <input name="subject" value={filters.subject} onChange={handleChange} placeholder="Subject" />
      <input type="number" name="year" value={filters.year} onChange={handleChange} placeholder="Year" />
      <button type="submit">Filter</button>
    </form>
  );
};

export default NoteFilter;
