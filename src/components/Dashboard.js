import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:32000';
function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    totalClasses: 0,
    notifications: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [studentsResponse, classesResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/students/count`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/classes/count`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStats({
          totalStudents: studentsResponse.data.count || 0,
          totalClasses: classesResponse.data.count || 0,
          presentToday: Math.floor(Math.random() * studentsResponse.data.count) || 0, // Sample data
          notifications: ['New student registered', 'Attendance report due tomorrow'],
        });
      } catch (err) {
        setError('Error fetching dashboard data.');
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="bg-dark text-white p-3" style={{ borderRadius: '8px', minHeight: '80vh' }}>
      <h2 className="mb-4">Dashboard</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        {/* Total Students Card */}
        <div className="col-md-3 col-sm-6 mb-3">
          <div
            className="card bg-secondary text-white"
            style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            <div className="card-body text-center">
              <h5 className="card-title">Total Students</h5>
              <p className="card-text display-4">{stats.totalStudents}</p>
            </div>
          </div>
        </div>
        {/* Present Today Card */}
        <div className="col-md-3 col-sm-6 mb-3">
          <div
            className="card bg-success text-white"
            style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            <div className="card-body text-center">
              <h5 className="card-title">Present Today</h5>
              <p className="card-text display-4">{stats.presentToday}</p>
            </div>
          </div>
        </div>
        {/* Total Classes Card */}
        <div className="col-md-3 col-sm-6 mb-3">
          <div
            className="card bg-info text-white"
            style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            <div className="card-body text-center">
              <h5 className="card-title">Total Classes</h5>
              <p className="card-text display-4">{stats.totalClasses}</p>
            </div>
          </div>
        </div>
        {/* Notifications Card */}
        <div className="col-md-3 col-sm-6 mb-3">
          <div
            className="card bg-warning text-dark"
            style={{ transition: 'transform 0.2s', cursor: 'pointer', height: '100%' }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            <div className="card-body">
              <h5 className="card-title">Notifications</h5>
              <ul className="list-group list-group-flush">
                {stats.notifications.map((note, index) => (
                  <li key={index} className="list-group-item bg-warning text-dark">{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;