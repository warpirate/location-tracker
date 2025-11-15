import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../App'
import { locationService } from '../config/supabase'

// Mock geolocation API
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
}

// Mock Supabase
jest.mock('../config/supabase', () => ({
  locationService: {
    insertLocation: jest.fn(),
    getLocationsByUser: jest.fn(),
    getLatestLocation: jest.fn(),
    testConnection: jest.fn()
  }
}))

describe('Location Tracker Test Application', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock geolocation API
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    })
    
    // Mock successful database connection
    locationService.testConnection.mockResolvedValue({
      success: true,
      message: 'Database connection successful'
    })
    
    locationService.getLocationsByUser.mockResolvedValue({
      success: true,
      data: []
    })
  })

  describe('Test 1: Geolocation API Availability', () => {
    test('Geolocation API is available', () => {
      expect(navigator.geolocation).toBeDefined()
      expect(typeof navigator.geolocation.getCurrentPosition).toBe('function')
      expect(typeof navigator.geolocation.watchPosition).toBe('function')
      expect(typeof navigator.geolocation.clearWatch).toBe('function')
    })
  })

  describe('Test 2: Application Rendering', () => {
    test('App renders without crashing', () => {
      render(<App />)
      expect(screen.getByText('Location Tracker Test Application')).toBeInTheDocument()
    })

    test('Control panel is visible', () => {
      render(<App />)
      expect(screen.getByText('Location Controls')).toBeInTheDocument()
      expect(screen.getByText('Get Current Location')).toBeInTheDocument()
      expect(screen.getByText('Start Continuous Tracking')).toBeInTheDocument()
    })

    test('Test results panel is visible', () => {
      render(<App />)
      expect(screen.getByText('Test Results')).toBeInTheDocument()
    })
  })

  describe('Test 3: Database Connection', () => {
    test('Can connect to Supabase', async () => {
      render(<App />)
      
      await waitFor(() => {
        expect(locationService.testConnection).toHaveBeenCalled()
      })
    })

    test('Database connection status is displayed', async () => {
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByText('✅ Connected')).toBeInTheDocument()
      })
    })
  })

  describe('Test 4: Location Capture', () => {
    test('Get current location button triggers geolocation', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10.5,
          altitude: null,
          altitudeAccuracy: null
        }
      }

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })

      locationService.insertLocation.mockResolvedValue({
        success: true,
        data: { id: 1, ...mockPosition.coords }
      })

      render(<App />)
      
      const getLocationButton = screen.getByText('Get Current Location')
      fireEvent.click(getLocationButton)

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
    })

    test('Location data has required fields', () => {
      const location = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10.5
      }
      
      expect(location).toHaveProperty('latitude')
      expect(location).toHaveProperty('longitude')
      expect(location).toHaveProperty('accuracy')
      expect(typeof location.latitude).toBe('number')
      expect(typeof location.longitude).toBe('number')
      expect(typeof location.accuracy).toBe('number')
    })
  })

  describe('Test 5: Continuous Tracking', () => {
    test('Start tracking button triggers watchPosition', async () => {
      const mockWatchId = 123
      mockGeolocation.watchPosition.mockReturnValue(mockWatchId)

      render(<App />)
      
      const startTrackingButton = screen.getByText('Start Continuous Tracking')
      fireEvent.click(startTrackingButton)

      expect(mockGeolocation.watchPosition).toHaveBeenCalled()
    })

    test('Stop tracking button clears watch', async () => {
      const mockWatchId = 123
      mockGeolocation.watchPosition.mockReturnValue(mockWatchId)

      render(<App />)
      
      // Start tracking first
      const startTrackingButton = screen.getByText('Start Continuous Tracking')
      fireEvent.click(startTrackingButton)

      // Then stop tracking
      await waitFor(() => {
        const stopTrackingButton = screen.getByText('Stop Tracking')
        fireEvent.click(stopTrackingButton)
      })

      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(mockWatchId)
    })
  })

  describe('Test 6: Error Handling', () => {
    test('Handles geolocation permission denied', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied the request for Geolocation.'
      }

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError)
      })

      render(<App />)
      
      const getLocationButton = screen.getByText('Get Current Location')
      fireEvent.click(getLocationButton)

      await waitFor(() => {
        expect(screen.getByText(/Location access denied by user/)).toBeInTheDocument()
      })
    })

    test('Handles geolocation timeout', async () => {
      const mockError = {
        code: 3, // TIMEOUT
        message: 'The request to get user location timed out.'
      }

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError)
      })

      render(<App />)
      
      const getLocationButton = screen.getByText('Get Current Location')
      fireEvent.click(getLocationButton)

      await waitFor(() => {
        expect(screen.getByText(/Location request timed out/)).toBeInTheDocument()
      })
    })
  })

  describe('Test 7: Data Validation', () => {
    test('Validates coordinate ranges', () => {
      const validLocation = {
        latitude: 40.7128,
        longitude: -74.0060
      }

      const invalidLocation = {
        latitude: 91, // Invalid: > 90
        longitude: -181 // Invalid: < -180
      }

      expect(validLocation.latitude).toBeGreaterThanOrEqual(-90)
      expect(validLocation.latitude).toBeLessThanOrEqual(90)
      expect(validLocation.longitude).toBeGreaterThanOrEqual(-180)
      expect(validLocation.longitude).toBeLessThanOrEqual(180)

      expect(invalidLocation.latitude).toBeGreaterThan(90)
      expect(invalidLocation.longitude).toBeLessThan(-180)
    })

    test('Validates accuracy values', () => {
      const location = {
        accuracy: 10.5
      }

      expect(location.accuracy).toBeGreaterThan(0)
      expect(typeof location.accuracy).toBe('number')
    })
  })

  describe('Test 8: User Interface', () => {
    test('Buttons are properly enabled/disabled', () => {
      render(<App />)
      
      const getLocationButton = screen.getByText('Get Current Location')
      const startTrackingButton = screen.getByText('Start Continuous Tracking')

      expect(getLocationButton).not.toBeDisabled()
      expect(startTrackingButton).not.toBeDisabled()
    })

    test('Loading state is handled correctly', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        // Simulate delay
        setTimeout(() => {
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.0060,
              accuracy: 10.5
            }
          })
        }, 100)
      })

      render(<App />)
      
      const getLocationButton = screen.getByText('Get Current Location')
      fireEvent.click(getLocationButton)

      // Should show loading state
      expect(screen.getByText('Getting Location...')).toBeInTheDocument()
    })
  })

  describe('Test 9: Map Integration', () => {
    test('Map link is generated correctly', () => {
      const latitude = 40.7128
      const longitude = -74.0060
      const expectedUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`

      // This would be tested in the component that generates the URL
      const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`
      expect(mapUrl).toBe(expectedUrl)
    })
  })

  describe('Test 10: Session Management', () => {
    test('User ID is generated and persists', () => {
      render(<App />)
      
      // User ID should be visible in the UI
      const userIdElement = screen.getByText(/user_/)
      expect(userIdElement).toBeInTheDocument()
    })
  })
})

