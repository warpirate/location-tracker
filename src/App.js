import React, { useEffect } from 'react'
import { useGeolocation } from './hooks/useGeolocation'
import LocationDisplay from './components/LocationDisplay'
import LocationHistory from './components/LocationHistory'
import ControlPanel from './components/ControlPanel'
import TestResults from './components/TestResults'
import './App.css'

function App() {
  const {
    location,
    error,
    loading,
    isTracking,
    userId,
    locationHistory,
    dbStatus,
    brazeStatus,
    brazeUserId,
    getCurrentLocation,
    startTracking,
    stopTracking,
    loadLocationHistory,
    isGeolocationSupported,
    brazeLocationService
  } = useGeolocation()

  // Load location history on mount
  useEffect(() => {
    loadLocationHistory()
  }, [loadLocationHistory])

  return (
    <div className="App">
      <header className="app-header">
        <h1>📍 Braze SDK Location Tracking Test</h1>
        <p>A comprehensive testing environment for Braze Web SDK location tracking functionality</p>
      </header>

      <main className="app-main">
        <div className="app-grid">
          {/* Control Panel */}
          <section className="panel control-section">
            <ControlPanel
              onGetCurrentLocation={getCurrentLocation}
              onStartTracking={startTracking}
              onStopTracking={stopTracking}
              isTracking={isTracking}
              loading={loading}
              isGeolocationSupported={isGeolocationSupported}
            />
          </section>

          {/* Location Display */}
          <section className="panel location-section">
            <LocationDisplay
              location={location}
              error={error}
              loading={loading}
              userId={userId}
              dbStatus={dbStatus}
              brazeStatus={brazeStatus}
              brazeUserId={brazeUserId}
            />
          </section>

          {/* Test Results */}
          <section className="panel test-section">
            <TestResults
              location={location}
              locationHistory={locationHistory}
              error={error}
              dbStatus={dbStatus}
              brazeStatus={brazeStatus}
              isTracking={isTracking}
            />
          </section>

          {/* Location History */}
          <section className="panel history-section">
            <LocationHistory
              locationHistory={locationHistory}
              onLoadHistory={loadLocationHistory}
              loading={loading}
            />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>Built with React + Supabase | Testing Location Tracking APIs</p>
          <div className="footer-links">
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API" target="_blank" rel="noopener noreferrer">
              📖 Geolocation API Docs
            </a>
            <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
              🗄️ Supabase Docs
            </a>
            <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">
              🗺️ OpenStreetMap
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
