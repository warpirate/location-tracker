# Braze SDK Setup Instructions

## ⚠️ Important: API Key Configuration Required

This application requires a valid Braze API key to function properly. Currently, placeholder values are used.

### Step 1: Get Your Braze Credentials

1. **Login to your Braze Dashboard**
2. **Navigate to Settings > API Keys**
3. **Copy your API Key**
4. **Get your SDK Endpoint URL** (e.g., `sdk.iad-01.braze.com`)

### Step 2: Update Configuration

Edit `src/config/braze.js` and replace the placeholder values:

```javascript
const BRAZE_CONFIG = {
  apiKey: "YOUR-ACTUAL-API-KEY", // Replace with your real API key
  baseUrl: "YOUR-SDK-ENDPOINT", // Replace with your SDK endpoint
  enableLogging: true, // Keep true for testing
  // ... other config options
}
```

### Step 3: Test the Integration

1. **Start the application**: `npm start`
2. **Check System Status**: Verify "Braze SDK" shows ✅ Connected
3. **Test Location Capture**: Click "Get Current Location"
4. **Check Browser Console**: Look for Braze SDK logs
5. **Verify in Braze Dashboard**: Check if location data appears in user profiles

## Braze SDK Methods Used

This application implements the exact methods from Braze documentation:

### One-time Location Capture
```javascript
import * as braze from "@braze/web-sdk";

function success(position) {
  var coords = position.coords;
  braze.getUser().setLastKnownLocation(
    coords.latitude,
    coords.longitude,
    coords.accuracy,
    coords.altitude,
    coords.altitudeAccuracy
  );
}

navigator.geolocation.getCurrentPosition(success);
```

### Continuous Location Tracking
```javascript
function success(position) {
  var coords = position.coords;
  braze.getUser().setLastKnownLocation(
    coords.latitude,
    coords.longitude,
    coords.accuracy,
    coords.altitude,
    coords.altitudeAccuracy
  );
}

navigator.geolocation.watchPosition(success);
```

## Testing Checklist

- [ ] Braze SDK initializes successfully
- [ ] Location permission granted
- [ ] One-time location capture works
- [ ] Continuous tracking sends updates to Braze
- [ ] Browser console shows Braze logs
- [ ] Location data appears in Braze dashboard
- [ ] Error handling works for permission denials
- [ ] Map integration displays correct coordinates

## Troubleshooting

### Braze SDK Not Connected
- Verify API key is correct
- Check SDK endpoint URL
- Ensure HTTPS in production
- Check browser console for errors

### Location Permission Issues
- Allow location access when prompted
- Check browser location settings
- Try different browser if needed
- Ensure HTTPS for production deployment

### No Data in Braze Dashboard
- Check API key permissions
- Verify user identification is working
- Check Braze logs in browser console
- Ensure SDK is properly initialized

## Production Deployment

For production use:
1. **Use HTTPS** (required for geolocation API)
2. **Secure API keys** (use environment variables)
3. **Configure proper CORS** settings
4. **Test across different browsers** and devices
5. **Monitor Braze dashboard** for incoming data

## Support

- **Braze Documentation**: https://www.braze.com/docs/developer_guide/platform_integration_guides/web/analytics/location_tracking/
- **Geolocation API**: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- **Browser Console**: Check for detailed error messages and Braze SDK logs
