import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const AdminTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    project_id: '',
    priority: '',
    employee_id: '',
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Form data for creating task
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    priority: 'medium',
    annotation_type: 'text_classification',
    data: '',
    guidelines: '',
    due_date: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchEmployees();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.project_id) params.project_id = filters.project_id;
      if (filters.priority) params.priority = filters.priority;
      if (filters.employee_id) params.employee_id = filters.employee_id;

      const response = await adminAPI.getTasks(params);
      setTasks(response.data.tasks || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await adminAPI.getProjects();
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createTask(formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        project_id: '',
        priority: 'medium',
        annotation_type: 'text_classification',
        data: '',
        guidelines: '',
        due_date: '',
      });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleAssignTask = async (employeeId) => {
    try {
      if (selectedTasks.length > 1) {
        await adminAPI.bulkAssignTasks(selectedTasks, employeeId);
      } else if (selectedTask) {
        await adminAPI.assignTask(selectedTask.id, employeeId);
      }
      setShowAssignModal(false);
      setSelectedTask(null);
      setSelectedTasks([]);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await adminAPI.deleteTask(taskId);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(t => t.id));
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

  if (loading && tasks.length === 0) {
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
          <h1>Task Management</h1>
          <p>Create, assign, and manage annotation tasks</p>
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

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Task
            </button>
            {selectedTasks.length > 0 && (
              <button
                className="btn-secondary"
                onClick={() => setShowAssignModal(true)}
              >
                Assign {selectedTasks.length} Task{selectedTasks.length > 1 ? 's' : ''}
              </button>
            )}
          </div>
          <div className="toolbar-right">
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={filters.project_id}
            onChange={(e) => handleFilterChange('project_id', e.target.value)}
            className="filter-select"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          <select
            value={filters.employee_id}
            onChange={(e) => handleFilterChange('employee_id', e.target.value)}
            className="filter-select"
          >
            <option value="">All Employees</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="error-box">{error}</div>
        )}

        {/* Tasks Table */}
        <div className="table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th style={{width: '40px'}}>
                  <input
                    type="checkbox"
                    checked={selectedTasks.length === tasks.length && tasks.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th style={{width: '120px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    No tasks found. Create your first task to get started.
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleSelectTask(task.id)}
                      />
                    </td>
                    <td>
                      <div className="task-info">
                        <div className="task-title">{task.title}</div>
                        <div className="task-type">{task.annotation_type?.replace(/_/g, ' ')}</div>
                      </div>
                    </td>
                    <td>
                      <span className="project-name">{task.project?.name || 'N/A'}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                        {task.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      {task.assigned_employee ? (
                        <div className="employee-info">
                          {task.assigned_employee.first_name} {task.assigned_employee.last_name}
                        </div>
                      ) : (
                        <button
                          className="btn-assign"
                          onClick={() => {
                            setSelectedTask(task);
                            setShowAssignModal(true);
                          }}
                        >
                          Assign
                        </button>
                      )}
                    </td>
                    <td>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => navigate(`/admin/tasks/${task.id}`)}
                          title="View Details"
                        >
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete"
                        >
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Back Link */}
        <div className="back-link">
          <Link to="/admin">&larr; Back to Dashboard</Link>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Project *</label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Annotation Type</label>
                    <select
                      value={formData.annotation_type}
                      onChange={(e) => setFormData({...formData, annotation_type: e.target.value})}
                    >
                      <option value="text_classification">Text Classification</option>
                      <option value="named_entity_recognition">Named Entity Recognition</option>
                      <option value="image_classification">Image Classification</option>
                      <option value="bounding_box">Bounding Box</option>
                      <option value="semantic_segmentation">Semantic Segmentation</option>
                      <option value="audio_transcription">Audio Transcription</option>
                      <option value="video_annotation">Video Annotation</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Task Data (JSON)</label>
                  <textarea
                    value={formData.data}
                    onChange={(e) => setFormData({...formData, data: e.target.value})}
                    rows="4"
                    placeholder='{"text": "Example data..."}'
                  />
                </div>

                <div className="form-group">
                  <label>Guidelines</label>
                  <textarea
                    value={formData.guidelines}
                    onChange={(e) => setFormData({...formData, guidelines: e.target.value})}
                    rows="3"
                    placeholder="Instructions for annotators..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Task{selectedTasks.length > 1 ? 's' : ''}</h2>
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

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
  }

  .toolbar-left {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .toolbar-right {
    flex: 1;
    max-width: 320px;
  }

  .btn-primary {
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
  }

  .btn-primary:hover {
    background: #4338ca;
  }

  .btn-primary svg {
    width: 16px;
    height: 16px;
  }

  .btn-secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .search-input {
    width: 100%;
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
  }

  .search-input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .filters {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .filter-select {
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    cursor: pointer;
  }

  .filter-select:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .table-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 32px;
  }

  .tasks-table {
    width: 100%;
    border-collapse: collapse;
  }

  .tasks-table thead {
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .tasks-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tasks-table td {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .tasks-table tbody tr:hover {
    background: #f9fafb;
  }

  .tasks-table tbody tr:last-child td {
    border-bottom: none;
  }

  .empty-state {
    text-align: center;
    color: #6b7280;
    padding: 48px 16px !important;
  }

  .task-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .task-title {
    font-weight: 500;
    color: #111827;
  }

  .task-type {
    font-size: 12px;
    color: #6b7280;
    text-transform: capitalize;
  }

  .project-name {
    font-size: 14px;
    color: #374151;
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

  .employee-info {
    font-size: 14px;
    color: #374151;
  }

  .btn-assign {
    background: transparent;
    color: #4f46e5;
    border: 1px solid #4f46e5;
    border-radius: 4px;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-assign:hover {
    background: #4f46e5;
    color: white;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .btn-icon {
    background: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .btn-icon:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .btn-icon.btn-danger:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  .btn-icon svg {
    width: 18px;
    height: 18px;
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

  .employee-name {
    font-weight: 500;
    color: #111827;
    margin-bottom: 4px;
  }

  .employee-email {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .employee-role {
    font-size: 12px;
    color: #9ca3af;
  }

  @media (max-width: 768px) {
    .toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .toolbar-right {
      max-width: none;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .table-container {
      overflow-x: auto;
    }

    .tasks-table {
      min-width: 800px;
    }
  }
`;

export default AdminTasks;
