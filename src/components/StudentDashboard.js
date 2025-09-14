import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentForm from './StudentForm';
import StudentList from './StudentList';

const BASE_URL = 'http://localhost:32000/api';

function StudentDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      debugger;
      setStudents(res.data);
    } catch (err) {
      showAlert('danger', 'Error fetching students.');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Show bootstrap-style alert
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  // Handlers passed into StudentForm & StudentList
  const handleSave = () => {
    setSelectedStudent(null);
    fetchStudents();
    showAlert('success', 'Student saved successfully!');
  };
  const handleError = () => showAlert('danger', 'Failed to save student.');
  const handleEdit = (student) => setSelectedStudent(student);
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
      showAlert('success', 'Student deleted.');
    } catch {
      showAlert('danger', 'Delete failed.');
    }
  };

  return (
    <div className="container my-4">
      {alert.show && (
        <div
          className={`alert alert-${alert.type} alert-dismissible fade show`}
          role="alert"
        >
          {alert.message}
        </div>
      )}

      <StudentForm
        selectedStudent={selectedStudent}
        onSave={handleSave}
        onError={handleError}
        onCancel={() => setSelectedStudent(null)}
      />

      <StudentList
        students={students}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pageSize={8}
      />
    </div>
  );
}

export default StudentDashboard;
