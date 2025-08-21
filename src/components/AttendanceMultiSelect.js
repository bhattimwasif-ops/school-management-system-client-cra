import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AttendanceMultiSelect() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [status, setStatus] = useState('Present');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://localhost:7014/api/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(response.data);
      } catch (err) {
        setError('Error fetching classes. Please try again.');
      }
    };
    fetchClasses();
  }, []);

  // Fetch students when class changes
  useEffect(() => {
    if (selectedClassId) {
      const fetchStudents = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`https://localhost:7014/api/students/${selectedClassId}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStudents(response.data);
          setSelectedStudents([]); // Reset selection
        } catch (err) {
          setError('Error fetching students. Please try again.');
        }
      };
      fetchStudents();
    }
  }, [selectedClassId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId || selectedStudents.length === 0) {
      setError('Please select a class and at least one student.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const attendances = selectedStudents.map(studentId => ({
        studentId: studentId,
        date: new Date().toISOString(),
        status,
      }));
      await axios.post('https://localhost:7014/api/attendance/manual-mark', attendances, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Attendance marked successfully!');
      setError('');
      setSelectedStudents([]);
    } catch (err) {
      setError('Error marking attendance. Please try again.');
      setSuccess('');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Mark Attendance (Multi-Select)</h2>
        {error && <p className="text-danger text-center mb-4">{error}</p>}
        {success && <p className="text-success text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="classId" className="form-label">Select Class</label>
            <select
              className="form-select"
              id="classId"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              required
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.Id} value={cls.id}>
                  {`${cls.className} - ${cls.section}`}
                </option>
              ))}
            </select>
          </div>
          {selectedClassId && students.length > 0 && (
            <>
              <div className="mb-3">
                <label className="form-label">Students</label>
                {students.map((student) => (
                  <div key={student.id} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`student-${student.id}`}
                      value={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, student.id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                        }
                      }}
                    />
                    <label className="form-check-label" htmlFor={`student-${student.id}`}>
                      {student.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                  className="form-select"
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100">Save Attendance</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default AttendanceMultiSelect;