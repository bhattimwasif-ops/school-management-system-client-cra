import { createBrowserRouter } from 'react-router-dom';
import Login from './components/Login';
import Attendance from './components/Attendance';
import ProtectedRoute from './components/ProtectedRoute';

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
    path: '/',
    element: <Login />,
  },
]);

export default router;