import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await adminAPI.getPlans();
      setPlans(response.data.plans);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load plans');
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

  const handleToggleActive = async (plan) => {
    try {
      await adminAPI.updatePlan(plan.id, { active: !plan.active });
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update plan');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updatePlan(editingPlan.id, {
        name: editingPlan.name,
        description: editingPlan.description,
      });
      setEditingPlan(null);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update plan');
    }
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

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="page-header">
          <h1>Plan Management</h1>
          <p>View and manage subscription plans</p>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <nav>
            <Link to="/admin" className="nav-tab">Dashboard</Link>
            <Link to="/admin/users" className="nav-tab">Users</Link>
            <Link to="/admin/plans" className="nav-tab active">Plans</Link>
          </nav>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${!plan.active ? 'inactive' : ''}`}
            >
              <div className="plan-card-content">
                <div className="plan-header">
                  <div>
                    <h3 className="plan-name">{plan.name}</h3>
                    <p className="plan-slug">{plan.slug}</p>
                  </div>
                  <span className={`status-pill ${plan.active ? 'active' : ''}`}>
                    {plan.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="plan-price">
                  <span className="price-amount">{formatCurrency(plan.price_cents)}</span>
                  <span className="price-period">
                    /{plan.billing_period === 'yearly' ? 'year' : plan.billing_period === 'monthly' ? 'month' : 'one-time'}
                  </span>
                </div>

                <p className="plan-description">{plan.description}</p>

                {/* Features */}
                <div className="plan-features">
                  <h4>Features:</h4>
                  <ul>
                    {plan.features?.map((feature, index) => (
                      <li key={index}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stripe Info */}
                <div className="stripe-info">
                  <p><span>Stripe Product:</span> {plan.stripe_product_id || 'Not synced'}</p>
                  <p><span>Stripe Price:</span> {plan.stripe_price_id || 'Not synced'}</p>
                  <p><span>Subscribers:</span> {plan.subscriber_count}</p>
                </div>

                {/* Actions */}
                <div className="plan-actions">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`toggle-btn ${plan.active ? 'deactivate' : 'activate'}`}
                  >
                    {plan.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingPlan && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Edit Plan</h3>
              <form onSubmit={handleSaveEdit}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, name: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editingPlan.description}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, description: e.target.value })
                    }
                    rows={3}
                    className="form-input"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
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

  .error-box {
    background: #fef2f2;
    color: #b91c1c;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  .plans-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  @media (min-width: 768px) {
    .plans-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .plan-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: opacity 0.2s;
  }

  .plan-card.inactive {
    opacity: 0.6;
  }

  .plan-card-content {
    padding: 24px;
  }

  .plan-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .plan-name {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .plan-slug {
    font-size: 14px;
    color: #6b7280;
    margin: 4px 0 0 0;
  }

  .status-pill {
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
    background: #f3f4f6;
    color: #4b5563;
  }

  .status-pill.active {
    background: #dcfce7;
    color: #166534;
  }

  .plan-price {
    margin-bottom: 16px;
  }

  .price-amount {
    font-size: 30px;
    font-weight: 700;
    color: #111827;
  }

  .price-period {
    font-size: 14px;
    font-weight: 400;
    color: #6b7280;
  }

  .plan-description {
    color: #4b5563;
    margin: 0 0 16px 0;
    line-height: 1.5;
  }

  .plan-features {
    margin-bottom: 16px;
  }

  .plan-features h4 {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
    margin: 0 0 8px 0;
  }

  .plan-features ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .plan-features li {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #4b5563;
    margin-bottom: 4px;
  }

  .plan-features svg {
    width: 16px;
    height: 16px;
    color: #22c55e;
    margin-right: 8px;
    flex-shrink: 0;
  }

  .stripe-info {
    background: #f9fafb;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 24px;
  }

  .stripe-info p {
    font-size: 12px;
    color: #6b7280;
    margin: 0 0 4px 0;
  }

  .stripe-info p:last-child {
    margin-bottom: 0;
  }

  .stripe-info span {
    font-weight: 500;
  }

  .plan-actions {
    display: flex;
    gap: 12px;
  }

  .edit-btn {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .edit-btn:hover {
    background: #f9fafb;
  }

  .toggle-btn {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-btn.deactivate {
    background: #fee2e2;
    color: #b91c1c;
  }

  .toggle-btn.deactivate:hover {
    background: #fecaca;
  }

  .toggle-btn.activate {
    background: #dcfce7;
    color: #166534;
  }

  .toggle-btn.activate:hover {
    background: #bbf7d0;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 50;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-width: 448px;
    width: 100%;
    padding: 24px;
  }

  .modal-content h3 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 16px 0;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 4px;
  }

  .form-input {
    width: 100%;
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .form-input:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }

  textarea.form-input {
    resize: vertical;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .cancel-btn {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn:hover {
    background: #f9fafb;
  }

  .save-btn {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: white;
    background: #4f46e5;
    cursor: pointer;
    transition: all 0.2s;
  }

  .save-btn:hover {
    background: #4338ca;
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

export default AdminPlans;
