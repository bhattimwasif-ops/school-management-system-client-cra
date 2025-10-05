import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentForm from './StudentForm';
import StudentList from './StudentList';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import BASE_URL from './config';

function StudentDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      debugger;
      setStudents(res.data);
    } catch (err) {
      toast.error('Error fetching students.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handlers passed into StudentForm & StudentList
  const handleSave = () => {
    setSelectedStudent(null);
    fetchStudents();
    toast.success('Student saved successfully!', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const handleError = () => {
    toast.error('Failed to save student.', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const handleEdit = (student) => setSelectedStudent(student);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
      toast.success('Student deleted.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch {
      toast.error('Delete failed.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="container my-4">
      <ToastContainer /> {/* Add ToastContainer for rendering toasts */}
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
        pageSize={20}
      />
    </div>
  );
}

export default StudentDashboard;