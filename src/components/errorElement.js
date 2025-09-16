const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    errorElement: <div className="text-center p-4">Page Not Found (404). <Link to="/dashboard">Go to Dashboard</Link></div>, // Custom 404 page
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
    ],
  },
]);