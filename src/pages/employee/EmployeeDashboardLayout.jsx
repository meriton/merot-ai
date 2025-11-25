import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import useEmployeeAuthStore from '../../stores/employeeAuthStore';
import NotificationCenter from '../../components/NotificationCenter';

function EmployeeDashboardLayout() {
  const navigate = useNavigate();
  const { employee, logout } = useEmployeeAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/employee/login');
  };

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <header className="employee-header">
        <div className="employee-header-left">
          <img src="/merotai-logo.png" alt="Merot AI" height="32" style={{filter: 'brightness(0) invert(1)'}} />
          <span className="employee-portal-title">Employee Portal</span>
        </div>
        <div className="employee-header-right">
          <div className="employee-info">
            <span className="employee-name">{employee?.full_name}</span>
            <span className="employee-role">{employee?.role}</span>
          </div>
          <NotificationCenter />
          <button onClick={handleLogout} className="employee-logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className="employee-layout">
        <aside className="employee-sidebar">
          <nav className="employee-nav">
            <NavLink to="/employee/dashboard" className={({ isActive }) => `employee-nav-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </NavLink>

            <NavLink to="/employee/tasks" className={({ isActive }) => `employee-nav-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Tasks
            </NavLink>

            {(employee?.role === 'reviewer' || employee?.role === 'team_lead' || employee?.role === 'admin') && (
              <NavLink to="/employee/reviews" className={({ isActive }) => `employee-nav-link ${isActive ? 'active' : ''}`}>
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Review Queue
              </NavLink>
            )}

            <NavLink to="/employee/revisions" className={({ isActive }) => `employee-nav-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Revisions
            </NavLink>

            <NavLink to="/employee/analytics" className={({ isActive }) => `employee-nav-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </NavLink>

            <NavLink to="/employee/help" className={({ isActive }) => `employee-nav-link ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help Center
            </NavLink>

            <div className="employee-stats">
              <div className="stat-item">
                <span className="stat-label">Tasks Completed</span>
                <span className="stat-value">{employee?.tasks_completed || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Quality Score</span>
                <span className="stat-value">{employee?.quality_score || 'N/A'}</span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="employee-main">
          <Outlet />
        </main>
      </div>

      <style>{`
        .employee-dashboard {
          min-height: 100vh;
          background: #f5f7fa;
        }

        .employee-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .employee-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .employee-portal-title {
          color: white;
          font-size: 18px;
          font-weight: 600;
        }

        .employee-header-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .employee-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .employee-name {
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        .employee-role {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          text-transform: capitalize;
        }

        .employee-logout-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .employee-logout-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .employee-layout {
          display: flex;
          min-height: calc(100vh - 64px);
        }

        .employee-sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #e0e0e0;
          padding: 24px 0;
        }

        .employee-nav {
          display: flex;
          flex-direction: column;
        }

        .employee-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          color: #555;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }

        .employee-nav-link:hover {
          background: #f5f5f5;
          color: #667eea;
        }

        .employee-nav-link.active {
          background: #f0f2ff;
          color: #667eea;
          border-left-color: #667eea;
        }

        .nav-icon {
          width: 20px;
          height: 20px;
        }

        .employee-stats {
          margin-top: 32px;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #667eea;
        }

        .employee-main {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .employee-header {
            padding: 12px 16px;
          }

          .employee-portal-title {
            display: none;
          }

          .employee-sidebar {
            display: none;
          }

          .employee-main {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default EmployeeDashboardLayout;
