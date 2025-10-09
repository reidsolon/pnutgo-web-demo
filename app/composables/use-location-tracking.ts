export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationUpdate {
  position: LocationCoordinates;
  timestamp: number;
  accuracy?: number;
}

export interface LocationTrackingState {
  currentLocation: LocationCoordinates | null;
  lastSpawnFetchLocation: LocationCoordinates | null;
  distanceFromLastFetch: number;
  isTracking: boolean;
  trackingError: string | null;
  watchId: number | null;
}

const REFETCH_DISTANCE_THRESHOLD = 50; // 50 meters

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance in meters
 */
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

export const useLocationTracking = () => {
  // State management
  const state = useState<LocationTrackingState>('location-tracking', () => ({
    currentLocation: null,
    lastSpawnFetchLocation: null,
    distanceFromLastFetch: 0,
    isTracking: false,
    trackingError: null,
    watchId: null,
  }));

  // Reactive getters
  const currentLocation = computed(() => state.value.currentLocation);
  const lastSpawnFetchLocation = computed(() => state.value.lastSpawnFetchLocation);
  const distanceFromLastFetch = computed(() => state.value.distanceFromLastFetch);
  const isTracking = computed(() => state.value.isTracking);
  const trackingError = computed(() => state.value.trackingError);
  const shouldRefetchSpawns = computed(() => state.value.distanceFromLastFetch >= REFETCH_DISTANCE_THRESHOLD);

  // Callbacks for location events
  const callbacks = ref<{
    onLocationUpdate?: (update: LocationUpdate) => void;
    onRefetchRequired?: (location: LocationCoordinates, distance: number) => void;
    onTrackingError?: (error: string) => void;
  }>({});

  /**
   * Set event callbacks
   */
  const setCallbacks = (newCallbacks: typeof callbacks.value) => {
    callbacks.value = { ...callbacks.value, ...newCallbacks };
  };

  /**
   * Update the current location and calculate distances
   */
  const updateLocation = (newLocation: LocationCoordinates, accuracy?: number) => {
    const timestamp = Date.now();
    
    // Update current location
    state.value.currentLocation = newLocation;
    
    // Calculate distance from last spawn fetch location
    if (state.value.lastSpawnFetchLocation) {
      state.value.distanceFromLastFetch = calculateDistance(
        state.value.lastSpawnFetchLocation,
        newLocation
      );
    }

    // Create location update object
    const locationUpdate: LocationUpdate = {
      position: newLocation,
      timestamp,
      accuracy,
    };

    // Call location update callback
    callbacks.value.onLocationUpdate?.(locationUpdate);

    // Check if we need to refetch spawns
    if (shouldRefetchSpawns.value && state.value.lastSpawnFetchLocation) {
      console.log(`Location moved ${state.value.distanceFromLastFetch.toFixed(1)}m, triggering spawn refetch`);
      
      // Call refetch callback
      callbacks.value.onRefetchRequired?.(newLocation, state.value.distanceFromLastFetch);
    }
  };

  /**
   * Mark that spawns were fetched at the current location
   */
  const markSpawnsFetched = (location?: LocationCoordinates) => {
    const fetchLocation = location || state.value.currentLocation;
    
    if (fetchLocation) {
      state.value.lastSpawnFetchLocation = { ...fetchLocation };
      state.value.distanceFromLastFetch = 0;
      console.log(`Spawns fetched at: ${fetchLocation.lat.toFixed(6)}, ${fetchLocation.lng.toFixed(6)}`);
    }
  };

  /**
   * Start continuous location tracking
   */
  const startTracking = () => {
    if (process.server || !navigator?.geolocation) {
      const error = 'Geolocation not supported';
      state.value.trackingError = error;
      callbacks.value.onTrackingError?.(error);
      return false;
    }

    if (state.value.isTracking) {
      console.log('Location tracking already active');
      return true;
    }

    try {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          state.value.trackingError = null;
          
          const newLocation: LocationCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          updateLocation(newLocation, position.coords.accuracy);
        },
        (error) => {
          let errorMessage = 'Location tracking error';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout';
              break;
          }

          console.error('Location tracking error:', errorMessage, error);
          state.value.trackingError = errorMessage;
          callbacks.value.onTrackingError?.(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000, // Use cached position if less than 5 seconds old
        }
      );

      state.value.watchId = watchId;
      state.value.isTracking = true;
      state.value.trackingError = null;
      
      console.log('Location tracking started');
      return true;
    } catch (error) {
      const errorMessage = 'Failed to start location tracking';
      state.value.trackingError = errorMessage;
      callbacks.value.onTrackingError?.(errorMessage);
      return false;
    }
  };

  /**
   * Stop location tracking
   */
  const stopTracking = () => {
    if (state.value.watchId !== null && navigator?.geolocation) {
      navigator.geolocation.clearWatch(state.value.watchId);
      state.value.watchId = null;
    }

    state.value.isTracking = false;
    console.log('Location tracking stopped');
  };

  /**
   * Get a single location update (one-time)
   */
  const getCurrentLocation = (): Promise<LocationCoordinates> => {
    return new Promise((resolve, reject) => {
      if (process.server || !navigator?.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          updateLocation(location, position.coords.accuracy);
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Failed to get current location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout';
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  /**
   * Reset tracking state
   */
  const resetTracking = () => {
    stopTracking();
    state.value.currentLocation = null;
    state.value.lastSpawnFetchLocation = null;
    state.value.distanceFromLastFetch = 0;
    state.value.trackingError = null;
  };

  /**
   * Get distance to a specific location
   */
  const getDistanceTo = (targetLocation: LocationCoordinates): number | null => {
    if (!state.value.currentLocation) return null;
    return calculateDistance(state.value.currentLocation, targetLocation);
  };

  // Cleanup on unmount
  onBeforeUnmount(() => {
    stopTracking();
  });

  return {
    // State (read-only)
    currentLocation,
    lastSpawnFetchLocation,
    distanceFromLastFetch,
    isTracking,
    trackingError,
    shouldRefetchSpawns,
    
    // Constants
    REFETCH_DISTANCE_THRESHOLD,
    
    // Actions
    setCallbacks,
    startTracking,
    stopTracking,
    getCurrentLocation,
    updateLocation,
    markSpawnsFetched,
    resetTracking,
    getDistanceTo,
    
    // Utilities
    calculateDistance,
  };
};