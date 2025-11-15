import React, { useState, useEffect } from 'react'

const TestResults = ({ location, locationHistory, error, dbStatus, brazeStatus, isTracking }) => {
  const [testResults, setTestResults] = useState({
    geolocationAPI: null,
    brazeSDK: null,
    databaseConnection: null,
    locationCapture: null,
    continuousTracking: null,
    dataAccuracy: null,
    errorHandling: null
  })

  const [testLog, setTestLog] = useState([])

  const addToLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setTestLog(prev => [...prev, { timestamp, message, type }])
  }

  // Test geolocation API availability
  useEffect(() => {
    const apiAvailable = !!navigator.geolocation
    setTestResults(prev => ({
      ...prev,
      geolocationAPI: apiAvailable ? 'PASS' : 'FAIL'
    }))
    
    addToLog(
      `Geolocation API: ${apiAvailable ? 'Available' : 'Not Available'}`,
      apiAvailable ? 'success' : 'error'
    )
  }, [])

  // Test Braze SDK connection
  useEffect(() => {
    const brazeConnected = brazeStatus.connected
    setTestResults(prev => ({
      ...prev,
      brazeSDK: brazeConnected ? 'PASS' : 'FAIL'
    }))
    
    addToLog(
      `Braze SDK: ${brazeConnected ? 'Connected and Initialized' : 'Failed to Initialize'}`,
      brazeConnected ? 'success' : 'error'
    )
  }, [brazeStatus])

  // Test database connection
  useEffect(() => {
    const dbConnected = dbStatus.connected
    setTestResults(prev => ({
      ...prev,
      databaseConnection: dbConnected ? 'PASS' : 'FAIL'
    }))
    
    addToLog(
      `Database Connection: ${dbConnected ? 'Connected' : 'Failed'}`,
      dbConnected ? 'success' : 'error'
    )
  }, [dbStatus])

  // Test location capture
  useEffect(() => {
    if (location) {
      const hasValidCoords = location.latitude && location.longitude
      const hasAccuracy = location.accuracy !== null && location.accuracy !== undefined
      
      setTestResults(prev => ({
        ...prev,
        locationCapture: hasValidCoords && hasAccuracy ? 'PASS' : 'PARTIAL'
      }))
      
      addToLog(
        `Location Captured: Lat ${location.latitude?.toFixed(6)}, Lng ${location.longitude?.toFixed(6)}, Accuracy ±${location.accuracy?.toFixed(1)}m`,
        'success'
      )
    }
  }, [location])

  // Test continuous tracking
  useEffect(() => {
    if (isTracking) {
      addToLog('Continuous tracking started', 'info')
      setTestResults(prev => ({
        ...prev,
        continuousTracking: 'RUNNING'
      }))
    } else if (locationHistory.length > 1) {
      setTestResults(prev => ({
        ...prev,
        continuousTracking: 'PASS'
      }))
      addToLog(`Continuous tracking completed. ${locationHistory.length} locations captured`, 'success')
    }
  }, [isTracking, locationHistory.length])

  // Test data accuracy
  useEffect(() => {
    if (location) {
      const latValid = location.latitude >= -90 && location.latitude <= 90
      const lngValid = location.longitude >= -180 && location.longitude <= 180
      const accuracyReasonable = location.accuracy && location.accuracy < 1000 // Less than 1km
      
      const accuracyTest = latValid && lngValid && accuracyReasonable
      setTestResults(prev => ({
        ...prev,
        dataAccuracy: accuracyTest ? 'PASS' : 'FAIL'
      }))
      
      addToLog(
        `Data Accuracy: Coordinates ${latValid && lngValid ? 'valid' : 'invalid'}, Accuracy ${accuracyReasonable ? 'reasonable' : 'poor'} (${location.accuracy?.toFixed(1)}m)`,
        accuracyTest ? 'success' : 'warning'
      )
    }
  }, [location])

  // Test error handling
  useEffect(() => {
    if (error) {
      setTestResults(prev => ({
        ...prev,
        errorHandling: 'PASS'
      }))
      addToLog(`Error handled: ${error}`, 'warning')
    }
  }, [error])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS': return '✅'
      case 'FAIL': return '❌'
      case 'PARTIAL': return '⚠️'
      case 'RUNNING': return '🔄'
      default: return '⏳'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS': return '#4CAF50'
      case 'FAIL': return '#f44336'
      case 'PARTIAL': return '#FF9800'
      case 'RUNNING': return '#2196F3'
      default: return '#9E9E9E'
    }
  }

  return (
    <div className="test-results">
      <h3>🧪 Test Results</h3>
      
      <div className="test-summary">
        <div className="test-item">
          <span className="test-name">Geolocation API</span>
          <span 
            className="test-status" 
            style={{ color: getStatusColor(testResults.geolocationAPI) }}
          >
            {getStatusIcon(testResults.geolocationAPI)} {testResults.geolocationAPI || 'PENDING'}
          </span>
        </div>
        
        <div className="test-item">
          <span className="test-name">Braze SDK</span>
          <span 
            className="test-status"
            style={{ color: getStatusColor(testResults.brazeSDK) }}
          >
            {getStatusIcon(testResults.brazeSDK)} {testResults.brazeSDK || 'PENDING'}
          </span>
        </div>
        
        <div className="test-item">
          <span className="test-name">Database (Comparison)</span>
          <span 
            className="test-status"
            style={{ color: getStatusColor(testResults.databaseConnection) }}
          >
            {getStatusIcon(testResults.databaseConnection)} {testResults.databaseConnection || 'PENDING'}
          </span>
        </div>
        
        <div className="test-item">
          <span className="test-name">Location Capture</span>
          <span 
            className="test-status"
            style={{ color: getStatusColor(testResults.locationCapture) }}
          >
            {getStatusIcon(testResults.locationCapture)} {testResults.locationCapture || 'PENDING'}
          </span>
        </div>
        
        <div className="test-item">
          <span className="test-name">Continuous Tracking</span>
          <span 
            className="test-status"
            style={{ color: getStatusColor(testResults.continuousTracking) }}
          >
            {getStatusIcon(testResults.continuousTracking)} {testResults.continuousTracking || 'PENDING'}
          </span>
        </div>
        
        <div className="test-item">
          <span className="test-name">Data Accuracy</span>
          <span 
            className="test-status"
            style={{ color: getStatusColor(testResults.dataAccuracy) }}
          >
            {getStatusIcon(testResults.dataAccuracy)} {testResults.dataAccuracy || 'PENDING'}
          </span>
        </div>
        
        <div className="test-item">
          <span className="test-name">Error Handling</span>
          <span 
            className="test-status"
            style={{ color: getStatusColor(testResults.errorHandling) }}
          >
            {getStatusIcon(testResults.errorHandling)} {testResults.errorHandling || 'PENDING'}
          </span>
        </div>
      </div>

      <div className="test-log">
        <h4>📝 Test Log</h4>
        <div className="log-container">
          {testLog.map((entry, index) => (
            <div 
              key={index} 
              className={`log-entry log-${entry.type}`}
            >
              <span className="log-timestamp">{entry.timestamp}</span>
              <span className="log-message">{entry.message}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="test-stats">
        <h4>📊 Session Statistics</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Locations:</span>
            <span className="stat-value">{locationHistory.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Current Accuracy:</span>
            <span className="stat-value">
              {location?.accuracy ? `±${location.accuracy.toFixed(1)}m` : 'N/A'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tracking Status:</span>
            <span className="stat-value">
              {isTracking ? '🔄 Active' : '⏹️ Stopped'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Test Log Entries:</span>
            <span className="stat-value">{testLog.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestResults
