import React, { useState, useEffect } from 'react';
import axios from 'axios';
const BASE_URL = 'https://localhost:7014';
function TestSystem() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [testName, setTestName] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentTests, setStudentTests] = useState([]);
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

  const createTest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/test/create`, {
        Name: testName,
        ClassId: selectedClassId,
        Date: testDate,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setStudentTests([]); // Reset for new test
      setSuccess('Test created successfully!');
      setError('');
    } catch (err) {
      setError('Error creating test.');
      setSuccess('');
    }
  };

  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || studentTests.length === 0) {
      setError('Please select a student and enter marks.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const testId = studentTests[0].TestId; // Assuming all entries share the same test
      const payload = studentTests.map(st => ({
        StudentId: selectedStudentId,
        TestId: testId,
        Subject: st.subject,
        TotalMarks: st.totalMarks,
        ObtainedMarks: st.obtainedMarks,
      }));
      await axios.post(`${BASE_URL}/api/test/add-marks`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Marks saved successfully!');
      setError('');
      setStudentTests([]);
    } catch (err) {
      setError('Error saving marks.');
      setSuccess('');
    }
  };

  const addTestEntry = () => {
    setStudentTests([...studentTests, { Subject: '', TotalMarks: 30, ObtainedMarks: 0, TestId: 1 }]);
  };

  const updateTestEntry = (index, field, value) => {
    const newTests = [...studentTests];
    newTests[index][field] = field === 'ObtainedMarks' ? parseInt(value) || 0 : value;
    setStudentTests(newTests);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4" style={{ maxWidth: '800px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Test System</h2>
        {error && <p className="text-danger text-center mb-4">{error}</p>}
        {success && <p className="text-success text-center mb-4">{success}</p>}
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
        <div className="mb-3">
          <label htmlFor="testName" className="form-label">Test Name</label>
          <input
            type="text"
            className="form-control"
            id="testName"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="e.g., Midterm"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="testDate" className="form-label">Test Date</label>
          <input
            type="date"
            className="form-control"
            id="testDate"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
          />
        </div>
        <button className="btn btn-primary mb-3" onClick={createTest}>Create Test</button>
        {selectedStudentId && (
          <>
            <h4 className="mb-3">Enter Marks</h4>
            {studentTests.map((st, index) => (
              <div key={index} className="mb-3 row">
                <div className="col-4">
                  <input
                    type="text"
                    className="form-control"
                    value={st.Subject}
                    onChange={(e) => updateTestEntry(index, 'Subject', e.target.value)}
                    placeholder="Subject"
                  />
                </div>
                <div className="col-2">
                  <input
                    type="number"
                    className="form-control"
                    value={st.TotalMarks}
                    onChange={(e) => updateTestEntry(index, 'TotalMarks', e.target.value)}
                    placeholder="Total Marks"
                  />
                </div>
                <div className="col-2">
                  <input
                    type="number"
                    className="form-control"
                    value={st.ObtainedMarks}
                    onChange={(e) => updateTestEntry(index, 'ObtainedMarks', e.target.value)}
                    placeholder="Obtained Marks"
                  />
                </div>
                <div className="col-2">
                  <input
                    type="text"
                    className="form-control"
                    value={(st.ObtainedMarks / st.TotalMarks * 100).toFixed(2) || '0'}
                    readOnly
                    placeholder="Percentage"
                  />
                </div>
                <div className="col-2">
                  <input
                    type="text"
                    className="form-control"
                    value={st.ObtainedMarks && st.TotalMarks ? AssignGrade((st.ObtainedMarks / st.TotalMarks * 100)) : ''}
                    readOnly
                    placeholder="Grade"
                  />
                </div>
              </div>
            ))}
            <button className="btn btn-secondary mb-3" onClick={addTestEntry}>Add Subject</button>
            <button type="submit" className="btn btn-primary w-100 mt-3" onClick={handleMarksSubmit}>Save Marks</button>
          </>
        )}
      </div>
    </div>
  );
}

function AssignGrade(percentage) {
  return percentage >= 90 ? "A+" :
         percentage >= 80 ? "A" :
         percentage >= 70 ? "B" :
         percentage >= 60 ? "C" :
         percentage >= 50 ? "D" : "F";
}

export default TestSystem;