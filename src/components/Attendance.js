import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from './config';
function Attendance() {
  const [classId, setClassId] = useState(1);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/attendance/students/${classId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStudents(response.data.map(student => ({ ...student, status: 'Present' })));
    } catch (err) {
      setError('Error fetching students');
    }
  };

  const saveAttendance = async () => {
    try {
      const attendances = students.map(student => ({
        studentId: student.id,
        date: new Date().toISOString(),
        status: student.status,
      }));
      await axios.post(`${BASE_URL}/api/attendance/mark`, attendances, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Attendance saved successfully');
    } catch (err) {
      setError('Error saving attendance');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4" style={{ maxWidth: '800px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Mark Attendance</h2>
        {error && <p className="text-danger text-center mb-4">{error}</p>}
        <div className="mb-3">
          <label htmlFor="classId" className="form-label">Class ID</label>
          <input type="number" className="form-control" id="classId" value={classId} onChange={(e) => setClassId(e.target.value)} />
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>
                  <select className="form-select" value={student.status} onChange={(e) => {
                    const updatedStudents = students.map(s =>
                      s.id === student.id ? { ...s, status: e.target.value } : s
                    );
                    setStudents(updatedStudents);
                  }}>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={saveAttendance} className="btn btn-primary w-100 mt-3">Save Attendance</button>
      </div>
    </div>
  );
}

export default Attendance;