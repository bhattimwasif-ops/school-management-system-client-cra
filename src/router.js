import { createBrowserRouter } from 'react-router-dom';
import Login from './components/Login';
import Attendance from './components/Attendance';
import ProtectedRoute from './components/ProtectedRoute';
import ClassRegistration from './components/ClassRegistration';
import StudentRegistration from './components/StudentRegistration';
import AttendanceMultiSelect from './components/AttendanceMultiSelect';
import AttendanceCardView from './components/AttendanceCardView';
import TestDefinition from './components/TestDefinition';


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
    path: '/attendance-multi-select',
    element: (
      <ProtectedRoute>
        <AttendanceMultiSelect />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendance-grid',
    element: (
      <ProtectedRoute>
        <AttendanceGrid />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendance-card-view',
    element: (
      <ProtectedRoute>
        <AttendanceCardView />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <Login />,
  },
  {
  path: '/test-definition',
  element: (
    <ProtectedRoute>
      <TestDefinition />
    </ProtectedRoute>
  ),
}
]);

export default router;