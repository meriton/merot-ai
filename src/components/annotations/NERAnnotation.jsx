import { useState, useEffect, useRef } from 'react';

function NERAnnotation({ task, initialAnnotation, onSave, onSubmit, onCancel }) {
  const [entities, setEntities] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [confidence, setConfidence] = useState(0.95);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const textRef = useRef(null);

  const text = task?.data?.text || '';
  const availableLabels = task?.data?.labels || task?.project?.labels || ['PERSON', 'ORGANIZATION', 'LOCATION', 'DATE', 'MISC'];
  const mlSuggestions = initialAnnotation?.ml_suggestions?.entities || [];

  useEffect(() => {
    // Load existing entities or ML suggestions
    if (initialAnnotation?.annotation_data?.entities) {
      setEntities(initialAnnotation.annotation_data.entities);
    } else if (mlSuggestions.length > 0) {
      setEntities(mlSuggestions);
    }
  }, [initialAnnotation, mlSuggestions]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedStr = selection.toString().trim();

    if (selectedStr && textRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(textRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;
      const end = start + selectedStr.length;

      setSelectedText({
        text: selectedStr,
        start,
        end
      });
    }
  };

  const handleAddEntity = () => {
    if (!selectedText || !selectedLabel) {
      setError('Please select text and a label');
      return;
    }

    // Check for overlapping entities
    const hasOverlap = entities.some(entity =>
      (selectedText.start >= entity.start && selectedText.start < entity.end) ||
      (selectedText.end > entity.start && selectedText.end <= entity.end) ||
      (selectedText.start <= entity.start && selectedText.end >= entity.end)
    );

    if (hasOverlap) {
      setError('Selected text overlaps with existing entity');
      return;
    }

    const newEntity = {
      text: selectedText.text,
      label: selectedLabel,
      start: selectedText.start,
      end: selectedText.end,
      confidence
    };

    setEntities([...entities, newEntity].sort((a, b) => a.start - b.start));
    setSelectedText(null);
    setSelectedLabel('');
    setError(null);
    window.getSelection().removeAllRanges();
  };

  const handleDeleteEntity = (index) => {
    setEntities(entities.filter((_, i) => i !== index));
  };

  const handleSave = async (submit = false) => {
    if (entities.length === 0) {
      setError('Please tag at least one entity');
      return;
    }

    setSaving(true);
    setError(null);

    const annotationData = {
      annotation_type: 'ner',
      annotation_data: {
        entities,
        available_labels: availableLabels,
        text
      },
      confidence_score: entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length
    };

    try {
      if (submit) {
        await onSubmit(annotationData);
      } else {
        await onSave(annotationData);
      }
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${submit ? 'submit' : 'save'} annotation`);
    } finally {
      setSaving(false);
    }
  };

  const renderHighlightedText = () => {
    if (entities.length === 0) {
      return <span>{text}</span>;
    }

    const parts = [];
    let lastEnd = 0;

    const labelColors = {
      PERSON: '#e3f2fd',
      ORGANIZATION: '#fff3e0',
      LOCATION: '#e8f5e9',
      DATE: '#fce4ec',
      MISC: '#f3e5f5'
    };

    entities.forEach((entity, index) => {
      // Add text before entity
      if (entity.start > lastEnd) {
        parts.push(
          <span key={`text-${index}`}>
            {text.substring(lastEnd, entity.start)}
          </span>
        );
      }

      // Add highlighted entity
      const bgColor = labelColors[entity.label] || '#f5f5f5';
      parts.push(
        <mark
          key={`entity-${index}`}
          className="entity-highlight"
          style={{ backgroundColor: bgColor }}
          title={`${entity.label} (${Math.round(entity.confidence * 100)}%)`}
        >
          {entity.text}
          <span className="entity-label-tag">{entity.label}</span>
        </mark>
      );

      lastEnd = entity.end;
    });

    // Add remaining text
    if (lastEnd < text.length) {
      parts.push(
        <span key="text-end">
          {text.substring(lastEnd)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className="ner-annotation">
      <div className="annotation-header">
        <h2>Named Entity Recognition</h2>
        <p>Select text spans and assign entity labels</p>
      </div>

      {/* ML Suggestions */}
      {mlSuggestions.length > 0 && entities.length === 0 && (
        <div className="ml-suggestion">
          <div className="suggestion-header">
            <svg className="suggestion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>AI Suggestions Available</span>
          </div>
          <p className="suggestion-note">
            We found {mlSuggestions.length} suggested entities. They are pre-loaded - review and edit as needed.
          </p>
        </div>
      )}

      {/* Text Display */}
      <div className="text-display">
        <label className="section-label">
          Text (Select spans to tag)
        </label>
        <div
          ref={textRef}
          className="text-content selectable"
          onMouseUp={handleTextSelection}
        >
          {renderHighlightedText()}
        </div>
      </div>

      {/* Selection Controls */}
      {selectedText && (
        <div className="selection-controls">
          <div className="selected-info">
            <strong>Selected:</strong> "{selectedText.text}"
          </div>
          <div className="label-selector">
            <label>Assign Label:</label>
            <select
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
              className="label-select"
            >
              <option value="">Select a label...</option>
              {availableLabels.map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="confidence-input"
              placeholder="Confidence"
            />
            <button
              onClick={handleAddEntity}
              className="add-entity-btn"
              disabled={!selectedLabel}
            >
              Add Entity
            </button>
          </div>
        </div>
      )}

      {/* Entities List */}
      <div className="entities-section">
        <label className="section-label">
          Tagged Entities ({entities.length})
        </label>
        {entities.length === 0 ? (
          <div className="no-entities">
            <p>No entities tagged yet</p>
            <span>Select text in the document above and assign a label</span>
          </div>
        ) : (
          <div className="entities-list">
            {entities.map((entity, index) => (
              <div key={index} className="entity-item">
                <div className="entity-item-header">
                  <span className="entity-text">"{entity.text}"</span>
                  <button
                    onClick={() => handleDeleteEntity(index)}
                    className="delete-entity-btn"
                    title="Delete"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="entity-item-meta">
                  <span className="entity-label">{entity.label}</span>
                  <span className="entity-position">Position: {entity.start}-{entity.end}</span>
                  <span className="entity-confidence">{Math.round(entity.confidence * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
          disabled={saving || entities.length === 0}
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={() => handleSave(true)}
          className="action-btn submit-btn"
          disabled={saving || entities.length === 0}
        >
          {saving ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      <style>{`
        .ner-annotation {
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
          margin-bottom: 8px;
        }

        .suggestion-icon {
          width: 20px;
          height: 20px;
          color: #667eea;
        }

        .suggestion-header span {
          font-weight: 600;
          color: #667eea;
        }

        .suggestion-note {
          font-size: 14px;
          color: #555;
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
          line-height: 1.8;
          color: #333;
          min-height: 150px;
          max-height: 500px;
          overflow-y: auto;
        }

        .text-content.selectable {
          user-select: text;
          cursor: text;
        }

        .entity-highlight {
          padding: 2px 4px;
          border-radius: 4px;
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
        }

        .entity-highlight:hover {
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
        }

        .entity-label-tag {
          display: inline-block;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 3px;
          margin-left: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .selection-controls {
          background: #fffbf0;
          border: 2px solid #ffd54f;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .selected-info {
          font-size: 14px;
          margin-bottom: 12px;
          color: #555;
        }

        .selected-info strong {
          color: #f57c00;
        }

        .label-selector {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .label-selector label {
          font-weight: 600;
          color: #555;
        }

        .label-select {
          flex: 1;
          min-width: 200px;
          padding: 10px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          background: white;
        }

        .confidence-input {
          width: 80px;
          padding: 10px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
        }

        .add-entity-btn {
          padding: 10px 24px;
          background: #f57c00;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .add-entity-btn:hover:not(:disabled) {
          background: #e65100;
        }

        .add-entity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .entities-section {
          margin-bottom: 24px;
        }

        .no-entities {
          text-align: center;
          padding: 48px;
          background: white;
          border: 2px dashed #e0e0e0;
          border-radius: 12px;
        }

        .no-entities p {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .no-entities span {
          font-size: 14px;
          color: #666;
        }

        .entities-list {
          display: grid;
          gap: 12px;
        }

        .entity-item {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          transition: border-color 0.2s;
        }

        .entity-item:hover {
          border-color: #667eea;
        }

        .entity-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .entity-text {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .delete-entity-btn {
          background: #ffebee;
          border: none;
          border-radius: 4px;
          padding: 6px;
          cursor: pointer;
          color: #c62828;
          transition: background 0.2s;
        }

        .delete-entity-btn:hover {
          background: #ef5350;
          color: white;
        }

        .entity-item-meta {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .entity-label {
          background: #667eea;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .entity-position,
        .entity-confidence {
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
          .label-selector {
            flex-direction: column;
            align-items: stretch;
          }

          .label-select {
            width: 100%;
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

export default NERAnnotation;
