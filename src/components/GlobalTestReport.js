import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas'; // Added import
import jsPDF from 'jspdf'; // Added import

function ClassTestStudentReport() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [allStudents, setAllStudents] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [classAverage, setClassAverage] = useState(0);

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
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const fetchTests = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:32000/api/test/${selectedClassId}/tests`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setTests(response.data);
        } catch (err) {
          setError('Error fetching tests.');
        }
      };
      fetchTests();
      const fetchStudents = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:32000/api/students/${selectedClassId}/students`, {
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
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:32000/api/studenttest/${selectedClassId}/marks`, {
        params: { testId: selectedTestId, studentId: allStudents ? null : selectedStudentId },
        headers: { Authorization: `Bearer ${token}` },
      });
      debugger
      setResults(response.data);
      const avg = response.data.reduce((sum, r) => sum + r.percentage, 0) / response.data.length;
      setClassAverage(avg.toFixed(2));
    } catch (err) {
      setError('Error fetching results.');
    }
  };

  const exportPDF = async () => {
    const input = document.getElementById('result-table');
    if (!input) {
      console.error('Element with id "result-table" not found.');
      return;
    }
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('class-report.pdf');
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4" style={{ maxWidth: '800px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Class Test Student Report</h2>
        {error && <p className="text-danger text-center mb-4">{error}</p>}
        <div className="mb-3">
          <label htmlFor="classId" className="form-label">Select Class</label>
          <select className="form-select" id="classId" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} required>
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.className} - {cls.section}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="testId" className="form-label">Select Test/Exam</label>
          <select className="form-select" id="testId" value={selectedTestId} onChange={(e) => setSelectedTestId(e.target.value)} required>
            <option value="">Select a test/exam</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name} ({test.type})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Students</label>
          <div className="form-check">
            <input className="form-check-input" type="radio" id="allStudents" checked={allStudents} onChange={() => setAllStudents(true)} />
            <label className="form-check-label" htmlFor="allStudents">All Students</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" id="specificStudent" checked={!allStudents} onChange={() => setAllStudents(false)} />
            <label className="form-check-label" htmlFor="specificStudent">Specific Student</label>
          </div>
          {!allStudents && (
            <select className="form-select mt-2" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} required>
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <button className="btn btn-primary w-100 mb-3" onClick={handleSearch}>Search</button>
        {results.length > 0 && (
          <>
            <div className="mb-3 p-3 bg-light border rounded">
              <h5>Class Average: {classAverage}%</h5>
            </div>
            <div className="table-responsive" id="result-table">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Student Name</th>
                    <th>Subject</th>
                    <th>Total Marks</th>
                    <th>Obtained Marks</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td>{result.testName}</td>
                      <td>{result.studentName}</td>
                      <td>{result.subject}</td>
                      <td>{result.totalMarks}</td>
                      <td>{result.obtainedMarks}</td>
                      <td>{result.percentage}</td>
                      <td>{result.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-success mt-3" onClick={exportPDF}>Export to PDF</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ClassTestStudentReport;