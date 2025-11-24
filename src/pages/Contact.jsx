import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { contactAPI } from '../services/api';

function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    annotation_type: '',
    location: '',
    website: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    success: false,
    error: false,
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitting: false,
        success: false,
        error: true,
        message: 'Please fill in all required fields.'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        submitting: false,
        success: false,
        error: true,
        message: 'Please enter a valid email address.'
      });
      return;
    }

    setFormStatus({
      submitting: true,
      success: false,
      error: false,
      message: ''
    });

    try {
      await contactAPI.submit(formData);

      setFormStatus({
        submitting: false,
        success: true,
        error: false,
        message: 'Thank you for contacting us! We\'ll get back to you shortly.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        company_name: '',
        annotation_type: '',
        location: '',
        website: '',
        message: ''
      });

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      setFormStatus({
        submitting: false,
        success: false,
        error: true,
        message: error.response?.data?.error || 'Something went wrong. Please try again.'
      });
    }
  };

  return (
    <div className="contact-page">
      {/* Navigation */}
      <nav className="contact-nav">
        <Link to="/" className="nav-logo">
          <img src="/merotai-logo.png" alt="Merot.ai" className="logo" />
        </Link>
        <Link to="/" className="back-link">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </nav>

      {/* Contact Form Section */}
      <div className="contact-container">
        <div className="contact-content">
          <div className="contact-header">
            <h1>Ready to Get Started?</h1>
            <p>Join leading companies using Merot.ai for their data annotation needs</p>
          </div>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@company.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="company_name">Company Name</label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Your company name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="annotation_type">Annotation Needs</label>
                <select
                  id="annotation_type"
                  name="annotation_type"
                  value={formData.annotation_type}
                  onChange={handleInputChange}
                >
                  <option value="">Select type</option>
                  <option value="ongoing">Ongoing Annotations</option>
                  <option value="one-time">One-time Project</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us about your data annotation needs..."
                rows="5"
                required
              ></textarea>
            </div>

            {formStatus.error && (
              <div className="form-message error">{formStatus.message}</div>
            )}

            {formStatus.success && (
              <div className="form-message success">{formStatus.message}</div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={formStatus.submitting}
            >
              {formStatus.submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .contact-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0A0E14 0%, #1a1f2e 100%);
        }

        .contact-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-logo .logo {
          height: 32px;
          filter: brightness(0) invert(1);
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #60a5fa;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #3b82f6;
        }

        .contact-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 20px;
        }

        .contact-content {
          max-width: 800px;
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 48px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .contact-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .contact-header h1 {
          font-size: 36px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .contact-header p {
          font-size: 18px;
          color: #8892a0;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          color: #ffffff;
          transition: all 0.2s;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #6b7280;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #60a5fa;
          background: rgba(255, 255, 255, 0.08);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-message {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .form-message.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .form-message.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .submit-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .contact-nav {
            padding: 16px 20px;
          }

          .contact-content {
            padding: 32px 24px;
          }

          .contact-header h1 {
            font-size: 28px;
          }

          .contact-header p {
            font-size: 16px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Contact;
