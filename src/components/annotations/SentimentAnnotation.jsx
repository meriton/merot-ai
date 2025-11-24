import { useState, useEffect } from 'react';

function SentimentAnnotation({ task, initialAnnotation, onSave, onSubmit, onCancel }) {
  const [sentiment, setSentiment] = useState('neutral');
  const [intensity, setIntensity] = useState(0.5);
  const [aspects, setAspects] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load initial annotation if exists
  useEffect(() => {
    if (initialAnnotation?.annotation_data) {
      const data = initialAnnotation.annotation_data;
      setSentiment(data.sentiment || 'neutral');
      setIntensity(data.intensity || 0.5);
      setAspects(data.aspects || []);
      setNotes(initialAnnotation.notes || '');
    }
  }, [initialAnnotation]);

  const handleAddAspect = () => {
    setAspects([
      ...aspects,
      {
        aspect: '',
        sentiment: 'neutral',
        intensity: 0.5
      }
    ]);
  };

  const handleAspectChange = (index, field, value) => {
    const newAspects = [...aspects];
    newAspects[index][field] = value;
    setAspects(newAspects);
  };

  const handleRemoveAspect = (index) => {
    setAspects(aspects.filter((_, i) => i !== index));
  };

  const buildAnnotationData = () => {
    return {
      annotation_type: 'sentiment',
      annotation_data: {
        sentiment,
        intensity,
        aspects: aspects.filter(a => a.aspect.trim() !== '')
      },
      notes: notes.trim() || null,
      confidence_score: intensity
    };
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await onSave(buildAnnotationData());
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAnnotation = async () => {
    if (!sentiment) {
      alert('Please select a sentiment');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(buildAnnotationData());
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit annotation');
    } finally {
      setSubmitting(false);
    }
  };

  const getSentimentColor = (sent) => {
    const colors = {
      positive: '#4caf50',
      negative: '#f44336',
      neutral: '#9e9e9e',
      mixed: '#ff9800'
    };
    return colors[sent] || '#9e9e9e';
  };

  const isReadOnly = initialAnnotation?.status === 'submitted';

  return (
    <div className="sentiment-annotation">
      {/* Text Display */}
      <div className="text-display">
        <h3>Text to Analyze</h3>
        <div className="text-content">
          {task.data?.text || 'No text provided'}
        </div>
      </div>

      {/* Overall Sentiment */}
      <div className="sentiment-section">
        <h3>Overall Sentiment</h3>
        <div className="sentiment-buttons">
          {['positive', 'negative', 'neutral', 'mixed'].map(sent => (
            <button
              key={sent}
              className={`sentiment-btn ${sentiment === sent ? 'selected' : ''}`}
              onClick={() => !isReadOnly && setSentiment(sent)}
              disabled={isReadOnly}
              style={{
                borderColor: sentiment === sent ? getSentimentColor(sent) : '#e0e0e0',
                background: sentiment === sent ? getSentimentColor(sent) : 'white',
                color: sentiment === sent ? 'white' : '#666'
              }}
            >
              {sent.charAt(0).toUpperCase() + sent.slice(1)}
            </button>
          ))}
        </div>

        {/* Intensity Slider */}
        <div className="intensity-slider">
          <label>
            Intensity: <strong>{Math.round(intensity * 100)}%</strong>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            disabled={isReadOnly}
          />
          <div className="intensity-labels">
            <span>Weak</span>
            <span>Strong</span>
          </div>
        </div>
      </div>

      {/* Aspect-Based Sentiment */}
      <div className="aspects-section">
        <div className="section-header">
          <h3>Aspect-Based Sentiment (Optional)</h3>
          {!isReadOnly && (
            <button onClick={handleAddAspect} className="add-aspect-btn">
              + Add Aspect
            </button>
          )}
        </div>

        {aspects.length > 0 && (
          <div className="aspects-list">
            {aspects.map((aspect, index) => (
              <div key={index} className="aspect-item">
                <input
                  type="text"
                  placeholder="Aspect (e.g., product_quality, customer_service)"
                  value={aspect.aspect}
                  onChange={(e) => handleAspectChange(index, 'aspect', e.target.value)}
                  disabled={isReadOnly}
                  className="aspect-input"
                />
                <select
                  value={aspect.sentiment}
                  onChange={(e) => handleAspectChange(index, 'sentiment', e.target.value)}
                  disabled={isReadOnly}
                  className="aspect-sentiment"
                >
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                  <option value="mixed">Mixed</option>
                </select>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={aspect.intensity}
                  onChange={(e) => handleAspectChange(index, 'intensity', parseFloat(e.target.value))}
                  disabled={isReadOnly}
                  className="aspect-intensity"
                />
                <span className="intensity-value">{Math.round(aspect.intensity * 100)}%</span>
                {!isReadOnly && (
                  <button
                    onClick={() => handleRemoveAspect(index)}
                    className="remove-aspect-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="notes-section">
        <label htmlFor="notes">Notes (Optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes or observations..."
          disabled={isReadOnly}
          rows="4"
        />
      </div>

      {/* Actions */}
      {!isReadOnly && (
        <div className="actions">
          <button onClick={onCancel} className="cancel-btn" disabled={saving || submitting}>
            Cancel
          </button>
          <button onClick={handleSaveDraft} className="save-btn" disabled={saving || submitting}>
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={handleSubmitAnnotation} className="submit-btn" disabled={saving || submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      )}

      <style>{`
        .sentiment-annotation {
          max-width: 900px;
          margin: 0 auto;
        }

        .text-display {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .text-display h3 {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          margin-bottom: 16px;
        }

        .text-content {
          background: #f5f7fa;
          padding: 20px;
          border-radius: 8px;
          font-size: 16px;
          line-height: 1.6;
          color: #333;
          white-space: pre-wrap;
        }

        .sentiment-section,
        .aspects-section,
        .notes-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .sentiment-section h3,
        .aspects-section h3,
        .notes-section label {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          margin-bottom: 16px;
          display: block;
        }

        .sentiment-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .sentiment-btn {
          padding: 14px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .sentiment-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .sentiment-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .intensity-slider {
          margin-top: 16px;
        }

        .intensity-slider label {
          display: block;
          font-size: 15px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .intensity-slider input[type="range"] {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: #e0e0e0;
          outline: none;
          -webkit-appearance: none;
          margin-bottom: 8px;
        }

        .intensity-slider input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
        }

        .intensity-slider input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          border: none;
        }

        .intensity-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #888;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .add-aspect-btn {
          padding: 8px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .add-aspect-btn:hover {
          background: #5568d3;
        }

        .aspects-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .aspect-item {
          display: grid;
          grid-template-columns: 2fr 1fr 2fr 60px 40px;
          gap: 12px;
          align-items: center;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 8px;
        }

        .aspect-input,
        .aspect-sentiment {
          padding: 10px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
        }

        .aspect-input:focus,
        .aspect-sentiment:focus {
          outline: none;
          border-color: #667eea;
        }

        .aspect-intensity {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e0e0e0;
          outline: none;
          -webkit-appearance: none;
        }

        .aspect-intensity::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
        }

        .aspect-intensity::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          border: none;
        }

        .intensity-value {
          font-size: 13px;
          font-weight: 600;
          color: #666;
        }

        .remove-aspect-btn {
          width: 32px;
          height: 32px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-aspect-btn:hover {
          background: #d32f2f;
        }

        .notes-section textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
        }

        .notes-section textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .notes-section textarea:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .cancel-btn,
        .save-btn,
        .submit-btn {
          padding: 12px 32px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: #e0e0e0;
          color: #666;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #d0d0d0;
        }

        .save-btn {
          background: #ff9800;
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          background: #f57c00;
          transform: translateY(-2px);
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .cancel-btn:disabled,
        .save-btn:disabled,
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .sentiment-buttons {
            grid-template-columns: repeat(2, 1fr);
          }

          .aspect-item {
            grid-template-columns: 1fr;
          }

          .actions {
            flex-direction: column;
          }

          .cancel-btn,
          .save-btn,
          .submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default SentimentAnnotation;
