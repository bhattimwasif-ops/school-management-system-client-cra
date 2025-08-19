import React, { use, useState,useEffect } from 'react';
import axios from 'axios';

function StudentRegistration() {
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://localhost:7014/api/classes', { headers: { Authorization: `Bearer ${token}` } });
                setClasses(response.data);
            } catch (err) {
                setError('Error fetching classes');
            }
        };
        fetchClasses();
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('https://localhost:7014/api/students', {
                name,
                classId: parseInt(classId),
                parentEmail,
                parentPhone,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Student registered successfully!');
            setError('');
            setName('');
            setClassId('');
            setParentEmail('');
            setParentPhone('');
        } catch (err) {
            setError('Error registering student. Please try again.');
            setSuccess('');
        }
    };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Register Student</h2>
        {error && <p className="text-danger text-center mb-4">{error}</p>}
        {success && <p className="text-success text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="classId" className="form-label">Class ID</label>
            <select className='form-select' id='classid' value={classId} onChange={(e) => setClassId(e.target.value)} required >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                        {`${cls.className} - ${cls.section}`}
                    </option>
                ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="parentEmail" className="form-label">Parent Email</label>
            <input
              type="email"
              className="form-control"
              id="parentEmail"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="parentPhone" className="form-label">Parent Phone</label>
            <input
              type="tel"
              className="form-control"
              id="parentPhone"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Register Student</button>
        </form>
      </div>
    </div>
  );
}

export default StudentRegistration;