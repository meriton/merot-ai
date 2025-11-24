import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../services/api';
import TextClassificationAnnotation from '../../components/annotations/TextClassificationAnnotation';
import NERAnnotation from '../../components/annotations/NERAnnotation';
import SentimentAnnotation from '../../components/annotations/SentimentAnnotation';
import ImageAnnotation from '../../components/annotations/ImageAnnotation';
import PolygonAnnotation from '../../components/annotations/PolygonAnnotation';
import KeypointAnnotation from '../../components/annotations/KeypointAnnotation';
import AudioAnnotation from './AudioAnnotation';
import VideoAnnotation from './VideoAnnotation';

function TaskAnnotation() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [annotation, setAnnotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);
  const [unsubmitting, setUnsubmitting] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getTask(taskId);
      const taskData = response.data.task;
      setTask(taskData);

      // Check if there's an existing annotation
      if (taskData.current_annotation) {
        setAnnotation(taskData.current_annotation);
      }

      // If task is assigned but not started, start it automatically
      if (taskData.status === 'assigned') {
        await handleStartTask();
      }

      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    setStarting(true);
    try {
      await employeeAPI.startTask(taskId);
      setTask(prev => ({ ...prev, status: 'in_progress' }));
    } catch (err) {
      console.error('Failed to start task:', err);
    } finally {
      setStarting(false);
    }
  };

  const handleSaveDraft = async (annotationData) => {
    console.log('=== handleSaveDraft called ===');
    console.log('TaskId:', taskId);
    console.log('Annotation Data:', annotationData);
    try {
      console.log('Making API call to saveDraft...');
      const response = await employeeAPI.saveDraft(taskId, annotationData);
      console.log('Save draft response:', response.data);
      setAnnotation(response.data.annotation);
      alert('Draft saved successfully!');
    } catch (err) {
      console.error('Save draft error:', err);
      console.error('Error response:', err.response?.data);
      throw err;
    }
  };

  const handleSubmit = async (annotationData) => {
    console.log('=== handleSubmit called ===');
    console.log('TaskId:', taskId);
    console.log('Annotation Data:', annotationData);
    try {
      console.log('Making API call to submitAnnotation...');
      await employeeAPI.submitAnnotation(taskId, annotationData);
      console.log('Submit successful!');
      alert('Annotation submitted successfully!');
      navigate('/employee/tasks');
    } catch (err) {
      console.error('Submit error:', err);
      console.error('Error response:', err.response?.data);
      throw err;
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/employee/tasks');
    }
  };

  const handleUnsubmit = async () => {
    if (!window.confirm('Are you sure you want to unsubmit this annotation? It will return to draft status.')) {
      return;
    }

    console.log('=== handleUnsubmit called ===');
    console.log('TaskId:', taskId);

    setUnsubmitting(true);
    try {
      console.log('Making API call to unsubmitAnnotation...');
      const response = await employeeAPI.unsubmitAnnotation(taskId);
      console.log('Unsubmit response:', response.data);

      // Refresh the task to get updated status
      await fetchTask();
      alert('Annotation unsubmitted successfully! You can now edit it.');
    } catch (err) {
      console.error('Unsubmit error:', err);
      console.error('Error response:', err.response?.data);
      alert(err.response?.data?.error || 'Failed to unsubmit annotation');
    } finally {
      setUnsubmitting(false);
    }
  };

  const renderAnnotationComponent = () => {
    if (!task) return null;

    const componentProps = {
      task,
      initialAnnotation: annotation,
      onSave: handleSaveDraft,
      onSubmit: handleSubmit,
      onCancel: handleCancel
    };

    switch (task.task_type) {
      case 'text_classification':
        return <TextClassificationAnnotation {...componentProps} />;

      case 'ner':
      case 'named_entity_recognition':
        return <NERAnnotation {...componentProps} />;

      case 'sentiment':
      case 'sentiment_analysis':
        return <SentimentAnnotation {...componentProps} />;

      case 'image_annotation':
      case 'image_classification':
      case 'bounding_box':
        return <ImageAnnotation {...componentProps} />;

      case 'polygon':
      case 'polygon_segmentation':
        return <PolygonAnnotation {...componentProps} />;

      case 'keypoint':
      case 'keypoint_annotation':
        return <KeypointAnnotation {...componentProps} />;

      case 'audio_transcription':
      case 'audio_annotation':
        return <AudioAnnotation task={task} existingAnnotation={annotation} onSave={handleSaveDraft} onSubmit={async (annotationData) => await handleSubmit(annotationData)} />;

      case 'video_annotation':
        return <VideoAnnotation task={task} existingAnnotation={annotation} onSave={handleSaveDraft} onSubmit={async (annotationData) => await handleSubmit(annotationData)} />;

      default:
        return (
          <div className="annotation-placeholder">
            <h3>Unknown Task Type</h3>
            <p>Task type "{task.task_type}" is not supported</p>
            <button onClick={handleCancel} className="back-btn">Back to Tasks</button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="task-annotation-loading">
        <div className="loading-spinner"></div>
        <p>Loading task...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-annotation-error">
        <h2>Error Loading Task</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/employee/tasks')} className="back-btn">
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="task-annotation-page">
      {/* Task Info Header */}
      <div className="task-info-header">
        <div className="task-info-left">
          <button onClick={handleCancel} className="back-link">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tasks
          </button>
          <div className="task-info-details">
            <h1>Task #{task?.id} - {task?.project?.name}</h1>
            <div className="task-meta">
              <span className="task-type">{task?.task_type?.replace('_', ' ')}</span>
              <span className="task-status" data-status={task?.status}>
                {task?.status?.replace('_', ' ')}
              </span>
              {task?.priority && (
                <span className="task-priority" data-priority={task.priority}>
                  {task.priority} priority
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="task-header-actions">
          {starting && (
            <div className="starting-badge">Starting task...</div>
          )}
          {task?.current_annotation?.status === 'submitted' && (
            <button
              onClick={handleUnsubmit}
              disabled={unsubmitting}
              className="unsubmit-btn"
            >
              {unsubmitting ? 'Unsubmitting...' : 'Unsubmit & Edit'}
            </button>
          )}
        </div>
      </div>

      {/* Guidelines */}
      {task?.project?.guidelines && Object.keys(task.project.guidelines).length > 0 && (
        <div className="guidelines-section">
          <h3>Guidelines</h3>
          <div className="guidelines-content">
            {typeof task.project.guidelines === 'string' ? (
              <p>{task.project.guidelines}</p>
            ) : (
              <ul>
                {Object.entries(task.project.guidelines).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Annotation Component */}
      <div className="annotation-container">
        {renderAnnotationComponent()}
      </div>

      <style>{`
        .task-annotation-page {
          max-width: 1400px;
          margin: 0 auto;
        }

        .task-annotation-loading,
        .task-annotation-error {
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

        .task-annotation-loading p,
        .task-annotation-error p {
          font-size: 16px;
          color: #666;
        }

        .task-annotation-error h2 {
          font-size: 24px;
          color: #c33;
          margin-bottom: 12px;
        }

        .back-btn {
          margin-top: 24px;
          padding: 12px 32px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #5568d3;
          transform: translateY(-2px);
        }

        .task-info-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .task-info-left {
          flex: 1;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 16px;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #5568d3;
        }

        .task-info-details h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .task-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .task-type,
        .task-status,
        .task-priority {
          padding: 6px 14px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .task-type {
          background: #e3f2fd;
          color: #1976d2;
        }

        .task-status {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .task-status[data-status="assigned"] {
          background: #e3f2fd;
          color: #1976d2;
        }

        .task-status[data-status="in_progress"] {
          background: #e8f5e9;
          color: #388e3c;
        }

        .task-status[data-status="review"] {
          background: #fff3e0;
          color: #f57c00;
        }

        .task-status[data-status="completed"],
        .task-status[data-status="approved"] {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .task-priority[data-priority="low"] {
          background: #f5f5f5;
          color: #757575;
        }

        .task-priority[data-priority="medium"] {
          background: #fff3e0;
          color: #f57c00;
        }

        .task-priority[data-priority="high"] {
          background: #ffebee;
          color: #c62828;
        }

        .task-header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .starting-badge {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        .unsubmit-btn {
          background: #ff9800;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .unsubmit-btn:hover:not(:disabled) {
          background: #f57c00;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(245, 124, 0, 0.3);
        }

        .unsubmit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .guidelines-section {
          background: #fffbf0;
          border: 2px solid #ffd54f;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .guidelines-section h3 {
          font-size: 18px;
          font-weight: 700;
          color: #f57c00;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .guidelines-content {
          font-size: 15px;
          line-height: 1.6;
          color: #555;
        }

        .guidelines-content ul {
          list-style: none;
          padding: 0;
        }

        .guidelines-content li {
          padding: 8px 0;
          border-bottom: 1px solid #ffe082;
        }

        .guidelines-content li:last-child {
          border-bottom: none;
        }

        .guidelines-content strong {
          color: #f57c00;
        }

        .annotation-container {
          background: #f5f7fa;
          border-radius: 12px;
          padding: 32px;
        }

        .annotation-placeholder {
          text-align: center;
          padding: 64px 32px;
          background: white;
          border-radius: 12px;
          border: 2px dashed #e0e0e0;
        }

        .annotation-placeholder h3 {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin-bottom: 12px;
        }

        .annotation-placeholder p {
          font-size: 16px;
          color: #666;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .task-info-header {
            flex-direction: column;
            gap: 16px;
          }

          .annotation-container {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default TaskAnnotation;
