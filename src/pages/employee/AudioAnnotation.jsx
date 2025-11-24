import { useState, useRef, useEffect } from 'react';

function AudioAnnotation({ task, existingAnnotation, onSave, onSubmit }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);

  // Transcription state
  const [transcription, setTranscription] = useState(
    existingAnnotation?.annotation_data?.transcription || ''
  );
  const [segments, setSegments] = useState(
    existingAnnotation?.annotation_data?.segments || []
  );

  // Labels/classification state
  const [selectedLabels, setSelectedLabels] = useState(
    existingAnnotation?.annotation_data?.labels || []
  );
  const [notes, setNotes] = useState(
    existingAnnotation?.annotation_data?.notes || ''
  );

  const availableLabels = task.labels || [
    'Speech',
    'Music',
    'Noise',
    'Silence',
    'Other'
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = volume;
    }
  }, [playbackRate, volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 5);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 5);
    }
  };

  const addTimestamp = () => {
    const timestamp = formatTime(currentTime);
    setTranscription(prev => prev + ` [${timestamp}] `);
  };

  const addSegment = () => {
    const newSegment = {
      id: Date.now(),
      start_time: currentTime,
      end_time: currentTime + 5,
      label: '',
      text: ''
    };
    setSegments([...segments, newSegment]);
  };

  const updateSegment = (id, field, value) => {
    setSegments(segments.map(seg =>
      seg.id === id ? { ...seg, [field]: value } : seg
    ));
  };

  const deleteSegment = (id) => {
    setSegments(segments.filter(seg => seg.id !== id));
  };

  const seekToSegment = (startTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      setCurrentTime(startTime);
    }
  };

  const toggleLabel = (label) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter(l => l !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
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
      transcription,
      segments: segments.map(seg => ({
        start_time: seg.start_time,
        end_time: seg.end_time,
        label: seg.label,
        text: seg.text
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
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 't':
          e.preventDefault();
          addTimestamp();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime]);

  return (
    <div className="audio-annotation">
      <div className="audio-header">
        <h2>Audio Annotation</h2>
        <div className="audio-info">
          <span>Duration: {formatTime(duration)}</span>
          <span>Current: {formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Audio Player */}
      <div className="audio-player">
        <audio
          ref={audioRef}
          src={task.media_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Waveform placeholder (simple progress bar for now) */}
        <div className="waveform">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="timeline-slider"
          />
          <div className="timeline-markers">
            {segments.map(seg => (
              <div
                key={seg.id}
                className="segment-marker"
                style={{
                  left: `${(seg.start_time / duration) * 100}%`,
                  width: `${((seg.end_time - seg.start_time) / duration) * 100}%`
                }}
                onClick={() => seekToSegment(seg.start_time)}
              />
            ))}
          </div>
        </div>

        {/* Player Controls */}
        <div className="player-controls">
          <button onClick={skipBackward} className="control-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
            <span>-5s</span>
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

          <button onClick={skipForward} className="control-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
            <span>+5s</span>
          </button>

          <div className="playback-controls">
            <label>
              Speed: {playbackRate}x
              <select value={playbackRate} onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}>
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
        <h3>Audio Classification</h3>
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

      {/* Transcription */}
      <div className="annotation-section">
        <div className="section-header">
          <h3>Transcription</h3>
          <button onClick={addTimestamp} className="timestamp-btn">
            Add Timestamp (T)
          </button>
        </div>
        <textarea
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          placeholder="Type transcription here... Press 'T' to insert timestamp at current playback position."
          className="transcription-editor"
          rows={8}
        />
      </div>

      {/* Segments */}
      <div className="annotation-section">
        <div className="section-header">
          <h3>Segments</h3>
          <button onClick={addSegment} className="add-segment-btn">
            Add Segment
          </button>
        </div>
        <div className="segments-list">
          {segments.length === 0 ? (
            <p className="empty-state">No segments added. Click "Add Segment" to create time-based segments.</p>
          ) : (
            segments.map((segment) => (
              <div key={segment.id} className="segment-item">
                <div className="segment-times">
                  <input
                    type="number"
                    value={segment.start_time}
                    onChange={(e) => updateSegment(segment.id, 'start_time', parseFloat(e.target.value))}
                    step="0.1"
                    className="time-input"
                  />
                  <span>→</span>
                  <input
                    type="number"
                    value={segment.end_time}
                    onChange={(e) => updateSegment(segment.id, 'end_time', parseFloat(e.target.value))}
                    step="0.1"
                    className="time-input"
                  />
                  <button onClick={() => seekToSegment(segment.start_time)} className="seek-btn">
                    ▶
                  </button>
                </div>
                <input
                  type="text"
                  value={segment.label}
                  onChange={(e) => updateSegment(segment.id, 'label', e.target.value)}
                  placeholder="Label (e.g., Speech, Music)"
                  className="segment-label-input"
                />
                <textarea
                  value={segment.text}
                  onChange={(e) => updateSegment(segment.id, 'text', e.target.value)}
                  placeholder="Segment transcription..."
                  className="segment-text"
                  rows={2}
                />
                <button onClick={() => deleteSegment(segment.id)} className="delete-segment-btn">
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
        <span>← = -5s</span>
        <span>→ = +5s</span>
        <span>T = Insert Timestamp</span>
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
        .audio-annotation {
          max-width: 1000px;
          margin: 0 auto;
        }

        .audio-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .audio-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .audio-info {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: #666;
        }

        .audio-player {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .waveform {
          position: relative;
          margin-bottom: 20px;
        }

        .timeline-slider {
          width: 100%;
          height: 60px;
          appearance: none;
          background: linear-gradient(to bottom, #e0e0e0 0%, #e0e0e0 40%, #667eea 40%, #667eea 60%, #e0e0e0 60%, #e0e0e0 100%);
          border-radius: 4px;
          cursor: pointer;
        }

        .timeline-slider::-webkit-slider-thumb {
          appearance: none;
          width: 4px;
          height: 60px;
          background: #667eea;
          cursor: pointer;
          border-radius: 2px;
        }

        .timeline-markers {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          pointer-events: none;
        }

        .segment-marker {
          position: absolute;
          height: 100%;
          background: rgba(102, 126, 234, 0.3);
          border: 1px solid #667eea;
          border-radius: 2px;
          pointer-events: all;
          cursor: pointer;
        }

        .segment-marker:hover {
          background: rgba(102, 126, 234, 0.5);
        }

        .player-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .control-btn,
        .play-btn {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px;
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
          width: 24px;
          height: 24px;
          color: #667eea;
        }

        .control-btn span {
          font-size: 12px;
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
          font-size: 14px;
          color: #666;
        }

        .playback-controls select {
          padding: 4px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
        }

        .volume-slider {
          width: 80px;
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

        .timestamp-btn,
        .add-segment-btn {
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

        .timestamp-btn:hover,
        .add-segment-btn:hover {
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

        .transcription-editor,
        .notes-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-family: 'Monaco', 'Courier New', monospace;
          resize: vertical;
        }

        .transcription-editor:focus,
        .notes-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .segments-list {
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

        .segment-item {
          background: #f9fafb;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .segment-times {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .time-input {
          width: 80px;
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

        .segment-label-input,
        .segment-text {
          width: 100%;
          padding: 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
        }

        .delete-segment-btn {
          align-self: flex-start;
          background: #ef4444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .delete-segment-btn:hover {
          background: #dc2626;
        }

        .shortcuts-help {
          background: #f0f2ff;
          border: 1px solid #c7d2fe;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 16px;
          display: flex;
          gap: 16px;
          font-size: 13px;
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
          .audio-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .player-controls {
            flex-wrap: wrap;
          }

          .playback-controls {
            width: 100%;
            margin-left: 0;
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

export default AudioAnnotation;
