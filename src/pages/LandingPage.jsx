import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { plansAPI, subscriptionsAPI } from '../services/api'
import useAuthStore from '../stores/authStore'
import '../App.css'

function LandingPage() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [showBanner, setShowBanner] = useState(false)
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(null)

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

  useEffect(() => {
    const handleScroll = () => {
      const contactSection = document.getElementById('contact')

      // Check if contact section is in view
      if (contactSection) {
        const rect = contactSection.getBoundingClientRect()
        const isContactVisible = rect.top < window.innerHeight && rect.bottom > 0

        if (isContactVisible) {
          setShowBanner(false)
          return
        }
      }

      if (window.scrollY > 300) {
        setShowBanner(true)
      } else {
        setShowBanner(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToContact = () => {
    navigate('/contact')
  }

  const selectPlan = (planName) => {
    navigate('/contact')
  }

  const handleCheckout = async (plan) => {
    // If user is not logged in, store plan and redirect to login
    if (!token) {
      localStorage.setItem('pendingPlanCheckout', plan.slug)
      navigate('/register')
      return
    }

    // If plan is Enterprise or doesn't have stripe_price_id, redirect to contact
    if (plan.slug === 'enterprise' || !plan.stripe_price_id) {
      selectPlan(plan.name)
      return
    }

    try {
      setCheckoutLoading(plan.id)
      const response = await subscriptionsAPI.checkout(plan.slug)
      // Redirect to Stripe Checkout
      window.location.href = response.data.checkout_url
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error.response?.data?.error || 'Failed to start checkout. Please try again.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  return (
    <div className="app">
      {/* Scroll Banner */}
      <div className={`scroll-banner ${showBanner ? 'show' : ''}`}>
        <div className="scroll-banner-container">
          <div className="scroll-banner-text">
            <p className="scroll-banner-title">Unlock savings and accuracy for your AI data and annotations</p>
          </div>
          <button className="scroll-banner-button" onClick={() => navigate('/register')}>
            Try Our Free Pilot
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <img src="/merotai-logo.png" alt="Merot.ai - AI Data Annotation Platform Logo" className="logo" />
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#pilot">Pilot</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            {token ? (
              <Link to="/dashboard" className="nav-account">Dashboard</Link>
            ) : (
              <div className="nav-auth">
                <Link to="/login" className="nav-login">Log In</Link>
                <Link to="/register" className="nav-signup">Create Account</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">99% Verified Accuracy</div>
            <h1 className="hero-title">Scalable Data Labeling for AI Teams</h1>
            <p className="hero-subtitle">
              Enterprise-ready annotation services powered by dedicated teams in Southeast Europe. Fast turnaround, full QA workflows, and multilingual coverage.
            </p>
            <div className="hero-features">
              <div className="hero-feature-item">
                <svg className="hero-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>48-72hr Turnaround</span>
              </div>
              <div className="hero-feature-item">
                <svg className="hero-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Full Audit Trails</span>
              </div>
              <div className="hero-feature-item">
                <svg className="hero-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Multilingual Coverage</span>
              </div>
            </div>
            <div className="hero-cta">
              <button className="primary-button" onClick={() => navigate('/register')}>Start a Pilot</button>
              <button className="secondary-button" onClick={() => navigate('/learn-more')}>Learn More</button>
            </div>
          </div>
          <div className="hero-image">
            <img src="/hero.jpg" alt="Merot.ai professional AI data annotation and labeling workspace" />
            <div className="hero-overlay"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section about-section">
        <div className="container">
          <div className="about-header">
            <h2 className="section-title about-title">
              Why <img src="/merotai-logo.png" alt="MEROT.ai" className="about-logo" style={{ height: '1.5em', verticalAlign: 'middle' }} />?
            </h2>
            <p className="about-subtitle">Enterprise-grade quality meets competitive pricing</p>
          </div>
          <div className="about-grid">
            <div className="about-card">
              <div className="about-icon-wrapper">
                <svg className="about-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>99% Verified Accuracy</h3>
              <p>Professional data-labeling with dedicated annotators, structured QA processes, and complete transparency through weekly reporting and audit trails.</p>
            </div>
            <div className="about-card">
              <div className="about-icon-wrapper">
                <svg className="about-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>Geographical Advantage</h3>
              <p>Our skilled workforce across Southeast Europe delivers enterprise-grade quality at competitive rates. Native-level annotation in English, German, French, Italian, and Balkan languages with deep cultural understanding.</p>
            </div>
            <div className="about-card">
              <div className="about-icon-wrapper">
                <svg className="about-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3>Full Auditability</h3>
              <p>Unlike cheap annotation vendors, we deliver quality logs, audit trails, and measurable results with every project. Complete transparency at every step.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Package Section */}
      <section id="pilot" className="section pilot-section">
        <div className="container">
          <h2 className="section-title">Try Our Pilot Package</h2>
          <div className="pilot-card">
            <div className="pilot-header">
              <h3>Low-Risk, High-Quality Pilot</h3>
              <p>Test our quality with zero long-term commitment</p>
            </div>
            <div className="pilot-features">
              <div className="pilot-feature">
                <div className="pilot-icon-wrapper">
                  <svg className="pilot-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <strong>1,000 labeled items</strong>
                  <p>Perfect size to evaluate quality</p>
                </div>
              </div>
              <div className="pilot-feature">
                <div className="pilot-icon-wrapper">
                  <svg className="pilot-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <strong>48-72 hour turnaround</strong>
                  <p>Fast delivery without compromising accuracy</p>
                </div>
              </div>
              <div className="pilot-feature">
                <div className="pilot-icon-wrapper">
                  <svg className="pilot-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <strong>Full QA + audit trail</strong>
                  <p>Complete transparency and quality assurance</p>
                </div>
              </div>
              <div className="pilot-feature">
                <div className="pilot-icon-wrapper">
                  <svg className="pilot-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <strong>Calibration call included</strong>
                  <p>Ensure perfect alignment with your requirements</p>
                </div>
              </div>
            </div>
            <button className="primary-button large" onClick={() => navigate('/register')}>Start Pilot</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section features-section">
        <div className="container">
          <div className="features-header">
            <h2 className="section-title features-title">What Sets Us Apart</h2>
            <p className="features-subtitle">Enterprise-grade capabilities that set us apart from basic annotation vendors</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-number">01</div>
              <div className="feature-icon-wrapper">
                <svg className="feature-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>99% Verified Accuracy</h3>
              <p>Structured QA processes with dedicated reviewers ensure exceptional quality on every project</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">02</div>
              <div className="feature-icon-wrapper">
                <svg className="feature-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>Multilingual Coverage</h3>
              <p>Southeast Europe teams provide native-level annotation across multiple languages</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">03</div>
              <div className="feature-icon-wrapper">
                <svg className="feature-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3>Full Auditability</h3>
              <p>Complete audit trails, QA logs, and weekly reporting dashboards for total transparency</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">04</div>
              <div className="feature-icon-wrapper">
                <svg className="feature-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3>Fast Turnaround</h3>
              <p>48-72 hour pilot delivery with scalable capacity for enterprise volumes</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">05</div>
              <div className="feature-icon-wrapper">
                <svg className="feature-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3>Dedicated Teams</h3>
              <p>Core annotators and QA reviewers assigned to your project for consistency</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">06</div>
              <div className="feature-icon-wrapper">
                <svg className="feature-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3>Enterprise-Ready Workflows</h3>
              <p>Structured intake, guidelines, secure upload, and professional cadence from day one</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="section clients-section">
        <div className="container">
          <div className="clients-header">
            <h2 className="section-title clients-title">Who We Serve</h2>
            <p className="clients-subtitle">Trusted by innovative companies building the future of AI</p>
          </div>
          <div className="clients-grid">
            <div className="client-card">
              <div className="client-icon-wrapper">
                <svg className="client-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3>AI Startups</h3>
              <p>Seed to Series B companies building ML products</p>
            </div>
            <div className="client-card">
              <div className="client-icon-wrapper">
                <svg className="client-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3>ML Research Labs</h3>
              <p>Academic and corporate research teams</p>
            </div>
            <div className="client-card">
              <div className="client-icon-wrapper">
                <svg className="client-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3>Enterprise Data Teams</h3>
              <p>Large-scale annotation for production systems</p>
            </div>
            <div className="client-card">
              <div className="client-icon-wrapper">
                <svg className="client-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>LLM Tool Companies</h3>
              <p>RLHF, fine-tuning, and preference data</p>
            </div>
            <div className="client-card">
              <div className="client-icon-wrapper">
                <svg className="client-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>Vertical AI Applications</h3>
              <p>Healthcare, legal, automotive, finance, and ecommerce</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section pricing-section">
        <div className="container">
          <h2 className="section-title">Startup-Friendly Pricing</h2>
          <p className="pricing-subtitle">Built for fast experimentation, small budgets, and rapid scaling</p>

          <div className="pricing-grid">
            {plansLoading ? (
              <div className="pricing-loading">Loading plans...</div>
            ) : (
              plans.filter((plan) => plan.slug !== 'starter-pilot').map((plan) => (
                <div
                  key={plan.id}
                  className={`pricing-card ${plan.is_featured ? 'featured' : ''}`}
                >
                  {plan.badge && <div className="featured-badge">{plan.badge}</div>}
                  <h3 className="pricing-tier">{plan.name}</h3>
                  <div className="pricing-price">
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
                  <p className="pricing-description">{plan.description}</p>
                  <ul className="pricing-features">
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    className={`pricing-button ${plan.is_featured ? 'primary' : ''}`}
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

      {/* Contact Section */}
      <section id="contact" className="section contact-section">
        <div className="container">
          <div className="contact-cta">
            <h2 className="section-title">Ready to Get Started?</h2>
            <p className="contact-text">
              Join leading companies using Merot.ai for their data annotation needs
            </p>
            <button onClick={() => navigate('/contact')} className="primary-button large">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <img src="/merotai-logo.png" alt="Merot.ai - AI Data Annotation Platform Logo" className="footer-logo" />
              <p>AI Data Annotation Platform</p>
            </div>
            <div className="footer-section">
              <h4>Services</h4>
              <a href="#about">About</a>
              <a href="#pilot">Pilot Package</a>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <a href="mailto:contact@merot.ai">contact@merot.ai</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Merot.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
