import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from './config';
function AttendanceGrid() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
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
        setError('Error fetching classes. Please try again.');
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const fetchStudents = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${BASE_URL}/api/students/${selectedClassId}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Fetched students:', response.data); // Debug log
          setStudents(response.data);
          const initialAttendance = response.data.reduce((acc, student) => {
            if (student.id) {
              return { ...acc, [student.id]: 'Present' };
            }
            return acc;
          }, {});
          setAttendance(initialAttendance);
        } catch (err) {
          setError('Error fetching students. Please try again.');
        }
      };
      fetchStudents();
    }
  }, [selectedClassId]);

  const handleMarkAllPresent = () => {
    const allPresent = students.reduce((acc, student) => {
      if (student.id) {
        return { ...acc, [student.id]: 'Present' };
      }
      return acc;
    }, {});
    setAttendance(allPresent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId || Object.keys(attendance).length === 0) {
      setError('Please select a class and mark attendance.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const attendances = Object.entries(attendance)
        .filter(([studentId]) => studentId && !isNaN(parseInt(studentId)))
        .map(([studentId, status]) => ({
          studentId: parseInt(studentId),
          date: new Date(date).toISOString(),
          status,
        }));
      if (attendances.length === 0) {
        setError('No valid attendance data to save.');
        return;
      }
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
      <div className="card p-4" style={{ maxWidth: '800px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Mark Attendance (Grid)</h2>
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
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <div className="form-check">
                              <input
                                type="radio"
                                className="form-check-input"
                                name={`status-${student.id}`}
                                id={`present-${student.id}`}
                                value="Present"
                                checked={attendance[student.id] === 'Present'}
                                onChange={() => setAttendance({ ...attendance, [student.id]: 'Present' })}
                              />
                              <label className="form-check-label" htmlFor={`present-${student.id}`}>Present</label>
                            </div>
                            <div className="form-check">
                              <input
                                type="radio"
                                className="form-check-input"
                                name={`status-${student.id}`}
                                id={`absent-${student.id}`}
                                value="Absent"
                                checked={attendance[student.id] === 'Absent'}
                                onChange={() => setAttendance({ ...attendance, [student.id]: 'Absent' })}
                              />
                              <label className="form-check-label" htmlFor={`absent-${student.id}`}>Absent</label>
                            </div>
                            <div className="form-check">
                              <input
                                type="radio"
                                className="form-check-input"
                                name={`status-${student.id}`}
                                id={`late-${student.id}`}
                                value="Late"
                                checked={attendance[student.id] === 'Late'}
                                onChange={() => setAttendance({ ...attendance, [student.id]: 'Late' })}
                              />
                              <label className="form-check-label" htmlFor={`late-${student.id}`}>Late</label>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-3">Save Attendance</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default AttendanceGrid;