import React from 'react'

const LocationHistory = ({ locationHistory, onLoadHistory, loading }) => {
  const formatCoordinate = (coord) => {
    return coord ? coord.toFixed(6) : 'N/A'
  }

  const formatAccuracy = (accuracy) => {
    return accuracy ? `±${accuracy.toFixed(1)}m` : 'N/A'
  }

  const getMapUrl = (lat, lng) => {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="location-history">
      <div className="history-header">
        <h3>📊 Location History</h3>
        <button 
          onClick={onLoadHistory} 
          className="btn btn-secondary"
          disabled={loading}
        >
          🔄 Refresh History
        </button>
      </div>

      {locationHistory.length === 0 ? (
        <div className="no-history">
          <p>No location history available. Start tracking to see your locations here.</p>
        </div>
      ) : (
        <div className="history-stats">
          <div className="stat-item">
            <span className="stat-label">Total Locations:</span>
            <span className="stat-value">{locationHistory.length}</span>
          </div>
          {locationHistory.length > 1 && (
            <div className="stat-item">
              <span className="stat-label">Time Range:</span>
              <span className="stat-value">
                {formatTimestamp(locationHistory[locationHistory.length - 1].timestamp)} - {formatTimestamp(locationHistory[0].timestamp)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="history-list">
        {locationHistory.map((location, index) => (
          <div key={location.id || index} className="history-item">
            <div className="history-item-header">
              <span className="history-index">#{locationHistory.length - index}</span>
              <span className="history-timestamp">
                {formatTimestamp(location.timestamp)}
              </span>
            </div>
            
            <div className="history-coordinates">
              <div className="coordinate-group">
                <span className="coordinate-label">Lat:</span>
                <span className="coordinate-value">{formatCoordinate(location.latitude)}</span>
              </div>
              <div className="coordinate-group">
                <span className="coordinate-label">Lng:</span>
                <span className="coordinate-value">{formatCoordinate(location.longitude)}</span>
              </div>
              <div className="coordinate-group">
                <span className="coordinate-label">Acc:</span>
                <span className="coordinate-value">{formatAccuracy(location.accuracy)}</span>
              </div>
            </div>

            <div className="history-actions">
              <a
                href={getMapUrl(location.latitude, location.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="history-map-link"
              >
                🗺️ View
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LocationHistory
