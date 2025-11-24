import useEmployeeAuthStore from '../../stores/employeeAuthStore';

function EmployeeDashboard() {
  const { employee } = useEmployeeAuthStore();

  return (
    <div className="employee-dashboard-home">
      <h1>Welcome back, {employee?.first_name}!</h1>
      <p className="subtitle">Ready to annotate some data?</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon" style={{ background: '#e3f2fd' }}>
            <svg fill="none" stroke="#2196f3" viewBox="0 0 24 24" width="32" height="32">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3>My Tasks</h3>
          <p>View and work on your assigned annotation tasks</p>
          <a href="/employee/tasks" className="card-link">Go to Tasks →</a>
        </div>

        <div className="dashboard-card">
          <div className="card-icon" style={{ background: '#f3e5f5' }}>
            <svg fill="none" stroke="#9c27b0" viewBox="0 0 24 24" width="32" height="32">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3>Performance</h3>
          <p>Track your quality scores and productivity</p>
          <span className="card-badge">Coming Soon</span>
        </div>

        <div className="dashboard-card">
          <div className="card-icon" style={{ background: '#e8f5e9' }}>
            <svg fill="none" stroke="#4caf50" viewBox="0 0 24 24" width="32" height="32">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3>Guidelines</h3>
          <p>Review annotation guidelines and best practices</p>
          <span className="card-badge">Coming Soon</span>
        </div>
      </div>

      <style>{`
        .employee-dashboard-home h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .subtitle {
          font-size: 16px;
          color: #666;
          margin-bottom: 32px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .dashboard-card {
          background: white;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }

        .dashboard-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .card-icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .dashboard-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .dashboard-card p {
          font-size: 14px;
          color: #666;
          margin-bottom: 16px;
        }

        .card-link {
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .card-link:hover {
          text-decoration: underline;
        }

        .card-badge {
          display: inline-block;
          background: #ffeaa7;
          color: #2d3436;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default EmployeeDashboard;
