import { useState, useEffect, useRef, useCallback } from 'react'
import { locationService } from '../config/supabase'
import { brazeLocationService, initializeBraze } from '../config/braze'

// Generate a meaningful user identifier for this session
const generateUserId = () => {
  const timestamp = new Date().toISOString()
  const browser = navigator.userAgent.split(' ').slice(-2).join(' ') // Get browser info
  const platform = navigator.platform || 'unknown'
  const language = navigator.language || 'unknown'
  const randomId = Math.random().toString(36).substr(2, 9)
  
  return `${browser}_${platform}_${language}_${timestamp}_${randomId}`
}

export const useGeolocation = () => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [userId] = useState(() => generateUserId())
  const [locationHistory, setLocationHistory] = useState([])
  const [dbStatus, setDbStatus] = useState({ connected: false, message: '' })
  const [brazeStatus, setBrazeStatus] = useState({ connected: false, message: '' })
  const [brazeUserId, setBrazeUserId] = useState(null)
  
  const watchId = useRef(null)

  // Test database connection and initialize Braze on mount
  useEffect(() => {
    const testDb = async () => {
      const result = await locationService.testConnection()
      setDbStatus({
        connected: result.success,
        message: result.success ? result.message : result.error
      })
    }
    
    const initBraze = async () => {
      const result = initializeBraze()
      setBrazeStatus({
        connected: result.success,
        message: result.success ? result.message : result.error
      })
      
      if (result.success) {
        // Get Braze user ID for display
        const userId = brazeLocationService.getBrazeUserId()
        setBrazeUserId(userId)
      }
    }
    
    testDb()
    initBraze()
  }, [])

  // Geolocation options
  const geoOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }

  // Save location to database
  const saveLocationToDb = useCallback(async (locationData) => {
    const result = await locationService.insertLocation({
      user_id: userId,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy,
      altitude: locationData.altitude,
      altitude_accuracy: locationData.altitudeAccuracy,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })

    if (result.success) {
      console.log('Location saved to database:', result.data)
      // Update local history
      setLocationHistory(prev => [result.data, ...prev.slice(0, 49)]) // Keep last 50
    } else {
      console.error('Failed to save location:', result.error)
    }

    return result
  }, [userId])

  // Handle successful geolocation
  const handleSuccess = useCallback((position) => {
    const coords = position.coords
    const locationData = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      timestamp: new Date().toISOString()
    }

    setLocation(locationData)
    setError(null)
    setLoading(false)

    // Save to database (for testing comparison)
    saveLocationToDb(locationData)

    // Send to Braze SDK (primary functionality)
    const brazeResult = brazeLocationService.setLastKnownLocation(
      coords.latitude,
      coords.longitude,
      coords.accuracy,
      coords.altitude,
      coords.altitudeAccuracy
    )

    console.log('Location updated:', locationData)
    console.log('Braze result:', brazeResult)
  }, [saveLocationToDb])

  // Handle geolocation errors
  const handleError = useCallback((error) => {
    let errorMessage = 'Unknown error occurred'
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable'
        break
      case error.TIMEOUT:
        errorMessage = 'Location request timed out'
        break
      default:
        errorMessage = `Geolocation error: ${error.message}`
    }

    setError(errorMessage)
    setLoading(false)
    console.error('Geolocation error:', errorMessage)
  }, [])

  // Get current location (one-time) using Braze SDK method
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Use Braze's recommended method
      const result = await brazeLocationService.getCurrentLocationAndSendToBraze()
      
      if (result.success) {
        setLocation(result.location)
        setError(null)
        
        // Also save to database for comparison
        await saveLocationToDb(result.location)
        
        console.log('Location captured and sent to Braze:', result.location)
        console.log('Braze result:', result.brazeResult)
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError(error.error || 'Failed to get location')
      console.error('Location capture failed:', error)
    } finally {
      setLoading(false)
    }
  }, [saveLocationToDb])

  // Start continuous tracking using Braze SDK method
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    if (isTracking) {
      console.log('Already tracking location')
      return
    }

    setLoading(true)
    setError(null)
    setIsTracking(true)

    // Use Braze's continuous tracking method
    watchId.current = brazeLocationService.startContinuousTracking()

    // Listen for Braze location updates
    const handleBrazeLocationUpdate = (event) => {
      const locationData = event.detail
      setLocation(locationData)
      setLoading(false)
      
      // Also save to database for comparison
      saveLocationToDb(locationData)
      
      console.log('Braze location update:', locationData)
    }

    const handleBrazeLocationError = (event) => {
      const { error } = event.detail
      setError(error)
      setLoading(false)
      console.error('Braze location error:', error)
    }

    window.addEventListener('brazeLocationUpdate', handleBrazeLocationUpdate)
    window.addEventListener('brazeLocationError', handleBrazeLocationError)

    // Store event listeners for cleanup
    watchId.current = {
      watchId: watchId.current,
      updateListener: handleBrazeLocationUpdate,
      errorListener: handleBrazeLocationError
    }

    console.log('Started continuous location tracking with Braze SDK')
  }, [isTracking, saveLocationToDb])

  // Stop continuous tracking
  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      // Handle both old format (just watchId) and new format (object with listeners)
      if (typeof watchId.current === 'object' && watchId.current.watchId) {
        // New format with Braze listeners
        brazeLocationService.stopContinuousTracking(watchId.current.watchId)
        
        // Remove event listeners
        window.removeEventListener('brazeLocationUpdate', watchId.current.updateListener)
        window.removeEventListener('brazeLocationError', watchId.current.errorListener)
      } else {
        // Old format (just watchId)
        navigator.geolocation.clearWatch(watchId.current)
      }
      
      watchId.current = null
    }
    
    setIsTracking(false)
    setLoading(false)
    console.log('Stopped location tracking')
  }, [])

  // Load location history from database
  const loadLocationHistory = useCallback(async () => {
    const result = await locationService.getLocationsByUser(userId, 50)
    if (result.success) {
      setLocationHistory(result.data)
    }
  }, [userId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        // Handle both old format (just watchId) and new format (object with listeners)
        if (typeof watchId.current === 'object' && watchId.current.watchId) {
          // New format with Braze listeners
          brazeLocationService.stopContinuousTracking(watchId.current.watchId)
          window.removeEventListener('brazeLocationUpdate', watchId.current.updateListener)
          window.removeEventListener('brazeLocationError', watchId.current.errorListener)
        } else {
          // Old format (just watchId)
          navigator.geolocation.clearWatch(watchId.current)
        }
      }
    }
  }, [])

  return {
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
    isGeolocationSupported: !!navigator.geolocation,
    brazeLocationService // Expose for additional testing
  }
}
