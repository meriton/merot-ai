import { useState, useEffect } from 'react';

function TextClassificationAnnotation({ task, initialAnnotation, onSave, onSubmit, onCancel }) {
  const [selectedLabel, setSelectedLabel] = useState('');
  const [confidence, setConfidence] = useState(0.95);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Get available labels from task data or project guidelines
  const availableLabels = task?.data?.labels || task?.project?.labels || [];
  const textToClassify = task?.data?.text || '';
  const mlSuggestion = initialAnnotation?.ml_suggestions?.label;

  useEffect(() => {
    // Load existing annotation data if available
    if (initialAnnotation?.annotation_data) {
      setSelectedLabel(initialAnnotation.annotation_data.label || '');
      setConfidence(initialAnnotation.annotation_data.confidence || 0.95);
    } else if (mlSuggestion) {
      // Pre-select ML suggestion if available
      setSelectedLabel(mlSuggestion.label || '');
      setConfidence(mlSuggestion.confidence || 0.95);
    }
  }, [initialAnnotation, mlSuggestion]);

  const handleLabelSelect = (label) => {
    setSelectedLabel(label);
    setError(null);
  };

  const handleSave = async (submit = false) => {
    console.log(`=== TextClassification handleSave called (submit=${submit}) ===`);

    if (!selectedLabel) {
      console.log('No label selected, showing error');
      setError('Please select a label');
      return;
    }

    setSaving(true);
    setError(null);

    const annotationData = {
      annotation_type: 'text_classification',
      annotation_data: {
        label: selectedLabel,
        confidence: confidence,
        labels: availableLabels
      },
      confidence_score: confidence
    };

    console.log('Annotation data to save:', annotationData);

    try {
      if (submit) {
        console.log('Calling onSubmit...');
        await onSubmit(annotationData);
      } else {
        console.log('Calling onSave...');
        await onSave(annotationData);
      }
      console.log('Save/submit completed successfully');
    } catch (err) {
      console.error('Save/submit error:', err);
      setError(err.response?.data?.error || err.response?.data?.errors?.join(', ') || `Failed to ${submit ? 'submit' : 'save'} annotation`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-classification-annotation">
      <div className="annotation-header">
        <h2>Text Classification</h2>
        <p>Read the text below and assign the most appropriate label</p>
      </div>

      {/* Text to classify */}
      <div className="text-display">
        <label className="section-label">Text to Classify</label>
        <div className="text-content">
          {textToClassify || 'No text available'}
        </div>
      </div>

      {/* ML Suggestion */}
      {mlSuggestion && (
        <div className="ml-suggestion">
          <div className="suggestion-header">
            <svg className="suggestion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>AI Suggestion</span>
            <span className="suggestion-confidence">{Math.round(mlSuggestion.confidence * 100)}% confident</span>
          </div>
          <p className="suggestion-label">Suggested label: <strong>{mlSuggestion.label}</strong></p>
          <p className="suggestion-note">You can accept this suggestion or choose a different label</p>
        </div>
      )}

      {/* Label Selection */}
      <div className="label-selection">
        <label className="section-label">Select Label</label>
        <div className="labels-grid">
          {availableLabels.length === 0 ? (
            <p className="no-labels">No labels configured for this task</p>
          ) : (
            availableLabels.map((label) => (
              <button
                key={label}
                className={`label-button ${selectedLabel === label ? 'selected' : ''}`}
                onClick={() => handleLabelSelect(label)}
                disabled={saving}
              >
                <span className="label-text">{label}</span>
                {selectedLabel === label && (
                  <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="confidence-section">
        <label className="section-label">
          Confidence Score
          <span className="confidence-value">{Math.round(confidence * 100)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={confidence}
          onChange={(e) => setConfidence(parseFloat(e.target.value))}
          className="confidence-slider"
          disabled={saving}
        />
        <div className="confidence-labels">
          <span>Not sure</span>
          <span>Very confident</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="annotation-error">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="annotation-actions">
        <button
          onClick={onCancel}
          className="action-btn cancel-btn"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={() => handleSave(false)}
          className="action-btn save-btn"
          disabled={saving || !selectedLabel}
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={() => handleSave(true)}
          className="action-btn submit-btn"
          disabled={saving || !selectedLabel}
        >
          {saving ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      <style>{`
        .text-classification-annotation {
          max-width: 900px;
          margin: 0 auto;
        }

        .annotation-header {
          margin-bottom: 32px;
        }

        .annotation-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .annotation-header p {
          font-size: 16px;
          color: #666;
        }

        .section-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .text-display {
          margin-bottom: 24px;
        }

        .text-content {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 24px;
          font-size: 16px;
          line-height: 1.6;
          color: #333;
          min-height: 120px;
          max-height: 400px;
          overflow-y: auto;
        }

        .ml-suggestion {
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          border: 2px solid #667eea;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .suggestion-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .suggestion-icon {
          width: 20px;
          height: 20px;
          color: #667eea;
        }

        .suggestion-header span:first-of-type {
          font-weight: 600;
          color: #667eea;
        }

        .suggestion-confidence {
          margin-left: auto;
          background: #667eea;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .suggestion-label {
          font-size: 16px;
          color: #333;
          margin-bottom: 4px;
        }

        .suggestion-label strong {
          color: #667eea;
          font-weight: 700;
        }

        .suggestion-note {
          font-size: 13px;
          color: #666;
          font-style: italic;
        }

        .label-selection {
          margin-bottom: 24px;
        }

        .labels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .no-labels {
          text-align: center;
          padding: 24px;
          color: #999;
          font-style: italic;
        }

        .label-button {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 15px;
          font-weight: 500;
          color: #333;
        }

        .label-button:hover:not(:disabled) {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .label-button.selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
        }

        .label-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .label-text {
          text-transform: capitalize;
        }

        .check-icon {
          width: 20px;
          height: 20px;
        }

        .confidence-section {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .confidence-section .section-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .confidence-value {
          color: #667eea;
          font-size: 18px;
          font-weight: 700;
        }

        .confidence-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: #e0e0e0;
          outline: none;
          -webkit-appearance: none;
          margin-bottom: 8px;
        }

        .confidence-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .confidence-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .confidence-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #888;
        }

        .annotation-error {
          background: #ffebee;
          border: 2px solid #ef5350;
          border-radius: 8px;
          padding: 12px 16px;
          color: #c62828;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .annotation-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .action-btn {
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: #f5f5f5;
          color: #666;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .save-btn {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .save-btn:hover:not(:disabled) {
          background: #f0f2ff;
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
          .labels-grid {
            grid-template-columns: 1fr;
          }

          .annotation-actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default TextClassificationAnnotation;
