# Location Tracking Feature Implementation

## Overview

Added a new location tracking feature that automatically refetches spawns every 50 meters of user movement.

## Files Added/Modified

### 1. New Composable: `use-location-tracking.ts`

Created a comprehensive location tracking composable that:

- Tracks user location continuously using `navigator.geolocation.watchPosition()`
- Calculates distance moved from last spawn fetch location using Haversine formula
- Triggers callbacks when movement exceeds 50m threshold
- Provides state for current location, distance moved, and tracking status
- Handles errors gracefully and provides user feedback

**Key Features:**
- Distance threshold: 50 meters
- High accuracy GPS tracking
- Automatic callback system for location updates and refetch requirements
- Error handling for permission denied, location unavailable, and timeout
- Cleanup on component unmount

### 2. Updated Component: `LeafletMap.vue`

Enhanced the map component to integrate location tracking:

- Integrated the `useLocationTracking` composable
- Added automatic spawn refetching when 50m threshold is reached
- Added rate limiting (minimum 10 seconds between auto-refetches)
- Added manual refetch button for user control
- Added visual indicators for tracking status and distance moved

**New UI Elements:**
- **Tracking Status Indicator**: Shows "Tracking Active" with current distance progress (e.g., "35m / 50m")
- **Auto-fetch Toggle**: Allows users to enable/disable automatic refetching
- **Manual Refetch Button**: Appears when distance > 10m, allows manual spawn refresh
- **Tracking Error Display**: Shows location tracking errors when they occur

## How It Works

### Location Tracking Flow

1. **Initialization**: When the map component mounts and location is enabled:
   - Sets up location tracking callbacks
   - Starts continuous location monitoring
   - Marks initial spawn fetch location

2. **Continuous Monitoring**: 
   - `watchPosition()` continuously updates user location
   - Calculates distance from last spawn fetch location
   - Updates UI indicators with current progress

3. **Auto-Refetch Trigger**:
   - When distance >= 50m and auto-refetch is enabled
   - Checks rate limiting (minimum 10 seconds between refetches)
   - Fetches new spawns at current location
   - Updates last fetch location to reset distance counter

4. **User Controls**:
   - Toggle auto-refetch on/off
   - Manual refetch button for immediate spawn refresh
   - Visual feedback for all tracking states

### Distance Calculation

Uses the Haversine formula for accurate distance calculation:

```typescript
function calculateDistance(coord1: LocationCoordinates, coord2: LocationCoordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
```

## Usage

### For Users

1. **Enable Location**: Allow location access when prompted
2. **View Tracking Status**: Check the green indicator in top-left showing distance progress
3. **Auto-Refetch**: Spawns automatically refresh every 50m of movement
4. **Manual Control**: 
   - Toggle auto-refetch on/off using the button below tracking status
   - Use manual refetch button when available (appears after 10m movement)

### For Developers

```typescript
// Use the composable
const {
  currentLocation,
  distanceFromLastFetch,
  isTracking,
  shouldRefetchSpawns,
  startTracking,
  stopTracking,
  markSpawnsFetched
} = useLocationTracking();

// Set up callbacks
setCallbacks({
  onLocationUpdate: (update) => {
    // Handle location updates
  },
  onRefetchRequired: (location, distance) => {
    // Handle spawn refetch requirement
  },
  onTrackingError: (error) => {
    // Handle tracking errors
  }
});
```

## Performance Considerations

1. **Rate Limiting**: Minimum 10 seconds between automatic refetches to prevent API spam
2. **High Accuracy GPS**: Uses `enableHighAccuracy: true` for precise location tracking
3. **Cached Positions**: Accepts cached positions up to 5 seconds old to reduce battery usage
4. **Error Handling**: Graceful fallbacks when location services fail
5. **Cleanup**: Properly stops tracking when component unmounts

## Error Handling

The implementation handles various error scenarios:

- **Permission Denied**: Shows user-friendly message and fallback options
- **Location Unavailable**: Continues with last known location
- **Timeout**: Retries with cached position
- **Network Issues**: Continues tracking, retries API calls
- **High Inaccuracy**: Continues tracking but may delay refetch

## Testing

To test the feature:

1. Open the map page with location enabled
2. Move around (or simulate movement in browser dev tools)
3. Watch the distance indicator update
4. Verify spawns refetch automatically at 50m threshold
5. Test manual refetch button functionality
6. Test auto-refetch toggle

## Future Enhancements

Potential improvements:

- Configurable distance threshold (user preference)
- Battery optimization modes
- Predictive refetching based on movement direction
- Smart refetch timing based on spawn density
- Location history and movement patterns