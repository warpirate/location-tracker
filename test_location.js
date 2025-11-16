// Simple test script to verify location tracking functionality
// Run this in browser console or as a standalone test

console.log('🧪 Starting Location Tracking Test...');

// Test 1: Check if geolocation is supported
if ('geolocation' in navigator) {
  console.log('✅ Geolocation is supported');
} else {
  console.error('❌ Geolocation is NOT supported');
  return;
}

// Test 2: Check permission state
if (navigator.permissions) {
  navigator.permissions.query({name: 'geolocation'})
    .then(permission => {
      console.log('🔐 Permission state:', permission.state);
      
      if (permission.state === 'denied') {
        console.error('❌ Location permission is denied - please enable in browser settings');
        return;
      }
      
      // Test 3: Try to get current location
      console.log('📍 Testing getCurrentPosition...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ SUCCESS - Location obtained:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString()
          });
          
          // Test 4: Try continuous tracking for 10 seconds
          console.log('🔄 Testing continuous tracking for 10 seconds...');
          const watchId = navigator.geolocation.watchPosition(
            (pos) => {
              console.log('📍 Continuous update:', {
                lat: pos.coords.latitude.toFixed(6),
                lng: pos.coords.longitude.toFixed(6),
                time: new Date().toLocaleTimeString()
              });
            },
            (error) => {
              console.error('❌ Continuous tracking error:', error.message);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 30000
            }
          );
          
          // Stop after 10 seconds
          setTimeout(() => {
            navigator.geolocation.clearWatch(watchId);
            console.log('⏹️ Continuous tracking test completed');
            console.log('🎉 All tests completed successfully!');
          }, 10000);
        },
        (error) => {
          console.error('❌ FAILED - Could not get location:', error.message);
          console.error('Error code:', error.code);
          console.error('Error details:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    })
    .catch(error => {
      console.log('⚠️ Could not check permission state:', error);
    });
} else {
  console.log('⚠️ Permissions API not available, proceeding with location test...');
}

// Test 5: Check localStorage for permission flag
const storedPermission = localStorage.getItem('locationPermissionGranted');
console.log('💾 Stored permission flag:', storedPermission);

console.log('🧪 Test initiated - check console for results...');
