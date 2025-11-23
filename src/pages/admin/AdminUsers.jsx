import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, per_page: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleToggleAdmin = async (user) => {
    if (!confirm(`Are you sure you want to ${user.admin ? 'remove' : 'grant'} admin privileges for ${user.full_name}?`)) {
      return;
    }

    try {
      await adminAPI.updateUser(user.id, { admin: !user.admin });
      fetchUsers(pagination?.current_page || 1);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      active: 'status-active',
      trialing: 'status-trialing',
      past_due: 'status-past-due',
      canceled: 'status-canceled',
      inactive: 'status-inactive',
    };
    return statusMap[status] || 'status-inactive';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="page-header">
          <h1>User Management</h1>
          <p>Manage platform users and their subscriptions</p>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <nav>
            <Link to="/admin" className="nav-tab">Dashboard</Link>
            <Link to="/admin/users" className="nav-tab active">Users</Link>
            <Link to="/admin/plans" className="nav-tab">Plans</Link>
          </nav>
        </div>

        {/* Filters */}
        <div className="filters-card">
          <form onSubmit={handleSearch} className="filters-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-select"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="table-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Last Sign In</th>
                <th>Joined</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="table-loading">
                    <div className="spinner"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{user.full_name}</div>
                        <div className="user-email">{user.email}</div>
                        {user.company_name && (
                          <div className="user-company">{user.company_name}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="plan-text">
                        {user.current_plan?.name || 'No Plan'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(user.subscription_status)}`}>
                        {user.subscription_status || 'inactive'}
                      </span>
                    </td>
                    <td className="date-cell">
                      {formatDate(user.last_sign_in_at)}
                    </td>
                    <td className="date-cell">
                      {formatDate(user.created_at)}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleAdmin(user)}
                        className={`admin-toggle ${user.admin ? 'is-admin' : ''}`}
                      >
                        {user.admin ? 'Admin' : 'User'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing page {pagination.current_page} of {pagination.total_pages} ({pagination.total_count} users)
              </div>
              <div className="pagination-buttons">
                <button
                  onClick={() => fetchUsers(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchUsers(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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

  .filters-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 16px;
    margin-bottom: 24px;
  }

  .filters-form {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .search-input-wrapper {
    flex: 1;
    min-width: 200px;
  }

  .search-input {
    width: 100%;
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
  }

  .search-input:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }

  .status-select {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .status-select:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }

  .search-button {
    padding: 8px 24px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .search-button:hover {
    background: #4338ca;
  }

  .error-box {
    background: #fef2f2;
    color: #b91c1c;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  .table-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .users-table {
    width: 100%;
    border-collapse: collapse;
  }

  .users-table thead {
    background: #f9fafb;
  }

  .users-table th {
    padding: 12px 24px;
    text-align: left;
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .users-table td {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    vertical-align: middle;
  }

  .users-table tbody tr:hover {
    background: #f9fafb;
  }

  .table-loading, .table-empty {
    text-align: center;
    padding: 48px 24px !important;
    color: #6b7280;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .user-info {
    white-space: nowrap;
  }

  .user-name {
    font-weight: 500;
    color: #111827;
  }

  .user-email {
    font-size: 14px;
    color: #6b7280;
    margin-top: 2px;
  }

  .user-company {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 2px;
  }

  .plan-text {
    font-size: 14px;
    color: #111827;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-active {
    background: #dcfce7;
    color: #166534;
  }

  .status-trialing {
    background: #dbeafe;
    color: #1e40af;
  }

  .status-past-due {
    background: #fef3c7;
    color: #92400e;
  }

  .status-canceled {
    background: #fee2e2;
    color: #991b1b;
  }

  .status-inactive {
    background: #f3f4f6;
    color: #4b5563;
  }

  .date-cell {
    font-size: 14px;
    color: #6b7280;
    white-space: nowrap;
  }

  .admin-toggle {
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    background: #f3f4f6;
    color: #4b5563;
  }

  .admin-toggle:hover {
    background: #e5e7eb;
  }

  .admin-toggle.is-admin {
    background: #f3e8ff;
    color: #7c3aed;
  }

  .admin-toggle.is-admin:hover {
    background: #ede9fe;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    border-top: 1px solid #e5e7eb;
    background: white;
  }

  .pagination-info {
    font-size: 14px;
    color: #374151;
  }

  .pagination-buttons {
    display: flex;
    gap: 8px;
  }

  .pagination-btn {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .pagination-btn:hover:not(:disabled) {
    background: #f9fafb;
  }

  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

export default AdminUsers;
