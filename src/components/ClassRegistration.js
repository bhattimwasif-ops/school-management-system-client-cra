import React, { useState } from 'react';
import axios from 'axios';

function ClassRegistration() {
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [teacher, setTeacher] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://localhost:7014/api/classes', {
        className,
        section,
        teacher,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Class registered successfully!');
      setError('');
      setClassName('');
      setSection('');
      setTeacher('');
    } catch (err) {
      setError('Error registering class. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Register Class</h2>
        {error && <p className="text-danger text-center mb-4">{error}</p>}
        {success && <p className="text-success text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="className" className="form-label">Class Name</label>
            <input
              type="text"
              className="form-control"
              id="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="section" className="form-label">Section</label>
            <input
              type="text"
              className="form-control"
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="teacher" className="form-label">Teacher</label>
            <input
              type="text"
              className="form-control"
              id="teacher"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Register Class</button>
        </form>
      </div>
    </div>
  );
}

export default ClassRegistration;