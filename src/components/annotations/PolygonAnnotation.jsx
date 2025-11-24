import { useState, useEffect, useRef } from 'react';

function PolygonAnnotation({ task, initialAnnotation, onSave, onSubmit, onCancel }) {
  const [polygons, setPolygons] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scale, setScale] = useState(1);

  const imageUrl = task.data?.image_url || task.primary_file_url;
  const labels = task.project?.labels || ['object'];
  const initialLoadDone = useRef(false);

  // Load initial annotation if exists
  useEffect(() => {
    if (initialLoadDone.current) return;

    if (initialAnnotation?.annotation_data?.polygons) {
      setPolygons(initialAnnotation.annotation_data.polygons);
      setNotes(initialAnnotation.notes || '');
      initialLoadDone.current = true;
    }
  }, [initialAnnotation]);

  // Set default label
  useEffect(() => {
    if (labels.length > 0 && !selectedLabel) {
      setSelectedLabel(labels[0]);
    }
  }, [labels, selectedLabel]);

  // Draw polygons on canvas
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const image = imageRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match image display size
    canvas.width = image.offsetWidth;
    canvas.height = image.offsetHeight;

    const scaleX = canvas.width / image.naturalWidth;
    const scaleY = canvas.height / image.naturalHeight;
    setScale({ x: scaleX, y: scaleY });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw completed polygons
    polygons.forEach((polygon, index) => {
      if (polygon.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = getColorForLabel(polygon.label);
      ctx.fillStyle = getColorForLabel(polygon.label, 0.3);
      ctx.lineWidth = 3;

      // Draw polygon
      polygon.points.forEach((point, i) => {
        const x = point.x * scaleX;
        const y = point.y * scaleY;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      if (polygon.closed) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();

      // Draw vertices
      polygon.points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x * scaleX, point.y * scaleY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = getColorForLabel(polygon.label);
        ctx.fill();
      });

      // Draw label
      if (polygon.points.length > 0) {
        const firstPoint = polygon.points[0];
        ctx.fillStyle = getColorForLabel(polygon.label);
        ctx.font = '14px Arial';
        const text = `${polygon.label} (${polygon.points.length} pts)`;
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(firstPoint.x * scaleX, firstPoint.y * scaleY - 25, textWidth + 10, 25);
        ctx.fillStyle = 'white';
        ctx.fillText(text, firstPoint.x * scaleX + 5, firstPoint.y * scaleY - 7);
      }
    });

    // Draw current polygon being drawn
    if (currentPolygon && currentPolygon.points.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = getColorForLabel(selectedLabel);
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;

      currentPolygon.points.forEach((point, i) => {
        const x = point.x * scaleX;
        const y = point.y * scaleY;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Draw vertex
        ctx.save();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = getColorForLabel(selectedLabel);
        ctx.fill();
        ctx.restore();
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [polygons, currentPolygon, imageLoaded, selectedLabel]);

  const getColorForLabel = (label, alpha = 1) => {
    const colors = {
      'person': `rgba(255, 99, 132, ${alpha})`,
      'car': `rgba(54, 162, 235, ${alpha})`,
      'building': `rgba(255, 206, 86, ${alpha})`,
      'tree': `rgba(75, 192, 192, ${alpha})`,
      'road': `rgba(153, 102, 255, ${alpha})`,
      'object': `rgba(102, 126, 234, ${alpha})`
    };
    return colors[label] || `rgba(102, 126, 234, ${alpha})`;
  };

  const handleCanvasClick = (e) => {
    if (initialAnnotation?.status === 'submitted') return;
    if (!selectedLabel) {
      alert('Please select a label first');
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale.x;
    const y = (e.clientY - rect.top) / scale.y;

    if (!currentPolygon) {
      // Start new polygon
      setCurrentPolygon({
        points: [{ x, y }],
        label: selectedLabel,
        closed: false
      });
    } else {
      // Add point to current polygon
      setCurrentPolygon({
        ...currentPolygon,
        points: [...currentPolygon.points, { x, y }]
      });
    }
  };

  const handleFinishPolygon = () => {
    if (!currentPolygon || currentPolygon.points.length < 3) {
      alert('Polygon must have at least 3 points');
      return;
    }

    setPolygons([...polygons, { ...currentPolygon, closed: true }]);
    setCurrentPolygon(null);
  };

  const handleCancelCurrentPolygon = () => {
    setCurrentPolygon(null);
  };

  const handleDeletePolygon = (index) => {
    setPolygons(polygons.filter((_, i) => i !== index));
  };

  const buildAnnotationData = () => {
    return {
      annotation_type: 'polygon',
      annotation_data: {
        polygons: polygons.map(p => ({
          points: p.points,
          label: p.label,
          closed: p.closed
        })),
        image_url: imageUrl,
        image_width: imageRef.current?.naturalWidth,
        image_height: imageRef.current?.naturalHeight
      },
      notes: notes.trim() || null,
      confidence_score: polygons.length > 0 ? 0.9 : 0
    };
  };

  const handleSaveDraft = async () => {
    if (polygons.length === 0) {
      alert('Please draw at least one polygon before saving');
      return;
    }

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
    if (polygons.length === 0) {
      alert('Please draw at least one polygon before submitting');
      return;
    }

    if (currentPolygon) {
      alert('Please finish or cancel the current polygon before submitting');
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

  const isReadOnly = initialAnnotation?.status === 'submitted';

  return (
    <div className="polygon-annotation">
      {/* Instructions */}
      <div className="instructions">
        <h3>Instructions</h3>
        <ul>
          <li>Select a label from the toolbar below</li>
          <li>Click on the image to add points to your polygon</li>
          <li>Click "Finish Polygon" when done (minimum 3 points)</li>
          <li>Click "Cancel" to discard the current polygon</li>
          <li>You can draw multiple polygons with different labels</li>
        </ul>
      </div>

      {/* Label Selector & Tools */}
      {!isReadOnly && (
        <div className="toolbar">
          <div className="label-selector">
            <label>Select Label:</label>
            <select value={selectedLabel} onChange={(e) => setSelectedLabel(e.target.value)}>
              {labels.map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>

          {currentPolygon && (
            <div className="polygon-tools">
              <span className="points-count">
                {currentPolygon.points.length} point{currentPolygon.points.length !== 1 ? 's' : ''}
              </span>
              <button onClick={handleFinishPolygon} className="finish-btn">
                Finish Polygon
              </button>
              <button onClick={handleCancelCurrentPolygon} className="cancel-polygon-btn">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image Canvas */}
      <div className="canvas-container">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Annotation target"
          onLoad={() => setImageLoaded(true)}
          style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        />
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            cursor: isReadOnly ? 'default' : 'crosshair'
          }}
        />
      </div>

      {/* Polygons List */}
      {polygons.length > 0 && (
        <div className="polygons-list">
          <h3>Drawn Polygons ({polygons.length})</h3>
          {polygons.map((polygon, index) => (
            <div key={index} className="polygon-item">
              <div className="polygon-info">
                <span
                  className="polygon-color"
                  style={{ background: getColorForLabel(polygon.label) }}
                />
                <span className="polygon-label">{polygon.label}</span>
                <span className="polygon-points">{polygon.points.length} points</span>
              </div>
              {!isReadOnly && (
                <button
                  onClick={() => handleDeletePolygon(index)}
                  className="delete-polygon-btn"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="notes-section">
        <label htmlFor="notes">Notes (Optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about the annotations..."
          disabled={isReadOnly}
          rows="3"
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
        .polygon-annotation {
          max-width: 1200px;
          margin: 0 auto;
        }

        .instructions {
          background: #fffbf0;
          border: 2px solid #ffd54f;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .instructions h3 {
          font-size: 18px;
          font-weight: 700;
          color: #f57c00;
          margin-bottom: 12px;
        }

        .instructions ul {
          margin: 0;
          padding-left: 20px;
          color: #555;
        }

        .instructions li {
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .toolbar {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .label-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .label-selector label {
          font-weight: 600;
          color: #333;
        }

        .label-selector select {
          padding: 8px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .label-selector select:focus {
          outline: none;
          border-color: #667eea;
        }

        .polygon-tools {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .points-count {
          padding: 8px 12px;
          background: #e3f2fd;
          color: #1976d2;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
        }

        .finish-btn,
        .cancel-polygon-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .finish-btn {
          background: #4caf50;
          color: white;
        }

        .finish-btn:hover {
          background: #388e3c;
          transform: translateY(-1px);
        }

        .cancel-polygon-btn {
          background: #f44336;
          color: white;
        }

        .cancel-polygon-btn:hover {
          background: #d32f2f;
          transform: translateY(-1px);
        }

        .canvas-container {
          position: relative;
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: inline-block;
          width: 100%;
        }

        .canvas-container img {
          display: block;
        }

        .polygons-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .polygons-list h3 {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          margin-bottom: 16px;
        }

        .polygon-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .polygon-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .polygon-color {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .polygon-label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .polygon-points {
          font-size: 13px;
          color: #666;
        }

        .delete-polygon-btn {
          padding: 6px 12px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .delete-polygon-btn:hover {
          background: #d32f2f;
        }

        .notes-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .notes-section label {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
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
          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .polygon-tools {
            flex-wrap: wrap;
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

export default PolygonAnnotation;
