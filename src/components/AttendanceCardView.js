import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Centralize base URL
const BASE_URL = 'https://localhost:7014';

function AttendanceCardView() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/classes`, {
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
          const response = await axios.get(`${BASE_URL}/api/students/${selectedClassId}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Map camel case data (e.g., student.id to studentId)
          const mappedStudents = response.data.map(student => ({
            id: student.id,
            name: student.name,
            rollNo: student.rollNo || student.id, // Fallback to id if rollNo missing
          }));
          setStudents(mappedStudents);
          const initialAttendance = mappedStudents.reduce((acc, student) => ({
            ...acc,
            [student.id]: 'Present',
          }), {});
          setAttendance(initialAttendance);
        } catch (err) {
          setError('Error fetching students. Please try again.');
        }
      };
      fetchStudents();
    }
  }, [selectedClassId]);

  const handleMarkAllPresent = () => {
    const allPresent = students.reduce((acc, student) => ({
      ...acc,
      [student.id]: 'Present',
    }), {});
    setAttendance(allPresent);
  };

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId || Object.keys(attendance).length === 0) {
      setError('Please select a class and mark attendance.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const attendances = Object.entries(attendance).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        date: new Date(date).toISOString(),
        status,
      }));
      await axios.post(`${BASE_URL}/api/attendance/manual-mark`, attendances, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Attendance marked successfully!');
      setError('');
    } catch (err) {
      setError('Error marking attendance. Please try again.');
      setSuccess('');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Mark Attendance (Card View)</h2>
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
                <option key={cls.id} value={cls.id}>
                  {`${cls.className} - ${cls.section}`}
                </option>
              ))}
            </select>
          </div>
          {selectedClassId && students.length > 0 && (
            <>
              <div className="mb-3">
                <button type="button" className="btn btn-secondary mb-2" onClick={handleMarkAllPresent}>
                  Mark All Present
                </button>
                <label htmlFor="date" className="form-label ms-3">Date</label>
                <input
                  type="date"
                  className="form-control d-inline w-auto ms-2"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="row row-cols-1 row-cols-md-2 g-3">
                {students.map((student) => (
                  <div key={student.id} className="col" onClick={() => toggleAttendance(student.id)}>
                    <div
                      className={`card h-100 ${attendance[student.id] === 'Present' ? 'border-success' : 'border-danger'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center">
                        <div className="placeholder-wave" style={{ height: '50px', width: '50px', margin: '0 auto', backgroundColor: '#e9ecef' }}></div> {/* Profile Pic Placeholder */}
                        <h5 className="card-title mt-2">{student.name}</h5>
                        <p className="card-text">Roll No: {student.rollNo}</p>
                        <p className="card-text">
                          Status: <strong>{attendance[student.id]}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-3">Save Attendance</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default AttendanceCardView;