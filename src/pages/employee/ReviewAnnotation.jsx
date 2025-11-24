import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../services/api';

function ReviewAnnotation() {
  const { annotationId } = useParams();
  const navigate = useNavigate();

  const [annotation, setAnnotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [action, setAction] = useState(null); // 'approve', 'reject', 'revise'
  const [qualityScore, setQualityScore] = useState(0.9);
  const [feedback, setFeedback] = useState('');
  const [issues, setIssues] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnotation();
  }, [annotationId]);

  const fetchAnnotation = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getAnnotationForReview(annotationId);
      setAnnotation(response.data.annotation);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load annotation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!action) {
      alert('Please select an action (approve, reject, or request revision)');
      return;
    }

    if (action === 'approve' && qualityScore === 0) {
      alert('Please provide a quality score');
      return;
    }

    if ((action === 'reject' || action === 'revise') && !feedback.trim()) {
      alert('Please provide feedback');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        quality_score: action === 'approve' ? qualityScore : null,
        feedback: feedback.trim() || null,
        issues: issues.length > 0 ? issues : null
      };

      switch (action) {
        case 'approve':
          await employeeAPI.approveAnnotation(annotationId, reviewData);
          alert('Annotation approved successfully!');
          break;
        case 'reject':
          await employeeAPI.rejectAnnotation(annotationId, reviewData);
          alert('Annotation rejected successfully');
          break;
        case 'revise':
          await employeeAPI.requestRevision(annotationId, reviewData);
          alert('Revision requested successfully');
          break;
      }

      navigate('/employee/reviews');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddIssue = () => {
    const issue = prompt('Describe the issue:');
    if (issue && issue.trim()) {
      setIssues([...issues, issue.trim()]);
    }
  };

  const handleRemoveIssue = (index) => {
    setIssues(issues.filter((_, i) => i !== index));
  };

  const renderAnnotationData = () => {
    if (!annotation?.annotation_data) return null;

    const data = annotation.annotation_data;
    const type = annotation.annotation_type;

    switch (type) {
      case 'text_classification':
        return (
          <div className="annotation-preview">
            <h3>Classification Result</h3>
            <div className="preview-content">
              <div className="preview-row">
                <strong>Label:</strong>
                <span className="label-badge">{data.label}</span>
              </div>
              <div className="preview-row">
                <strong>Confidence:</strong>
                <span>{Math.round(data.confidence * 100)}%</span>
              </div>
              {data.text && (
                <div className="preview-text">
                  <strong>Text:</strong>
                  <p>{data.text}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'ner':
        return (
          <div className="annotation-preview">
            <h3>Named Entities ({data.entities?.length || 0})</h3>
            <div className="preview-content">
              {data.entities?.map((entity, index) => (
                <div key={index} className="entity-preview">
                  <span className="entity-text">"{entity.text}"</span>
                  <span className="entity-label">{entity.label}</span>
                  <span className="entity-confidence">{Math.round(entity.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'bounding_box':
        return (
          <div className="annotation-preview">
            <h3>Bounding Boxes ({data.boxes?.length || 0})</h3>
            {data.image_url && (
              <img src={data.image_url} alt="Annotated" className="preview-image" />
            )}
            <div className="preview-content">
              {data.boxes?.map((box, index) => (
                <div key={index} className="box-preview">
                  <span className="box-label">{box.label}</span>
                  <span>Position: ({Math.round(box.x)}, {Math.round(box.y)})</span>
                  <span>Size: {Math.round(box.width)} × {Math.round(box.height)}</span>
                  <span>{Math.round(box.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="annotation-preview">
            <h3>Annotation Data</h3>
            <pre className="data-preview">{JSON.stringify(data, null, 2)}</pre>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="review-loading">
        <div className="loading-spinner"></div>
        <p>Loading annotation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-error">
        <h2>Error Loading Annotation</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/employee/reviews')} className="back-btn">
          Back to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="review-annotation-page">
      {/* Header */}
      <div className="review-header">
        <button onClick={() => navigate('/employee/reviews')} className="back-link">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Queue
        </button>
        <h1>Review Annotation #{annotation?.id}</h1>
      </div>

      {/* Annotation Info */}
      <div className="annotation-info-card">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Task</span>
            <span className="info-value">#{annotation?.task_id} - {annotation?.task?.project?.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Annotator</span>
            <span className="info-value">{annotation?.employee?.full_name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Type</span>
            <span className="info-value">{annotation?.annotation_type?.replace('_', ' ')}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Submitted</span>
            <span className="info-value">
              {annotation?.submitted_at
                ? new Date(annotation.submitted_at).toLocaleString()
                : 'N/A'}
            </span>
          </div>
          {annotation?.time_spent_seconds && (
            <div className="info-item">
              <span className="info-label">Time Spent</span>
              <span className="info-value">
                {Math.round(annotation.time_spent_seconds / 60)} minutes
              </span>
            </div>
          )}
          {annotation?.confidence_score && (
            <div className="info-item">
              <span className="info-label">Confidence</span>
              <span className="info-value">
                {Math.round(annotation.confidence_score * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Annotation Data */}
      <div className="annotation-data-section">
        {renderAnnotationData()}
      </div>

      {/* Review Form */}
      <div className="review-form">
        <h2>Submit Review</h2>

        {/* Action Selection */}
        <div className="action-selection">
          <button
            className={`action-btn approve ${action === 'approve' ? 'selected' : ''}`}
            onClick={() => setAction('approve')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Approve
          </button>
          <button
            className={`action-btn revise ${action === 'revise' ? 'selected' : ''}`}
            onClick={() => setAction('revise')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Request Revision
          </button>
          <button
            className={`action-btn reject ${action === 'reject' ? 'selected' : ''}`}
            onClick={() => setAction('reject')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Reject
          </button>
        </div>

        {/* Quality Score (for approval) */}
        {action === 'approve' && (
          <div className="quality-score-section">
            <label>
              Quality Score
              <span className="score-value">{Math.round(qualityScore * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={qualityScore}
              onChange={(e) => setQualityScore(parseFloat(e.target.value))}
              className="quality-slider"
            />
            <div className="score-labels">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="feedback-section">
          <label>Feedback {(action === 'reject' || action === 'revise') && <span className="required">*</span>}</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={
              action === 'approve'
                ? 'Optional: Add positive feedback or suggestions...'
                : 'Explain what needs to be improved...'
            }
            className="feedback-textarea"
            rows="4"
          />
        </div>

        {/* Issues (for rejection/revision) */}
        {(action === 'reject' || action === 'revise') && (
          <div className="issues-section">
            <label>Issues Found</label>
            <div className="issues-list">
              {issues.map((issue, index) => (
                <div key={index} className="issue-item">
                  <span>{issue}</span>
                  <button onClick={() => handleRemoveIssue(index)} className="remove-issue-btn">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button onClick={handleAddIssue} className="add-issue-btn">
                + Add Issue
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="submit-section">
          <button
            onClick={handleSubmitReview}
            disabled={submitting || !action}
            className="submit-review-btn"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>

      <style>{`
        .review-annotation-page {
          max-width: 1000px;
          margin: 0 auto;
        }

        .review-loading,
        .review-error {
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

        .review-loading p,
        .review-error p {
          font-size: 16px;
          color: #666;
        }

        .review-error h2 {
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
        }

        .review-header {
          margin-bottom: 24px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #667eea;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 16px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .back-link:hover {
          color: #5568d3;
        }

        .review-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .annotation-info-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 15px;
          color: #333;
          font-weight: 500;
        }

        .annotation-data-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .annotation-preview h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .preview-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .preview-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .label-badge {
          background: #667eea;
          color: white;
          padding: 4px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
        }

        .preview-text {
          margin-top: 8px;
        }

        .preview-text p {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 8px;
          line-height: 1.6;
          margin-top: 8px;
        }

        .entity-preview,
        .box-preview {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 8px 12px;
          background: #f5f5f5;
          border-radius: 6px;
          font-size: 14px;
        }

        .entity-text {
          font-weight: 600;
          color: #333;
        }

        .entity-label,
        .box-label {
          background: #667eea;
          color: white;
          padding: 2px 10px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }

        .entity-confidence {
          color: #888;
          font-size: 12px;
        }

        .preview-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .data-preview {
          background: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 13px;
        }

        .review-form {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .review-form h2 {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 24px;
        }

        .action-selection {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 15px;
          font-weight: 600;
        }

        .action-btn:hover {
          border-color: #667eea;
        }

        .action-btn.selected.approve {
          background: #4caf50;
          border-color: #4caf50;
          color: white;
        }

        .action-btn.selected.revise {
          background: #ff9800;
          border-color: #ff9800;
          color: white;
        }

        .action-btn.selected.reject {
          background: #f44336;
          border-color: #f44336;
          color: white;
        }

        .quality-score-section {
          background: #f5f7fa;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .quality-score-section label {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        .score-value {
          color: #667eea;
          font-size: 18px;
        }

        .quality-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: #e0e0e0;
          outline: none;
          -webkit-appearance: none;
          margin-bottom: 8px;
        }

        .quality-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
        }

        .quality-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          border: none;
        }

        .score-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #888;
        }

        .feedback-section {
          margin-bottom: 24px;
        }

        .feedback-section label {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .required {
          color: #f44336;
        }

        .feedback-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
        }

        .feedback-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .issues-section {
          margin-bottom: 24px;
        }

        .issues-section label {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .issue-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: #ffebee;
          border-radius: 6px;
        }

        .remove-issue-btn {
          background: none;
          border: none;
          color: #c62828;
          cursor: pointer;
          padding: 4px;
        }

        .add-issue-btn {
          padding: 10px 16px;
          background: white;
          border: 2px dashed #e0e0e0;
          border-radius: 6px;
          color: #667eea;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-issue-btn:hover {
          border-color: #667eea;
          background: #f0f2ff;
        }

        .submit-section {
          display: flex;
          justify-content: flex-end;
        }

        .submit-review-btn {
          padding: 14px 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .submit-review-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .submit-review-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .action-selection {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default ReviewAnnotation;
