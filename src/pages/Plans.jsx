import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { plansAPI, subscriptionsAPI } from '../services/api';

const Plans = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await plansAPI.getAll();
        setPlans(response.data.plans);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleCheckout = async (plan) => {
    if (plan.price_formatted === 'Custom') {
      navigate('/contact');
      return;
    }

    try {
      setCheckoutLoading(plan.id);
      const response = await subscriptionsAPI.checkout(plan.slug);
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.error || 'Failed to start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const subscription = user?.subscription;
  const currentPlanSlug = subscription?.current_plan?.slug;

  return (
    <div className="plans-page">
      {/* Header */}
      <header className="plans-header">
        <div className="header-left">
          <img src="/merotai-logo.png" alt="Merot AI" height="32" style={{filter: 'brightness(0) invert(1)'}} />
          <h1>Choose Your Plan</h1>
        </div>
        <div className="header-right">
          {(subscription?.status === 'active' || subscription?.status === 'trialing') && (
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              Back to Dashboard
            </button>
          )}
          <span className="user-name">{user?.full_name}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="plans-content">
        <div className="plans-intro">
          <h2>Startup-Friendly Pricing</h2>
          <p>Built for fast experimentation, small budgets, and rapid scaling</p>
        </div>

        <div className="plans-grid">
          {plansLoading ? (
            <div className="plans-loading">Loading plans...</div>
          ) : (
            plans.map((plan) => {
              const isCurrentPlan = currentPlanSlug === plan.slug;
              return (
                <div
                  key={plan.id}
                  className={`plan-card ${plan.is_featured ? 'featured' : ''} ${isCurrentPlan ? 'current' : ''}`}
                >
                  {plan.badge && <div className="featured-badge">{plan.badge}</div>}
                  {isCurrentPlan && <div className="current-badge">Current Plan</div>}
                  <h3 className="plan-tier">{plan.name}</h3>
                  <div className="plan-price">
                    {plan.price_formatted === 'Custom' ? (
                      <span className="price-amount">Custom</span>
                    ) : (
                      <>
                        <span className="price-amount">{plan.price_formatted.split('/')[0]}</span>
                        {plan.billing_period === 'monthly' && <span className="price-period">/month</span>}
                        {plan.billing_period === 'one_time' && <span className="price-period one-time">one-time</span>}
                      </>
                    )}
                  </div>
                  <p className="plan-description">{plan.description}</p>
                  <ul className="plan-features">
                    {plan.features.map((feature, index) => (
                      <li key={index}>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="check-icon">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`plan-button ${plan.is_featured ? 'primary' : ''}`}
                    onClick={() => handleCheckout(plan)}
                    disabled={checkoutLoading === plan.id || isCurrentPlan}
                  >
                    {checkoutLoading === plan.id
                      ? 'Processing...'
                      : isCurrentPlan
                      ? 'Current Plan'
                      : plan.price_formatted === 'Custom'
                      ? 'Contact Sales'
                      : plan.stripe_price_id
                      ? 'Choose Plan'
                      : 'Coming Soon'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </main>

      <style>{`
        .plans-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0A0E14 0%, #1a1f2e 100%);
        }

        .plans-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-left h1 {
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-name {
          color: #8892a0;
          font-size: 14px;
        }

        .back-btn {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .logout-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .plans-content {
          padding: 48px 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .plans-intro {
          text-align: center;
          margin-bottom: 48px;
        }

        .plans-intro h2 {
          color: #ffffff;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .plans-intro p {
          color: #8892a0;
          font-size: 18px;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }

        .plans-loading {
          grid-column: 1 / -1;
          text-align: center;
          color: #8892a0;
          padding: 48px;
        }

        .plan-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px 24px;
          position: relative;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
        }

        .plan-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .plan-card.featured {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .plan-card.current {
          border-color: rgba(16, 185, 129, 0.5);
          background: rgba(16, 185, 129, 0.05);
        }

        .featured-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
          line-height: 1;
          letter-spacing: 0.5px;
        }

        .current-badge {
          position: absolute;
          top: -12px;
          right: 16px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .plan-tier {
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;
        }

        .plan-price {
          text-align: center;
          margin-bottom: 16px;
        }

        .price-amount {
          color: #ffffff;
          font-size: 36px;
          font-weight: 700;
        }

        .price-period {
          color: #8892a0;
          font-size: 14px;
          margin-left: 4px;
        }

        .price-period.one-time {
          display: block;
          margin-left: 0;
          margin-top: 4px;
        }

        .plan-description {
          color: #8892a0;
          font-size: 14px;
          text-align: center;
          margin-bottom: 24px;
          min-height: 40px;
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
          flex-grow: 1;
        }

        .plan-features li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #c9d1d9;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .check-icon {
          width: 16px;
          height: 16px;
          color: #10b981;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .plan-button {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: auto;
        }

        .plan-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .plan-button.primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
        }

        .plan-button.primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .plan-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 1100px) {
          .plans-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .plans-header {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }

          .header-right {
            flex-wrap: wrap;
            justify-content: center;
          }

          .plans-content {
            padding: 24px 16px;
          }

          .plans-intro h2 {
            font-size: 28px;
          }

          .plans-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Plans;
