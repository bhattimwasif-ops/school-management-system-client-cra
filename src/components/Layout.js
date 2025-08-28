import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
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

// Define routes
const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/attendance', element: <Attendance /> },
      { path: '/class-registration', element: <ClassRegistration /> },
      { path: '/student-registration', element: <StudentRegistration /> },
      { path: '/attendance-multi-select', element: <AttendanceMultiSelect /> },
      { path: '/attendance-grid', element: <AttendanceGrid /> },
      { path: '/attendance-card-view', element: <AttendanceCardView /> },
      {
  path: '/test-system',
  element: <TestSystem />
}   
    ],
  },
]);

function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start collapsed on mobile
  const menuItems = router.routes
    .flatMap(route => route.children || [])
    .filter(route => route.path !== '/'); // Exclude root redirect

  const handleToggle = () => {
    console.log('Toggle clicked'); // Debug log
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
      {/* Toggle Button */}
      <button
        className="btn btn-dark ms-3 mt-3"
        type="button"
        onClick={handleToggle}
        style={{ position: 'fixed', zIndex: 1000, borderRadius: '50%', width: '40px', height: '40px', padding: 0, border: 'none' }}
      >
        <span className="navbar-toggler-icon" style={{ color: isSidebarOpen ? '#0e0d0dff' : '#ccc' }}></span>
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
          transition: 'width 0.3s ease-in-out',
          overflowY: 'auto',
          backgroundColor: '#222',
          color: '#fff',
          boxShadow: isSidebarOpen ? '2px 0 10px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="p-3 border-bottom border-secondary">
          <h4 className="mb-0 text-white">Hub</h4>
        </div>
        <div className="list-group list-group-flush">
          {menuItems.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={`list-group-item list-group-item-action ${location.pathname === route.path ? 'active' : ''}`}
              aria-current={location.pathname === route.path ? 'page' : undefined}
              style={{ color: '#100101ff' }} // Remove transition and hover handlers
            >
              {route.path
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
                .replace('/', '') || 'Home'}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main
        className="flex-grow-1"
        style={{
          marginLeft: (isSidebarOpen || window.innerWidth >= 768) ? '250px' : '0',
          padding: '20px',
          transition: 'margin-left 0.3s ease-in-out',
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

export { Layout, router };