import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditMarks from './EditMarks';
import Modal from 'react-bootstrap/Modal';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Select from 'react-select';
import ResultCard from './ResultCard'; // Changed from StudentReportCard to avoid conflict

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

function StudentReportCard() { // Renamed to avoid conflict with import
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
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    const fetchClasses = async () => {
      console.log('Fetching classes...');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found.');
        console.error('No token in localStorage');
        return;
      }
      try {
        const response = await axios.get('https://localhost:7014/api/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Classes response:', response.data);
        setClasses(response.data);
      } catch (err) {
        console.error('Classes fetch error:', err);
        setError('Error fetching classes.');
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const fetchStudents = async () => {
        console.log('Fetching students for classId:', selectedClassId);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found.');
          console.error('No token in localStorage');
          return;
        }
        try {
          const response = await axios.get(`https://localhost:7014/api/students/${selectedClassId}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Students response:', response.data);
          setStudents(response.data);
          setSelectedStudentId(''); // Reset selected student
        } catch (err) {
          console.error('Students fetch error:', err);
          setError('Error fetching students.');
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
      const response = await axios.get(`https://localhost:7014/api/studenttest/${selectedStudentId}/reports`, {
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

  // ... (existing handlers remain unchanged)

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
              disabled={!selectedClassId}
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
              <div className="mt-4">
                <ResultCard selectedStudentId={selectedStudentId} />
              </div>
            </>
          )}
          {/* ... (existing Modals remain unchanged) */}
        </div>
      </div>
    </div>
  );

  // ... (existing functions and data remain unchanged)
};

export default StudentReportCard; // Export with new name