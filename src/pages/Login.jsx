import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { subscriptionsAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    clearError();
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);

      // Check if user was trying to checkout a plan before login
      const pendingPlan = localStorage.getItem('pendingPlanCheckout');
      if (pendingPlan) {
        localStorage.removeItem('pendingPlanCheckout');
        try {
          const response = await subscriptionsAPI.checkout(pendingPlan);
          window.location.href = response.data.checkout_url;
        } catch (error) {
          console.error('Checkout error:', error);
          alert(error.response?.data?.error || 'Failed to start checkout. Redirecting to plans page.');
          navigate('/plans');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <img src="/merotai-logo.png" alt="Merot AI" height="40" />
          </Link>
          <h1>Welcome Back</h1>
          <p>Sign in to your Merot AI account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
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
            />
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0A0E14 0%, #1a1f2e 100%);
          padding: 20px;
        }

        .auth-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          backdrop-filter: blur(10px);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo {
          display: inline-block;
          margin-bottom: 24px;
        }

        .auth-logo img {
          height: 40px;
          filter: brightness(0) invert(1);
        }

        .auth-header h1 {
          color: #ffffff;
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .auth-header p {
          color: #8892a0;
          font-size: 16px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
        }

        .form-group input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px 16px;
          color: #ffffff;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #60a5fa;
        }

        .form-group input::placeholder {
          color: #6b7280;
        }

        .auth-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .auth-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auth-footer p {
          color: #8892a0;
          font-size: 14px;
        }

        .auth-footer a {
          color: #60a5fa;
          text-decoration: none;
          font-weight: 500;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
