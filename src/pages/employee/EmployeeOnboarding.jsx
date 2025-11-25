import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeOnboarding.css';

const EmployeeOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Check if user has already completed onboarding
    const onboardingCompleted = localStorage.getItem('employee_onboarding_completed');
    if (onboardingCompleted === 'true') {
      navigate('/employee/dashboard');
    }
  }, [navigate]);

  const steps = [
    {
      title: 'Welcome to the Annotation Platform',
      icon: '👋',
      content: (
        <div className="step-content">
          <h2>Welcome to Your Annotation Workspace!</h2>
          <p>We're excited to have you join our team. This quick tour will help you get started with our annotation platform.</p>
          <div className="feature-highlights">
            <div className="feature-item">
              <div className="feature-icon">📝</div>
              <h3>Annotate Tasks</h3>
              <p>Work on text, image, audio, and video annotation tasks</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>Monitor your performance and quality metrics</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3>Quality Reviews</h3>
              <p>Get feedback from reviewers to improve your work</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Understanding Tasks',
      icon: '📋',
      content: (
        <div className="step-content">
          <h2>How Tasks Work</h2>
          <div className="task-workflow">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-info">
                <h3>Task Assignment</h3>
                <p>Tasks are assigned to you based on your skills and availability</p>
              </div>
            </div>
            <div className="workflow-arrow">↓</div>
            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-info">
                <h3>Annotation</h3>
                <p>Complete the annotation according to project guidelines</p>
              </div>
            </div>
            <div className="workflow-arrow">↓</div>
            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-info">
                <h3>Submission</h3>
                <p>Submit your work for review when ready</p>
              </div>
            </div>
            <div className="workflow-arrow">↓</div>
            <div className="workflow-step">
              <div className="step-number">4</div>
              <div className="step-info">
                <h3>Review</h3>
                <p>Reviewers check your work and provide feedback</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Quality Guidelines',
      icon: '⭐',
      content: (
        <div className="step-content">
          <h2>Maintaining Quality</h2>
          <p>Quality is our top priority. Here are key principles to follow:</p>
          <div className="guidelines-list">
            <div className="guideline-item">
              <div className="guideline-icon">📖</div>
              <div className="guideline-text">
                <h3>Read Guidelines Carefully</h3>
                <p>Each project has specific guidelines. Always review them before starting.</p>
              </div>
            </div>
            <div className="guideline-item">
              <div className="guideline-icon">🔍</div>
              <div className="guideline-text">
                <h3>Pay Attention to Detail</h3>
                <p>Accuracy is crucial. Double-check your work before submission.</p>
              </div>
            </div>
            <div className="guideline-item">
              <div className="guideline-icon">💬</div>
              <div className="guideline-text">
                <h3>Ask Questions</h3>
                <p>If you're unsure about something, use the comment feature to ask.</p>
              </div>
            </div>
            <div className="guideline-item">
              <div className="guideline-icon">🎓</div>
              <div className="guideline-text">
                <h3>Learn from Feedback</h3>
                <p>Review feedback from quality checks to continuously improve.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Using the Platform',
      icon: '🖥️',
      content: (
        <div className="step-content">
          <h2>Platform Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📋 Task Queue</h3>
              <p>View and select from available tasks assigned to you</p>
            </div>
            <div className="feature-card">
              <h3>✏️ Annotation Tools</h3>
              <p>Use specialized tools for different annotation types</p>
            </div>
            <div className="feature-card">
              <h3>💾 Save Drafts</h3>
              <p>Save your work in progress and come back later</p>
            </div>
            <div className="feature-card">
              <h3>📊 Analytics</h3>
              <p>Track your performance metrics and quality scores</p>
            </div>
            <div className="feature-card">
              <h3>🔔 Notifications</h3>
              <p>Get notified about task assignments and feedback</p>
            </div>
            <div className="feature-card">
              <h3>❓ Help Center</h3>
              <p>Access FAQs and support when you need help</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Ready to Start!',
      icon: '🚀',
      content: (
        <div className="step-content">
          <h2>You're All Set!</h2>
          <p>You've completed the onboarding tour and are ready to start annotating.</p>
          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>Head to your dashboard to see assigned tasks</li>
              <li>Review project guidelines before starting a task</li>
              <li>Use the help center if you have questions</li>
              <li>Track your progress in the analytics section</li>
            </ul>
          </div>
          <div className="encouragement">
            <p className="encouragement-text">
              Remember: Quality over speed. Take your time to do accurate work,
              and don't hesitate to ask questions!
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('employee_onboarding_completed', 'true');
    setCompleted(true);
    navigate('/employee/dashboard');
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="step-indicator">
          <span className="step-icon">{steps[currentStep].icon}</span>
          <span className="step-title">{steps[currentStep].title}</span>
          <span className="step-counter">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <div className="step-body">
          {steps[currentStep].content}
        </div>

        <div className="navigation-buttons">
          <div className="button-group-left">
            {currentStep > 0 && (
              <button onClick={handlePrevious} className="nav-button secondary">
                ← Previous
              </button>
            )}
          </div>
          <div className="button-group-right">
            {currentStep < steps.length - 1 && (
              <button onClick={handleSkip} className="nav-button text">
                Skip Tour
              </button>
            )}
            <button onClick={handleNext} className="nav-button primary">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next →'}
            </button>
          </div>
        </div>
      </div>

      <div className="step-dots">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            onClick={() => setCurrentStep(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default EmployeeOnboarding;
