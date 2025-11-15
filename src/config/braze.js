import * as braze from "@braze/web-sdk"

// Braze configuration
const BRAZE_CONFIG = {
  apiKey: process.env.REACT_APP_BRAZE_API_KEY,
  baseUrl: process.env.REACT_APP_BRAZE_BASE_URL,
  enableLogging: true, // Enable for testing
  sessionTimeoutInSeconds: 10,
  allowUserSuppliedJavascript: false,
  enableHtmlInAppMessages: false,
  openInAppMessagesInNewTab: false,
  allowCrawlerActivity: false,
  doNotLoadFontAwesome: true,
  enableSdkAuthentication: false
}

if (!BRAZE_CONFIG.apiKey || !BRAZE_CONFIG.baseUrl) {
  console.error('Braze env vars missing. Check REACT_APP_BRAZE_API_KEY and REACT_APP_BRAZE_BASE_URL')
}

// Initialize Braze SDK
export const initializeBraze = () => {
  try {
    braze.initialize(BRAZE_CONFIG.apiKey, {
      baseUrl: BRAZE_CONFIG.baseUrl,
      enableLogging: BRAZE_CONFIG.enableLogging,
      sessionTimeoutInSeconds: BRAZE_CONFIG.sessionTimeoutInSeconds,
      allowUserSuppliedJavascript: BRAZE_CONFIG.allowUserSuppliedJavascript,
      enableHtmlInAppMessages: BRAZE_CONFIG.enableHtmlInAppMessages,
      openInAppMessagesInNewTab: BRAZE_CONFIG.openInAppMessagesInNewTab,
      allowCrawlerActivity: BRAZE_CONFIG.allowCrawlerActivity,
      doNotLoadFontAwesome: BRAZE_CONFIG.doNotLoadFontAwesome,
      enableSdkAuthentication: BRAZE_CONFIG.enableSdkAuthentication
    })

    // Open session
    braze.openSession()
    
    console.log('Braze SDK initialized successfully')
    return { success: true, message: 'Braze SDK initialized' }
  } catch (error) {
    console.error('Failed to initialize Braze SDK:', error)
    return { success: false, error: error.message }
  }
}

// Braze location service following the exact SDK documentation
export const brazeLocationService = {
  // Set last known location using Braze SDK
  setLastKnownLocation(latitude, longitude, accuracy, altitude, altitudeAccuracy) {
    try {
      braze.getUser().setLastKnownLocation(
        latitude,
        longitude,
        accuracy,
        altitude,
        altitudeAccuracy
      )
      
      console.log('Location sent to Braze:', {
        latitude,
        longitude,
        accuracy,
        altitude,
        altitudeAccuracy
      })
      
      return { success: true, message: 'Location sent to Braze successfully' }
    } catch (error) {
      console.error('Failed to send location to Braze:', error)
      return { success: false, error: error.message }
    }
  },

  // Get current location and send to Braze (following Braze documentation)
  getCurrentLocationAndSendToBraze() {
    return new Promise((resolve, reject) => {
      const success = (position) => {
        const coords = position.coords
        
        // Send to Braze using their exact method
        const result = this.setLastKnownLocation(
          coords.latitude,
          coords.longitude,
          coords.accuracy,
          coords.altitude,
          coords.altitudeAccuracy
        )
        
        resolve({
          success: true,
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            altitude: coords.altitude,
            altitudeAccuracy: coords.altitudeAccuracy,
            timestamp: new Date().toISOString()
          },
          brazeResult: result
        })
      }

      const error = (error) => {
        console.error('Geolocation error:', error)
        reject({
          success: false,
          error: this.getGeolocationErrorMessage(error)
        })
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }

      navigator.geolocation.getCurrentPosition(success, error, options)
    })
  },

  // Start continuous location tracking and send to Braze
  startContinuousTracking() {
    const success = (position) => {
      const coords = position.coords
      
      // Send each location update to Braze
      this.setLastKnownLocation(
        coords.latitude,
        coords.longitude,
        coords.accuracy,
        coords.altitude,
        coords.altitudeAccuracy
      )
      
      // Trigger custom event for UI updates
      window.dispatchEvent(new CustomEvent('brazeLocationUpdate', {
        detail: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          altitude: coords.altitude,
          altitudeAccuracy: coords.altitudeAccuracy,
          timestamp: new Date().toISOString()
        }
      }))
    }

    const error = (error) => {
      console.error('Continuous tracking error:', error)
      window.dispatchEvent(new CustomEvent('brazeLocationError', {
        detail: { error: this.getGeolocationErrorMessage(error) }
      }))
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

    const watchId = navigator.geolocation.watchPosition(success, error, options)
    console.log('Started continuous location tracking with Braze, watchId:', watchId)
    
    return watchId
  },

  // Stop continuous tracking
  stopContinuousTracking(watchId) {
    if (watchId !== null && watchId !== undefined) {
      navigator.geolocation.clearWatch(watchId)
      console.log('Stopped continuous location tracking, watchId:', watchId)
      return true
    }
    return false
  },

  // Helper method to get user-friendly error messages
  getGeolocationErrorMessage(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied by user'
      case error.POSITION_UNAVAILABLE:
        return 'Location information unavailable'
      case error.TIMEOUT:
        return 'Location request timed out'
      default:
        return `Geolocation error: ${error.message}`
    }
  },

  // Test Braze SDK connection
  testBrazeConnection() {
    try {
      // Try to get user - this will fail if Braze isn't initialized
      const user = braze.getUser()
      if (user) {
        console.log('Braze SDK connection test successful')
        return { success: true, message: 'Braze SDK is connected and ready' }
      } else {
        return { success: false, error: 'Braze user object not available' }
      }
    } catch (error) {
      console.error('Braze connection test failed:', error)
      return { success: false, error: error.message }
    }
  },

  // Get Braze user ID for testing
  getBrazeUserId() {
    try {
      const user = braze.getUser()
      return user ? user.getUserId() : null
    } catch (error) {
      console.error('Failed to get Braze user ID:', error)
      return null
    }
  },

  // Log custom event for testing
  logCustomEvent(eventName, properties = {}) {
    try {
      braze.logCustomEvent(eventName, properties)
      console.log('Custom event logged to Braze:', eventName, properties)
      return { success: true, message: 'Custom event logged successfully' }
    } catch (error) {
      console.error('Failed to log custom event:', error)
      return { success: false, error: error.message }
    }
  }
}

export { braze }
export default brazeLocationService
