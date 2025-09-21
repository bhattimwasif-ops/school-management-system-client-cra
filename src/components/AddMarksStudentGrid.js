import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BASE_URL from './config';

function AddMarksStudentGrid() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marks, setMarks] = useState({});
  const [totalMarks, setTotalMarks] = useState(30); // Single editable total marks outside grid
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const defaultSubjects = [
    'English', 'Urdu', 'Islamic Studies', 'Pak Studies', 'Physics', 'Chemistry',
    'Bio', 'Math', 'Tarjama tul Quran', 'General Knowledge', 'Art', 'Dictation',
    'Nazra', 'Ethics', 'Civics'
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
        toast.error('Error fetching classes.');
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
          toast.error('Error fetching tests.');
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
          // Reset marks when students change
          setMarks(response.data.reduce((acc, student) => ({ ...acc, [student.id]: 0 }), {}));
        } catch (err) {
          setError('Error fetching students.');
          toast.error('Error fetching students.');
        }
      };
      fetchStudents();
    } else {
      setTests([]);
      setStudents([]);
      setMarks({});
    }
  }, [selectedClassId]);

  const handleSaveRow = async (studentId) => {
    if (!selectedTestId || !selectedSubject || marks[studentId] === undefined) {
      setError('Please select a test, subject, and enter marks.');
      toast.warning('Please select a test, subject, and enter marks.');
      return;
    }

    const obtainedMarks = marks[studentId] || 0;
    if (obtainedMarks > totalMarks) {
      setError('Obtained marks cannot exceed total marks.');
      toast.warning('Obtained marks cannot exceed total marks.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        StudentId: studentId,
        TestId: selectedTestId,
        Subject: selectedSubject,
        TotalMarks: totalMarks,
        ObtainedMarks: obtainedMarks,
      };
      const response = await axios.post(`${BASE_URL}/api/test/add-marks-row`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });// Optional: check response status or message
      debugger
      if (response.status === 200 && response?.data?.message == "Marks not added.") {
        setSuccess(response?.data?.message + ' ' + response.data.skippedSubjects[0]);
        setError('');
        toast.warning(response?.data?.message + ' because marks already added for ' + response.data.skippedSubjects[0]);
      } else if (response.status === 200 && response?.data?.message == "Marks added.") {
        setSuccess(response?.data?.message);
        setError('');
        toast.success(response?.data?.message);
      } else {
        // In case of a logical error returned by the API
        const message = response.data?.message || 'Error saving marks for this student.';
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      setError('Error saving marks for this student.');
      toast.error('Error saving marks for this student.');
    }
  };

  const handleSaveAll = async () => {
    if (!selectedTestId || !selectedSubject || Object.values(marks).some(m => m === undefined)) {
      setError('Please select a test, subject, and enter all marks.');
      toast.warning('Please select a test, subject, and enter all marks.');
      return;
    }

    const invalidEntries = students.filter(student => marks[student.id] > totalMarks);
    if (invalidEntries.length > 0) {
      setError('Obtained marks cannot exceed total marks for some students.');
      toast.warning('Obtained marks cannot exceed total marks for some students.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = students.map(student => ({
        StudentId: student.id,
        TestId: selectedTestId,
        Subject: selectedSubject,
        TotalMarks: totalMarks,
        ObtainedMarks: marks[student.id] || 0,
      }));
      const response = await axios.post(`${BASE_URL}/api/test/add-marks`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const skipped = response.data?.skippedSubjects || [];
      if (skipped.length > 0) {
        setSuccess(`Marks saved. Skipped these subjects: ${skipped.join(', ')}`);
        toast.success(`Marks saved. Skipped these subjects: ${skipped.join(', ')}`);
      } else {
        setSuccess('All marks saved successfully!');
        toast.success('All marks saved successfully!');
      }
      setError('');
    } catch (err) {
      setError('Error saving all marks.');
      toast.error('Error saving all marks.');
    }
  };

  const updateMarks = (studentId, value) => {
    setMarks(prev => ({ ...prev, [studentId]: parseInt(value) || 0 }));
  };

  // Function to calculate grade based on marks and total marks
  const calculateGrade = (obtainedMarks) => {
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks * 100) : 0;
    return percentage >= 90 ? "A+" :
           percentage >= 80 ? "A" :
           percentage >= 70 ? "B" :
           percentage >= 60 ? "C" :
           percentage >= 50 ? "D" : "F";
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="container py-3">
        <div className="card p-3 p-md-4">
          <h2 className="card-title text-center mb-4">Add Marks for Test</h2>
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
                <div className="col-12 col-md-6">
                  <label htmlFor="totalMarks" className="form-label">Total Marks</label>
                  <input
                    type="number"
                    className="form-control"
                    id="totalMarks"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(parseInt(e.target.value) || 0)}
                    min="0"
                  />
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
                      <th>Grade</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const obtainedMarks = marks[student.id] || 0;
                      const grade = calculateGrade(obtainedMarks);
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
                              max={totalMarks}
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