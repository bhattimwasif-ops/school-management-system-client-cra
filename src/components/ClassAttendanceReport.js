import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function ClassAttendanceReport() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [totals, setTotals] = useState({ Present: 0, Absent: 0, Late: 0 });
  const [absentStudents, setAbsentStudents] = useState([]);
  const [error, setError] = useState('');
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://localhost:7014/api/classes', {
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
    if (selectedClassId && fromDate && toDate) {
      const fetchAttendance = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`https://localhost:7014/api/attendance/class/${selectedClassId}`, {
            params: { fromDate, toDate },
            headers: { Authorization: `Bearer ${token}` },
          });
          setAttendanceData(response.data.attendance);
          setTotals(response.data.totals);
          setAbsentStudents(response.data.absentStudents);
        } catch (err) {
          setError('Error fetching attendance data.');
        }
      };
      fetchAttendance();
    }
  }, [selectedClassId, fromDate, toDate]);

  const exportPDF = async () => {
    const input = reportRef.current;
    if (!input) {
      console.error('Report element not found.');
      return;
    }
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = 210;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('class-attendance-report.pdf');
  };

  const pieData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [totals.present, totals.absent, totals.late],
      backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
    }],
  };

  const selectedClass = classes.find(cls => cls.id === parseInt(selectedClassId));

  return (
    <div className="d-flex justify-content-center align-items-start min-vh-100 bg-light py-4">
      <div className="card p-4" style={{ maxWidth: '800px', width: '100%', backgroundColor: '#fff', borderRadius: '8px', overflowY: 'auto', maxHeight: '90vh' }}>
        <div ref={reportRef}>
          <h2 className="card-title text-center mb-4" style={{ color: '#333' }}>Class Attendance Report</h2>
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
          <div className="d-flex justify-content-center mb-3">
            <Pie data={pieData} style={{ maxWidth: '300px',maxHeight:'300px' }} />
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
          <h4 className="text-center mb-3">Absent Students</h4>
          <ul className="list-group mb-3">
            {absentStudents.map((student) => (
              <li key={student} className="list-group-item">
                {student}
              </li>
            ))}
          </ul>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.rollNumber}</td>
                    <td>{student.status}</td>
                    <td>{new Date(student.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-success w-100 mt-3" onClick={exportPDF}>Export to PDF</button>
        </div>
      </div>
    </div>
  );
}

export default ClassAttendanceReport;