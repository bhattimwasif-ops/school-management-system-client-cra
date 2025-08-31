import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import EditMarks from './EditMarks';
import Modal from 'react-bootstrap/Modal';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StudentReport() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterTest, setFilterTest] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReportId, setDeleteReportId] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://localhost:7014/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(response.data);
      } catch (err) {
        setError('Error fetching students.');
        console.error(err);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchReports();
    }
  }, [selectedStudentId]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://localhost:7014/api/studenttest/${selectedStudentId}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let filtered = response.data;
      if (filterTest) filtered = filtered.filter(r => r.testName.toLowerCase().includes(filterTest.toLowerCase()));
      if (filterSubject) filtered = filtered.filter(r => r.subject.toLowerCase().includes(filterSubject.toLowerCase()));
      if (filterDate) filtered = filtered.filter(r => new Date(r.updatedAt).toISOString().split('T')[0] === filterDate);
      setReports(filtered);
    } catch (err) {
      setError('Error fetching reports.');
      console.error(err);
    }
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setShowEdit(true);
  };

  const handleSave = () => {
    setShowEdit(false);
    setSelectedReport(null);
    if (selectedStudentId) fetchReports();
  };

  const handleDelete = (id) => {
    setDeleteReportId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://localhost:7014/api/studenttest/${deleteReportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(reports.filter(r => r.id !== deleteReportId));
      setShowDeleteConfirm(false);
      setDeleteReportId(null);
    } catch (err) {
      setError('Error deleting record.');
      console.error(err);
    }
  };

  const exportPDF = () => {
    const input = document.getElementById('report-table');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('student-report.pdf');
    });
  };

  const totalMarks = reports.reduce((sum, r) => sum + r.totalMarks, 0);
  const obtainedMarks = reports.reduce((sum, r) => sum + r.obtainedMarks, 0);
  const averagePercentage = totalMarks > 0 ? (obtainedMarks / totalMarks * 100).toFixed(2) : 0;
  const overallGrade = averagePercentage >= 90 ? "A+" :
                      averagePercentage >= 80 ? "A" :
                      averagePercentage >= 70 ? "B" :
                      averagePercentage >= 60 ? "C" :
                      averagePercentage >= 50 ? "D" : "F";

  const chartData = {
    labels: reports.map(r => r.subject),
    datasets: [{
      label: 'Obtained Marks',
      data: reports.map(r => r.obtainedMarks),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  // Destroy previous chart instance if it exists
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [selectedStudentId]);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <div className="container py-3">
        <div className="card p-3 p-md-4">
          <h2 className="card-title text-center mb-4">Student Report</h2>
          {error && <p className="text-danger text-center mb-3">{error}</p>}
          <div className="mb-3">
            <label htmlFor="studentId" className="form-label">Select Student</label>
            <select
              className="form-select"
              id="studentId"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          {selectedStudentId && (
            <>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Filter by Test"
                  value={filterTest}
                  onChange={(e) => { setFilterTest(e.target.value); fetchReports(); }}
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Filter by Subject"
                  value={filterSubject}
                  onChange={(e) => { setFilterSubject(e.target.value); fetchReports(); }}
                />
                <input
                  type="date"
                  className="form-control"
                  value={filterDate}
                  onChange={(e) => { setFilterDate(e.target.value); fetchReports(); }}
                />
              </div>
              <div className="mb-3">
                <h4>Performance Dashboard</h4>
                <Bar data={chartData} ref={chartRef} />
              </div>
              <div className="mb-3 p-3 bg-light border rounded">
                <h5>Overall Result</h5>
                <p>Total Marks: {totalMarks}</p>
                <p>Obtained Marks: {obtainedMarks}</p>
                <p>Average Percentage: {averagePercentage}%</p>
                <p>Overall Grade: {overallGrade}</p>
              </div>
              <div className="mb-3">
                <button className="btn btn-success mb-2" onClick={exportPDF}>Export to PDF</button>
              </div>
              <div className="table-responsive" id="report-table">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Subject</th>
                      <th>Total Marks</th>
                      <th>Obtained Marks</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                      <th>Updated At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.testName}</td>
                        <td>{report.subject}</td>
                        <td>{report.totalMarks}</td>
                        <td>{report.obtainedMarks}</td>
                        <td>{report.percentage}</td>
                        <td>{report.grade}</td>
                        <td>{new Date(report.updatedAt).toLocaleString()}</td>
                        <td>
                          <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(report)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(report.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <Modal show={showEdit} onHide={() => { setShowEdit(false); setSelectedReport(null); }} centered>
            <Modal.Header closeButton>
              <Modal.Title>Edit Marks</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedReport ? <EditMarks report={selectedReport} onSave={handleSave} /> : <p>Loading...</p>}
            </Modal.Body>
          </Modal>
          <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete this record?</Modal.Body>
            <Modal.Footer>
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default StudentReport;