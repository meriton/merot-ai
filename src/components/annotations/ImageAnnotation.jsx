import { useState, useEffect, useRef } from 'react';

function ImageAnnotation({ task, initialAnnotation, onSave, onSubmit, onCancel }) {
  const [boxes, setBoxes] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [confidence, setConfidence] = useState(0.95);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState(null);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const imageUrl = task?.data?.image_url || '';
  const availableLabels = task?.data?.labels || task?.project?.labels || ['person', 'car', 'object'];
  const mlSuggestions = initialAnnotation?.ml_suggestions?.boxes || [];

  useEffect(() => {
    // Load existing boxes or ML suggestions
    if (initialAnnotation?.annotation_data?.boxes) {
      setBoxes(initialAnnotation.annotation_data.boxes);
    } else if (mlSuggestions.length > 0) {
      setBoxes(mlSuggestions);
    }
  }, [initialAnnotation, mlSuggestions]);

  useEffect(() => {
    if (imageRef.current?.complete) {
      handleImageLoad();
    }
  }, [boxes]);

  const handleImageLoad = () => {
    const img = imageRef.current;
    if (!img) return;

    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });

    drawCanvas();
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale
    const scaleX = img.width / img.naturalWidth;
    const scaleY = img.height / img.naturalHeight;

    // Draw existing boxes
    boxes.forEach((box, index) => {
      const x = box.x * scaleX;
      const y = box.y * scaleY;
      const width = box.width * scaleX;
      const height = box.height * scaleY;

      // Box color based on label or selection
      const isSelected = index === selectedBoxIndex;
      ctx.strokeStyle = isSelected ? '#667eea' : getLabelColor(box.label);
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(x, y, width, height);

      // Label background
      ctx.fillStyle = isSelected ? '#667eea' : getLabelColor(box.label);
      const labelText = `${box.label} ${Math.round(box.confidence * 100)}%`;
      const textMetrics = ctx.measureText(labelText);
      const labelPadding = 4;
      const labelHeight = 20;

      ctx.fillRect(
        x,
        y - labelHeight,
        textMetrics.width + labelPadding * 2,
        labelHeight
      );

      // Label text
      ctx.fillStyle = 'white';
      ctx.font = '12px sans-serif';
      ctx.fillText(labelText, x + labelPadding, y - 5);
    });

    // Draw current box being drawn
    if (currentBox) {
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        currentBox.x,
        currentBox.y,
        currentBox.width,
        currentBox.height
      );
      ctx.setLineDash([]);
    }
  };

  const getLabelColor = (label) => {
    const colors = {
      person: '#4caf50',
      car: '#2196f3',
      object: '#ff9800',
      animal: '#9c27b0',
      building: '#f44336'
    };
    return colors[label] || '#607d8b';
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    if (!selectedLabel) {
      setError('Please select a label before drawing');
      return;
    }

    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setCurrentBox({
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0
    });
    setError(null);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentBox) return;

    const coords = getCanvasCoordinates(e);
    const newBox = {
      ...currentBox,
      width: coords.x - currentBox.x,
      height: coords.y - currentBox.y
    };

    setCurrentBox(newBox);
    drawCanvas();
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox) return;

    // Only add box if it has minimum size
    if (Math.abs(currentBox.width) > 10 && Math.abs(currentBox.height) > 10) {
      const img = imageRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      // Normalize box (handle negative width/height)
      let { x, y, width, height } = currentBox;
      if (width < 0) {
        x += width;
        width = Math.abs(width);
      }
      if (height < 0) {
        y += height;
        height = Math.abs(height);
      }

      const newBox = {
        x: x * scaleX,
        y: y * scaleY,
        width: width * scaleX,
        height: height * scaleY,
        label: selectedLabel,
        confidence
      };

      setBoxes([...boxes, newBox]);
    }

    setIsDrawing(false);
    setCurrentBox(null);
    drawCanvas();
  };

  const handleDeleteBox = (index) => {
    setBoxes(boxes.filter((_, i) => i !== index));
    setSelectedBoxIndex(null);
  };

  const handleSave = async (submit = false) => {
    if (boxes.length === 0) {
      setError('Please draw at least one bounding box');
      return;
    }

    setSaving(true);
    setError(null);

    const annotationData = {
      annotation_type: 'bounding_box',
      annotation_data: {
        boxes,
        image_url: imageUrl,
        image_width: imageDimensions.width,
        image_height: imageDimensions.height
      },
      confidence_score: boxes.reduce((sum, b) => sum + b.confidence, 0) / boxes.length
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

  return (
    <div className="image-annotation">
      <div className="annotation-header">
        <h2>Image Annotation - Bounding Boxes</h2>
        <p>Select a label and draw boxes around objects in the image</p>
      </div>

      {/* ML Suggestions */}
      {mlSuggestions.length > 0 && boxes.length === 0 && (
        <div className="ml-suggestion">
          <div className="suggestion-header">
            <svg className="suggestion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>AI Suggestions Available</span>
          </div>
          <p className="suggestion-note">
            We found {mlSuggestions.length} suggested boxes. They are pre-loaded - review and edit as needed.
          </p>
        </div>
      )}

      {/* Label Selection */}
      <div className="controls-section">
        <div className="label-selection">
          <label className="control-label">Select Label:</label>
          <div className="labels-row">
            {availableLabels.map((label) => (
              <button
                key={label}
                className={`label-btn ${selectedLabel === label ? 'selected' : ''}`}
                onClick={() => setSelectedLabel(label)}
                style={{
                  borderColor: selectedLabel === label ? getLabelColor(label) : '#e0e0e0',
                  color: selectedLabel === label ? 'white' : '#333',
                  background: selectedLabel === label ? getLabelColor(label) : 'white'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="confidence-control">
          <label className="control-label">
            Confidence:
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
          />
        </div>
      </div>

      {/* Image Canvas */}
      <div className="image-container">
        {!imageUrl ? (
          <div className="no-image">
            <p>No image available for this task</p>
          </div>
        ) : (
          <div className="canvas-wrapper">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Annotation target"
              className="annotation-image"
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
            <canvas
              ref={canvasRef}
              className="annotation-canvas"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="instructions">
        <strong>Instructions:</strong>
        <ol>
          <li>Select a label from the options above</li>
          <li>Click and drag on the image to draw a bounding box</li>
          <li>Release to create the box</li>
          <li>Click on boxes in the list below to highlight or delete them</li>
        </ol>
      </div>

      {/* Boxes List */}
      <div className="boxes-section">
        <label className="section-label">
          Bounding Boxes ({boxes.length})
        </label>
        {boxes.length === 0 ? (
          <div className="no-boxes">
            <p>No bounding boxes drawn yet</p>
            <span>Select a label and draw boxes on the image above</span>
          </div>
        ) : (
          <div className="boxes-list">
            {boxes.map((box, index) => (
              <div
                key={index}
                className={`box-item ${selectedBoxIndex === index ? 'selected' : ''}`}
                onClick={() => setSelectedBoxIndex(index)}
              >
                <div className="box-item-header">
                  <span className="box-label" style={{ background: getLabelColor(box.label) }}>
                    {box.label}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBox(index);
                    }}
                    className="delete-box-btn"
                    title="Delete"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="box-item-meta">
                  <span>Position: ({Math.round(box.x)}, {Math.round(box.y)})</span>
                  <span>Size: {Math.round(box.width)} × {Math.round(box.height)}</span>
                  <span>Confidence: {Math.round(box.confidence * 100)}%</span>
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
          disabled={saving || boxes.length === 0}
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={() => handleSave(true)}
          className="action-btn submit-btn"
          disabled={saving || boxes.length === 0}
        >
          {saving ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      <style>{`
        .image-annotation {
          max-width: 1200px;
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

        .controls-section {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .control-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #555;
          margin-bottom: 8px;
        }

        .label-selection {
          margin-bottom: 20px;
        }

        .labels-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .label-btn {
          padding: 8px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: capitalize;
        }

        .label-btn:hover:not(.selected) {
          border-color: #667eea;
          background: #f0f2ff;
        }

        .confidence-control {
          max-width: 300px;
        }

        .confidence-value {
          float: right;
          color: #667eea;
          font-size: 16px;
        }

        .confidence-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e0e0e0;
          outline: none;
          -webkit-appearance: none;
        }

        .confidence-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
        }

        .confidence-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          border: none;
        }

        .image-container {
          margin-bottom: 24px;
          background: #f5f5f5;
          border-radius: 12px;
          overflow: hidden;
        }

        .no-image {
          padding: 64px;
          text-align: center;
          color: #999;
        }

        .canvas-wrapper {
          position: relative;
          display: inline-block;
          width: 100%;
        }

        .annotation-image {
          display: block;
          max-width: 100%;
          height: auto;
        }

        .annotation-canvas {
          position: absolute;
          top: 0;
          left: 0;
          cursor: crosshair;
        }

        .instructions {
          background: #fffbf0;
          border: 2px solid #ffd54f;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #555;
        }

        .instructions strong {
          color: #f57c00;
        }

        .instructions ol {
          margin: 8px 0 0 20px;
          padding: 0;
        }

        .instructions li {
          margin: 4px 0;
        }

        .boxes-section {
          margin-bottom: 24px;
        }

        .no-boxes {
          text-align: center;
          padding: 48px;
          background: white;
          border: 2px dashed #e0e0e0;
          border-radius: 12px;
        }

        .no-boxes p {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .no-boxes span {
          font-size: 14px;
          color: #666;
        }

        .boxes-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .box-item {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .box-item:hover {
          border-color: #667eea;
        }

        .box-item.selected {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .box-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .box-label {
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .delete-box-btn {
          background: #ffebee;
          border: none;
          border-radius: 4px;
          padding: 6px;
          cursor: pointer;
          color: #c62828;
          transition: background 0.2s;
        }

        .delete-box-btn:hover {
          background: #ef5350;
          color: white;
        }

        .box-item-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
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
          .boxes-list {
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

export default ImageAnnotation;
