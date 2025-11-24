import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const AdminTaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form data
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    priority: '',
    status: '',
    due_date: '',
    guidelines: '',
  });

  useEffect(() => {
    fetchTask();
    fetchEmployees();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTask(taskId);
      const taskData = response.data.task;
      setTask(taskData);
      setEditData({
        title: taskData.title || '',
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        status: taskData.status || 'pending',
        due_date: taskData.due_date ? taskData.due_date.split('T')[0] : '',
        guidelines: taskData.guidelines || '',
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await adminAPI.getEmployees();
      setEmployees(response.data.employees || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  const handleAssignTask = async (employeeId) => {
    try {
      await adminAPI.assignTask(taskId, employeeId);
      setShowAssignModal(false);
      fetchTask();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign task');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateTask(taskId, editData);
      setShowEditModal(false);
      fetchTask();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;

    try {
      await adminAPI.deleteTask(taskId);
      navigate('/admin/tasks');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'status-pending',
      assigned: 'status-assigned',
      in_progress: 'status-in-progress',
      under_review: 'status-under-review',
      completed: 'status-completed',
      rejected: 'status-rejected',
    };
    return classes[status] || 'status-pending';
  };

  const getPriorityBadgeClass = (priority) => {
    const classes = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent',
    };
    return classes[priority] || 'priority-medium';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
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

  if (error || !task) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="error-box">{error || 'Task not found'}</div>
          <div className="back-link">
            <Link to="/admin/tasks">&larr; Back to Tasks</Link>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="page-header-with-actions">
          <div className="page-header">
            <h1>Task Details</h1>
            <p>View and manage task information</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setShowEditModal(true)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button className="btn-danger" onClick={handleDeleteTask}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <nav>
            <Link to="/admin" className="nav-tab">Dashboard</Link>
            <Link to="/admin/users" className="nav-tab">Users</Link>
            <Link to="/admin/plans" className="nav-tab">Plans</Link>
            <Link to="/admin/tasks" className="nav-tab active">Tasks</Link>
          </nav>
        </div>

        {/* Task Overview */}
        <div className="details-grid">
          {/* Main Info Card */}
          <div className="detail-card main-card">
            <div className="card-header">
              <h2>Task Information</h2>
            </div>
            <div className="card-body">
              <div className="detail-row">
                <div className="detail-label">Title</div>
                <div className="detail-value">{task.title}</div>
              </div>

              {task.description && (
                <div className="detail-row">
                  <div className="detail-label">Description</div>
                  <div className="detail-value">{task.description}</div>
                </div>
              )}

              <div className="detail-row">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                    {task.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Priority</div>
                <div className="detail-value">
                  <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Annotation Type</div>
                <div className="detail-value annotation-type">
                  {task.annotation_type?.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Due Date</div>
                <div className="detail-value">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
                </div>
              </div>
            </div>
          </div>

          {/* Project & Assignment Card */}
          <div className="detail-card">
            <div className="card-header">
              <h2>Project & Assignment</h2>
            </div>
            <div className="card-body">
              <div className="detail-row">
                <div className="detail-label">Project</div>
                <div className="detail-value">
                  {task.project ? (
                    <div>
                      <div className="project-name">{task.project.name}</div>
                      {task.project.description && (
                        <div className="project-desc">{task.project.description}</div>
                      )}
                    </div>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Assigned To</div>
                <div className="detail-value">
                  {task.assigned_employee ? (
                    <div className="employee-info-detail">
                      <div className="employee-name">
                        {task.assigned_employee.first_name} {task.assigned_employee.last_name}
                      </div>
                      <div className="employee-email">{task.assigned_employee.email}</div>
                      <button
                        className="btn-reassign"
                        onClick={() => setShowAssignModal(true)}
                      >
                        Reassign
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-primary-small"
                      onClick={() => setShowAssignModal(true)}
                    >
                      Assign Employee
                    </button>
                  )}
                </div>
              </div>

              {task.customer && (
                <div className="detail-row">
                  <div className="detail-label">Customer</div>
                  <div className="detail-value">
                    <div>{task.customer.full_name}</div>
                    <div className="customer-email">{task.customer.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Data Section */}
        {task.data && (
          <div className="detail-card">
            <div className="card-header">
              <h2>Task Data</h2>
            </div>
            <div className="card-body">
              <pre className="code-block">{JSON.stringify(task.data, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Guidelines Section */}
        {task.guidelines && (
          <div className="detail-card">
            <div className="card-header">
              <h2>Guidelines</h2>
            </div>
            <div className="card-body">
              <div className="guidelines-text">{task.guidelines}</div>
            </div>
          </div>
        )}

        {/* Timeline Section */}
        <div className="detail-card">
          <div className="card-header">
            <h2>Timeline</h2>
          </div>
          <div className="card-body">
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Task Created</div>
                  <div className="timeline-date">{formatDate(task.created_at)}</div>
                </div>
              </div>

              {task.assigned_at && (
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Assigned to {task.assigned_employee?.first_name}</div>
                    <div className="timeline-date">{formatDate(task.assigned_at)}</div>
                  </div>
                </div>
              )}

              {task.started_at && (
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Task Started</div>
                    <div className="timeline-date">{formatDate(task.started_at)}</div>
                  </div>
                </div>
              )}

              {task.completed_at && (
                <div className="timeline-item">
                  <div className="timeline-marker completed"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Task Completed</div>
                    <div className="timeline-date">{formatDate(task.completed_at)}</div>
                  </div>
                </div>
              )}

              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Last Updated</div>
                  <div className="timeline-date">{formatDate(task.updated_at)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="back-link">
          <Link to="/admin/tasks">&larr; Back to Tasks</Link>
        </div>
      </div>

      {/* Assign Task Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Task</h2>
              <button onClick={() => setShowAssignModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="employee-list">
                {employees.map(employee => (
                  <button
                    key={employee.id}
                    className="employee-card"
                    onClick={() => handleAssignTask(employee.id)}
                  >
                    <div className="employee-name">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="employee-email">{employee.email}</div>
                    {employee.role && (
                      <div className="employee-role">{employee.role}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAssignModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Task</h2>
              <button onClick={() => setShowEditModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleUpdateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({...editData, status: e.target.value})}
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="under_review">Under Review</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={editData.priority}
                      onChange={(e) => setEditData({...editData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={editData.due_date}
                    onChange={(e) => setEditData({...editData, due_date: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Guidelines</label>
                  <textarea
                    value={editData.guidelines}
                    onChange={(e) => setEditData({...editData, guidelines: e.target.value})}
                    rows="4"
                    placeholder="Instructions for annotators..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    margin-bottom: 24px;
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

  .page-header-with-actions {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    gap: 16px;
    flex-wrap: wrap;
  }

  .page-header {
    margin-bottom: 0;
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

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .btn-primary, .btn-secondary, .btn-danger {
    border: none;
    border-radius: 6px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #4f46e5;
    color: white;
  }

  .btn-primary:hover {
    background: #4338ca;
  }

  .btn-secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .btn-secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .btn-danger {
    background: #dc2626;
    color: white;
  }

  .btn-danger:hover {
    background: #b91c1c;
  }

  .btn-primary svg,
  .btn-secondary svg,
  .btn-danger svg {
    width: 16px;
    height: 16px;
  }

  .nav-tabs {
    margin-bottom: 32px;
    border-bottom: 1px solid #e5e7eb;
  }

  .nav-tabs nav {
    display: flex;
    gap: 32px;
    margin-bottom: -1px;
    overflow-x: auto;
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

  .details-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: 24px;
  }

  @media (min-width: 1024px) {
    .details-grid {
      grid-template-columns: 2fr 1fr;
    }
  }

  .detail-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 24px;
  }

  .detail-card.main-card {
    grid-column: 1;
  }

  .card-header {
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .card-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .card-body {
    padding: 24px;
  }

  .detail-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .detail-label {
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
  }

  .detail-value {
    font-size: 14px;
    color: #111827;
  }

  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
  }

  .status-pending {
    background: #f3f4f6;
    color: #6b7280;
  }

  .status-assigned {
    background: #dbeafe;
    color: #1e40af;
  }

  .status-in-progress {
    background: #fef3c7;
    color: #92400e;
  }

  .status-under-review {
    background: #e0e7ff;
    color: #3730a3;
  }

  .status-completed {
    background: #d1fae5;
    color: #065f46;
  }

  .status-rejected {
    background: #fee2e2;
    color: #991b1b;
  }

  .priority-low {
    background: #f3f4f6;
    color: #6b7280;
  }

  .priority-medium {
    background: #dbeafe;
    color: #1e40af;
  }

  .priority-high {
    background: #fed7aa;
    color: #9a3412;
  }

  .priority-urgent {
    background: #fecaca;
    color: #991b1b;
  }

  .annotation-type {
    text-transform: capitalize;
  }

  .project-name {
    font-weight: 500;
    color: #111827;
    margin-bottom: 4px;
  }

  .project-desc {
    font-size: 13px;
    color: #6b7280;
    margin-top: 4px;
  }

  .employee-info-detail {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .employee-name {
    font-weight: 500;
    color: #111827;
  }

  .employee-email {
    font-size: 13px;
    color: #6b7280;
  }

  .btn-reassign {
    background: transparent;
    color: #4f46e5;
    border: 1px solid #4f46e5;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 8px;
    width: fit-content;
    transition: all 0.2s;
  }

  .btn-reassign:hover {
    background: #4f46e5;
    color: white;
  }

  .btn-primary-small {
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary-small:hover {
    background: #4338ca;
  }

  .customer-email {
    font-size: 13px;
    color: #6b7280;
    margin-top: 4px;
  }

  .code-block {
    background: #1f2937;
    color: #e5e7eb;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 13px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    line-height: 1.5;
  }

  .guidelines-text {
    color: #374151;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .timeline {
    position: relative;
    padding-left: 32px;
  }

  .timeline::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: #e5e7eb;
  }

  .timeline-item {
    position: relative;
    padding-bottom: 24px;
  }

  .timeline-item:last-child {
    padding-bottom: 0;
  }

  .timeline-marker {
    position: absolute;
    left: -28px;
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    border: 2px solid #4f46e5;
  }

  .timeline-marker.completed {
    background: #10b981;
    border-color: #10b981;
  }

  .timeline-content {
    padding-left: 8px;
  }

  .timeline-title {
    font-weight: 500;
    color: #111827;
    margin-bottom: 4px;
  }

  .timeline-date {
    font-size: 13px;
    color: #6b7280;
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

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .close-btn {
    background: transparent;
    border: none;
    font-size: 28px;
    color: #6b7280;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .modal-body {
    padding: 24px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #e5e7eb;
  }

  .employee-list {
    display: grid;
    gap: 12px;
  }

  .employee-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
  }

  .employee-card:hover {
    border-color: #4f46e5;
    background: #f9fafb;
  }

  .employee-card .employee-name {
    font-weight: 500;
    color: #111827;
    margin-bottom: 4px;
  }

  .employee-card .employee-email {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .employee-role {
    font-size: 12px;
    color: #9ca3af;
  }

  @media (max-width: 768px) {
    .page-header-with-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .header-actions {
      justify-content: stretch;
    }

    .header-actions button {
      flex: 1;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }

    .detail-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .form-row {
      grid-template-columns: 1fr;
    }
  }
`;

export default AdminTaskDetail;
