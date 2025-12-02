import { Link } from 'react-router-dom';

function LearnMore() {
  const faqs = [
    {
      question: "Why Choose Merot.ai Over Other Annotation Services?",
      answer: "Unlike crowdsourced platforms that rely on inconsistent quality, Merot.ai provides dedicated annotation teams based in Southeast Europe. This means you get enterprise-grade accuracy with professional annotators, structured QA workflows, and complete audit trails—all at competitive pricing that works for startups and growing companies."
    },
    {
      question: "How Does Your Geographic Location Benefit My Project?",
      answer: "Our teams in Southeast Europe offer a unique advantage: native-level proficiency in English, German, French, Italian, and Balkan languages, combined with deep cultural understanding of European and Western markets. You get high-quality annotations at rates 40-60% lower than Western Europe or North America, without compromising on quality or communication."
    },
    {
      question: "What Makes Your Quality Different?",
      answer: "Every annotation goes through a multi-layer quality process: professional annotators → dedicated QA reviewers → weekly quality reports with full audit trails. We maintain 99% verified accuracy through structured workflows, not just crowd consensus. You'll know exactly who annotated what, when, and with what confidence level."
    },
    {
      question: "How Fast Can You Deliver Results?",
      answer: "Our pilot packages deliver 1,000 labeled items in 48-72 hours. For production volumes, we scale dedicated teams to match your timeline. Need it faster? Our rush delivery option (24-hour turnaround) is available for urgent projects. Unlike platforms that depend on crowd availability, our dedicated teams ensure predictable delivery."
    },
    {
      question: "What If I Need Specialized Domain Knowledge?",
      answer: "We support domain-specific projects across healthcare, legal, automotive, finance, and e-commerce. Our annotators receive custom training on your taxonomy and guidelines, with calibration calls to ensure perfect alignment. For highly specialized needs, we can assign domain experts who understand your industry's nuances and terminology."
    }
  ];

  return (
    <div className="learn-more-page">
      {/* Navigation */}
      <nav className="learn-more-nav">
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

      {/* Hero Section */}
      <section className="learn-more-hero">
        <div className="hero-content">
          <h1>
            Why <img src="/merotai-logo.png" alt="Merot.ai" className="hero-logo" />?
          </h1>
          <p className="hero-subtitle">
            Enterprise-grade annotation quality at startup-friendly prices, powered by dedicated teams in Southeast Europe
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-number">0{index + 1}</div>
                <div className="faq-content">
                  <h3 className="faq-question">{faq.question}</h3>
                  <p className="faq-answer">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Experience the Difference?</h2>
          <p>Start with our risk-free pilot package and see the quality for yourself</p>
          <div className="cta-buttons">
            <Link to="/contact" className="primary-btn">
              Start a Pilot
            </Link>
            <Link to="/register" className="secondary-btn">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .learn-more-page {
          min-height: 100vh;
          background: #f5f7fa;
        }

        .learn-more-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          background: white;
          border-bottom: 1px solid #e0e0e0;
        }

        .nav-logo .logo {
          height: 32px;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #5568d3;
        }

        .learn-more-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 80px 20px;
          text-align: center;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-content h1 {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .hero-logo {
          height: 48px;
          filter: brightness(0) invert(1);
          vertical-align: middle;
        }

        .hero-subtitle {
          font-size: 20px;
          opacity: 0.95;
          line-height: 1.6;
          text-align: center;
        }

        .faq-section {
          padding: 80px 20px;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .faq-item {
          display: flex;
          gap: 24px;
          background: white;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .faq-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .faq-number {
          font-size: 32px;
          font-weight: 700;
          color: #667eea;
          flex-shrink: 0;
          width: 60px;
        }

        .faq-content {
          flex: 1;
        }

        .faq-question {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .faq-answer {
          font-size: 16px;
          color: #666;
          line-height: 1.8;
        }

        .cta-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 80px 20px;
          text-align: center;
          color: white;
        }

        .cta-content {
          max-width: 700px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .cta-content p {
          font-size: 18px;
          opacity: 0.95;
          margin-bottom: 32px;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .primary-btn {
          background: white;
          color: #667eea;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          display: inline-block;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
        }

        .secondary-btn {
          background: transparent;
          color: white;
          border: 2px solid white;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          display: inline-block;
        }

        .secondary-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .learn-more-nav {
            padding: 16px 20px;
          }

          .learn-more-hero {
            padding: 60px 20px;
          }

          .hero-content h1 {
            font-size: 36px;
            flex-wrap: wrap;
          }

          .hero-logo {
            height: 36px;
          }

          .hero-subtitle {
            font-size: 18px;
          }

          .faq-section {
            padding: 60px 20px;
          }

          .faq-item {
            flex-direction: column;
            padding: 24px;
          }

          .faq-number {
            font-size: 28px;
            width: auto;
          }

          .faq-question {
            font-size: 20px;
          }

          .faq-answer {
            font-size: 15px;
          }

          .cta-section {
            padding: 60px 20px;
          }

          .cta-content h2 {
            font-size: 28px;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default LearnMore;
