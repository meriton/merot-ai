import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Plans from './pages/Plans'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPlans from './pages/admin/AdminPlans'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import useAuthStore from './stores/authStore'

// Employee Portal
import EmployeeLogin from './pages/employee/EmployeeLogin'
import EmployeeDashboardLayout from './pages/employee/EmployeeDashboardLayout'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import EmployeeTasks from './pages/employee/EmployeeTasks'
import EmployeeProtectedRoute from './components/EmployeeProtectedRoute'
import useEmployeeAuthStore from './stores/employeeAuthStore'

function App() {
  const { token } = useAuthStore()
  const { token: employeeToken } = useEmployeeAuthStore()

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <Plans />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <AdminRoute>
              <AdminPlans />
            </AdminRoute>
          }
        />

        {/* Employee Portal Routes */}
        <Route
          path="/employee/login"
          element={employeeToken ? <Navigate to="/employee/dashboard" replace /> : <EmployeeLogin />}
        />
        <Route
          path="/employee"
          element={
            <EmployeeProtectedRoute>
              <EmployeeDashboardLayout />
            </EmployeeProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="tasks" element={<EmployeeTasks />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
