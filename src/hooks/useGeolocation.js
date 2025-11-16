import { useState, useEffect, useRef, useCallback } from 'react'
import { locationService } from '../config/supabase'

// Generate a simple user identifier for this session
const generateUserId = () => {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substr(2, 9)
  
  return `user_${timestamp}_${randomId}`
}

export const useGeolocation = () => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [userId] = useState(() => generateUserId())
  const [locationHistory, setLocationHistory] = useState([])
  const [dbStatus, setDbStatus] = useState({ connected: false, message: '' })
  
  const watchId = useRef(null)
  const intervalId = useRef(null)

  // Test database connection on mount
  useEffect(() => {
    const testDb = async () => {
      const result = await locationService.testConnection()
      setDbStatus({
        connected: result.success,
        message: result.success ? result.message : result.error
      })
    }
    
    testDb()
  }, [])

  // Geolocation options
  const geoOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }

  // Save location to database
  const saveLocationToDb = useCallback(async (locationData) => {
    try {
      console.log('Attempting to save location to database:', locationData)
      
      const result = await locationService.insertLocation({
        user_id: userId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        altitude: locationData.altitude,
        altitude_accuracy: locationData.altitudeAccuracy,
        timestamp: new Date().toISOString()
      })

      if (result.success) {
        console.log('✅ Location saved to database successfully:', result.data)
        // Update local history
        setLocationHistory(prev => [result.data, ...prev.slice(0, 49)]) // Keep last 50
      } else {
        console.error('❌ Failed to save location to database:', result.error)
      }

      return result
    } catch (error) {
      console.error('❌ Database save error:', error)
      return { success: false, error: error.message }
    }
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

    // Save to database
    saveLocationToDb(locationData)

    console.log('Location updated:', locationData)
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

  // Get current location (one-time) using browser geolocation
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser'
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    setLoading(true)
    setError(null)

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
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
            
            // Save to database
            await saveLocationToDb(locationData)
            
            console.log('Location captured:', locationData)
            resolve(locationData)
          } catch (error) {
            console.error('Error processing location:', error)
            setError('Failed to process location data')
            setLoading(false)
            reject(error)
          }
        },
        (error) => {
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
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }, [saveLocationToDb])

  // Start continuous tracking using browser geolocation
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

    // Start browser-based continuous tracking
    const browserWatchId = navigator.geolocation.watchPosition(
      handleSuccess,
      (error) => {
        handleError(error)
        
        // If permission is denied, clear the localStorage flag
        if (error.code === error.PERMISSION_DENIED) {
          localStorage.setItem('locationPermissionGranted', 'false')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000 // Update more frequently - every 30 seconds
      }
    )

    // Store watch ID for cleanup
    watchId.current = browserWatchId

    // Also set up a periodic backup to ensure regular updates
    intervalId.current = setInterval(() => {
      console.log('🔄 Periodic location update check...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('🔄 Periodic location update successful')
          handleSuccess(position)
        },
        (error) => {
          console.log('🔄 Periodic location update failed:', error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    }, 60000) // Every 60 seconds

    console.log('Started continuous location tracking with browser geolocation + periodic backup')
  }, [isTracking, saveLocationToDb, handleSuccess, handleError])

  // Stop continuous tracking
  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      // Clear the browser geolocation watch
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    
    if (intervalId.current !== null) {
      // Clear the periodic backup interval
      clearInterval(intervalId.current)
      intervalId.current = null
    }
    
    setIsTracking(false)
    setLoading(false)
    console.log('Stopped location tracking and periodic updates')
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
        navigator.geolocation.clearWatch(watchId.current)
      }
      if (intervalId.current !== null) {
        clearInterval(intervalId.current)
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
    getCurrentLocation,
    startTracking,
    stopTracking,
    loadLocationHistory,
    isGeolocationSupported: !!navigator.geolocation
  }
}
