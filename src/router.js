import { createBrowserRouter } from 'react-router-dom';
import Login from './components/Login';
import Attendance from './components/Attendance';
import ProtectedRoute from './components/ProtectedRoute';
import ClassRegistration from './components/ClassRegistration';
import StudentRegistration from './components/StudentRegistration';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/attendance',
    element: (
      <ProtectedRoute>
        <Attendance />
      </ProtectedRoute>
    ),
  },
  {
    path: '/class-registration',
    element: (
      <ProtectedRoute>
        <ClassRegistration />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student-registration',
    element: (
      <ProtectedRoute>
        <StudentRegistration />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <Login />,
  },
]);

export default router;