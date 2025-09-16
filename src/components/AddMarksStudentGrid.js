import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from './config';

function AddMarksStudentGrid() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marks, setMarks] = useState({}); // Stores obtained marks
  const [totalMarks, setTotalMarks] = useState({}); // Stores editable total marks per student
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
          setSelectedTestId(''); // Reset test on class change
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
          // Reset marks and total marks when students change
          setMarks(response.data.reduce((acc, student) => ({ ...acc, [student.id]: 0 }), {}));
          setTotalMarks(response.data.reduce((acc, student) => ({ ...acc, [student.id]: 30 }), {})); // Default total marks as 30
        } catch (err) {
          setError('Error fetching students.');
        }
      };
      fetchStudents();
    } else {
      setTests([]);
      setStudents([]);
      setMarks({});
      setTotalMarks({});
    }
  }, [selectedClassId]);

  const handleSaveRow = async (studentId) => {
    if (!selectedTestId || !selectedSubject || marks[studentId] === undefined || totalMarks[studentId] === undefined) {
      setError('Please select a test, subject, and enter marks.');
      return;
    }

    const obtainedMarks = marks[studentId] || 0;
    const maxMarks = totalMarks[studentId] || 30;
    if (obtainedMarks > maxMarks) {
      setError('Obtained marks cannot exceed total marks.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        StudentId: studentId,
        TestId: selectedTestId,
        Subject: selectedSubject,
        TotalMarks: maxMarks,
        ObtainedMarks: obtainedMarks,
      };
      await axios.post(`${BASE_URL}/api/test/add-marks`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Marks saved for this student!');
      setError('');
    } catch (err) {
      setError('Error saving marks for this student.');
    }
  };

  const handleSaveAll = async () => {
    if (!selectedTestId || !selectedSubject || Object.values(marks).some(m => m === undefined) || Object.values(totalMarks).some(m => m === undefined)) {
      setError('Please select a test, subject, and enter all marks.');
      return;
    }

    const invalidEntries = students.filter(student => marks[student.id] > totalMarks[student.id]);
    if (invalidEntries.length > 0) {
      setError('Obtained marks cannot exceed total marks for some students.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = students.map(student => ({
        StudentId: student.id,
        TestId: selectedTestId,
        Subject: selectedSubject,
        TotalMarks: totalMarks[student.id] || 30,
        ObtainedMarks: marks[student.id] || 0,
      }));
      const response = await axios.post(`${BASE_URL}/api/test/add-marks`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const skipped = response.data?.skippedSubjects || [];
      if (skipped.length > 0) {
        setSuccess(`Marks saved. Skipped these subjects: ${skipped.join(', ')}`);
      } else {
        setSuccess('All marks saved successfully!');
      }
      setError('');
    } catch (err) {
      setError('Error saving all marks.');
    }
  };

  const updateMarks = (studentId, value) => {
    setMarks(prev => ({ ...prev, [studentId]: parseInt(value) || 0 }));
  };

  const updateTotalMarks = (studentId, value) => {
    const newTotal = parseInt(value) || 0;
    setTotalMarks(prev => ({ ...prev, [studentId]: newTotal }));
    // Ensure obtained marks don't exceed new total
    const obtained = marks[studentId] || 0;
    if (obtained > newTotal) {
      setMarks(prev => ({ ...prev, [studentId]: newTotal }));
    }
  };

  // Function to calculate grade based on marks and total marks
  const calculateGrade = (obtainedMarks, totalMarks) => {
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks * 100) : 0;
    return percentage >= 90 ? "A+" :
           percentage >= 80 ? "A" :
           percentage >= 70 ? "B" :
           percentage >= 60 ? "C" :
           percentage >= 50 ? "D" : "F";
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <div className="container py-3">
        <div className="card p-3 p-md-4">
          <h2 className="card-title text-center mb-4">Add Marks for Test</h2>
          {error && <p className="text-danger text-center mb-3">{error}</p>}
          {success && <p className="text-success text-center mb-3">{success}</p>}
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
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
            <div className="col-12 col-md-6">
              <label htmlFor="testId" className="form-label">Select Test/Exam</label>
              <select
                className="form-select"
                id="testId"
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                required
                disabled={!selectedClassId}
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
          {selectedTestId && (
            <>
              <div className="row g-2 mb-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="subject" className="form-label">Select Subject</label>
                  <select
                    className="form-select"
                    id="subject"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    required
                  >
                    <option value="">Select a subject</option>
                    {defaultSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="table-responsive mb-3">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Subject</th>
                      <th>Marks Obtained</th>
                      <th>Total Marks</th>
                      <th>Grade</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const obtainedMarks = marks[student.id] || 0;
                      const maxMarks = totalMarks[student.id] || 30;
                      const grade = calculateGrade(obtainedMarks, maxMarks);
                      return (
                        <tr key={student.id}>
                          <td>{student.rollNo}</td>
                          <td>{student.name}</td>
                          <td>{selectedSubject}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={obtainedMarks}
                              onChange={(e) => updateMarks(student.id, e.target.value)}
                              min="0"
                              max={maxMarks}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={maxMarks}
                              onChange={(e) => updateTotalMarks(student.id, e.target.value)}
                              min="0"
                            />
                          </td>
                          <td>{grade}</td> {/* Grade calculated runtime */}
                          <td>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleSaveRow(student.id)}
                            >
                              ✓
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveAll}
                  disabled={!selectedSubject || students.length === 0}
                >
                  Save All
                </button>
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

export default AddMarksStudentGrid;