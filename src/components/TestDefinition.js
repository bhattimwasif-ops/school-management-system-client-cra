import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from './config';

function TestDefinition() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [session, setSession] = useState('');
  const [type, setType] = useState('Test');
  const [name, setName] = useState('');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(response.data);
      } catch (err) {
        setError('Error fetching classes.');
      }
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/test/create`, {
        ClassId: classId,
        Session: session,
        Type: type,
        Name: name,
        FromDate: fromDate,
        ToDate: toDate,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Test defined successfully!');
      setError('');
    } catch (err) {
      setError('Error defining test.');
      setSuccess('');
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <div className="container py-3">
        <div className="card p-3 p-md-4">
          <h2 className="card-title text-center mb-4">Create Test/Exam</h2>
          {error && <p className="text-danger text-center mb-3">{error}</p>}
          {success && <p className="text-success text-center mb-3">{success}</p>}
          <form onSubmit={handleSubmit}>
            <div className="row g-2 mb-3">
              <div className="col-12">
                <label htmlFor="classId" className="form-label">Class</label>
                <select className="form-select" id="classId" value={classId} onChange={(e) => setClassId(e.target.value)} required>
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className} - {cls.section}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-12">
                <label htmlFor="session" className="form-label">Session</label>
                <input type="text" className="form-control" id="session" value={session} onChange={(e) => setSession(e.target.value)} required />
              </div>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-12">
                <label className="form-label">Type</label>
                <div className="d-flex flex-wrap gap-3">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" id="test" value="Test" checked={type === 'Test'} onChange={(e) => setType(e.target.value)} />
                    <label className="form-check-label" htmlFor="test">Test</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" id="exam" value="Exam" checked={type === 'Exam'} onChange={(e) => setType(e.target.value)} />
                    <label className="form-check-label" htmlFor="exam">Exam</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-12">
                <label htmlFor="name" className="form-label">Name</label>
                <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <label htmlFor="fromDate" className="form-label">From Date</label>
                <input type="date" className="form-control" id="fromDate" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
              </div>
              <div className="col-12 col-md-6">
                <label htmlFor="toDate" className="form-label">To Date</label>
                <input type="date" className="form-control" id="toDate" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100">Save Test Definition</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TestDefinition;