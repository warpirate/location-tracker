import React from 'react'

const LocationDisplay = ({ location, error, loading, userId, dbStatus, brazeStatus, brazeUserId }) => {
  const formatCoordinate = (coord) => {
    return coord ? coord.toFixed(8) : 'N/A'
  }

  const formatAccuracy = (accuracy) => {
    return accuracy ? `±${accuracy.toFixed(1)}m` : 'N/A'
  }

  const getMapUrl = (lat, lng) => {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`
  }

  return (
    <div className="location-display">
      <div className="status-section">
        <h3>🌐 System Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">Session User ID:</span>
            <span className="value">{userId}</span>
          </div>
          <div className="status-item">
            <span className="label">Braze SDK:</span>
            <span className={`value ${brazeStatus.connected ? 'connected' : 'disconnected'}`}>
              {brazeStatus.connected ? '✅ Connected' : '❌ Disconnected'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Braze User ID:</span>
            <span className="value">{brazeUserId || 'Not available'}</span>
          </div>
          <div className="status-item">
            <span className="label">Database (Comparison):</span>
            <span className={`value ${dbStatus.connected ? 'connected' : 'disconnected'}`}>
              {dbStatus.connected ? '✅ Connected' : '❌ Disconnected'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Geolocation API:</span>
            <span className={`value ${navigator.geolocation ? 'available' : 'unavailable'}`}>
              {navigator.geolocation ? '✅ Available' : '❌ Unavailable'}
            </span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-section">
          <div className="spinner"></div>
          <p>📍 Getting your location...</p>
        </div>
      )}

      {error && (
        <div className="error-section">
          <h3>❌ Error</h3>
          <p className="error-message">{error}</p>
        </div>
      )}

      {location && (
        <div className="location-section">
          <h3>📍 Current Location</h3>
          <div className="location-grid">
            <div className="location-item">
              <span className="label">Latitude:</span>
              <span className="value">{formatCoordinate(location.latitude)}</span>
            </div>
            <div className="location-item">
              <span className="label">Longitude:</span>
              <span className="value">{formatCoordinate(location.longitude)}</span>
            </div>
            <div className="location-item">
              <span className="label">Accuracy:</span>
              <span className="value">{formatAccuracy(location.accuracy)}</span>
            </div>
            <div className="location-item">
              <span className="label">Altitude:</span>
              <span className="value">
                {location.altitude ? `${location.altitude.toFixed(1)}m` : 'N/A'}
              </span>
            </div>
            <div className="location-item">
              <span className="label">Timestamp:</span>
              <span className="value">
                {new Date(location.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="map-section">
            <a
              href={getMapUrl(location.latitude, location.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="map-link"
            >
              🗺️ View on OpenStreetMap
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationDisplay
