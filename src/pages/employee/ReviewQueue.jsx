import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../services/api';

function ReviewQueue() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    project_id: '',
    annotation_type: '',
    annotator_id: '',
    start_date: '',
    end_date: '',
    sort_by: 'due_date' // due_date, priority, created_at
  });
  const [projects, setProjects] = useState([]);
  const [annotators, setAnnotators] = useState([]);
  const [selectedAnnotations, setSelectedAnnotations] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, [filters]);

  useEffect(() => {
    fetchFiltersData();
  }, []);

  const fetchFiltersData = async () => {
    try {
      // Fetch projects and annotators for filter dropdowns
      // Note: These endpoints would need to be added to the API if they don't exist
      // For now, we'll use placeholder data
      setProjects([]);
      setAnnotators([]);
    } catch (err) {
      console.error('Failed to load filter data:', err);
    }
  };

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getReviewQueue(filters);
      setTasks(response.data.tasks || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReviewClick = (task) => {
    navigate(`/employee/review/${task.annotation.id}`);
  };

  const handleSelectAnnotation = (annotationId) => {
    setSelectedAnnotations(prev =>
      prev.includes(annotationId)
        ? prev.filter(id => id !== annotationId)
        : [...prev, annotationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAnnotations.length === tasks.length) {
      setSelectedAnnotations([]);
    } else {
      setSelectedAnnotations(tasks.map(t => t.annotation.id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedAnnotations.length === 0) return;

    const qualityScore = prompt('Enter quality score (1-10):', '8');
    if (!qualityScore) return;

    if (!window.confirm(`Approve ${selectedAnnotations.length} annotations with quality score ${qualityScore}?`)) {
      return;
    }

    setBulkProcessing(true);
    try {
      const response = await employeeAPI.bulkApproveAnnotations(selectedAnnotations, {
        quality_score: parseInt(qualityScore)
      });

      alert(response.data.message);
      setSelectedAnnotations([]);
      fetchQueue(); // Refresh the queue
    } catch (err) {
      alert('Bulk approval failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedAnnotations.length === 0) return;

    const feedback = prompt(`Enter rejection feedback for ${selectedAnnotations.length} annotations:`);
    if (!feedback) return;

    if (!window.confirm(`Reject ${selectedAnnotations.length} annotations?`)) {
      return;
    }

    setBulkProcessing(true);
    try {
      const response = await employeeAPI.bulkRejectAnnotations(selectedAnnotations, {
        feedback: feedback
      });

      alert(response.data.message);
      setSelectedAnnotations([]);
      fetchQueue(); // Refresh the queue
    } catch (err) {
      alert('Bulk rejection failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setBulkProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      in_review: '#2196f3',
      approved: '#4caf50',
      rejected: '#f44336',
      needs_revision: '#9c27b0'
    };
    return colors[status] || '#999';
  };

  const getPriorityBadge = (priority) => {
    if (!priority) return null;

    const colors = {
      low: '#f5f5f5',
      medium: '#fff3e0',
      high: '#ffebee'
    };

    const textColors = {
      low: '#757575',
      medium: '#f57c00',
      high: '#c62828'
    };

    return (
      <span
        className="priority-badge"
        style={{
          background: colors[priority],
          color: textColors[priority]
        }}
      >
        {priority} priority
      </span>
    );
  };

  return (
    <div className="review-queue">
      <div className="queue-header">
        <div>
          <h1>Review Queue</h1>
          <p>Review and provide feedback on submitted annotations</p>
        </div>
        <div className="queue-stats">
          <div className="stat-box">
            <span className="stat-value">{tasks.length}</span>
            <span className="stat-label">In Queue</span>
          </div>
        </div>
      </div>

      <div className="queue-filters">
        <div className="filters-row">
          <select
            name="project_id"
            value={filters.project_id}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          <select
            name="annotation_type"
            value={filters.annotation_type}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="text_classification">Text Classification</option>
            <option value="named_entity_recognition">NER</option>
            <option value="sentiment_analysis">Sentiment</option>
            <option value="image_classification">Image Classification</option>
            <option value="bounding_box">Bounding Box</option>
            <option value="polygon_segmentation">Polygon</option>
            <option value="keypoint_annotation">Keypoint</option>
          </select>

          <select
            name="annotator_id"
            value={filters.annotator_id}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Annotators</option>
            {annotators.map(annotator => (
              <option key={annotator.id} value={annotator.id}>
                {annotator.first_name} {annotator.last_name}
              </option>
            ))}
          </select>

          <select
            name="sort_by"
            value={filters.sort_by}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="due_date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="created_at">Sort by Submitted Date</option>
          </select>
        </div>

        <div className="filters-row">
          <div className="date-filter">
            <label>From:</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="date-input"
            />
          </div>

          <div className="date-filter">
            <label>To:</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="date-input"
            />
          </div>

          <button
            onClick={() => setFilters({
              project_id: '',
              annotation_type: '',
              annotator_id: '',
              start_date: '',
              end_date: '',
              sort_by: 'due_date'
            })}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="queue-loading">
          <div className="loading-spinner"></div>
          <p>Loading queue...</p>
        </div>
      ) : error ? (
        <div className="queue-error">
          <p>{error}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="queue-empty">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No tasks in queue</p>
          <span>Tasks will appear here when submitted for review</span>
        </div>
      ) : (
        <>
          {/* Bulk Actions Toolbar */}
          {selectedAnnotations.length > 0 && (
            <div className="bulk-actions-toolbar">
              <div className="toolbar-left">
                <span className="selected-count">
                  {selectedAnnotations.length} selected
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAnnotations([]);
                  }}
                  className="clear-selection-btn"
                >
                  Clear
                </button>
              </div>
              <div className="toolbar-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBulkApprove();
                  }}
                  disabled={bulkProcessing}
                  className="bulk-btn approve"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {bulkProcessing ? 'Processing...' : 'Approve All'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBulkReject();
                  }}
                  disabled={bulkProcessing}
                  className="bulk-btn reject"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {bulkProcessing ? 'Processing...' : 'Reject All'}
                </button>
              </div>
            </div>
          )}

          {/* Select All Row */}
          <div className="select-all-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedAnnotations.length === tasks.length && tasks.length > 0}
                onChange={handleSelectAll}
                className="checkbox-input"
              />
              <span>Select All ({tasks.length})</span>
            </label>
          </div>

          <div className="queue-list">
            {tasks.map(task => (
              <div
                key={task.id}
                className="annotation-card"
              >
                <div className="card-checkbox" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedAnnotations.includes(task.annotation.id)}
                    onChange={() => handleSelectAnnotation(task.annotation.id)}
                    className="checkbox-input"
                  />
                </div>
                <div className="card-content" onClick={() => handleReviewClick(task)}>
                  <div className="card-header">
                    <div className="header-left">
                      <span className="annotation-id">Task #{task.id}</span>
                  <span
                    className="annotation-status"
                    style={{ background: getStatusColor('pending') }}
                  >
                    pending review
                  </span>
                  <span className="annotation-type">
                    {task.task_type.replace('_', ' ')}
                  </span>
                </div>
                {getPriorityBadge(task.priority)}
              </div>

              <div className="card-body">
                <div className="annotation-info">
                  <div className="info-row">
                    <span className="info-label">Project:</span>
                    <span className="info-value">
                      {task.project?.name || 'Unknown Project'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Annotator:</span>
                    <span className="info-value">{task.annotator?.full_name || 'Unknown'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Submitted:</span>
                    <span className="info-value">
                      {task.submitted_at
                        ? new Date(task.submitted_at).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                  {task.annotation?.time_spent && (
                    <div className="info-row">
                      <span className="info-label">Time Spent:</span>
                      <span className="info-value">
                        {Math.round(task.annotation.time_spent / 60)} minutes
                      </span>
                    </div>
                  )}
                </div>

                {task.annotation?.confidence_score && (
                  <div className="confidence-bar">
                    <span className="confidence-label">
                      Confidence: {Math.round(task.annotation.confidence_score * 100)}%
                    </span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${task.annotation.confidence_score * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button className="review-btn">
                  Review Annotation
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .review-queue {
          max-width: 1200px;
        }

        .queue-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .queue-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .queue-header p {
          font-size: 16px;
          color: #666;
        }

        .queue-stats {
          display: flex;
          gap: 16px;
        }

        .stat-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 120px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          opacity: 0.9;
        }

        .queue-filters {
          margin-bottom: 24px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .filters-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .filters-row:last-child {
          margin-bottom: 0;
        }

        .filter-select {
          flex: 1;
          min-width: 180px;
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

        .date-filter {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-filter label {
          font-size: 14px;
          font-weight: 500;
          color: #666;
        }

        .date-input {
          padding: 10px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .date-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .clear-filters-btn {
          padding: 10px 20px;
          background: transparent;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters-btn:hover {
          border-color: #667eea;
          color: #667eea;
          background: #f8f9ff;
        }

        .queue-loading,
        .queue-error,
        .queue-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          background: white;
          border-radius: 12px;
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

        .queue-loading p,
        .queue-error p {
          font-size: 16px;
          color: #666;
        }

        .queue-error p {
          color: #c33;
        }

        .queue-empty svg {
          color: #ccc;
          margin-bottom: 16px;
        }

        .queue-empty p {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .queue-empty span {
          font-size: 14px;
          color: #666;
        }

        /* Bulk Actions Toolbar */
        .bulk-actions-toolbar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 16px 24px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .selected-count {
          color: white;
          font-size: 16px;
          font-weight: 600;
        }

        .clear-selection-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-selection-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .toolbar-actions {
          display: flex;
          gap: 12px;
        }

        .bulk-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bulk-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .bulk-btn svg {
          width: 18px;
          height: 18px;
        }

        .bulk-btn.approve {
          background: #10b981;
          color: white;
        }

        .bulk-btn.approve:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .bulk-btn.reject {
          background: #ef4444;
          color: white;
        }

        .bulk-btn.reject:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        /* Select All Row */
        .select-all-row {
          background: #f9fafb;
          border-radius: 8px;
          padding: 12px 20px;
          margin-bottom: 16px;
          border: 1px solid #e5e7eb;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .checkbox-label span {
          user-select: none;
        }

        .queue-list {
          display: grid;
          gap: 16px;
        }

        .card-checkbox {
          display: flex;
          align-items: flex-start;
          padding-top: 4px;
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .card-content {
          flex: 1;
          cursor: pointer;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .header-left {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .annotation-id {
          font-size: 14px;
          color: #888;
          font-weight: 600;
        }

        .annotation-status,
        .annotation-type {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: white;
        }

        .annotation-type {
          background: #607d8b;
          text-transform: capitalize;
        }

        .priority-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .card-body {
          margin-bottom: 16px;
        }

        .annotation-info {
          display: grid;
          gap: 8px;
          margin-bottom: 16px;
        }

        .info-row {
          display: flex;
          gap: 8px;
        }

        .info-label {
          font-size: 13px;
          color: #888;
          min-width: 100px;
        }

        .info-value {
          font-size: 13px;
          color: #333;
          font-weight: 500;
        }

        .confidence-bar {
          margin-top: 12px;
        }

        .confidence-label {
          font-size: 12px;
          color: #666;
          font-weight: 600;
          margin-bottom: 4px;
          display: block;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s;
        }

        .card-footer {
          display: flex;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }

        .review-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .review-btn:hover {
          background: #5568d3;
        }

        .review-btn svg {
          margin-top: 2px;
        }

        @media (max-width: 768px) {
          .queue-header {
            flex-direction: column;
            gap: 16px;
          }

          .filters-row {
            flex-direction: column;
          }

          .filter-select {
            width: 100%;
            min-width: auto;
          }

          .date-filter {
            flex-direction: column;
            align-items: flex-start;
          }

          .date-input {
            width: 100%;
          }

          .clear-filters-btn {
            width: 100%;
          }

          .header-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}

export default ReviewQueue;
