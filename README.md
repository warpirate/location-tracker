# Braze SDK Location Tracking Test Application

A comprehensive testing environment for **Braze Web SDK location tracking functionality** built with React. This application implements the exact location tracking methods from the Braze SDK documentation.

## Features

- **Braze SDK Integration**: Uses `braze.getUser().setLastKnownLocation()` method
- **One-time Location Capture**: Implements `navigator.geolocation.getCurrentPosition()` with Braze
- **Continuous Location Tracking**: Uses `navigator.geolocation.watchPosition()` with Braze SDK
- **Real-time Testing**: Comprehensive test scenarios for Braze SDK functionality
- **Comparison Database**: Supabase storage for comparing Braze data accuracy
- **Interactive Testing**: Live test results and Braze SDK logging
- **Map Integration**: View locations on OpenStreetMap
- **Error Handling**: Graceful handling of permission denials and API errors

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Application**
   ```bash
   npm start
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

## Test Scenarios

### Scenario 1: Basic Functionality
- Click "Get Current Location"
- Verify latitude/longitude display
- Confirm accuracy reading
- Check data in browser console
- Verify location saved to Supabase

### Scenario 2: Continuous Tracking
- Click "Start Continuous Tracking"
- Wait 5-10 seconds
- Observe real-time updates
- Move physically (if possible)
- Verify multiple database entries
- Click "Stop Tracking"

### Scenario 3: Error Handling
- Deny location permission
- Verify error message displays
- Test with geolocation disabled
- Check network error handling

### Scenario 4: Data Persistence
- Capture a location
- Refresh the page
- Verify data exists in Supabase
- Check user_id association
- Confirm timestamp accuracy

### Scenario 5: Map Integration
- Get a location
- Click "View on Map"
- Verify OpenStreetMap opens
- Confirm correct coordinates
- Check zoom level

## Database Schema

The application uses a `locations` table with the following structure:

```sql
CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(10, 2),
    altitude DECIMAL(10, 2),
    altitude_accuracy DECIMAL(10, 2),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Configuration

The application is pre-configured with Supabase credentials. For production use:

1. Create your own Supabase project
2. Update the credentials in `src/config/supabase.js`
3. Run the database migration to create the `locations` table

## API Reference

### Geolocation API Methods

- `getCurrentPosition()`: Get current location once
- `watchPosition()`: Start continuous tracking
- `clearWatch()`: Stop continuous tracking

### Supabase Operations

- `insertLocation()`: Save location to database
- `getLocationsByUser()`: Retrieve user's location history
- `getLatestLocation()`: Get most recent location
- `testConnection()`: Verify database connectivity

## Browser Compatibility

- Chrome 5+
- Firefox 3.5+
- Safari 5+
- Edge 12+
- Opera 10.6+

## Security Considerations

- Location data is sensitive - handle with care
- HTTPS required for geolocation API in production
- Implement proper authentication for production use
- Consider data retention policies

## Troubleshooting

### Common Issues

1. **Location Permission Denied**
   - Check browser location settings
   - Ensure HTTPS in production
   - Clear browser cache and try again

2. **Database Connection Failed**
   - Verify Supabase credentials
   - Check network connectivity
   - Confirm database schema exists

3. **Inaccurate Location Data**
   - Enable high accuracy mode
   - Check GPS signal strength
   - Try different browsers/devices

4. **Continuous Tracking Not Working**
   - Verify watchPosition support
   - Check for JavaScript errors
   - Ensure proper cleanup on unmount

## Performance Tips

- Limit location history to prevent memory issues
- Use appropriate timeout values for geolocation
- Implement proper error boundaries
- Monitor database query performance

## Testing Checklist

- [ ] Location permission prompt appears
- [ ] UI is responsive and loads quickly
- [ ] Buttons are properly enabled/disabled
- [ ] Error messages are clear and helpful
- [ ] Loading spinner appears during operations
- [ ] Map link works correctly
- [ ] Timestamps are accurate
- [ ] User ID persists within session
- [ ] No console errors during normal operation
- [ ] Database queries complete successfully

## Built With

- **React 18** - Frontend framework
- **Supabase** - Backend database and API
- **Geolocation API** - Browser location services
- **OpenStreetMap** - Map visualization
- **CSS Grid & Flexbox** - Responsive layout

## License

This project is for testing and educational purposes.
