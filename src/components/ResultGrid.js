import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BASE_URL from './config';

function ResultGrid() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [results, setResults] = useState([]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(res.data);
      } catch (err) {
        console.error('Error fetching classes:', err);
        toast.error('Error fetching classes.', { position: 'top-right', autoClose: 3000 });
      }
    };
    fetchClasses();
  }, []);

  // Fetch tests when class is selected
  useEffect(() => {
    if (selectedClassId) {
      const fetchTests = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${BASE_URL}/api/test/${selectedClassId}/tests`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setTests(res.data);
          setSelectedTestId(''); // Reset test selection
        } catch (err) {
          console.error('Error fetching tests:', err);
          toast.error('Error fetching tests.', { position: 'top-right', autoClose: 3000 });
        }
      };
      fetchTests();
    } else {
      setTests([]);
      setSelectedTestId('');
    }
  }, [selectedClassId]);

  // Fetch results when test is selected
  useEffect(() => {
    if (selectedTestId) {
      const fetchResults = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${BASE_URL}/api/test/${selectedTestId}/results`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setResults(res.data);
        } catch (err) {
          console.error('Error fetching results:', err);
          toast.error('Error fetching results. Please check the test ID or server.', { position: 'top-right', autoClose: 3000 });
        }
      };
      fetchResults();
    } else {
      setResults([]);
    }
  }, [selectedTestId]);

  // Calculate grade based on total percentage
  const getGrade = (obtained, total) => {
    const percentage = (obtained / total) * 100 || 0;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  // Get all unique subjects from all results
  const getUniqueSubjects = (results) => {
    const subjectsSet = new Set();
    results.forEach((result) => {
      result.subjects.forEach((subject) => subjectsSet.add(subject.subject));
    });
    return Array.from(subjectsSet);
  };

  const uniqueSubjects = getUniqueSubjects(results);

  return (
    <div className="container my-4">
      <ToastContainer />
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
        <label htmlFor="testId" className="form-label">Select Test</label>
        <select
          className="form-select"
          id="testId"
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          required
          disabled={!selectedClassId}
        >
          <option value="">Select a test</option>
          {tests.map((test) => (
            <option key={test.id} value={test.id}>
              {test.name} ({test.type})
            </option>
          ))}
        </select>
      </div>

      {selectedTestId && results.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Student Name</th>
                {uniqueSubjects.map((subject) => (
                  <th key={subject}>{subject}</th>
                ))}
                <th>Total</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.studentId}>
                  <td>{result.name}</td>
                  {uniqueSubjects.map((subject) => {
                    const subjectData = result.subjects.find((s) => s.subject === subject);
                    return <td key={subject}>{subjectData ? `${subjectData.obtainedMarks}/${subjectData.totalMarks}` : 'N/A'}</td>;
                  })}
                  <td>{result.totalStatus.split(' ')[1]}</td>
                  <td>{getGrade(parseInt(result.totalStatus.split(' ')[1].split('/')[0]), parseInt(result.totalStatus.split(' ')[1].split('/')[1]))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ResultGrid;