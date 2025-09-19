import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import Login from './Login';
import Attendance from './Attendance';
import ProtectedRoute from './ProtectedRoute';
import ClassRegistration from './ClassRegistration';
import StudentRegistration from './StudentRegistration';
import AttendanceMultiSelect from './AttendanceMultiSelect';
import AttendanceGrid from './AttendanceGrid';
import AttendanceCardView from './AttendanceCardView';
import Dashboard from './Dashboard';
import TestSystem from './TestSystem';
import TestDefinition from './TestDefinition';
import StudentReport from './StudentReport';
import EditMarks from './EditMarks';
import GlobalTestReport from './GlobalTestReport';
import StudentReportGenerator from './StudentReportGenerator';
import ClassAttendanceReport from './ClassAttendanceReport';
import StudentForm from './StudentForm';
import StudentList from './StudentList';
import StudentDashboard from './StudentDashboard';
import StudentAttendanceDetail from './StudentAttendanceDetail';
import ResultCard from './ResultCard';
import StudentReportCard from './StudentReportCard';
import AddMarksStudentGrid from './AddMarksStudentGrid';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggle = () => {
    console.log('Toggle clicked, isSidebarOpen:', !isSidebarOpen); // Debug log
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', isParent: false },
    {
      label: 'Student Management System',
      isParent: true,
      children: [
        // { path: '/class-registration', label: 'Class Setup' },
        // { path: '/student-registration', label: 'Student Enrollment' },
        // { path: '/student-form', label: 'Student Form' },
        // { path: '/student-list', label: 'Student List' },
        { path: '/student-dashboard', label: 'Student Dashboard' },
      ],
    },
    {
      label: 'Attendance Management System (AMS)',
      isParent: true,
      children: [
        { path: '/attendance-multi-select', label: 'Attendance Multi-Select' },
        { path: '/attendance-grid', label: 'Attendance Grid View' },
        { path: '/attendance-card-view', label: 'Attendance Card View' },
        { path: '/class-attendance-report', label: 'Attendance Report' },
        { path: '/student-attendance-detail', label: 'Student Attendance Report' },
      ],
    },
    {
      label: 'Exam & Test Management System',
      isParent: true,
      children: [
        { path: '/test-definition', label: 'Exam/Test Configuration' },
        { path: '/test-system', label: 'Add Marks' },
        { path: '/student-report', label: 'Test Performance Report' },
        { path: '/student-result-card', label: 'Student Result Card' },
        { path: '/add-marks-student-grid', label: 'Add Marks Student Grid' },
      ],
    },
    { label: 'Logout', isParent: false, onClick: handleLogout },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
      {/* Toggle Button */}
      <button
        className="btn btn-dark ms-3 mt-3"
        type="button"
        onClick={handleToggle}
        style={{ position: 'fixed', zIndex: 1000, borderRadius: '50%', width: '40px', height: '40px', padding: 0, border: 'none' }}
      >
        <span className="navbar-toggler-icon" style={{ color: isSidebarOpen ? '#0e0d0dff' : '#562d2dff' }}></span>
      </button>

      {/* Sidebar */}
      <nav
        className={`sidebar ${isSidebarOpen ? 'open' : ''} ${window.innerWidth >= 768 ? 'd-block' : 'd-none d-md-block'}`}
        style={{
          width: isSidebarOpen || window.innerWidth >= 768 ? '250px' : '0',
          minWidth: isSidebarOpen || window.innerWidth >= 768 ? '250px' : '0',
          position: 'fixed',
          height: '100vh',
          paddingTop: '60px',
          transition: 'all 0.3s ease-in-out',
          overflowY: 'auto',
          backgroundColor: '#222',
          color: '#fff',
          boxShadow: isSidebarOpen ? '2px 0 10px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="p-3 border-bottom border-secondary text-center">
<img src={require('../school-logo.png')} alt="School Logo" style={{ maxWidth: '200px', height: 'auto', marginBottom: '10px' }} />          <h4 className="mb-0 text-white"></h4>
        </div>
        <div className="list-group list-group-flush">
          {menuItems.map((item) =>
            item.isParent ? (
              <div key={item.label}>
                <div
                  className={`list-group-item list-group-item-action ${location.pathname.includes(item.children.find(c => location.pathname.includes(c.path))?.path) ? 'active' : ''}`}
                  style={{ cursor: 'pointer', color: '#fff', backgroundColor: '#333' }}
                  onClick={(e) => {
                    const submenu = e.currentTarget.nextElementSibling;
                    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                  }}
                >
                  {item.label}
                </div>
                <ul
                  className="list-group list-group-flush submenu"
                  style={{ display: 'none', backgroundColor: '#2a2a2a' }}
                >
                  {item.children.map((child) => (
                    <li key={child.path}>
                      <Link
                        to={child.path}
                        className={`list-group-item list-group-item-action ${location.pathname === child.path ? 'active' : ''}`}
                        aria-current={location.pathname === child.path ? 'page' : undefined}
                        style={{ color: '#080c86ff' }}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div
                key={item.label}
                className={`list-group-item list-group-item-action ${location.pathname === '/logout' ? 'active' : ''}`}
                style={{ color: '#2f075cff', cursor: 'pointer' }}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsSidebarOpen(false);
                }}
              >
                {item.label}
              </div>
            )
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main
        className="flex-grow-1"
        style={{
          marginLeft: (isSidebarOpen || window.innerWidth >= 768) ? '250px' : '0',
          padding: '20px',
          transition: 'all 0.3s ease-in-out',
          width: `calc(100% - ${(isSidebarOpen || window.innerWidth >= 768) ? '250px' : '0'})`,
          backgroundColor: '#fff',
          borderRadius: '8px',
          color: '#000',
        }}
      >
        <div className="p-4">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75"
          style={{ zIndex: 900 }}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

// Define routes
const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    errorElement: <div className="text-center p-4">Page Not Found (404). <Link to="/dashboard">Go to Dashboard</Link></div>,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/student-form', element: <StudentForm /> },
      { path: '/student-list', element: <StudentList /> },
      { path: '/student-dashboard', element: <StudentDashboard /> },
      { path: '/student-attendance-detail', element: <StudentAttendanceDetail /> },
      { path: '/class-registration', element: <ClassRegistration /> },
      { path: '/student-registration', element: <StudentRegistration /> },
      { path: '/attendance-multi-select', element: <AttendanceMultiSelect /> },
      { path: '/attendance-grid', element: <AttendanceGrid /> },
      { path: '/attendance-card-view', element: <AttendanceCardView /> },
      { path: '/test-system', element: <TestSystem /> },
      { path: '/test-definition', element: <TestDefinition /> },
      { path: '/student-report', element: <StudentReport /> },
      { path: '/global-test-report', element: <GlobalTestReport /> },
      { path: '/student-report-generator', element: <StudentReportGenerator /> },
      { path: '/class-attendance-report', element: <ClassAttendanceReport /> },
      { path: '/student-result-card', element: <StudentReportCard /> },
      { path: '/add-marks-student-grid', element: <AddMarksStudentGrid /> },
    ],
  },
]);

export { Layout, router };