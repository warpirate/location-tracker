import React from 'react'

const ControlPanel = ({ 
  onGetCurrentLocation, 
  onStartTracking, 
  onStopTracking, 
  isTracking, 
  loading, 
  isGeolocationSupported 
}) => {
  if (!isGeolocationSupported) {
    return (
      <div className="control-panel">
        <div className="error-section">
          <h3>❌ Geolocation Not Supported</h3>
          <p>Your browser does not support the Geolocation API. Please use a modern browser like Chrome, Firefox, or Safari.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="control-panel">
      <h3>🎮 Braze SDK Location Controls</h3>
      
      <div className="control-section">
        <h4>One-time Location (Braze SDK)</h4>
        <p>Get your current location using <code>braze.getUser().setLastKnownLocation()</code> method.</p>
        <button 
          onClick={onGetCurrentLocation}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? '📍 Getting Location...' : '📍 Get Current Location'}
        </button>
      </div>

      <div className="control-section">
        <h4>Continuous Tracking (Braze SDK)</h4>
        <p>
          {isTracking 
            ? 'Continuously tracking your location with Braze SDK using navigator.geolocation.watchPosition().' 
            : 'Start continuous location tracking using Braze SDK methods to monitor location changes in real-time.'
          }
        </p>
        
        <div className="tracking-controls">
          {!isTracking ? (
            <button 
              onClick={onStartTracking}
              disabled={loading}
              className="btn btn-success"
            >
              {loading ? '🔄 Starting...' : '▶️ Start Continuous Tracking'}
            </button>
          ) : (
            <button 
              onClick={onStopTracking}
              className="btn btn-danger"
            >
              ⏹️ Stop Tracking
            </button>
          )}
        </div>

        {isTracking && (
          <div className="tracking-status">
            <div className="tracking-indicator">
              <div className="pulse-dot"></div>
              <span>Tracking Active</span>
            </div>
          </div>
        )}
      </div>

      <div className="control-section">
        <h4>📋 Braze SDK Test Scenarios</h4>
        <div className="test-scenarios">
          <div className="scenario">
            <strong>Braze Basic Test:</strong> Click "Get Current Location" and verify data is sent to Braze SDK
          </div>
          <div className="scenario">
            <strong>Braze Continuous Test:</strong> Start tracking and verify each update calls braze.getUser().setLastKnownLocation()
          </div>
          <div className="scenario">
            <strong>SDK Integration Test:</strong> Check browser console for Braze SDK logs
          </div>
          <div className="scenario">
            <strong>Comparison Test:</strong> Compare Braze data with database storage for accuracy
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
