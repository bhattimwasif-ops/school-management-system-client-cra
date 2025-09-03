import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function StudentReportGenerator() {
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
    if (selectedClassId) {
      const fetchTests = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`https://localhost:7014/api/test/${selectedClassId}/tests`, {
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
          const response = await axios.get(`https://localhost:7014/api/students/${selectedClassId}/students`, {
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
      const response = await axios.get(`https://localhost:7014/api/studenttest/${selectedClassId}/marks`, {
        params: { testId: selectedTestId, studentId: allStudents ? null : selectedStudentId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(response.data);
      const avg = response.data.reduce((sum, r) => sum + r.percentage, 0) / response.data.length;
      setClassAverage(avg.toFixed(2));
    } catch (err) {
      setError('Error fetching results.');
    }
  };

  const exportPDF = async () => {
    const input = reportRef.current;
    if (!input) {
      console.error('Report element not found.');
      return;
    }

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = 210;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.height;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.height;
    }

    pdf.save('student-report.pdf');
  };

  const selectedClass = classes.find(cls => cls.id === parseInt(selectedClassId));
  const selectedTest = tests.find(test => test.id === parseInt(selectedTestId));

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4" style={{ maxWidth: '800px', width: '100%', backgroundColor: '#fff', borderRadius: '8px' }}>
        <div ref={reportRef}>
          <div style={{ backgroundColor: '#222', color: '#fff', padding: '10mm', textAlign: 'center' }}>
            <h1>Student Performance Report</h1>
            <p>
              Class: {selectedClass?.className} - {selectedClass?.section || 'N/A'} | 
              Test: {selectedTest?.name} ({selectedTest?.type || 'N/A'}) | 
              Date: {new Date().toLocaleDateString()}
            </p>
          </div>
          <div style={{ marginTop: '10mm', backgroundColor: '#fff', padding: '10mm', border: '1px solid #ddd' }}>
            <h3 style={{ color: '#333', marginBottom: '10mm' }}>Student Results Summary</h3>
            {error && <p style={{ color: '#dc3545', textAlign: 'center', marginBottom: '10mm' }}>{error}</p>}
            <div className="mb-3">
              <label htmlFor="classId" className="form-label" style={{ color: '#333' }}>Select Class</label>
              <select
                className="form-select"
                id="classId"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{ backgroundColor: '#f8f9fa', borderColor: '#ccc' }}
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
              <label htmlFor="testId" className="form-label" style={{ color: '#333' }}>Select Test/Exam</label>
              <select
                className="form-select"
                id="testId"
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                style={{ backgroundColor: '#f8f9fa', borderColor: '#ccc' }}
                required
              >
                <option value="">Select a test/exam</option>
                {tests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.name} ({test.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ color: '#333' }}>Select Students</label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="allStudents"
                  checked={allStudents}
                  onChange={() => setAllStudents(true)}
                  style={{ accentColor: '#007bff' }}
                />
                <label className="form-check-label" htmlFor="allStudents" style={{ color: '#333' }}>All Students</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="specificStudent"
                  checked={!allStudents}
                  onChange={() => setAllStudents(false)}
                  style={{ accentColor: '#007bff' }}
                />
                <label className="form-check-label" htmlFor="specificStudent" style={{ color: '#333' }}>Specific Student</label>
              </div>
              {!allStudents && (
                <select
                  className="form-select mt-2"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{ backgroundColor: '#f8f9fa', borderColor: '#ccc' }}
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button
              className="btn btn-primary w-100 mb-3"
              onClick={handleSearch}
              style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
            >
              Generate Report
            </button>
            {results.length > 0 && (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#333' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#007bff', color: '#fff' }}>
                      <th style={{ border: '1px solid #ddd', padding: '5mm' }}>Test Name</th>
                      <th style={{ border: '1px solid #ddd', padding: '5mm' }}>Student Name</th>
                      <th style={{ border: '1px solid #ddd', padding: '5mm' }}>Subject</th>
                      <th style={{ border: '1px solid #ddd', padding: '5mm' }}>Total Marks</th>
                      <th style={{ border: '1px solid #ddd', padding: '5mm' }}>Obtained Marks</th>
                      <th style={{ border: '1px solid #ddd', padding: '5mm' }}>Percentage</th>
                      <th style={{ border: '1px solid #ddd', padding: '5mm' }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id} style={{ border: '1px solid #ddd' }}>
                        <td style={{ border: '1px solid #ddd', padding: '5mm' }}>{result.testName}</td>
                        <td style={{ border: '1px solid #ddd', padding: '5mm' }}>{result.studentName}</td>
                        <td style={{ border: '1px solid #ddd', padding: '5mm' }}>{result.subject}</td>
                        <td style={{ border: '1px solid #ddd', padding: '5mm' }}>{result.totalMarks}</td>
                        <td style={{ border: '1px solid #ddd', padding: '5mm' }}>{result.obtainedMarks}</td>
                        <td style={{ border: '1px solid #ddd', padding: '5mm' }}>{result.percentage}</td>
                        <td style={{ border: '1px solid #ddd', padding: '5mm' }}>{result.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: '10mm', textAlign: 'right', color: '#333' }}>
                  <h4>Class Average: {classAverage}%</h4>
                </div>
              </>
            )}
            <button
              className="btn btn-success mt-3"
              onClick={exportPDF}
              style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
            >
              Export to PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentReportGenerator;