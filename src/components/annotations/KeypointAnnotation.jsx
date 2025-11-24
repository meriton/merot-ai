import { useState, useEffect, useRef } from 'react';

function KeypointAnnotation({ task, initialAnnotation, onSave, onSubmit, onCancel }) {
  const [keypoints, setKeypoints] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedKeypointIndex, setSelectedKeypointIndex] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scale, setScale] = useState(1);

  const imageUrl = task.data?.image_url || task.primary_file_url;
  const initialLoadDone = useRef(false);

  // Keypoint templates
  const templates = {
    'human_pose': [
      { label: 'nose', color: '#ff6b6b' },
      { label: 'left_eye', color: '#4ecdc4' },
      { label: 'right_eye', color: '#45b7d1' },
      { label: 'left_ear', color: '#96ceb4' },
      { label: 'right_ear', color: '#ffeaa7' },
      { label: 'left_shoulder', color: '#74b9ff' },
      { label: 'right_shoulder', color: '#a29bfe' },
      { label: 'left_elbow', color: '#fd79a8' },
      { label: 'right_elbow', color: '#fdcb6e' },
      { label: 'left_wrist', color: '#6c5ce7' },
      { label: 'right_wrist', color: '#00b894' },
      { label: 'left_hip', color: '#e17055' },
      { label: 'right_hip', color: '#0984e3' },
      { label: 'left_knee', color: '#00cec9' },
      { label: 'right_knee', color: '#d63031' },
      { label: 'left_ankle', color: '#fdcb6e' },
      { label: 'right_ankle', color: '#e84393' }
    ],
    'face_landmarks': [
      { label: 'left_eye', color: '#4ecdc4' },
      { label: 'right_eye', color: '#45b7d1' },
      { label: 'nose_tip', color: '#ff6b6b' },
      { label: 'mouth_left', color: '#96ceb4' },
      { label: 'mouth_right', color: '#ffeaa7' },
      { label: 'chin', color: '#74b9ff' }
    ],
    'hand': [
      { label: 'wrist', color: '#ff6b6b' },
      { label: 'thumb_tip', color: '#4ecdc4' },
      { label: 'index_tip', color: '#45b7d1' },
      { label: 'middle_tip', color: '#96ceb4' },
      { label: 'ring_tip', color: '#ffeaa7' },
      { label: 'pinky_tip', color: '#74b9ff' }
    ],
    'custom': []
  };

  // Default connections for human pose
  const poseConnections = [
    ['nose', 'left_eye'], ['nose', 'right_eye'],
    ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
    ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    ['left_hip', 'left_knee'], ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'], ['right_knee', 'right_ankle']
  ];

  const [selectedTemplate, setSelectedTemplate] = useState('human_pose');

  // Load initial annotation if exists
  useEffect(() => {
    if (initialLoadDone.current) return;

    if (initialAnnotation?.annotation_data) {
      const data = initialAnnotation.annotation_data;
      setKeypoints(data.keypoints || []);
      setConnections(data.connections || []);
      setNotes(initialAnnotation.notes || '');
      initialLoadDone.current = true;
    }
  }, [initialAnnotation]);

  // Initialize keypoints from template
  useEffect(() => {
    if (keypoints.length === 0 && selectedTemplate !== 'custom') {
      const template = templates[selectedTemplate] || [];
      const initialKeypoints = template.map(t => ({
        x: null,
        y: null,
        label: t.label,
        visible: false,
        color: t.color
      }));
      setKeypoints(initialKeypoints);

      if (selectedTemplate === 'human_pose') {
        setConnections(poseConnections);
      }
    }
  }, [selectedTemplate]);

  // Draw keypoints on canvas
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

    // Draw connections
    connections.forEach(([labelA, labelB]) => {
      const pointA = keypoints.find(k => k.label === labelA && k.visible);
      const pointB = keypoints.find(k => k.label === labelB && k.visible);

      if (pointA && pointB) {
        ctx.beginPath();
        ctx.moveTo(pointA.x * scaleX, pointA.y * scaleY);
        ctx.lineTo(pointB.x * scaleX, pointB.y * scaleY);
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    // Draw keypoints
    keypoints.forEach((kp, index) => {
      if (!kp.visible || kp.x === null) return;

      const x = kp.x * scaleX;
      const y = kp.y * scaleY;
      const isSelected = index === selectedKeypointIndex;

      // Draw keypoint
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 10 : 7, 0, 2 * Math.PI);
      ctx.fillStyle = kp.color || '#667eea';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#fff' : 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = kp.color || '#667eea';
      ctx.font = '12px Arial';
      ctx.fontWeight = 'bold';
      const text = kp.label;
      const textWidth = ctx.measureText(text).width;
      ctx.fillRect(x - textWidth/2 - 4, y - 22, textWidth + 8, 16);
      ctx.fillStyle = 'white';
      ctx.fillText(text, x - textWidth/2, y - 10);
    });
  }, [keypoints, connections, imageLoaded, selectedKeypointIndex]);

  const handleCanvasClick = (e) => {
    if (initialAnnotation?.status === 'submitted') return;
    if (selectedKeypointIndex === null) {
      alert('Please select a keypoint from the list to place');
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale.x;
    const y = (e.clientY - rect.top) / scale.y;

    const newKeypoints = [...keypoints];
    newKeypoints[selectedKeypointIndex] = {
      ...newKeypoints[selectedKeypointIndex],
      x,
      y,
      visible: true
    };
    setKeypoints(newKeypoints);

    // Auto-select next keypoint
    const nextIndex = keypoints.findIndex((kp, i) => i > selectedKeypointIndex && !kp.visible);
    setSelectedKeypointIndex(nextIndex >= 0 ? nextIndex : null);
  };

  const handleKeypointSelect = (index) => {
    if (initialAnnotation?.status === 'submitted') return;
    setSelectedKeypointIndex(index === selectedKeypointIndex ? null : index);
  };

  const handleToggleVisibility = (index) => {
    const newKeypoints = [...keypoints];
    newKeypoints[index] = {
      ...newKeypoints[index],
      visible: !newKeypoints[index].visible,
      x: newKeypoints[index].visible ? null : newKeypoints[index].x,
      y: newKeypoints[index].visible ? null : newKeypoints[index].y
    };
    setKeypoints(newKeypoints);
  };

  const buildAnnotationData = () => {
    return {
      annotation_type: 'keypoint',
      annotation_data: {
        keypoints: keypoints.filter(k => k.visible).map(k => ({
          x: k.x,
          y: k.y,
          label: k.label,
          visible: k.visible
        })),
        connections,
        image_url: imageUrl,
        image_width: imageRef.current?.naturalWidth,
        image_height: imageRef.current?.naturalHeight
      },
      notes: notes.trim() || null,
      confidence_score: keypoints.filter(k => k.visible).length / keypoints.length
    };
  };

  const handleSaveDraft = async () => {
    const visibleCount = keypoints.filter(k => k.visible).length;
    if (visibleCount === 0) {
      alert('Please place at least one keypoint before saving');
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
    const visibleCount = keypoints.filter(k => k.visible).length;
    if (visibleCount === 0) {
      alert('Please place at least one keypoint before submitting');
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
  const visibleKeypointsCount = keypoints.filter(k => k.visible).length;

  return (
    <div className="keypoint-annotation">
      {/* Instructions */}
      <div className="instructions">
        <h3>Instructions</h3>
        <ul>
          <li>Select a template that matches your annotation task</li>
          <li>Click on a keypoint in the list to select it</li>
          <li>Click on the image to place the selected keypoint</li>
          <li>Mark keypoints as "Not Visible" if they're occluded or out of frame</li>
          <li>Connections between keypoints will be drawn automatically</li>
        </ul>
      </div>

      {/* Template Selector */}
      {!isReadOnly && keypoints.length === 0 && (
        <div className="template-selector">
          <label>Select Template:</label>
          <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
            <option value="human_pose">Human Pose (17 keypoints)</option>
            <option value="face_landmarks">Face Landmarks (6 keypoints)</option>
            <option value="hand">Hand (6 keypoints)</option>
          </select>
        </div>
      )}

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">Placed:</span>
          <span className="stat-value">{visibleKeypointsCount}/{keypoints.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Progress:</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(visibleKeypointsCount / keypoints.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="annotation-workspace">
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

        {/* Keypoints List */}
        <div className="keypoints-panel">
          <h3>Keypoints</h3>
          <div className="keypoints-list">
            {keypoints.map((kp, index) => (
              <div
                key={index}
                className={`keypoint-item ${index === selectedKeypointIndex ? 'selected' : ''} ${kp.visible ? 'placed' : ''}`}
                onClick={() => handleKeypointSelect(index)}
              >
                <div className="keypoint-info">
                  <span
                    className="keypoint-color"
                    style={{ background: kp.color }}
                  />
                  <span className="keypoint-label">{kp.label}</span>
                  {kp.visible && <span className="check-icon">✓</span>}
                </div>
                {!isReadOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(index);
                    }}
                    className={`visibility-btn ${kp.visible ? 'visible' : 'hidden'}`}
                  >
                    {kp.visible ? '👁️' : '👁️‍🗨️'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="notes-section">
        <label htmlFor="notes">Notes (Optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about the keypoints..."
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
        .keypoint-annotation {
          max-width: 1400px;
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

        .template-selector {
          background: white;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .template-selector label {
          font-weight: 600;
          color: #333;
        }

        .template-selector select {
          padding: 8px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .stats-bar {
          background: white;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          gap: 32px;
          align-items: center;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-label {
          font-weight: 600;
          color: #666;
          font-size: 14px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }

        .progress-bar {
          width: 200px;
          height: 12px;
          background: #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s;
        }

        .annotation-workspace {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
          margin-bottom: 24px;
        }

        .canvas-container {
          position: relative;
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .keypoints-panel {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          max-height: 600px;
          overflow-y: auto;
        }

        .keypoints-panel h3 {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          margin-bottom: 16px;
          position: sticky;
          top: 0;
          background: white;
          padding-bottom: 8px;
        }

        .keypoints-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .keypoint-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: #f5f7fa;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .keypoint-item:hover {
          background: #eef1f7;
        }

        .keypoint-item.selected {
          border-color: #667eea;
          background: #e8eaf6;
        }

        .keypoint-item.placed {
          background: #e8f5e9;
        }

        .keypoint-item.placed.selected {
          background: #c8e6c9;
          border-color: #4caf50;
        }

        .keypoint-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .keypoint-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .keypoint-label {
          font-size: 13px;
          font-weight: 600;
          color: #333;
        }

        .check-icon {
          color: #4caf50;
          font-size: 16px;
        }

        .visibility-btn {
          padding: 4px 8px;
          background: transparent;
          border: none;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .visibility-btn:hover {
          transform: scale(1.1);
        }

        .visibility-btn.hidden {
          opacity: 0.4;
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

        @media (max-width: 1024px) {
          .annotation-workspace {
            grid-template-columns: 1fr;
          }

          .keypoints-panel {
            max-height: none;
          }

          .stats-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .progress-bar {
            width: 100%;
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

export default KeypointAnnotation;
