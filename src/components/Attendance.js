import { useState, useEffect } from 'react';
import axios from 'axios';

function Attendance() {
  const [classId, setClassId] = useState(1);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`https://localhost:5001/api/attendance/students/${classId}`, {
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
      await axios.post('https://localhost:5001/api/attendance/mark', attendances, {
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
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Mark Attendance</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block text-gray-700">Class ID</label>
        <input
          type="number"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td className="border p-2">{student.name}</td>
              <td className="border p-2">
                <select
                  value={student.status}
                  onChange={(e) => {
                    const updatedStudents = students.map(s =>
                      s.id === student.id ? { ...s, status: e.target.value } : s
                    );
                    setStudents(updatedStudents);
                  }}
                  className="p-2 border rounded"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={saveAttendance}
        className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Save Attendance
      </button>
    </div>
  );
}

export default Attendance;