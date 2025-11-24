import { useState, useEffect } from 'react';
import { employeeAPI } from '../../services/api';

function EmployeeAnalytics() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [statsResponse, leaderboardResponse] = await Promise.all([
        employeeAPI.getPersonalAnalytics({ start_date: startDate, end_date: endDate }),
        employeeAPI.getLeaderboard({ start_date: startDate, end_date: endDate })
      ]);

      setStats(statsResponse.data.stats);
      setLeaderboard(leaderboardResponse.data.leaderboard || []);
      setError(null);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const renderTrendChart = () => {
    if (!stats?.trends || stats.trends.length === 0) return null;

    const maxTasks = Math.max(...stats.trends.map(t => t.tasks_completed), 1);
    const chartHeight = 200;

    return (
      <div className="trend-chart">
        <h3>12-Week Performance Trend</h3>
        <div className="chart-container">
          <div className="chart-bars">
            {stats.trends.map((trend, index) => {
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="employee-analytics">
      <div className="analytics-header">
        <div>
          <h1>Performance Analytics</h1>
          <p>Track your performance and progress</p>
        </div>
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

      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon tasks">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Tasks Completed</span>
            <span className="stat-value">{stats?.overview?.total_tasks_completed || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon quality">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Quality Score</span>
            <span className="stat-value">{stats?.overview?.quality_score || 'N/A'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon time">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Avg Time per Task</span>
            <span className="stat-value">{stats?.overview?.avg_time_per_task || 0} min</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Completion Rate</span>
            <span className="stat-value">{stats?.performance?.completion_rate || 0}%</span>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="status-section">
        <h2>Current Status</h2>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-value">{stats?.overview?.tasks_in_progress || 0}</span>
            <span className="status-label">In Progress</span>
          </div>
          <div className="status-item">
            <span className="status-value">{stats?.overview?.tasks_pending || 0}</span>
            <span className="status-label">Pending</span>
          </div>
          <div className="status-item">
            <span className="status-value">{stats?.overview?.total_annotations || 0}</span>
            <span className="status-label">Total Annotations</span>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      {stats?.quality && (
        <div className="quality-section">
          <h2>Quality Metrics</h2>
          <div className="quality-grid">
            <div className="quality-item">
              <span className="quality-label">Total Reviews</span>
              <span className="quality-value">{stats.quality.total_reviews || 0}</span>
            </div>
            <div className="quality-item approved">
              <span className="quality-label">Approved</span>
              <span className="quality-value">{stats.quality.approved || 0}</span>
            </div>
            <div className="quality-item rejected">
              <span className="quality-label">Rejected</span>
              <span className="quality-value">{stats.quality.rejected || 0}</span>
            </div>
            <div className="quality-item revision">
              <span className="quality-label">Needs Revision</span>
              <span className="quality-value">{stats.quality.needs_revision || 0}</span>
            </div>
            <div className="quality-item rate">
              <span className="quality-label">Approval Rate</span>
              <span className="quality-value">{stats.quality.approval_rate || 0}%</span>
            </div>
            <div className="quality-item score">
              <span className="quality-label">Avg Quality Score</span>
              <span className="quality-value">{stats.quality.avg_quality_score || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      {renderTrendChart()}

      {/* Task Breakdown */}
      {stats?.performance?.by_type && Object.keys(stats.performance.by_type).length > 0 && (
        <div className="breakdown-section">
          <h2>Tasks by Type</h2>
          <div className="breakdown-grid">
            {Object.entries(stats.performance.by_type).map(([type, count]) => (
              <div key={type} className="breakdown-item">
                <span className="breakdown-type">{type.replace('_', ' ')}</span>
                <div className="breakdown-bar">
                  <div
                    className="breakdown-fill"
                    style={{
                      width: `${(count / stats.overview.total_tasks_completed) * 100}%`
                    }}
                  />
                </div>
                <span className="breakdown-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="leaderboard-section">
          <h2>Leaderboard - Top Performers</h2>
          <div className="leaderboard-list">
            {leaderboard.map((employee, index) => (
              <div key={employee.id} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                <div className="rank">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="employee-info">
                  <span className="employee-name">{employee.full_name}</span>
                  <div className="employee-stats-small">
                    <span>{employee.tasks_completed} tasks</span>
                    <span className="divider">•</span>
                    <span>Quality: {employee.quality_score || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .employee-analytics {
          max-width: 1200px;
        }

        .analytics-loading,
        .analytics-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .analytics-loading p,
        .analytics-error p {
          font-size: 16px;
          color: #666;
        }

        .analytics-error p {
          color: #c33;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .analytics-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .analytics-header p {
          font-size: 16px;
          color: #666;
        }

        .date-range-select {
          padding: 10px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .date-range-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          gap: 16px;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon svg {
          width: 28px;
          height: 28px;
          color: white;
        }

        .stat-icon.tasks {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-icon.quality {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .stat-icon.time {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .stat-icon.progress {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .status-section,
        .quality-section,
        .trend-chart,
        .breakdown-section,
        .leaderboard-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        h2 {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 20px;
        }

        h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 24px;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .status-value {
          font-size: 36px;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 8px;
        }

        .status-label {
          font-size: 13px;
          color: #888;
          text-transform: uppercase;
        }

        .quality-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .quality-item {
          background: #f5f7fa;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .quality-item.approved {
          background: #e8f5e9;
        }

        .quality-item.rejected {
          background: #ffebee;
        }

        .quality-item.revision {
          background: #fff3e0;
        }

        .quality-item.rate,
        .quality-item.score {
          background: #e3f2fd;
        }

        .quality-label {
          font-size: 12px;
          color: #666;
          font-weight: 600;
        }

        .quality-value {
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }

        .chart-container {
          height: 220px;
          padding: 16px 0;
        }

        .chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 100%;
          gap: 4px;
        }

        .chart-bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
        }

        .chart-bar {
          width: 100%;
          background: linear-gradient(to top, #667eea, #764ba2);
          border-radius: 4px 4px 0 0;
          min-height: 20px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 4px;
          transition: all 0.3s;
        }

        .chart-bar:hover {
          opacity: 0.8;
        }

        .bar-value {
          font-size: 11px;
          font-weight: 600;
          color: white;
        }

        .bar-label {
          font-size: 10px;
          color: #888;
          margin-top: 4px;
        }

        .breakdown-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .breakdown-item {
          display: grid;
          grid-template-columns: 200px 1fr 60px;
          gap: 16px;
          align-items: center;
        }

        .breakdown-type {
          font-size: 14px;
          color: #333;
          font-weight: 500;
          text-transform: capitalize;
        }

        .breakdown-bar {
          height: 24px;
          background: #f0f0f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .breakdown-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s;
        }

        .breakdown-count {
          font-size: 16px;
          font-weight: 700;
          color: #667eea;
          text-align: right;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f5f7fa;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .leaderboard-item.top-three {
          background: linear-gradient(135deg, #fff9e6 0%, #ffe8cc 100%);
          border: 2px solid #ffd54f;
        }

        .leaderboard-item:hover {
          transform: translateX(4px);
        }

        .rank {
          font-size: 24px;
          font-weight: 700;
          color: #667eea;
          min-width: 48px;
          text-align: center;
        }

        .employee-info {
          flex: 1;
        }

        .employee-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          display: block;
          margin-bottom: 4px;
        }

        .employee-stats-small {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 13px;
          color: #666;
        }

        .divider {
          color: #ddd;
        }

        @media (max-width: 768px) {
          .analytics-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .breakdown-item {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .breakdown-count {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}

export default EmployeeAnalytics;
