import { Navigate } from 'react-router-dom';
import useEmployeeAuthStore from '../stores/employeeAuthStore';

function EmployeeProtectedRoute({ children }) {
  const { token } = useEmployeeAuthStore();

  if (!token) {
    return <Navigate to="/employee/login" replace />;
  }

  return children;
}

export default EmployeeProtectedRoute;
