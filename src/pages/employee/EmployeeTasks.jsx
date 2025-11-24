import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../services/api';

function EmployeeTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    task_type: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getTasks(filters);
      setTasks(response.data.tasks);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa726',
      assigned: '#42a5f5',
      in_progress: '#66bb6a',
      completed: '#26a69a',
      review: '#ab47bc',
      approved: '#4caf50',
      rejected: '#ef5350'
    };
    return colors[status] || '#999';
  };

  return (
    <div className="employee-tasks">
      <div className="tasks-header">
        <h1>My Tasks</h1>
        <p>View and manage your assigned annotation tasks</p>
      </div>

      <div className="tasks-filters">
        <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
          <option value="">All Statuses</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select name="task_type" value={filters.task_type} onChange={handleFilterChange} className="filter-select">
          <option value="">All Types</option>
          <option value="text_classification">Text Classification</option>
          <option value="image_annotation">Image Annotation</option>
          <option value="audio_transcription">Audio Transcription</option>
          <option value="video_annotation">Video Annotation</option>
        </select>
      </div>

      {loading ? (
        <div className="tasks-loading">Loading tasks...</div>
      ) : error ? (
        <div className="tasks-error">{error}</div>
      ) : tasks.length === 0 ? (
        <div className="tasks-empty">
          <p>No tasks found</p>
          <span>Tasks will appear here once assigned to you</span>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <span className="task-id">#{task.id}</span>
                <span
                  className="task-status"
                  style={{ background: getStatusColor(task.status), color: 'white' }}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <div className="task-body">
                <h3 className="task-project">{task.project.name}</h3>
                <p className="task-type">{task.task_type.replace('_', ' ')}</p>

                {task.is_overdue && (
                  <span className="task-overdue">⚠️ Overdue</span>
                )}
              </div>

              <div className="task-footer">
                {task.due_date && (
                  <span className="task-due">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
                <button
                  className="task-action-btn"
                  onClick={() => navigate(`/employee/tasks/${task.id}`)}
                >
                  View Task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .employee-tasks {
          max-width: 1200px;
        }

        .tasks-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .tasks-header p {
          font-size: 16px;
          color: #666;
          margin-bottom: 32px;
        }

        .tasks-filters {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .filter-select {
          padding: 10px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .filter-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .tasks-loading,
        .tasks-error,
        .tasks-empty {
          text-align: center;
          padding: 48px;
          background: white;
          border-radius: 12px;
        }

        .tasks-error {
          color: #c33;
        }

        .tasks-empty p {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .tasks-empty span {
          font-size: 14px;
          color: #666;
        }

        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .task-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .task-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .task-id {
          font-size: 12px;
          color: #888;
          font-weight: 600;
        }

        .task-status {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .task-body {
          margin-bottom: 16px;
        }

        .task-project {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .task-type {
          font-size: 14px;
          color: #666;
          text-transform: capitalize;
          margin-bottom: 8px;
        }

        .task-overdue {
          display: inline-block;
          color: #ef5350;
          font-size: 12px;
          font-weight: 600;
        }

        .task-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }

        .task-due {
          font-size: 12px;
          color: #888;
        }

        .task-action-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .task-action-btn:hover {
          background: #5568d3;
        }

        @media (max-width: 768px) {
          .tasks-filters {
            flex-direction: column;
          }

          .filter-select {
            width: 100%;
          }

          .tasks-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default EmployeeTasks;
