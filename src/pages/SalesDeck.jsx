import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { plansAPI } from '../services/api'

function SalesDeck() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await plansAPI.getAll()
        setPlans(response.data.plans)
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      } finally {
        setPlansLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const stats = [
    { value: '99%', label: 'Verified Accuracy' },
    { value: '48-72h', label: 'Turnaround Time' },
    { value: '40-60%', label: 'Cost Savings' },
    { value: '100%', label: 'Audit Coverage' }
  ]

  const challenges = [
    {
      title: 'Quality Consistency',
      challenge: 'Crowdsourced platforms deliver inconsistent results',
      approach: 'Dedicated professional teams with multi-layer QA'
    },
    {
      title: 'Transparency',
      challenge: 'Black-box processes with no visibility',
      approach: 'Complete audit trails and weekly quality reports'
    },
    {
      title: 'Predictability',
      challenge: 'Unreliable timelines and availability',
      approach: 'Committed 48-72hr SLAs with dedicated capacity'
    },
    {
      title: 'Cost Efficiency',
      challenge: 'Premium pricing without premium value',
      approach: 'Enterprise quality at 40-60% cost savings'
    }
  ]

  const competitiveAdvantages = [
    {
      title: 'Professional Teams',
      description: 'Dedicated annotators and QA reviewers, not random crowd workers',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: 'Full API Integration',
      description: 'Programmatic data submission and retrieval for seamless workflow automation',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    {
      title: 'Geographic Arbitrage',
      description: 'Enterprise quality at competitive rates from Southeast Europe',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Full Auditability',
      description: 'Every annotation tracked with complete quality logs and metrics',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Multilingual Native Speakers',
      description: 'English, German, French, Italian, and Balkan languages',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      )
    },
    {
      title: 'Enterprise-Ready Platform',
      description: 'Secure data handling, SOC 2 compliance ready, and dedicated support',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ]

  const useCases = [
    {
      industry: 'LLM Companies',
      needs: 'RLHF, Preference Data, Fine-tuning',
      highlight: 'High-quality human feedback for model alignment'
    },
    {
      industry: 'AI Startups',
      needs: 'Training Data, Model Evaluation',
      highlight: 'Fast iteration cycles with startup-friendly pricing'
    },
    {
      industry: 'Enterprise ML Teams',
      needs: 'Production Data Labeling, QA',
      highlight: 'Scalable capacity with enterprise SLAs'
    },
    {
      industry: 'Research Labs',
      needs: 'Dataset Creation, Benchmarking',
      highlight: 'Academic rigor with publication-ready quality'
    }
  ]

  const selectPlan = (planName) => {
    navigate('/contact')
  }

  return (
    <div className="sales-deck">
      {/* Navigation */}
      <nav className="deck-nav">
        <Link to="/" className="nav-logo">
          <img src="/merotai-logo.png" alt="Merot.ai" className="logo" />
        </Link>
        <div className="nav-actions">
          <Link to="/" className="back-link">Back to Home</Link>
          <button onClick={() => navigate('/register')} className="cta-button">Start Free Pilot</button>
        </div>
      </nav>

      {/* Slide 1: Title Slide */}
      <section className="slide title-slide">
        <div className="slide-content">
          <div className="badge">AI Data Annotation Platform</div>
          <h1>Enterprise-Grade Quality<br/>Startup-Friendly Pricing</h1>
          <p className="subtitle">
            99% verified accuracy with 48-72hr turnaround, powered by dedicated teams in Southeast Europe
          </p>
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 2: The Challenge */}
      <section className="slide problem-slide">
        <div className="slide-content">
          <h2 className="slide-title">The Annotation Landscape Today</h2>
          <div className="problem-grid">
            {challenges.map((item, idx) => (
              <div key={idx} className="problem-card">
                <div className="card-header">
                  <h3>{item.title}</h3>
                </div>
                <div className="challenge-section">
                  <div className="section-label">Industry Challenge</div>
                  <p className="challenge-text">{item.challenge}</p>
                </div>
                <div className="divider"></div>
                <div className="approach-section">
                  <div className="section-label">Our Approach</div>
                  <p className="approach-text">{item.approach}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 3: Competitive Advantages */}
      <section className="slide advantages-slide">
        <div className="slide-content">
          <h2 className="slide-title">What Sets Merot.ai Apart</h2>
          <div className="advantages-grid">
            {competitiveAdvantages.map((advantage, idx) => (
              <div key={idx} className="advantage-card">
                <div className="advantage-icon">{advantage.icon}</div>
                <h3>{advantage.title}</h3>
                <p>{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 4: Your Journey with Merot.ai */}
      <section className="slide process-slide">
        <div className="slide-content">
          <h2 className="slide-title">Your Journey with Merot.ai</h2>
          <p className="journey-intro">From pilot to production in four clear phases</p>
          <div className="process-timeline">
            <div className="process-step">
              <div className="step-indicator">
                <div className="step-number">1</div>
                <div className="step-line"></div>
              </div>
              <div className="step-content">
                <div className="step-phase">Discovery Phase</div>
                <h3>Requirements & Alignment</h3>
                <p>Collaborative kickoff to define taxonomy, quality standards, and success metrics. We ensure complete understanding before annotation begins.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-indicator">
                <div className="step-number">2</div>
                <div className="step-line"></div>
              </div>
              <div className="step-content">
                <div className="step-phase">Pilot Phase</div>
                <h3>Risk-Free Evaluation</h3>
                <p>1,000 items delivered in 48-72 hours with full QA workflow. Evaluate our quality, transparency, and turnaround with zero long-term commitment.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-indicator">
                <div className="step-number">3</div>
                <div className="step-line"></div>
              </div>
              <div className="step-content">
                <div className="step-phase">Assessment Phase</div>
                <h3>Quality Validation</h3>
                <p>Review complete audit trails, accuracy metrics, and annotator performance. Make data-driven decisions with full transparency.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-indicator">
                <div className="step-number">4</div>
              </div>
              <div className="step-content">
                <div className="step-phase">Production Phase</div>
                <h3>Scale with Confidence</h3>
                <p>Expand volumes with dedicated teams, predictable delivery, and ongoing quality assurance. Your proven partner for production-scale annotation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 5: Use Cases */}
      <section className="slide use-cases-slide">
        <div className="slide-content">
          <h2 className="slide-title">Who We Serve</h2>
          <div className="use-cases-grid">
            {useCases.map((useCase, idx) => (
              <div key={idx} className="use-case-card">
                <h3>{useCase.industry}</h3>
                <div className="use-case-needs">{useCase.needs}</div>
                <div className="use-case-highlight">
                  <div className="highlight-bar"></div>
                  <div className="highlight-text">{useCase.highlight}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 6: Pricing */}
      <section className="slide pricing-slide">
        <div className="slide-content">
          <h2 className="slide-title">Startup-Friendly Pricing</h2>
          <p className="pricing-subtitle">Built for fast experimentation, small budgets, and rapid scaling</p>

          <div className="deck-pricing-grid">
            {plansLoading ? (
              <div className="pricing-loading">Loading plans...</div>
            ) : (
              plans.filter((plan) => plan.slug !== 'starter-pilot').map((plan) => (
                <div
                  key={plan.id}
                  className={`deck-pricing-card ${plan.is_featured ? 'featured' : ''}`}
                >
                  {plan.badge && <div className="plan-badge">{plan.badge}</div>}
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    {plan.price_formatted === 'Custom' ? (
                      <span className="price-amount">Custom</span>
                    ) : plan.price_cents === 0 ? (
                      <>
                        <span className="price-currency">$</span>
                        <span className="price-amount">0</span>
                        <span className="price-period"> / one month</span>
                      </>
                    ) : (
                      <>
                        <span className="price-currency">$</span>
                        <span className="price-amount">{Math.floor(plan.price).toLocaleString()}</span>
                        {plan.billing_period === 'monthly' && <span className="price-period">/month</span>}
                        {plan.billing_period === 'yearly' && <span className="price-period">/year</span>}
                      </>
                    )}
                  </div>
                  <p className="plan-description">{plan.description}</p>
                  <ul className="plan-features">
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    className={`plan-button ${plan.is_featured ? 'primary' : ''}`}
                    onClick={() => {
                      if (plan.slug === 'enterprise') {
                        selectPlan(plan.name);
                      } else {
                        navigate('/register');
                      }
                    }}
                  >
                    {plan.slug === 'enterprise'
                      ? 'Contact Sales'
                      : plan.slug === 'starter-pilot'
                        ? 'Start Pilot'
                        : 'Choose Plan'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Final CTA Slide */}
      <section className="slide cta-slide">
        <div className="slide-content">
          <h2>Ready to See the Difference?</h2>
          <p className="cta-subtitle">
            Join leading AI companies using Merot.ai for their data annotation needs
          </p>
          <div className="cta-actions">
            <button onClick={() => navigate('/register')} className="primary-cta">
              Start Free Pilot
            </button>
            <button onClick={() => navigate('/contact')} className="secondary-cta">
              Schedule a Demo
            </button>
          </div>
          <div className="contact-info">
            <p>Questions? Reach us at <a href="mailto:contact@merot.ai">contact@merot.ai</a></p>
          </div>
        </div>
      </section>

      <style>{`
        .sales-deck {
          min-height: 100vh;
          background: #f8f9fa;
        }

        /* Navigation */
        .deck-nav {
          position: sticky;
          top: 0;
          background: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          z-index: 100;
        }

        .nav-logo .logo {
          height: 40px;
        }

        .nav-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .back-link {
          color: #666;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #667eea;
        }

        .cta-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .cta-button:hover {
          transform: translateY(-2px);
        }

        /* Slide Base */
        .slide {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
        }

        .slide-content {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        .slide-title {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 3rem;
          color: #1a1a1a;
        }

        /* Title Slide */
        .title-slide {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }

        .badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .title-slide h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .subtitle {
          font-size: 1.25rem;
          opacity: 0.95;
          max-width: 800px;
          margin: 0 auto 3rem;
          line-height: 1.6;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-top: 4rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        /* Problem Slide */
        .problem-slide {
          background: white;
        }

        .problem-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .problem-card {
          background: #f8f9fa;
          padding: 2rem;
          border-radius: 12px;
          border: 2px solid #e9ecef;
          transition: all 0.3s;
        }

        .problem-card:hover {
          border-color: #667eea;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.1);
        }

        .card-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #667eea;
        }

        .card-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .challenge-section, .approach-section {
          margin-bottom: 1rem;
        }

        .section-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }

        .challenge-text {
          color: #666;
          font-size: 1rem;
          line-height: 1.6;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #e0e0e0 50%, transparent 100%);
          margin: 1.5rem 0;
        }

        .approach-text {
          color: #1a1a1a;
          font-size: 1.05rem;
          line-height: 1.6;
          font-weight: 500;
        }

        /* Advantages Slide */
        .advantages-slide {
          background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
        }

        .advantages-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .advantage-card {
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
        }

        .advantage-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.15);
        }

        .advantage-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .advantage-icon svg {
          width: 32px;
          height: 32px;
          color: white;
        }

        .advantage-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #1a1a1a;
        }

        .advantage-card p {
          color: #666;
          line-height: 1.7;
          font-size: 1.05rem;
        }

        /* Process Slide */
        .process-slide {
          background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
        }

        .journey-intro {
          text-align: center;
          color: #666;
          font-size: 1.1rem;
          margin: -2rem auto 3rem;
          max-width: 600px;
        }

        .process-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
          max-width: 900px;
          margin: 0 auto;
        }

        .process-step {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 2rem;
          position: relative;
        }

        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .step-number {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          flex-shrink: 0;
        }

        .step-line {
          width: 2px;
          flex: 1;
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          margin: 0.5rem 0;
        }

        .process-step:last-child .step-line {
          display: none;
        }

        .step-content {
          padding: 0.5rem 0 3rem 0;
        }

        .step-phase {
          font-size: 0.75rem;
          font-weight: 700;
          color: #667eea;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }

        .step-content h3 {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          color: #1a1a1a;
          font-weight: 700;
        }

        .step-content p {
          color: #666;
          line-height: 1.7;
          font-size: 1rem;
        }

        /* Use Cases Slide */
        .use-cases-slide {
          background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
        }

        .use-cases-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .use-case-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border-left: 4px solid #667eea;
          transition: all 0.3s;
        }

        .use-case-card:hover {
          transform: translateX(8px);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
        }

        .use-case-card h3 {
          font-size: 1.5rem;
          color: #667eea;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .use-case-needs {
          color: #666;
          margin-bottom: 1.25rem;
          font-size: 1.05rem;
        }

        .use-case-highlight {
          position: relative;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 1rem 1rem 1rem 1.5rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .highlight-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px 0 0 8px;
        }

        .highlight-text {
          color: #1a1a1a;
          font-weight: 500;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        /* Pricing Slide */
        .pricing-slide {
          background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
        }

        .pricing-subtitle {
          text-align: center;
          font-size: 1.1rem;
          color: #666;
          margin: -2rem auto 3rem;
          max-width: 700px;
        }

        .deck-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1100px;
          margin: 0 auto;
        }

        .pricing-loading {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem;
          color: #666;
          font-size: 1.1rem;
        }

        .deck-pricing-card {
          background: white;
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex;
          flex-direction: column;
          border: 2px solid transparent;
        }

        .deck-pricing-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }

        .deck-pricing-card.featured {
          border-color: #667eea;
          transform: scale(1.05);
        }

        .deck-pricing-card.featured:hover {
          transform: scale(1.05) translateY(-5px);
        }

        .plan-badge {
          position: absolute;
          top: -15px;
          right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .plan-name {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1a1a1a;
        }

        .plan-price {
          margin: 2rem 0;
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.25rem;
        }

        .price-currency {
          font-size: 1.5rem;
          color: #666;
        }

        .price-amount {
          font-size: 3rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .price-period {
          font-size: 1.1rem;
          color: #666;
        }

        .plan-description {
          color: #666;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          min-height: 40px;
          text-align: center;
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin: 2rem 0;
          flex-grow: 1;
        }

        .plan-features li {
          padding: 0.75rem 0;
          border-bottom: 1px solid #eee;
          color: #555;
          font-size: 0.95rem;
        }

        .plan-features li:last-child {
          border-bottom: none;
        }

        .plan-button {
          width: 100%;
          padding: 1rem;
          border: 2px solid #667eea;
          background: white;
          color: #667eea;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: auto;
        }

        .plan-button:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        .plan-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .plan-button.primary:hover {
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        /* CTA Slide */
        .cta-slide {
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          color: white;
          text-align: center;
        }

        .cta-slide h2 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .cta-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          margin-bottom: 3rem;
        }

        .cta-actions {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .primary-cta {
          background: white;
          color: #667eea;
          border: none;
          padding: 1.25rem 3rem;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .primary-cta:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(255, 255, 255, 0.3);
        }

        .secondary-cta {
          background: transparent;
          color: white;
          border: 2px solid white;
          padding: 1.25rem 3rem;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .secondary-cta:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-4px);
        }

        .contact-info {
          margin-top: 2rem;
          opacity: 0.8;
        }

        .contact-info a {
          color: white;
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid,
          .problem-grid,
          .advantages-grid,
          .use-cases-grid,
          .deck-pricing-grid {
            grid-template-columns: 1fr;
          }

          .deck-pricing-card.featured {
            transform: scale(1);
          }

          .process-step {
            grid-template-columns: 80px 1fr;
            gap: 1.5rem;
          }

          .step-number {
            width: 56px;
            height: 56px;
            font-size: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .deck-nav {
            padding: 1rem;
          }

          .nav-actions {
            flex-direction: column;
            gap: 0.5rem;
            align-items: stretch;
          }

          .slide {
            padding: 2rem 1rem;
          }

          .slide-title {
            font-size: 1.75rem;
            margin-bottom: 2rem;
          }

          .title-slide h1 {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .cta-slide h2 {
            font-size: 2rem;
          }

          .cta-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .primary-cta,
          .secondary-cta {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default SalesDeck
