import React, { useState } from 'react';
import './HelpCenter.css';

const HelpCenter = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
    { id: 'tasks', label: 'Tasks & Annotation', icon: '📝' },
    { id: 'quality', label: 'Quality & Reviews', icon: '⭐' },
    { id: 'technical', label: 'Technical Issues', icon: '🔧' },
    { id: 'account', label: 'Account & Settings', icon: '👤' },
  ];

  const faqs = {
    'getting-started': [
      {
        question: 'How do I get started with annotation?',
        answer: 'After logging in, you\'ll see your dashboard with assigned tasks. Click on any task to start annotating. Make sure to read the project guidelines before beginning. If you haven\'t completed onboarding, you\'ll be guided through a quick tour of the platform.'
      },
      {
        question: 'What are the different task types?',
        answer: 'Our platform supports various annotation types including: Text Classification, Named Entity Recognition (NER), Sentiment Analysis, Image Annotation (bounding boxes, polygons, keypoints), Audio Transcription, and Video Annotation. Each task type has specific tools and guidelines.'
      },
      {
        question: 'How do I understand project guidelines?',
        answer: 'Each task page has a collapsible Guidelines section at the top. Click on it to view detailed instructions, examples, label definitions, and tips. The guidelines are organized into tabs: Overview, Instructions, Labels, Examples, and Tips.'
      },
      {
        question: 'What if I don\'t understand a task?',
        answer: 'Use the comment feature on the task page to ask questions. Your questions will be visible to reviewers and project managers who can provide clarification. You can also check the Examples tab in the guidelines section.'
      },
    ],
    'tasks': [
      {
        question: 'How do I save my work?',
        answer: 'Click the "Save Draft" button to save your work in progress. Your annotation will be saved and you can return to it later. Drafts are automatically saved for your convenience.'
      },
      {
        question: 'Can I edit a submitted annotation?',
        answer: 'Yes! If your annotation is still in "submitted" status (not yet reviewed), you can click the "Unsubmit & Edit" button to return it to draft status. After editing, you can resubmit it.'
      },
      {
        question: 'What happens after I submit an annotation?',
        answer: 'Your submission enters the review queue. A reviewer will check your work and either approve it, request revisions, or reject it with feedback. You\'ll receive a notification about the review decision.'
      },
      {
        question: 'How long should each task take?',
        answer: 'Task duration varies by type and complexity. Focus on quality over speed. The platform tracks your time spent, but accuracy is more important than completion time. Your quality score is based on accuracy, not speed.'
      },
      {
        question: 'Can I work on multiple tasks at once?',
        answer: 'Yes, you can save drafts on multiple tasks and switch between them. However, we recommend focusing on one task at a time to maintain quality and avoid confusion.'
      },
    ],
    'quality': [
      {
        question: 'How is my work quality measured?',
        answer: 'Your quality is measured through reviewer feedback and approval rates. Reviewers assess your annotations based on accuracy, completeness, and adherence to guidelines. Your quality score is updated after each review.'
      },
      {
        question: 'What does "Request Revision" mean?',
        answer: 'When a reviewer requests revision, they\'ve identified areas for improvement but believe the annotation can be fixed. Check the revision feedback carefully, make the necessary changes, and resubmit.'
      },
      {
        question: 'How can I improve my quality score?',
        answer: 'Read guidelines thoroughly before starting, review examples, ask questions when unsure, double-check your work before submitting, and learn from reviewer feedback on previous submissions.'
      },
      {
        question: 'What happens if my annotation is rejected?',
        answer: 'Rejection means the annotation needs significant rework. Review the feedback from the reviewer, understand what went wrong, and redo the annotation following the guidelines more carefully. Rejections are learning opportunities.'
      },
      {
        question: 'Can I see my performance analytics?',
        answer: 'Yes! Visit the Analytics page to see your quality metrics, approval rates, tasks completed, average time per task, and performance trends over time.'
      },
    ],
    'technical': [
      {
        question: 'The platform is running slowly. What should I do?',
        answer: 'Try refreshing the page, clearing your browser cache, or using a different browser. Chrome and Firefox work best. If issues persist, contact support with details about your browser and operating system.'
      },
      {
        question: 'I can\'t upload an image/audio/video file. Why?',
        answer: 'Check that your file meets the size and format requirements. Maximum file size is typically 50MB. Supported formats: Images (JPG, PNG, GIF), Audio (MP3, WAV, M4A), Video (MP4, MOV). If the file meets requirements and still fails, contact support.'
      },
      {
        question: 'My annotations aren\'t saving. What\'s wrong?',
        answer: 'This could be due to a network issue or session timeout. Check your internet connection and ensure you\'re still logged in. Try refreshing the page and logging in again. If the problem persists, contact support.'
      },
      {
        question: 'How do I report a bug?',
        answer: 'Use the "Report Issue" button in the help menu or contact support directly with a description of the problem, what you were doing when it occurred, and any error messages you saw.'
      },
      {
        question: 'Which browsers are supported?',
        answer: 'We recommend using the latest versions of Google Chrome or Mozilla Firefox for the best experience. Safari and Edge are also supported but may have limited functionality for some features.'
      },
    ],
    'account': [
      {
        question: 'How do I change my password?',
        answer: 'Currently, password changes must be requested through your account manager or administrator. Contact support if you need to reset your password.'
      },
      {
        question: 'Can I update my profile information?',
        answer: 'Basic profile information can be updated through the Settings page. For changes to email address or other critical information, contact your administrator.'
      },
      {
        question: 'How do notifications work?',
        answer: 'You\'ll receive notifications for task assignments, review feedback, revision requests, and important updates. Check the notification bell icon in the header to see your notifications.'
      },
      {
        question: 'What should I do if I can\'t log in?',
        answer: 'Ensure you\'re using the correct email and password. If you forgot your password, contact support for a reset. Make sure cookies are enabled in your browser.'
      },
      {
        question: 'How can I see my work history?',
        answer: 'Visit the Analytics page to see your completed tasks, review history, and performance metrics. You can also export your data for personal records.'
      },
    ],
  };

  const quickLinks = [
    { title: 'View Guidelines', icon: '📚', link: '/employee/tasks', description: 'Access project guidelines' },
    { title: 'My Analytics', icon: '📊', link: '/employee/analytics', description: 'View your performance' },
    { title: 'Contact Support', icon: '💬', action: 'contact', description: 'Get help from our team' },
    { title: 'Video Tutorials', icon: '🎥', action: 'tutorials', description: 'Watch how-to videos' },
  ];

  const filteredFAQs = () => {
    const categoryFAQs = faqs[activeCategory] || [];

    if (!searchQuery) {
      return categoryFAQs;
    }

    const query = searchQuery.toLowerCase();
    return categoryFAQs.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  };

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleQuickLinkClick = (link) => {
    if (link.link) {
      window.location.href = link.link;
    } else if (link.action === 'contact') {
      alert('Please email support@merot.ai for assistance or contact your project manager.');
    } else if (link.action === 'tutorials') {
      alert('Video tutorials coming soon! Check back later.');
    }
  };

  return (
    <div className="help-center">
      <div className="help-header">
        <div className="header-content">
          <h1>Help Center</h1>
          <p>Find answers to common questions and get support</p>
        </div>
      </div>

      <div className="help-container">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-box">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <h2>Quick Links</h2>
          <div className="links-grid">
            {quickLinks.map((link, index) => (
              <div
                key={index}
                className="link-card"
                onClick={() => handleQuickLinkClick(link)}
              >
                <div className="link-icon">{link.icon}</div>
                <h3>{link.title}</h3>
                <p>{link.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>

          {/* Categories */}
          <div className="categories">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(category.id);
                  setSearchQuery('');
                  setExpandedFAQ(null);
                }}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-label">{category.label}</span>
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="faq-list">
            {filteredFAQs().length > 0 ? (
              filteredFAQs().map((faq, index) => (
                <div
                  key={index}
                  className={`faq-item ${expandedFAQ === index ? 'expanded' : ''}`}
                >
                  <div className="faq-question" onClick={() => toggleFAQ(index)}>
                    <h3>{faq.question}</h3>
                    <span className="faq-toggle">{expandedFAQ === index ? '−' : '+'}</span>
                  </div>
                  {expandedFAQ === index && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No FAQs found matching "{searchQuery}"</p>
                <p>Try a different search term or browse categories above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="contact-section">
          <div className="contact-card">
            <div className="contact-icon">💬</div>
            <div className="contact-content">
              <h3>Still Need Help?</h3>
              <p>Can't find what you're looking for? Our support team is here to help.</p>
              <button
                className="contact-btn"
                onClick={() => alert('Please email support@merot.ai for assistance or contact your project manager.')}
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
