import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmployeeAuthStore from '../../stores/employeeAuthStore';

function EmployeeLogin() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useEmployeeAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/employee/dashboard');
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="employee-login-page">
      <div className="employee-login-container">
        <div className="employee-login-header">
          <img src="/merotai-logo.png" alt="Merot AI" className="employee-logo" />
          <h1>Employee Portal</h1>
          <p>Sign in to access the annotation dashboard</p>
        </div>

        <form className="employee-login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@company.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="employee-login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="employee-login-footer">
            <a href="mailto:support@merot.ai">Need help? Contact support</a>
          </div>
        </form>
      </div>

      <style>{`
        .employee-login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .employee-login-container {
          background: white;
          border-radius: 16px;
          padding: 48px;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .employee-login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .employee-logo {
          height: 48px;
          margin-bottom: 24px;
        }

        .employee-login-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .employee-login-header p {
          font-size: 14px;
          color: #666;
        }

        .employee-login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .form-group input {
          padding: 12px 16px;
          font-size: 14px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
        }

        .employee-login-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 8px;
        }

        .employee-login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .employee-login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .employee-login-footer {
          text-align: center;
          margin-top: 16px;
        }

        .employee-login-footer a {
          font-size: 14px;
          color: #667eea;
          text-decoration: none;
        }

        .employee-login-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .employee-login-container {
            padding: 32px 24px;
          }

          .employee-login-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}

export default EmployeeLogin;