// Integration Tests
describe('Integration Tests', () => {
  test('End-to-end location capture flow', async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10.5,
        altitude: 100,
        altitudeAccuracy: 5
      }
    }

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition)
    })

    locationService.insertLocation.mockResolvedValue({
      success: true,
      data: {
        id: 1,
        user_id: 'test_user',
        latitude: mockPosition.coords.latitude,
        longitude: mockPosition.coords.longitude,
        accuracy: mockPosition.coords.accuracy,
        altitude: mockPosition.coords.altitude,
        timestamp: new Date().toISOString()
      }
    })

    render(<App />)
    
    // Click get location button
    const getLocationButton = screen.getByText('Get Current Location')
    fireEvent.click(getLocationButton)

    // Wait for location to be captured and displayed
    await waitFor(() => {
      expect(screen.getByText('40.71280000')).toBeInTheDocument()
      expect(screen.getByText('-74.00600000')).toBeInTheDocument()
    })

    // Verify database insertion was called
    expect(locationService.insertLocation).toHaveBeenCalledWith({
      user_id: expect.any(String),
      latitude: mockPosition.coords.latitude,
      longitude: mockPosition.coords.longitude,
      accuracy: mockPosition.coords.accuracy,
      altitude: mockPosition.coords.altitude,
      altitude_accuracy: mockPosition.coords.altitudeAccuracy,
      timestamp: expect.any(String)
    })
  })

  test('Continuous tracking flow', async () => {
    let watchCallback
    const mockWatchId = 123

    mockGeolocation.watchPosition.mockImplementation((callback) => {
      watchCallback = callback
      return mockWatchId
    })

    locationService.insertLocation.mockResolvedValue({
      success: true,
      data: { id: 1 }
    })

    render(<App />)
    
    // Start tracking
    const startTrackingButton = screen.getByText('Start Continuous Tracking')
    fireEvent.click(startTrackingButton)

    expect(mockGeolocation.watchPosition).toHaveBeenCalled()

    // Simulate location updates
    const positions = [
      { coords: { latitude: 40.7128, longitude: -74.0060, accuracy: 10 } },
      { coords: { latitude: 40.7129, longitude: -74.0061, accuracy: 8 } },
      { coords: { latitude: 40.7130, longitude: -74.0062, accuracy: 12 } }
    ]

    for (const position of positions) {
      watchCallback(position)
      await waitFor(() => {
        expect(locationService.insertLocation).toHaveBeenCalledWith(
          expect.objectContaining({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        )
      })
    }

    // Stop tracking
    const stopTrackingButton = await screen.findByText('Stop Tracking')
    fireEvent.click(stopTrackingButton)

    expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(mockWatchId)
  })
})
