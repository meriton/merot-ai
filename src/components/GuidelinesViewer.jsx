import React, { useState } from 'react';
import './GuidelinesViewer.css';

const GuidelinesViewer = ({ project, taskType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!project) {
    return null;
  }

  const { guidelines = {}, labels = [] } = project;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'instructions', label: 'Instructions', icon: '📝' },
    { id: 'labels', label: 'Labels', icon: '🏷️' },
    { id: 'examples', label: 'Examples', icon: '💡' },
    { id: 'tips', label: 'Tips', icon: '⭐' },
  ];

  const renderOverview = () => (
    <div className="guideline-section">
      <h3>Project Overview</h3>
      <div className="overview-content">
        <div className="info-row">
          <strong>Project:</strong>
          <span>{project.name}</span>
        </div>
        <div className="info-row">
          <strong>Task Type:</strong>
          <span>{taskType || 'N/A'}</span>
        </div>
        {guidelines.description && (
          <div className="description-box">
            <p>{guidelines.description}</p>
          </div>
        )}
        {guidelines.objective && (
          <div className="objective-box">
            <h4>Objective</h4>
            <p>{guidelines.objective}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderInstructions = () => (
    <div className="guideline-section">
      <h3>Step-by-Step Instructions</h3>
      {guidelines.instructions ? (
        <ol className="instructions-list">
          {guidelines.instructions.map((instruction, index) => (
            <li key={index} className="instruction-item">
              <div className="instruction-number">{index + 1}</div>
              <div className="instruction-content">
                <h4>{instruction.title || `Step ${index + 1}`}</h4>
                <p>{instruction.description}</p>
                {instruction.note && (
                  <div className="instruction-note">
                    <strong>Note:</strong> {instruction.note}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="placeholder-message">
          <p>No specific instructions available. Please follow general annotation guidelines.</p>
        </div>
      )}
    </div>
  );

  const renderLabels = () => (
    <div className="guideline-section">
      <h3>Available Labels</h3>
      {labels && labels.length > 0 ? (
        <div className="labels-grid">
          {labels.map((label, index) => (
            <div key={index} className="label-card">
              <div className="label-header">
                <div className="label-name">{label.name || label}</div>
                {label.color && (
                  <div
                    className="label-color"
                    style={{ backgroundColor: label.color }}
                  />
                )}
              </div>
              {label.description && (
                <p className="label-description">{label.description}</p>
              )}
              {label.examples && label.examples.length > 0 && (
                <div className="label-examples">
                  <strong>Examples:</strong>
                  <ul>
                    {label.examples.map((example, idx) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="placeholder-message">
          <p>No labels defined for this project.</p>
        </div>
      )}
    </div>
  );

  const renderExamples = () => (
    <div className="guideline-section">
      <h3>Annotation Examples</h3>
      {guidelines.examples ? (
        <div className="examples-list">
          {guidelines.examples.map((example, index) => (
            <div key={index} className="example-card">
              <div className="example-header">
                <span className={`example-badge ${example.type}`}>
                  {example.type === 'good' ? '✓ Good Example' : '✗ Bad Example'}
                </span>
              </div>
              <div className="example-content">
                {example.input && (
                  <div className="example-input">
                    <strong>Input:</strong>
                    <pre>{example.input}</pre>
                  </div>
                )}
                {example.output && (
                  <div className="example-output">
                    <strong>Annotation:</strong>
                    <pre>{JSON.stringify(example.output, null, 2)}</pre>
                  </div>
                )}
                {example.explanation && (
                  <div className="example-explanation">
                    <strong>Explanation:</strong>
                    <p>{example.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="placeholder-message">
          <p>No examples available yet. Contact your project manager if you need clarification.</p>
        </div>
      )}
    </div>
  );

  const renderTips = () => (
    <div className="guideline-section">
      <h3>Tips & Best Practices</h3>
      {guidelines.tips ? (
        <div className="tips-list">
          {guidelines.tips.map((tip, index) => (
            <div key={index} className="tip-card">
              <div className="tip-icon">💡</div>
              <div className="tip-content">
                <h4>{tip.title || `Tip ${index + 1}`}</h4>
                <p>{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tips-list">
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <div className="tip-content">
              <h4>Focus on Accuracy</h4>
              <p>Take your time to ensure accurate annotations rather than rushing through tasks.</p>
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📖</div>
            <div className="tip-content">
              <h4>Review Guidelines Regularly</h4>
              <p>Refer back to guidelines frequently, especially when encountering edge cases.</p>
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">💬</div>
            <div className="tip-content">
              <h4>Ask Questions</h4>
              <p>If you're unsure about something, use comments to ask questions before submitting.</p>
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🔍</div>
            <div className="tip-content">
              <h4>Double Check</h4>
              <p>Always review your work before submission to catch any mistakes.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'instructions':
        return renderInstructions();
      case 'labels':
        return renderLabels();
      case 'examples':
        return renderExamples();
      case 'tips':
        return renderTips();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={`guidelines-viewer ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="guidelines-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-left">
          <span className="header-icon">📚</span>
          <h2>Project Guidelines</h2>
        </div>
        <div className="header-right">
          {!isExpanded && (
            <span className="expand-hint">Click to view guidelines</span>
          )}
          <button className="toggle-button">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="guidelines-content">
          <div className="guidelines-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="guidelines-body">
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidelinesViewer;
