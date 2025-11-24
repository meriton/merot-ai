import { useState, useRef, useEffect } from 'react';

function VideoAnnotation({ task, existingAnnotation, onSave, onSubmit }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);

  // Video annotation state
  const [events, setEvents] = useState(
    existingAnnotation?.annotation_data?.events || []
  );
  const [selectedLabels, setSelectedLabels] = useState(
    existingAnnotation?.annotation_data?.labels || []
  );
  const [notes, setNotes] = useState(
    existingAnnotation?.annotation_data?.notes || ''
  );

  // Frame annotation state (bounding boxes on current frame)
  const [currentFrameBoxes, setCurrentFrameBoxes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [currentBox, setCurrentBox] = useState(null);

  const availableLabels = task.labels || [
    'Action',
    'Object',
    'Person',
    'Text',
    'Other'
  ];

  const eventTypes = ['Action', 'Scene Change', 'Object Appearance', 'Custom'];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
      videoRef.current.volume = volume;
    }
  }, [playbackRate, volume]);

  useEffect(() => {
    // Render boxes when time changes
    renderFrameAnnotations();
  }, [currentTime, currentFrameBoxes]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);

      // Set up canvas
      if (canvasRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      }
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, currentTime - 1);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, currentTime + 1);
    }
  };

  const previousFrame = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, currentTime - 1/30);
    }
  };

  const nextFrame = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, currentTime + 1/30);
    }
  };

  const addEvent = () => {
    const newEvent = {
      id: Date.now(),
      timestamp: currentTime,
      type: 'Action',
      label: '',
      description: ''
    };
    setEvents([...events, newEvent]);
  };

  const updateEvent = (id, field, value) => {
    setEvents(events.map(evt =>
      evt.id === id ? { ...evt, [field]: value } : evt
    ));
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(evt => evt.id !== id));
  };

  const seekToEvent = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
    }
  };

  const toggleLabel = (label) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter(l => l !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  // Canvas drawing for bounding boxes
  const handleCanvasMouseDown = (e) => {
    if (isPlaying) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setDrawStart({ x, y });
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || !drawStart) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentBox({
      x: Math.min(drawStart.x, x),
      y: Math.min(drawStart.y, y),
      width: Math.abs(x - drawStart.x),
      height: Math.abs(y - drawStart.y)
    });
  };

  const handleCanvasMouseUp = () => {
    if (currentBox && currentBox.width > 10 && currentBox.height > 10) {
      const newBox = {
        id: Date.now(),
        frame_time: currentTime,
        ...currentBox,
        label: ''
      };
      setCurrentFrameBoxes([...currentFrameBoxes, newBox]);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentBox(null);
  };

  const deleteBox = (id) => {
    setCurrentFrameBoxes(currentFrameBoxes.filter(box => box.id !== id));
  };

  const updateBoxLabel = (id, label) => {
    setCurrentFrameBoxes(currentFrameBoxes.map(box =>
      box.id === id ? { ...box, label } : box
    ));
  };

  const renderFrameAnnotations = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw existing boxes for current frame (within 0.1s tolerance)
    const frameTolerance = 0.1;
    const boxesToDraw = currentFrameBoxes.filter(box =>
      Math.abs(box.frame_time - currentTime) < frameTolerance
    );

    boxesToDraw.forEach((box, index) => {
      ctx.strokeStyle = `hsl(${(index * 60) % 360}, 70%, 50%)`;
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      if (box.label) {
        ctx.fillStyle = `hsl(${(index * 60) % 360}, 70%, 50%)`;
        ctx.fillRect(box.x, box.y - 25, ctx.measureText(box.label).width + 10, 25);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(box.label, box.x + 5, box.y - 7);
      }
    });

    // Draw current drawing box
    if (currentBox) {
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      ctx.setLineDash([]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    const annotationData = {
      events: events.map(evt => ({
        timestamp: evt.timestamp,
        type: evt.type,
        label: evt.label,
        description: evt.description
      })),
      frame_annotations: currentFrameBoxes.map(box => ({
        frame_time: box.frame_time,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        label: box.label
      })),
      labels: selectedLabels,
      notes,
      duration
    };
    onSave(annotationData);
  };

  const handleSubmit = () => {
    handleSave();
    onSubmit();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            previousFrame();
          } else {
            skipBackward();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            nextFrame();
          } else {
            skipForward();
          }
          break;
        case 'e':
          e.preventDefault();
          addEvent();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime]);

  return (
    <div className="video-annotation">
      <div className="video-header">
        <h2>Video Annotation</h2>
        <div className="video-info">
          <span>Duration: {formatTime(duration)}</span>
          <span>Current: {formatTime(currentTime)}</span>
          <span>Frame: {Math.floor(currentTime * 30)}</span>
        </div>
      </div>

      {/* Video Player */}
      <div className="video-player">
        <div className="video-container">
          <video
            ref={videoRef}
            src={task.media_url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
          <canvas
            ref={canvasRef}
            className="annotation-canvas"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          />
        </div>

        {/* Timeline */}
        <div className="timeline">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            step="0.033"
            className="timeline-slider"
          />
          <div className="timeline-markers">
            {events.map(evt => (
              <div
                key={evt.id}
                className="event-marker"
                style={{ left: `${(evt.timestamp / duration) * 100}%` }}
                onClick={() => seekToEvent(evt.timestamp)}
                title={evt.label || evt.type}
              />
            ))}
          </div>
        </div>

        {/* Player Controls */}
        <div className="player-controls">
          <button onClick={previousFrame} className="control-btn" title="Previous Frame (Shift+←)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button onClick={skipBackward} className="control-btn" title="Back 1s (←)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
            <span>-1s</span>
          </button>

          <button onClick={togglePlayPause} className="play-btn">
            {isPlaying ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>

          <button onClick={skipForward} className="control-btn" title="Forward 1s (→)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
            <span>+1s</span>
          </button>

          <button onClick={nextFrame} className="control-btn" title="Next Frame (Shift+→)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="playback-controls">
            <label>
              Speed:
              <select value={playbackRate} onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}>
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1.0">1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2.0">2.0x</option>
              </select>
            </label>

            <label>
              Volume:
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Classification Labels */}
      <div className="annotation-section">
        <h3>Video Classification</h3>
        <div className="label-selection">
          {availableLabels.map((label) => (
            <button
              key={label}
              onClick={() => toggleLabel(label)}
              className={`label-btn ${selectedLabels.includes(label) ? 'selected' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Frame Annotations (Bounding Boxes) */}
      <div className="annotation-section">
        <h3>Frame Annotations</h3>
        <p className="instruction">Pause the video and draw bounding boxes on objects in the current frame.</p>
        <div className="frame-boxes-list">
          {currentFrameBoxes.length === 0 ? (
            <p className="empty-state">No bounding boxes drawn. Draw on the video canvas above.</p>
          ) : (
            currentFrameBoxes.map((box, index) => (
              <div key={box.id} className="box-item">
                <div className="box-info">
                  <span className="box-number" style={{ background: `hsl(${(index * 60) % 360}, 70%, 50%)` }}>
                    {index + 1}
                  </span>
                  <span>Frame: {formatTime(box.frame_time)}</span>
                  <input
                    type="text"
                    value={box.label}
                    onChange={(e) => updateBoxLabel(box.id, e.target.value)}
                    placeholder="Label this object..."
                    className="box-label-input"
                  />
                </div>
                <button onClick={() => deleteBox(box.id)} className="delete-box-btn">
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Events */}
      <div className="annotation-section">
        <div className="section-header">
          <h3>Timeline Events</h3>
          <button onClick={addEvent} className="add-event-btn">
            Add Event (E)
          </button>
        </div>
        <div className="events-list">
          {events.length === 0 ? (
            <p className="empty-state">No events added. Click "Add Event" to mark important moments.</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-time">
                  <input
                    type="number"
                    value={event.timestamp}
                    onChange={(e) => updateEvent(event.id, 'timestamp', parseFloat(e.target.value))}
                    step="0.1"
                    className="time-input"
                  />
                  <button onClick={() => seekToEvent(event.timestamp)} className="seek-btn">
                    ▶
                  </button>
                </div>
                <select
                  value={event.type}
                  onChange={(e) => updateEvent(event.id, 'type', e.target.value)}
                  className="event-type-select"
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={event.label}
                  onChange={(e) => updateEvent(event.id, 'label', e.target.value)}
                  placeholder="Event label..."
                  className="event-label-input"
                />
                <textarea
                  value={event.description}
                  onChange={(e) => updateEvent(event.id, 'description', e.target.value)}
                  placeholder="Event description..."
                  className="event-description"
                  rows={2}
                />
                <button onClick={() => deleteEvent(event.id)} className="delete-event-btn">
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="annotation-section">
        <h3>Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes or observations..."
          className="notes-textarea"
          rows={3}
        />
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="shortcuts-help">
        <strong>Keyboard Shortcuts:</strong>
        <span>Space = Play/Pause</span>
        <span>← = -1s</span>
        <span>→ = +1s</span>
        <span>Shift+← = Previous Frame</span>
        <span>Shift+→ = Next Frame</span>
        <span>E = Add Event</span>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={handleSave} className="save-btn">
          Save Draft
        </button>
        <button onClick={handleSubmit} className="submit-btn">
          Submit for Review
        </button>
      </div>

      <style>{`
        .video-annotation {
          max-width: 1200px;
          margin: 0 auto;
        }

        .video-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .video-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .video-info {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: #666;
        }

        .video-player {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .video-container {
          position: relative;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .video-container video {
          width: 100%;
          display: block;
        }

        .annotation-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          cursor: crosshair;
        }

        .timeline {
          position: relative;
          margin-bottom: 20px;
        }

        .timeline-slider {
          width: 100%;
          height: 40px;
          appearance: none;
          background: #e0e0e0;
          border-radius: 4px;
          cursor: pointer;
        }

        .timeline-slider::-webkit-slider-thumb {
          appearance: none;
          width: 4px;
          height: 40px;
          background: #667eea;
          cursor: pointer;
        }

        .timeline-markers {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40px;
          pointer-events: none;
        }

        .event-marker {
          position: absolute;
          width: 3px;
          height: 100%;
          background: #f59e0b;
          pointer-events: all;
          cursor: pointer;
        }

        .event-marker:hover {
          width: 5px;
          background: #f97316;
        }

        .player-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .control-btn,
        .play-btn {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .control-btn:hover,
        .play-btn:hover {
          border-color: #667eea;
          background: #f5f7ff;
        }

        .control-btn svg,
        .play-btn svg {
          width: 20px;
          height: 20px;
          color: #667eea;
        }

        .control-btn span {
          font-size: 11px;
          font-weight: 600;
          color: #667eea;
        }

        .playback-controls {
          display: flex;
          gap: 16px;
          margin-left: auto;
        }

        .playback-controls label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
        }

        .playback-controls select {
          padding: 4px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 13px;
        }

        .volume-slider {
          width: 70px;
        }

        .annotation-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .annotation-section h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .instruction {
          font-size: 14px;
          color: #666;
          margin-bottom: 16px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h3 {
          margin-bottom: 0;
        }

        .add-event-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-event-btn:hover {
          background: #5568d3;
        }

        .label-selection {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .label-btn {
          background: white;
          border: 2px solid #e0e0e0;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .label-btn:hover {
          border-color: #667eea;
        }

        .label-btn.selected {
          background: #667eea;
          border-color: #667eea;
          color: white;
          font-weight: 600;
        }

        .frame-boxes-list,
        .events-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-state {
          text-align: center;
          color: #999;
          padding: 24px;
          font-size: 14px;
        }

        .box-item,
        .event-item {
          background: #f9fafb;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .box-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .box-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 14px;
        }

        .box-label-input {
          flex: 1;
          padding: 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
        }

        .delete-box-btn,
        .delete-event-btn {
          align-self: flex-start;
          background: #ef4444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .delete-box-btn:hover,
        .delete-event-btn:hover {
          background: #dc2626;
        }

        .event-time {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .time-input {
          width: 100px;
          padding: 6px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
        }

        .seek-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .seek-btn:hover {
          background: #5568d3;
        }

        .event-type-select,
        .event-label-input,
        .event-description {
          width: 100%;
          padding: 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
        }

        .notes-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
        }

        .notes-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .shortcuts-help {
          background: #f0f2ff;
          border: 1px solid #c7d2fe;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 12px;
          color: #4338ca;
        }

        .shortcuts-help strong {
          margin-right: 8px;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .save-btn,
        .submit-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn {
          background: white;
          border: 2px solid #667eea;
          color: #667eea;
        }

        .save-btn:hover {
          background: #f5f7ff;
        }

        .submit-btn {
          background: #667eea;
          border: 2px solid #667eea;
          color: white;
        }

        .submit-btn:hover {
          background: #5568d3;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
          .video-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .video-info {
            flex-wrap: wrap;
          }

          .player-controls {
            justify-content: center;
          }

          .playback-controls {
            width: 100%;
            margin-left: 0;
            justify-content: space-between;
          }

          .action-buttons {
            flex-direction: column;
          }

          .save-btn,
          .submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default VideoAnnotation;
