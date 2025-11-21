import React from 'react'

const FinanceContent = () => {
  return (
    <div className="finance-page">
      <header className="finance-header">
        <div className="finance-header-inner">
          <div className="finance-brand-center">
            <img
              src="/logo.png"
              alt="Secure Banking"
              className="finance-logo"
            />
          </div>
        </div>
      </header>

      <main className="finance-main">
        <section className="finance-hero">
          <h1 className="finance-title">Welcome to Your Financial Dashboard</h1>
          <p className="finance-subtitle">Secure banking and financial services at your fingertips</p>
        </section>

        <section className="finance-services">
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">💳</div>
              <h3 className="service-title">Banking Services</h3>
              <p className="service-description">Manage your accounts, transfer funds, and track transactions securely.</p>
            </div>

            <div className="service-card">
              <div className="service-icon">📈</div>
              <h3 className="service-title">Investment Portfolio</h3>
              <p className="service-description">Track your investments, analyze market trends, and grow your wealth.</p>
            </div>

            <div className="service-card">
              <div className="service-icon">🔒</div>
              <h3 className="service-title">Security Center</h3>
              <p className="service-description">Advanced security features to protect your financial information.</p>
            </div>

            <div className="service-card">
              <div className="service-icon">💰</div>
              <h3 className="service-title">Loans & Credit</h3>
              <p className="service-description">Apply for loans, check credit score, and manage credit facilities.</p>
            </div>
          </div>
        </section>

        
        <section className="finance-stats">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">$2.5M+</div>
              <div className="stat-label">Transactions Processed Daily</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">150K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime Guarantee</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Customer Support</div>
            </div>
          </div>
        </section>

        <section className="finance-footer-updates">
          <div className="updates-container">
            <h3 className="updates-title">Latest Updates & Important News</h3>
            <div className="updates-grid">
              <div className="update-item">
                <div className="update-date">November 21, 2025</div>
                <div className="update-headline">Enhanced Security Features Now Available</div>
                <div className="update-summary">We've implemented advanced encryption protocols to better protect your financial data and transactions.</div>
              </div>
              <div className="update-item">
                <div className="update-date">November 19, 2025</div>
                <div className="update-headline">Mobile App Update Released</div>
                <div className="update-summary">New version includes biometric authentication and real-time transaction notifications.</div>
              </div>
              <div className="update-item">
                <div className="update-date">November 15, 2025</div>
                <div className="update-headline">Interest Rate Changes Effective December 1</div>
                <div className="update-summary">Federal rate adjustments will affect savings and loan products. View your account for specific impacts.</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="finance-security-footer">
        <div className="finance-security-badges">
          <div className="security-badge">VeriSign Secured</div>
          <div className="security-badge">256-bit Encryption</div>
        </div>
      </footer>
    </div>
  )
}

export default FinanceContent
