import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import BASE_URL from './config';

// Register Chart.js components
ChartJS.register(ArcElement, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

function StudentAttendanceDetail() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [error, setError] = useState('');
  const [totals, setTotals] = useState({ Present: 0, Absent: 0, Late: 0 });

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

  useEffect(() => {
    if (selectedClassId) {
      const fetchStudents = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${BASE_URL}/api/students/${selectedClassId}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStudents(response.data);
        } catch (err) {
          setError('Error fetching students.');
        }
      };
      fetchStudents();
    }
  }, [selectedClassId]);

  const handleSearch = async () => {
    if (!selectedClassId || !selectedStudentId || !fromDate || !toDate) {
      setError('Please select class, student, and date range.');
      return;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from > to) {
      setError('From date cannot be later than to date.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/attendance/student/${selectedStudentId}`, {
        params: { fromDate, toDate },
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceDetails(response.data.attendanceDetails || []);
      setTotals(response.data.totals || { Present: 0, Absent: 0, Late: 0 });
      setError('');
    } catch (err) {
      setError('Error fetching attendance details.');
      setAttendanceDetails([]);
      setTotals({ Present: 0, Absent: 0, Late: 0 });
    }
  };

  const pieData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [totals.present, totals.absent, totals.late],
      backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
    }],
  };

  const lineData = {
    labels: attendanceDetails.map(a => new Date(a.date).toLocaleDateString()),
    datasets: [{
      label: 'Status Trend',
      data: attendanceDetails.map(a => a.status === 'Present' ? 3 : a.status === 'Late' ? 2 : 1), // Numerical mapping for line chart (3=Present, 2=Late, 1=Absent)
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  };

  return (
    <div className="d-flex justify-content-center align-items-start min-vh-100 bg-light py-4">
      <div className="card p-4" style={{ maxWidth: '800px', width: '100%', backgroundColor: '#fff', borderRadius: '8px', overflowY: 'auto', maxHeight: '90vh' }}>
        <h2 className="card-title text-center mb-4" style={{ color: '#333' }}>Student Attendance Details</h2>
        {error && <p className="text-danger text-center mb-4">{error}</p>}
        <div className="mb-3">
          <label htmlFor="classId" className="form-label" style={{ color: '#333' }}>Select Class</label>
          <select className="form-select" id="classId" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} required>
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id} style={{ color: '#333' }}>
                {cls.className} - {cls.section}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="studentId" className="form-label" style={{ color: '#333' }}>Select Student</label>
          <select className="form-select" id="studentId" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} required>
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id} style={{ color: '#333' }}>
                {student.name}
              </option>
            ))}
          </select>
        </div>
        <div className="row mb-3">
          <div className="col-12 col-md-6 mb-2">
            <label htmlFor="fromDate" className="form-label" style={{ color: '#333' }}>From Date</label>
            <input type="date" className="form-control" id="fromDate" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="toDate" className="form-label" style={{ color: '#333' }}>To Date</label>
            <input type="date" className="form-control" id="toDate" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
          </div>
        </div>
        <div className="mb-3">
          <button className="btn btn-primary w-100" onClick={handleSearch}>Search</button>
        </div>
        {attendanceDetails.length > 0 && (
          <>
            <div className="d-flex justify-content-center mb-3">
              <Pie data={pieData} style={{ maxWidth: '300px', maxHeight:'300px' }} />
            </div>
            <div className="row mb-3 text-center">
              <div className="col-12 col-md-4 mb-2">
                <p>Present: {totals.present}</p>
              </div>
              <div className="col-12 col-md-4 mb-2">
                <p>Absent: {totals.absent}</p>
              </div>
              <div className="col-12 col-md-4">
                <p>Late: {totals.late}</p>
              </div>
            </div>
            <h4 className="text-center mb-3">Attendance Details</h4>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceDetails.map((attendance) => (
                    <tr key={attendance.date}>
                      <td>{new Date(attendance.date).toLocaleDateString()}</td>
                      <td>{attendance.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                      {/* <button className="btn btn-success w-100 mt-3" onClick={exportPDF}>Export to PDF</button> */}
          </>
        )}
      </div>
    </div>
  );
}

export default StudentAttendanceDetail;