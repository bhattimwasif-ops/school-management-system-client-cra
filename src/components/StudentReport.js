import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditMarks from './EditMarks';
import Modal from 'react-bootstrap/Modal';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Select from 'react-select';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

function StudentReport() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReportId, setDeleteReportId] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [chartType, setChartType] = useState('bar'); // Options: 'bar', 'pie', 'line'

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:32000/api/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(response.data);
      } catch (err) {
        setError('Error fetching classes.');
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const fetchStudents = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:32000/api/students/${selectedClassId}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStudents(response.data);
          setSelectedStudentId(''); // Reset selected student when class changes
        } catch (err) {
          setError('Error fetching students.');
          console.error(err);
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
      setSelectedStudentId('');
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchReports();
    }
  }, [selectedStudentId, selectedTests, filterSubject, filterDate]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:32000/api/studenttest/${selectedStudentId}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let filtered = response.data;
      if (selectedTests.length > 0) filtered = filtered.filter(r => selectedTests.some(t => t.value === r.testName));
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
      await axios.delete(`http://localhost:32000/api/studenttest/${deleteReportId}`, {
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
    if (!input) {
      console.error('Report table element not found.');
      return;
    }
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

const uniqueTests = [...new Set(reports.map(r => r.testName))].map(test => ({ value: test, label: test }));
  const barChartData = {
    labels: reports.map(r => r.subject),
    datasets: [{
      label: 'Obtained Marks',
      data: reports.map(r => r.obtainedMarks),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  const pieChartData = {
    labels: reports.map(r => r.subject),
    datasets: [{
      data: reports.map(r => r.obtainedMarks),
      backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
      borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
      borderWidth: 1,
    }],
  };

  const lineChartData = {
    labels: reports.map(r => new Date(r.updatedAt).toLocaleDateString()),
    datasets: [{
      label: 'Obtained Marks',
      data: reports.map(r => r.obtainedMarks),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Student Performance' },
    },
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <div className="container py-3">
        <div className="card p-3 p-md-4">
          <h2 className="card-title text-center mb-4">Student Report</h2>
          {error && <p className="text-danger text-center mb-3">{error}</p>}
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
                  {cls.className} - {cls.section}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="studentId" className="form-label">Select Student</label>
            <select
              className="form-select"
              id="studentId"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              disabled={!selectedClassId} // Disable until class is selected
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
                <label htmlFor="testFilter" className="form-label">Filter by Test</label>
                <Select
                  id="testFilter"
                  isMulti
                  options={uniqueTests}
                  value={selectedTests}
                  onChange={setSelectedTests}
                  onBlur={() => fetchReports()}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
                <input
                  type="text"
                  className="form-control mb-2 mt-2"
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
              <div className="mb-3" style={{ height: '400px', position: 'relative' }}>
                <h4>Performance Dashboard</h4>
                <select
                  className="form-select mb-2"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  style={{ maxWidth: '200px' }}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="line">Line Chart</option>
                </select>
                <div style={{ height: '90%', width: '100%', position: 'relative' }}>
                  {reports.length > 0 && (
                    <>
                      {chartType === 'bar' && <Bar data={barChartData} options={chartOptions} />}
                      {chartType === 'pie' && <Pie data={pieChartData} options={chartOptions} />}
                      {chartType === 'line' && <Line data={lineChartData} options={chartOptions} />}
                    </>
                  )}
                </div>
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