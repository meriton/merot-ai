import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../services/api';

function RevisionInterface() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRevisionTasks();
  }, []);

  const fetchRevisionTasks = async () => {
    setLoading(true);
    try {
      // Get tasks with annotations that need revision
      const response = await employeeAPI.getMyReviews({ status: 'needs_revision' });
      setTasks(response.data.reviews || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load revision tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleReviseClick = (review) => {
    // Navigate to the task annotation page with revision context
    navigate(`/employee/tasks/${review.task_id}?revision=${review.annotation_id}`);
  };

  const getAnnotationTypeLabel = (type) => {
    const labels = {
      text_classification: 'Text Classification',
      named_entity_recognition: 'Named Entity Recognition',
      sentiment_analysis: 'Sentiment Analysis',
      image_classification: 'Image Classification',
      bounding_box: 'Bounding Box',
      polygon_segmentation: 'Polygon Segmentation',
      keypoint_annotation: 'Keypoint Annotation',
      audio_transcription: 'Audio Transcription',
      video_annotation: 'Video Annotation'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="revision-loading">
        <div className="loading-spinner"></div>
        <p>Loading revision tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="revision-error">
        <p>{error}</p>
        <button onClick={fetchRevisionTasks} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="revision-interface">
      <div className="revision-header">
        <h1>Revisions Needed</h1>
        <p>Tasks that require your attention based on reviewer feedback</p>
      </div>

      {tasks.length === 0 ? (
        <div className="no-revisions">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="success-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2>All caught up!</h2>
          <p>You have no tasks requiring revision at this time.</p>
          <button onClick={() => navigate('/employee/tasks')} className="back-btn">
            Back to Tasks
          </button>
        </div>
      ) : (
        <div className="revision-list">
          {tasks.map((review) => (
            <div key={review.id} className="revision-card">
              <div className="revision-card-header">
                <div className="revision-info">
                  <h3 className="task-title">
                    {review.task?.title || 'Untitled Task'}
                  </h3>
                  <span className="annotation-type">
                    {getAnnotationTypeLabel(review.task?.annotation_type)}
                  </span>
                </div>
                <span className="revision-status">Needs Revision</span>
              </div>

              <div className="revision-card-body">
                <div className="feedback-section">
                  <div className="feedback-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="feedback-icon">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <strong>Reviewer Feedback:</strong>
                  </div>
                  <p className="feedback-text">{review.feedback || 'No specific feedback provided'}</p>
                  {review.feedback_category && (
                    <span className="feedback-category">{review.feedback_category}</span>
                  )}
                </div>

                <div className="revision-metadata">
                  <div className="metadata-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Reviewed by: {review.reviewer?.first_name} {review.reviewer?.last_name}</span>
                  </div>
                  <div className="metadata-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Reviewed: {formatDate(review.reviewed_at)}</span>
                  </div>
                </div>

                {review.quality_score && (
                  <div className="quality-score">
                    <span>Quality Score: </span>
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{ width: `${review.quality_score}%` }}
                      ></div>
                    </div>
                    <span className="score-value">{review.quality_score}%</span>
                  </div>
                )}
              </div>

              <div className="revision-card-footer">
                <button
                  onClick={() => handleReviseClick(review)}
                  className="revise-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Revise Annotation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .revision-interface {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .revision-header {
          margin-bottom: 32px;
        }

        .revision-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .revision-header p {
          font-size: 16px;
          color: #666;
        }

        .revision-loading,
        .revision-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f4f6;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .revision-error p {
          color: #ef4444;
          margin-bottom: 16px;
        }

        .retry-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .retry-btn:hover {
          background: #5568d3;
        }

        .no-revisions {
          text-align: center;
          padding: 60px 20px;
        }

        .success-icon {
          width: 64px;
          height: 64px;
          color: #10b981;
          margin: 0 auto 24px;
        }

        .no-revisions h2 {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .no-revisions p {
          font-size: 16px;
          color: #666;
          margin-bottom: 24px;
        }

        .back-btn {
          background: transparent;
          border: 1px solid #667eea;
          color: #667eea;
          padding: 10px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #667eea;
          color: white;
        }

        .revision-list {
          display: grid;
          gap: 24px;
        }

        .revision-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-left: 4px solid #f59e0b;
          border-radius: 8px;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }

        .revision-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .revision-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
        }

        .revision-info {
          flex: 1;
        }

        .task-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .annotation-type {
          display: inline-block;
          background: #e0e7ff;
          color: #4f46e5;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .revision-status {
          background: #fef3c7;
          color: #92400e;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        .revision-card-body {
          padding: 24px;
        }

        .feedback-section {
          background: #fef3c7;
          border-left: 3px solid #f59e0b;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .feedback-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: #92400e;
        }

        .feedback-icon {
          width: 20px;
          height: 20px;
        }

        .feedback-text {
          color: #78350f;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .feedback-category {
          display: inline-block;
          background: #fbbf24;
          color: #78350f;
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .revision-metadata {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .metadata-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 14px;
        }

        .metadata-item svg {
          width: 16px;
          height: 16px;
        }

        .quality-score {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .quality-score > span:first-child {
          font-size: 14px;
          font-weight: 500;
          color: #666;
        }

        .score-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b 0%, #f97316 100%);
          border-radius: 4px;
          transition: width 0.3s;
        }

        .score-value {
          font-size: 14px;
          font-weight: 600;
          color: #f59e0b;
          min-width: 45px;
        }

        .revision-card-footer {
          padding: 16px 24px;
          background: #f9fafb;
          border-top: 1px solid #f3f4f6;
        }

        .revise-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .revise-btn:hover {
          background: #5568d3;
          transform: translateY(-1px);
        }

        .revise-btn svg {
          width: 18px;
          height: 18px;
        }

        @media (max-width: 768px) {
          .revision-interface {
            padding: 16px;
          }

          .revision-card-header {
            flex-direction: column;
            gap: 12px;
          }

          .revision-metadata {
            flex-direction: column;
            gap: 12px;
          }

          .quality-score {
            flex-direction: column;
            align-items: flex-start;
          }

          .score-bar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default RevisionInterface;
