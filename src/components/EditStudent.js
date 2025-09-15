import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import BASE_URL from './config';

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState({
    name: '',
    classId: '',
    parentEmail: '',
    parentPhone: ''
  });

  useEffect(() => {
    const fetchStudent = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudent(response.data);
    };
    fetchStudent();
  }, [id]);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await axios.put(`${BASE_URL}/api/students/${id}`, student, {
      headers: { Authorization: `Bearer ${token}` },
    });
    navigate('/students');
  };
  const handleDelete = async (id) => {
  const token = localStorage.getItem('token');
  await axios.delete(`${BASE_URL}/api/students/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  setStudents(students.filter((s) => s.id !== id));
};

  return (
    <div className="container mt-5">
      <h2>Edit Student</h2>
      <form onSubmit={handleUpdate}>
        <input type="text" name="name" value={student.name} onChange={handleChange} className="form-control mb-2" />
        <input type="text" name="classId" value={student.classId} onChange={handleChange} className="form-control mb-2" />
        <input type="email" name="parentEmail" value={student.parentEmail} onChange={handleChange} className="form-control mb-2" />
        <input type="tel" name="parentPhone" value={student.parentPhone} onChange={handleChange} className="form-control mb-2" />
        <button type="submit" className="btn btn-primary">Update</button>
      </form>
    </div>
  );
}

export default EditStudent;
