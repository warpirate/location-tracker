import { useState, useEffect, useRef, useCallback } from 'react'
import { locationService } from '../config/supabase'

// Generate a device identifier and store it persistently
const generateDeviceId = () => {
  try {
    // Try to get existing device ID from storage
    const storedId = localStorage.getItem('device_id')
    
    if (storedId) {
      console.log('Using existing device ID:', storedId)
      return storedId
    }
    
    // If no ID exists, create a new one
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    const deviceId = `device_${timestamp}_${randomId}`
    
    // Store it for future use
    localStorage.setItem('device_id', deviceId)
    console.log('Created and stored new device ID:', deviceId)
    return deviceId
  } catch (error) {
    console.error('Error managing device ID:', error)
    // Fallback to a temporary ID if storage fails
    return `temp_${Date.now()}`
  }
}

export const useGeolocation = () => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [userId] = useState(() => generateDeviceId())
  const [locationHistory, setLocationHistory] = useState([])
  const [dbStatus, setDbStatus] = useState({ connected: false, message: '' })
  
  const watchId = useRef(null)
  const intervalId = useRef(null)
  const retryCount = useRef(0)
  const maxRetries = 3

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
        retryCount.current = 0 // Reset retry count on permission denied
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable - this may be due to poor GPS signal or rate limiting'
        break
      case error.TIMEOUT:
        errorMessage = 'Location request timed out - trying with less aggressive settings'
        break
      default:
        errorMessage = `Geolocation error: ${error.message}`
    }

    // Implement exponential backoff for retries
    if (error.code !== error.PERMISSION_DENIED && retryCount.current < maxRetries) {
      retryCount.current++
      const backoffTime = Math.pow(2, retryCount.current) * 1000 // 2s, 4s, 8s
      console.log(`⏳ Retrying location request in ${backoffTime/1000}s (attempt ${retryCount.current}/${maxRetries})`)
      
      setTimeout(() => {
        console.log('🔄 Retrying location request...')
        navigator.geolocation.getCurrentPosition(
          (position) => {
            retryCount.current = 0 // Reset on success
            handleSuccess(position)
          },
          handleError,
          {
            enableHighAccuracy: false,
            timeout: 45000, // Even longer timeout for retries
            maximumAge: 600000 // 10 minute cache for retries
          }
        )
      }, backoffTime)
    } else {
      retryCount.current = 0 // Reset retry count
    }

    setError(errorMessage)
    setLoading(false)
    console.error('❌ Geolocation error:', errorMessage, 'Code:', error.code)
  }, [])

  // Get current location (one-time) using browser geolocation
  const getCurrentLocation = useCallback(async () => {
    console.log('🎯 getCurrentLocation called')
    
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser'
      setError(errorMsg)
      console.error('❌ Geolocation not supported')
      throw new Error(errorMsg)
    }

    // Check current permission state
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({name: 'geolocation'})
        console.log('🔐 Current geolocation permission:', permission.state)
        
        if (permission.state === 'denied') {
          const errorMsg = 'Location permission is denied. Please enable it in browser settings.'
          setError(errorMsg)
          localStorage.setItem('locationPermissionGranted', 'false')
          throw new Error(errorMsg)
        }
      } catch (permError) {
        console.log('⚠️ Could not check permission state:', permError)
      }
    }

    setLoading(true)
    setError(null)
    console.log('📍 Requesting location...')

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('✅ Location obtained:', position)
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
            console.log('💾 Saving to database...')
            await saveLocationToDb(locationData)
            
            console.log('✅ Location captured and saved:', locationData)
            resolve(locationData)
          } catch (error) {
            console.error('❌ Error processing location:', error)
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
              localStorage.setItem('locationPermissionGranted', 'false')
              console.error('❌ Permission denied - clearing localStorage flag')
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
          console.error('❌ Geolocation error:', errorMessage, 'Code:', error.code)
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: false, // Less aggressive to avoid rate limits
          timeout: 30000, // Longer timeout for better reliability
          maximumAge: 60000 // Cache location for 1 minute to reduce API calls
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
        enableHighAccuracy: false, // Less aggressive to avoid rate limits
        timeout: 30000, // Longer timeout for better reliability  
        maximumAge: 300000 // Cache for 5 minutes to reduce rate limiting
      }
    )

    // Store watch ID for cleanup
    watchId.current = browserWatchId

    // Set up a less frequent periodic backup to avoid rate limits
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
          enableHighAccuracy: false, // Less aggressive
          timeout: 30000, // Longer timeout
          maximumAge: 300000 // 5 minute cache
        }
      )
    }, 300000) // Every 5 minutes to avoid rate limits

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
