import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStats();
        setStats(response.data.stats);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
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
`;

export default AdminDashboard;
