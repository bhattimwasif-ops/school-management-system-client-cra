// StudentForm.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:32000/api';

const initialFormData = {
  name: '',
  rollNo: '',
  classId: '',
  parentEmail: '',
  parentPhone: '',
  image: '',
  address: '',
  fatherOccupation: '',
  motherName: '',
  guardianName: '',
  guardianOccupation: '',
  admissionDate: ''
};

const allFields = [
  { label: 'Name', name: 'name', type: 'text', required: true },
  { label: 'Roll No', name: 'rollNo', type: 'text', required: false },
  { label: 'Class', name: 'classId', type: 'select', required: true },
  { label: 'Parent Email', name: 'parentEmail', type: 'email', required: true },
  { label: 'Parent Phone', name: 'parentPhone', type: 'tel', required: true },
  { label: 'Image URL', name: 'image', type: 'text', required: false },
  { label: 'Address', name: 'address', type: 'text', required: false },
  { label: 'Father Occupation', name: 'fatherOccupation', type: 'text', required: false },
  { label: 'Mother Name', name: 'motherName', type: 'text', required: false },
  { label: 'Guardian Name', name: 'guardianName', type: 'text', required: false },
  { label: 'Guardian Occupation', name: 'guardianOccupation', type: 'text', required: false },
  { label: 'Admission Date', name: 'admissionDate', type: 'date', required: false },
  { label: 'DOB', name: 'DOB', type: 'date', required: false }

];

function StudentForm({ selectedStudent, onSave, onError, onCancel }) {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({ ...initialFormData });
  const firstRender = useRef(true);

  // Fetch classes for the dropdown
  useEffect(() => {
    axios
      .get(`${BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => setClasses(res.data))
      .catch(() => { /* ignore */ });
  }, []);

  // When editing, preload form; when cleared, reset form
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (selectedStudent) {
      // Format date as YYYY-MM-DD or empty
      const admissionDate = selectedStudent.admissionDate
        ? selectedStudent.admissionDate.split('T')[0]
        : '';
      setFormData({
        ...selectedStudent,
        classId: selectedStudent.classId.toString(),
        admissionDate
      });
    } else {
      setFormData({ ...initialFormData });
    }
  }, [selectedStudent]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...formData,
      classId: parseInt(formData.classId, 10),
      admissionDate: formData.admissionDate || null
    };

    try {
      const token = localStorage.getItem('token');
      if (selectedStudent) {
        await axios.put(
          `${BASE_URL}/students/${selectedStudent.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.alert('Student updated successfully!');
      } else {
        await axios.post(`${BASE_URL}/students`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        window.alert('Student registered successfully!');
      }
      onSave();
      setFormData({ ...initialFormData }); // clear form
    } catch {
      window.alert('Failed to save student.');
      onError();
    }
  };

  // Distribute fields into 3 roughly equal columns
  const chunkSize = Math.ceil(allFields.length / 3);
  const columns = [
    allFields.slice(0, chunkSize),
    allFields.slice(chunkSize, chunkSize * 2),
    allFields.slice(chunkSize * 2)
  ];

  // Assign tabIndex in original order
  const fieldsWithTab = allFields.map((f, i) => ({ ...f, tabIndex: i + 1 }));

  return (
    <form onSubmit={handleSubmit} className="card p-4 mb-4">
      <h5>{selectedStudent ? 'Edit Student' : 'Register Student'}</h5>
      <div className="row">
        {columns.map((colFields, colIdx) => (
          <div className="col-md-4" key={colIdx}>
            {colFields.map(field => {
              // find the tabIndex
              const { tabIndex } = fieldsWithTab.find(f => f.name === field.name);

              if (field.type === 'select') {
                return (
                  <div className="mb-3" key={field.name}>
                    <label className="form-label">{field.label}</label>
                    <select
                      className="form-select"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      tabIndex={tabIndex}
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.className} – {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <div className="mb-3" key={field.name}>
                  <label className="form-label">{field.label}</label>
                  <input
                    type={field.type}
                    className="form-control"
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    tabIndex={tabIndex}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-end">
        {selectedStudent && (
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {selectedStudent ? 'Update' : 'Register'}
        </button>
      </div>
    </form>
  );
}

export default StudentForm;
