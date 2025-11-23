import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { subscriptionsAPI } from '../services/api';

const syncSubscription = async () => {
  try {
    await subscriptionsAPI.sync();
  } catch (error) {
    console.error('Sync error:', error);
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, isLoading, refreshUser } = useAuthStore();
  const [portalLoading, setPortalLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Sync subscription from Stripe on page load (background)
  useEffect(() => {
    const syncInBackground = async () => {
      try {
        await syncSubscription();
        await refreshUser?.();
      } catch (error) {
        // Silent fail for background sync
        console.error('Background sync failed:', error);
      }
    };
    syncInBackground();
  }, []);

  // Check for checkout success
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setShowSuccessMessage(true);
      // Clear the URL params
      window.history.replaceState({}, '', '/dashboard');
      // Hide message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleManageBilling = async () => {
    try {
      setPortalLoading(true);
      const response = await subscriptionsAPI.portal();
      window.location.href = response.data.portal_url;
    } catch (error) {
      console.error('Portal error:', error);
      alert(error.response?.data?.error || 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: 'Active' },
      trialing: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', text: 'Trial' },
      past_due: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', text: 'Past Due' },
      canceled: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'Canceled' },
      inactive: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', text: 'No Plan' },
    };
    return badges[status] || badges.inactive;
  };

  const subscription = user?.subscription;
  const statusBadge = getStatusBadge(subscription?.status);

  return (
    <div className="dashboard-page">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-banner">
          <svg viewBox="0 0 20 20" fill="currentColor" className="success-icon">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Payment successful! Your subscription is now active.</span>
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img src="/merotai-logo.png" alt="Merot AI" height="32" style={{filter: 'brightness(0) invert(1)'}} />
          <h1>Dashboard</h1>
        </div>
        <div className="header-right">
          <span className="user-name">{user?.full_name}</span>
          <button onClick={handleLogout} className="logout-btn" disabled={isLoading}>
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>Welcome back, {user?.first_name}!</h2>
          <p>Manage your account and subscription from your dashboard.</p>
        </div>

        <div className="dashboard-grid">
          {/* Subscription Card */}
          <div className="info-card subscription-card">
            <div className="card-header">
              <h3>Subscription</h3>
              <span
                className="status-badge"
                style={{ color: statusBadge.color, background: statusBadge.bg }}
              >
                {statusBadge.text}
              </span>
            </div>

            {subscription?.current_plan ? (
              <div className="plan-details">
                <div className="plan-name">{subscription.current_plan.name}</div>
                {subscription.current_period_end && (
                  <div className="plan-period">
                    {subscription.status === 'canceled' ? 'Access until: ' : 'Renews: '}
                    {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-plan">
                <p>You don't have an active subscription.</p>
                <button
                  className="primary-btn"
                  onClick={() => navigate('/plans')}
                >
                  View Plans
                </button>
              </div>
            )}

            {subscription?.current_plan && (
              <button
                className="secondary-btn"
                onClick={handleManageBilling}
                disabled={portalLoading}
              >
                {portalLoading ? 'Opening...' : 'Manage Billing'}
              </button>
            )}
          </div>

          {/* Account Details Card */}
          <div className="info-card">
            <div className="card-header">
              <h3>Account Details</h3>
            </div>
            <div className="info-row">
              <span className="label">Name</span>
              <span className="value">{user?.full_name}</span>
            </div>
            <div className="info-row">
              <span className="label">Email</span>
              <span className="value">{user?.email}</span>
            </div>
            {user?.company_name && (
              <div className="info-row">
                <span className="label">Company</span>
                <span className="value">{user?.company_name}</span>
              </div>
            )}
            <div className="info-row">
              <span className="label">Member since</span>
              <span className="value">
                {user?.created_at && new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="info-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="actions-list">
              {user?.admin && (
                <button className="action-btn admin-btn" onClick={() => navigate('/admin')}>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                  Admin Dashboard
                </button>
              )}
              <button className="action-btn" onClick={() => navigate('/plans')}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {subscription?.current_plan ? 'Change Plan' : 'Subscribe to a Plan'}
              </button>
              <button className="action-btn" onClick={() => navigate('/#contact')}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Contact Support
              </button>
              <a href="https://docs.merot.ai" target="_blank" rel="noopener noreferrer" className="action-btn">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Documentation
              </a>
            </div>
          </div>

          {/* Usage Stats Card (Placeholder) */}
          <div className="info-card">
            <div className="card-header">
              <h3>Usage This Month</h3>
            </div>
            <div className="usage-placeholder">
              <svg viewBox="0 0 20 20" fill="currentColor" className="usage-icon">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <p>Usage tracking coming soon!</p>
              <span className="hint">You'll see your annotation usage and API calls here.</span>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0A0E14 0%, #1a1f2e 100%);
        }

        .success-banner {
          background: rgba(16, 185, 129, 0.1);
          border-bottom: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          padding: 12px 32px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
        }

        .success-icon {
          width: 20px;
          height: 20px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-left h1 {
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-name {
          color: #8892a0;
          font-size: 14px;
        }

        .logout-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .logout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .dashboard-content {
          padding: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .welcome-card {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 32px;
        }

        .welcome-card h2 {
          color: #ffffff;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .welcome-card p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h3 {
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .plan-details {
          margin-bottom: 20px;
        }

        .plan-name {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .plan-period {
          color: #8892a0;
          font-size: 14px;
        }

        .no-plan {
          text-align: center;
          padding: 20px 0;
        }

        .no-plan p {
          color: #8892a0;
          margin-bottom: 16px;
        }

        .primary-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .secondary-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .secondary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row .label {
          color: #8892a0;
          font-size: 14px;
        }

        .info-row .value {
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 14px 16px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .action-btn svg {
          width: 20px;
          height: 20px;
          color: #3b82f6;
        }

        .admin-btn {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .admin-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
        }

        .admin-btn svg {
          color: #8b5cf6;
        }

        .usage-placeholder {
          text-align: center;
          padding: 24px;
          color: #8892a0;
        }

        .usage-icon {
          width: 48px;
          height: 48px;
          color: #3b82f6;
          opacity: 0.5;
          margin-bottom: 16px;
        }

        .usage-placeholder p {
          color: #ffffff;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .hint {
          font-size: 14px;
          color: #6b7280;
        }

        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 16px;
          }

          .dashboard-content {
            padding: 16px;
          }

          .header-left h1 {
            display: none;
          }

          .welcome-card {
            padding: 24px;
          }

          .welcome-card h2 {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
