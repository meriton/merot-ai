import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { employeeAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [teamAnalytics, setTeamAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30'); // days
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [statsResponse, teamResponse] = await Promise.all([
        adminAPI.getStats(),
        employeeAPI.getTeamAnalytics({ start_date: startDate, end_date: endDate })
      ]);

      setStats(statsResponse.data.stats);
      setTeamAnalytics(teamResponse.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let response;
      let filename;

      switch (type) {
        case 'annotations':
          response = await employeeAPI.exportAnnotations({
            format: 'csv',
            start_date: startDate,
            end_date: endDate
          });
          filename = `annotations_${startDate}_to_${endDate}.csv`;
          break;
        case 'tasks':
          response = await employeeAPI.exportTasks({
            format: 'csv',
            start_date: startDate,
            end_date: endDate
          });
          filename = `tasks_${startDate}_to_${endDate}.csv`;
          break;
        case 'performance':
          response = await employeeAPI.exportPerformance({
            start_date: startDate,
            end_date: endDate
          });
          filename = `performance_${startDate}_to_${endDate}.json`;
          break;
        default:
          return;
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([JSON.stringify(response.data)]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setExporting(false);
    }
  };

  const renderTeamChart = () => {
    if (!teamAnalytics?.team_performance?.trends || teamAnalytics.team_performance.trends.length === 0) {
      return null;
    }

    const trends = teamAnalytics.team_performance.trends;
    const maxTasks = Math.max(...trends.map(t => t.tasks_completed), 1);

    return (
      <div className="trend-chart">
        <div className="chart-bars">
          {trends.map((trend, index) => {
            const height = (trend.tasks_completed / maxTasks) * 100;
            return (
              <div key={index} className="chart-bar-wrapper">
                <div
                  className="chart-bar"
                  style={{ height: `${height}%` }}
                  title={`Week ${trend.week}: ${trend.tasks_completed} tasks`}
                >
                  <span className="bar-value">{trend.tasks_completed}</span>
                </div>
                <span className="bar-label">W{index + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="error-box">{error}</div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Overview of your platform metrics</p>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <nav>
            <Link to="/admin" className="nav-tab active">Dashboard</Link>
            <Link to="/admin/users" className="nav-tab">Users</Link>
            <Link to="/admin/plans" className="nav-tab">Plans</Link>
          </nav>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon indigo">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="stat-text">
                <p className="stat-label">Total Users</p>
                <p className="stat-value">{stats.total_users}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="stat-text">
                <p className="stat-label">New This Month</p>
                <p className="stat-value">{stats.users_this_month}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon yellow">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="stat-text">
                <p className="stat-label">Active Subscriptions</p>
                <p className="stat-value">{stats.active_subscriptions}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon purple">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-text">
                <p className="stat-label">MRR</p>
                <p className="stat-value">{formatCurrency(stats.mrr_cents)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Breakdown */}
        <div className="plans-breakdown">
          <div className="breakdown-header">
            <h2>Subscribers by Plan</h2>
          </div>
          <div className="breakdown-list">
            {stats.plans_breakdown?.map((plan) => (
              <div key={plan.id} className="breakdown-item">
                <div>
                  <p className="plan-name">{plan.name}</p>
                  <p className="plan-slug">{plan.slug}</p>
                </div>
                <div className="plan-stats">
                  <p className="subscriber-count">{plan.subscriber_count}</p>
                  <p className="subscriber-label">subscribers</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider">
          <h2>Annotation Platform Analytics</h2>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {/* Team Performance Stats */}
        {teamAnalytics && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-icon blue">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="stat-text">
                    <p className="stat-label">Total Tasks</p>
                    <p className="stat-value">{teamAnalytics.overview?.total_tasks || 0}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-icon green">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="stat-text">
                    <p className="stat-label">Completed</p>
                    <p className="stat-value">{teamAnalytics.overview?.tasks_completed || 0}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-icon orange">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="stat-text">
                    <p className="stat-label">Avg Time/Task</p>
                    <p className="stat-value">{teamAnalytics.overview?.avg_time_per_task || 0} min</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-icon teal">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="stat-text">
                    <p className="stat-label">Quality Score</p>
                    <p className="stat-value">{teamAnalytics.quality?.avg_quality_score || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Trend */}
            {teamAnalytics.team_performance?.trends && (
              <div className="chart-section">
                <div className="chart-header">
                  <h2>Team Performance Trend</h2>
                  <p>Tasks completed over the last 12 weeks</p>
                </div>
                {renderTeamChart()}
              </div>
            )}

            {/* Project Breakdown */}
            {teamAnalytics.projects && teamAnalytics.projects.length > 0 && (
              <div className="projects-section">
                <div className="section-header">
                  <h2>Project Progress</h2>
                </div>
                <div className="projects-grid">
                  {teamAnalytics.projects.map((project) => (
                    <div key={project.project_id} className="project-card">
                      <div className="project-header">
                        <h3>{project.project_name}</h3>
                        <span className="project-count">{project.tasks_completed}/{project.total_tasks} tasks</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${(project.tasks_completed / project.total_tasks) * 100}%` }}
                        />
                      </div>
                      <div className="project-stats">
                        <span>Quality: {project.avg_quality_score || 'N/A'}</span>
                        <span>Approval: {project.approval_rate || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Employee Performance */}
            {teamAnalytics.employees && teamAnalytics.employees.length > 0 && (
              <div className="employees-section">
                <div className="section-header">
                  <h2>Employee Performance</h2>
                </div>
                <div className="employees-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Tasks</th>
                        <th>Quality</th>
                        <th>Approval Rate</th>
                        <th>Avg Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamAnalytics.employees.map((employee) => (
                        <tr key={employee.employee_id}>
                          <td className="employee-cell">
                            <div className="employee-name">{employee.full_name}</div>
                            <div className="employee-role">{employee.role}</div>
                          </td>
                          <td>{employee.tasks_completed}</td>
                          <td>
                            <span className="quality-badge">
                              {employee.quality_score || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span className={`approval-badge ${employee.approval_rate >= 90 ? 'high' : employee.approval_rate >= 70 ? 'medium' : 'low'}`}>
                              {employee.approval_rate || 0}%
                            </span>
                          </td>
                          <td>{employee.avg_time_per_task || 0} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Export Tools */}
            <div className="export-section">
              <div className="section-header">
                <h2>Export Reports</h2>
                <p>Download data for the selected date range</p>
              </div>
              <div className="export-buttons">
                <button
                  onClick={() => handleExport('annotations')}
                  disabled={exporting}
                  className="export-btn"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Annotations (CSV)
                </button>
                <button
                  onClick={() => handleExport('tasks')}
                  disabled={exporting}
                  className="export-btn"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Tasks (CSV)
                </button>
                <button
                  onClick={() => handleExport('performance')}
                  disabled={exporting}
                  className="export-btn"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Export Performance (JSON)
                </button>
              </div>
            </div>
          </>
        )}

        {/* Back to Dashboard Link */}
        <div className="back-link">
          <Link to="/dashboard">&larr; Back to User Dashboard</Link>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .admin-page {
    min-height: 100vh;
    background: #f3f4f6;
  }

  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid #e5e7eb;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-box {
    background: #fef2f2;
    color: #b91c1c;
    padding: 16px;
    border-radius: 8px;
  }

  .admin-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px 16px;
  }

  @media (min-width: 640px) {
    .admin-container { padding: 32px 24px; }
  }

  @media (min-width: 1024px) {
    .admin-container { padding: 32px; }
  }

  .page-header {
    margin-bottom: 32px;
  }

  .page-header h1 {
    font-size: 30px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .page-header p {
    margin-top: 8px;
    color: #4b5563;
  }

  .nav-tabs {
    margin-bottom: 32px;
    border-bottom: 1px solid #e5e7eb;
  }

  .nav-tabs nav {
    display: flex;
    gap: 32px;
    margin-bottom: -1px;
  }

  .nav-tab {
    padding: 16px 4px;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    text-decoration: none;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .nav-tab:hover {
    color: #374151;
    border-bottom-color: #d1d5db;
  }

  .nav-tab.active {
    color: #4f46e5;
    border-bottom-color: #4f46e5;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: 32px;
  }

  @media (min-width: 768px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (min-width: 1024px) {
    .stats-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .stat-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 24px;
  }

  .stat-content {
    display: flex;
    align-items: center;
  }

  .stat-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 6px;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon svg {
    width: 24px;
    height: 24px;
    color: white;
  }

  .stat-icon.indigo { background: #4f46e5; }
  .stat-icon.green { background: #22c55e; }
  .stat-icon.yellow { background: #eab308; }
  .stat-icon.purple { background: #a855f7; }

  .stat-text {
    margin-left: 16px;
  }

  .stat-label {
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    margin: 0;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: #111827;
    margin: 4px 0 0 0;
  }

  .plans-breakdown {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .breakdown-header {
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .breakdown-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .breakdown-list {
    divide-y: 1px solid #e5e7eb;
  }

  .breakdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .breakdown-item:last-child {
    border-bottom: none;
  }

  .plan-name {
    font-weight: 500;
    color: #111827;
    margin: 0;
  }

  .plan-slug {
    font-size: 14px;
    color: #6b7280;
    margin: 4px 0 0 0;
  }

  .plan-stats {
    text-align: right;
  }

  .subscriber-count {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .subscriber-label {
    font-size: 14px;
    color: #6b7280;
    margin: 4px 0 0 0;
  }

  .back-link {
    margin-top: 32px;
  }

  .back-link a {
    color: #4f46e5;
    font-weight: 500;
    text-decoration: none;
  }

  .back-link a:hover {
    color: #3730a3;
  }

  /* Section Divider */
  .section-divider {
    margin: 48px 0 32px 0;
    padding: 16px 0;
    border-top: 2px solid #e5e7eb;
    border-bottom: 2px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-divider h2 {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .date-range-select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    cursor: pointer;
  }

  .date-range-select:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  /* Additional Stat Icon Colors */
  .stat-icon.blue { background: #3b82f6; }
  .stat-icon.orange { background: #f97316; }
  .stat-icon.teal { background: #14b8a6; }

  /* Chart Section */
  .chart-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 24px;
    margin-bottom: 32px;
  }

  .chart-header {
    margin-bottom: 24px;
  }

  .chart-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 4px 0;
  }

  .chart-header p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  .trend-chart {
    padding: 16px;
  }

  .chart-bars {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 200px;
    padding: 16px 0;
  }

  .chart-bar-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .chart-bar {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px 4px 0 0;
    min-height: 20px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 4px;
    transition: all 0.3s;
    cursor: pointer;
  }

  .chart-bar:hover {
    opacity: 0.8;
    transform: translateY(-4px);
  }

  .bar-value {
    font-size: 11px;
    font-weight: 600;
    color: white;
  }

  .bar-label {
    font-size: 11px;
    color: #6b7280;
  }

  /* Projects Section */
  .projects-section {
    margin-bottom: 32px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 4px 0;
  }

  .section-header p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (min-width: 768px) {
    .projects-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (min-width: 1024px) {
    .projects-grid { grid-template-columns: repeat(3, 1fr); }
  }

  .project-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 20px;
  }

  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .project-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
    flex: 1;
  }

  .project-count {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
    white-space: nowrap;
    margin-left: 8px;
  }

  .progress-bar {
    height: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 12px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s;
  }

  .project-stats {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #6b7280;
  }

  /* Employees Section */
  .employees-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 24px;
    margin-bottom: 32px;
  }

  .employees-table {
    overflow-x: auto;
  }

  .employees-table table {
    width: 100%;
    border-collapse: collapse;
  }

  .employees-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
  }

  .employees-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .employees-table td {
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
  }

  .employees-table tbody tr:hover {
    background: #f9fafb;
  }

  .employee-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .employee-name {
    font-weight: 500;
    color: #111827;
  }

  .employee-role {
    font-size: 12px;
    color: #6b7280;
    text-transform: capitalize;
  }

  .quality-badge {
    display: inline-block;
    padding: 4px 10px;
    background: #e0e7ff;
    color: #3730a3;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
  }

  .approval-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
  }

  .approval-badge.high {
    background: #d1fae5;
    color: #065f46;
  }

  .approval-badge.medium {
    background: #fed7aa;
    color: #9a3412;
  }

  .approval-badge.low {
    background: #fee2e2;
    color: #991b1b;
  }

  /* Export Section */
  .export-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 24px;
    margin-bottom: 32px;
  }

  .export-buttons {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 16px;
  }

  @media (min-width: 768px) {
    .export-buttons { grid-template-columns: repeat(3, 1fr); }
  }

  .export-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
  }

  .export-btn:hover:not(:disabled) {
    border-color: #4f46e5;
    color: #4f46e5;
    background: #f9fafb;
  }

  .export-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .export-btn svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    .section-divider {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .date-range-select {
      width: 100%;
    }
  }
`;

export default AdminDashboard;
