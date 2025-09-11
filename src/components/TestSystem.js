import React, { useState, useEffect } from 'react';
import axios from 'axios';
const BASE_URL = 'https://localhost:7014';

function TestSystem() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentTests, setStudentTests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const defaultSubjects = [
    'English', 'Urdu', 'Islamic Studies', 'Pak Studies', 'Physics', 'Chemistry',
    'Bio', 'Math', 'Tarjama tul Quran', 'General Knowledge', 'Art', 'Dictation', 'Nazra'
  ];

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
      const fetchTests = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${BASE_URL}/api/test/${selectedClassId}/tests`, {
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

  useEffect(() => {
    if (selectedStudentId && studentTests.length === 0 && selectedTestId) {
      const initialTests = defaultSubjects.map(subject => ({
        Subject: subject,
        TotalMarks: 30,
        ObtainedMarks: 0,
        TestId: selectedTestId
      }));
      setStudentTests(initialTests);
    }
  }, [selectedStudentId, studentTests.length, selectedTestId]);

  const handleMarksSubmit = async (e) => {
  e.preventDefault();
  if (!selectedStudentId || studentTests.length === 0) {
    setError('Please select a student and enter marks.');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const testId = selectedTestId;
    const payload = studentTests.map(st => ({
      StudentId: selectedStudentId,
      TestId: testId,
      Subject: st.Subject,
      TotalMarks: st.TotalMarks,
      ObtainedMarks: st.ObtainedMarks,
    }));

    const response = await axios.post(`${BASE_URL}/api/test/add-marks`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const skipped = response.data?.skippedSubjects || [];
    debugger
    if (skipped.length > 0) {
      setSuccess(`Marks saved. But these subjects were already added: ${skipped.join(', ')}`);
    } else {
      setSuccess('Marks saved successfully!');
    }

    setError('');
    setStudentTests([]);
  } catch (err) {
    setError('Error saving marks.');
    setSuccess('');
  }
};

  const addTestEntry = () => {
    setStudentTests([...studentTests, { Subject: '', TotalMarks: 30, ObtainedMarks: 0, TestId: selectedTestId }]);
  };

  const removeTestEntry = (index) => {
    setStudentTests(studentTests.filter((_, i) => i !== index));
  };

  const updateTestEntry = (index, field, value) => {
    const newTests = [...studentTests];
    newTests[index][field] = field === 'ObtainedMarks' ? parseInt(value) || 0 : value;
    setStudentTests(newTests);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <div className="container py-3">
        <div className="card p-3 p-md-4">
          <h2 className="card-title text-center mb-4">Record Student Marks</h2>
          {error && <p className="text-danger text-center mb-3">{error}</p>}
          {success && <p className="text-success text-center mb-3">{success}</p>}
          <div className="row g-2 mb-3">
            <div className="col-12">
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
          </div>
          <div className="row g-2 mb-3">
            <div className="col-12">
              <label htmlFor="testId" className="form-label">Select Test/Exam</label>
              <select
                className="form-select"
                id="testId"
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                required
              >
                <option value="">Select a test/exam</option>
                {tests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.name} ({test.type}, {test.session})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row g-2 mb-3">
            <div className="col-12">
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
          </div>
          {selectedStudentId && (
            <>
              <h4 className="mb-3">Enter Marks</h4>
              {studentTests.map((st, index) => (
                <div key={index} className="row g-2 mb-2 align-items-center">
                  <div className="col-12 col-md-4">
                    <input
                      type="text"
                      disabled
                      className="form-control"
                      value={st.Subject}
                      onChange={(e) => updateTestEntry(index, 'Subject', e.target.value)}
                      placeholder="Subject"
                    />
                  </div>
                  <div className="col-6 col-md-2">
                    <input
                      type="number"
                      className="form-control"
                      value={st.TotalMarks}
                      onChange={(e) => updateTestEntry(index, 'TotalMarks', e.target.value)}
                      placeholder="Total Marks"
                    />
                  </div>
                  <div className="col-6 col-md-2">
                    <input
                      type="number"
                      className="form-control"
                      value={st.ObtainedMarks}
                      onChange={(e) => updateTestEntry(index, 'ObtainedMarks', e.target.value)}
                      placeholder="Obtained Marks"
                    />
                  </div>
                  <div className="col-6 col-md-2">
                    <input
                      type="text"
                      className="form-control"
                      value={(st.ObtainedMarks / st.TotalMarks * 100).toFixed(2) || '0'}
                      readOnly
                      placeholder="Percentage"
                    />
                  </div>
                  <div className="col-6 col-md-1">
                    <input
                      type="text"
                      className="form-control"
                      value={st.ObtainedMarks && st.TotalMarks ? AssignGrade((st.ObtainedMarks / st.TotalMarks * 100)) : ''}
                      readOnly
                      placeholder="Grade"
                    />
                  </div>
                  <div className="col-6 col-md-1">
                    <button className="btn btn-danger w-100" onClick={() => removeTestEntry(index)}>Remove</button>
                  </div>
                </div>
              ))}
              <div className="d-flex gap-2 flex-column flex-md-row">
                <button className="btn btn-secondary mb-3" onClick={addTestEntry}>Add Subject</button>
                <button className="btn btn-primary mb-3" onClick={handleMarksSubmit}>Save Marks</button>
              </div>
            </>
          )}
        </div>
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