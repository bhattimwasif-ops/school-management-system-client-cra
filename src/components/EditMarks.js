import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EditMarks({ report, onSave }) {
  const [subject, setSubject] = useState(report?.subject || '');
  const [totalMarks, setTotalMarks] = useState(report?.totalMarks || 0);
  const [obtainedMarks, setObtainedMarks] = useState(report?.obtainedMarks || 0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (report) {
      setSubject(report.subject || '');
      setTotalMarks(report.totalMarks || 0);
      setObtainedMarks(report.obtainedMarks || 0);
    }
  }, [report]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!report || obtainedMarks > totalMarks) {
      setError('Obtained marks cannot exceed total marks or report is invalid.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:32000/api/studenttest/${report.id}`, {
        Subject: subject,
        TotalMarks: totalMarks,
        ObtainedMarks: obtainedMarks,
      }, { headers: { Authorization: `Bearer ${token}` } });
      onSave();
    } catch (err) {
      setError('Error updating marks: ' + err.message);
      console.error(err);
    }
  };

  if (!report) return <p>Loading...</p>;

  return (
    <div className="card p-3">
      <h4 className="card-title mb-3">Edit Marks</h4>
      {error && <p className="text-danger mb-3">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="subject" className="form-label">Subject</label>
          <input type="text" className="form-control" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label htmlFor="totalMarks" className="form-label">Total Marks</label>
          <input type="number" className="form-control" id="totalMarks" value={totalMarks} onChange={(e) => setTotalMarks(parseInt(e.target.value) || 0)} required />
        </div>
        <div className="mb-3">
          <label htmlFor="obtainedMarks" className="form-label">Obtained Marks</label>
          <input type="number" className="form-control" id="obtainedMarks" value={obtainedMarks} onChange={(e) => setObtainedMarks(parseInt(e.target.value) || 0)} required />
        </div>
        <button type="submit" className="btn btn-primary w-100">Save Changes</button>
      </form>
    </div>
  );
}

export default EditMarks;