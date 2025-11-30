import type { RarityKey, RarityLabel, MediaImage } from '~/types';

// Extended MediaImage with additional fields for API response
export interface MediaImageExtended extends MediaImage {
  collection_name: string;
  mime_type: string;
  size: number;
  created_at: string;
}

export interface Companion {
  id: number;
  name: string;
  description: string;
  personality: string;
  traits: string;
  rarity: RarityKey;
  rarity_label: RarityLabel;
  view_image: MediaImageExtended;
  silhouette_image: MediaImageExtended;
}

export interface ActiveCycle {
  id: number;
  companion: Companion;
  expires_at: string;
  capture_limit: number;
  current_captures: number;
  remaining_captures: number;
  is_active: boolean;
}

export interface NearbySpawn {
  id: number;
  lat: number;
  lng: number;
  places_address: string;
  distance: number;
  capturable: boolean;
  show_silhouette: boolean;
  spawned_at: string;
  expires_at: string | null;
  is_active: boolean;
  active_cycles: ActiveCycle[];
}

export interface RadiusInfo {
  capture_radius_meters: number;
  discovery_radius_meters: number;
  load_radius_meters: number;
}

export interface SearchLocation {
  lat: string;
  lng: string;
}

export interface NearbySpawnsResponse {
  data: NearbySpawn[];
  meta: {
    count: number;
    search_location: SearchLocation;
    radius_info: RadiusInfo;
  };
  http_status: number;
  success: boolean;
}

export const useNearbySpawns = () => {
  const { apiClient } = useApiClient();
  const { listenForSpawns, connected, currentRegion } = useWebSocket();

  // State
  const spawns = useState<NearbySpawn[]>('nearby-spawns', () => []);
  const loading = useState<boolean>('nearby-spawns-loading', () => false);
  const error = useState<string | null>('nearby-spawns-error', () => null);
  const radiusInfo = useState<RadiusInfo | null>('nearby-spawns-radius-info', () => null);
  const wsCleanup = ref<(() => void) | null>(null);
  const userLocation = ref<{ lat: number; lng: number } | null>(null);

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param lat1 - Latitude of first point
   * @param lng1 - Longitude of first point
   * @param lat2 - Latitude of second point
   * @param lng2 - Longitude of second point
   * @returns Distance in meters
   */
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  /**
   * Handle real-time spawn events
   * @param event - Spawn event from WebSocket
   */
  const handleSpawnEvent = (event: any): void => {
    console.log('Spawn event received:', event);

    // Handle spawn cycle updates from public channel
    if (event.type === 'spawn:created') {
      const payload = event.data;
      
      if (!payload.spawns || !Array.isArray(payload.spawns)) {
        console.warn('Received spawn cycle update without spawns array data:', payload);
        return;
      }

      console.log(payload)

      // Process each spawn in the array
      payload.spawns.forEach((spawnData: any) => {
        // Calculate distance if user location is available
        let distance = 0;
        if (userLocation.value) {
          console.log('Calculating distance:', {
            userLat: userLocation.value.lat,
            userLng: userLocation.value.lng,
            spawnLat: spawnData.lat,
            spawnLng: spawnData.lng,
            spawnLatType: typeof spawnData.lat,
            spawnLngType: typeof spawnData.lng,
          });
          
          distance = calculateDistance(
            userLocation.value.lat,
            userLocation.value.lng,
            parseFloat(spawnData.lat),
            parseFloat(spawnData.lng)
          );
          
          console.log('Calculated distance:', distance, 'meters');
        }

        // Check if spawn is within load radius
        if (radiusInfo.value && distance > radiusInfo.value.load_radius_meters) {
          console.log(`Spawn ${spawnData.id} is outside load radius (${distance.toFixed(2)}m > ${radiusInfo.value.load_radius_meters}m), skipping`);
          return;
        }

        const newSpawn: NearbySpawn = {
          id: spawnData.id,
          lat: spawnData.lat,
          lng: spawnData.lng,
          places_address: spawnData.places_address,
          distance: distance,
          capturable: radiusInfo.value ? distance <= radiusInfo.value.capture_radius_meters : false,
          show_silhouette: radiusInfo.value ? distance > radiusInfo.value.discovery_radius_meters : false,
          spawned_at: spawnData.spawned_at,
          expires_at: spawnData.expires_at,
          is_active: spawnData.is_active,
          active_cycles: spawnData.active_cycles || [],
        };

        // Check if spawn already exists
        const existingIndex = spawns.value.findIndex((s) => s.id === newSpawn.id);

        if (existingIndex !== -1) {
          // Update existing spawn
          spawns.value[existingIndex] = {
            ...spawns.value[existingIndex],
            ...newSpawn,
          };
          console.log('Updated existing spawn:', newSpawn.id);
        } else {
          // Add new spawn
          spawns.value.push(newSpawn);
          console.log('Added new spawn:', newSpawn.id);
        }
      });

      // Remove inactive spawns
      spawns.value = spawns.value.filter((spawn) => spawn.is_active);
    }
  };

  /**
   * Initialize WebSocket listener for spawn events
   */
  const initializeWebSocket = (): void => {
    if (!userLocation.value) {
      console.log('Cannot initialize WebSocket: No user location available');
      return;
    }

    if (wsCleanup.value) {
      console.log('WebSocket listener already initialized');
      return;
    }

    const cleanup = listenForSpawns(
      userLocation.value.lat,
      userLocation.value.lng,
      handleSpawnEvent
    );
    
    if (cleanup) {
      wsCleanup.value = cleanup;
      console.log('WebSocket listener initialized for spawn events');
    }
  };

  /**
   * Cleanup WebSocket listener
   */
  const cleanupWebSocket = (): void => {
    if (wsCleanup.value) {
      wsCleanup.value();
      wsCleanup.value = null;
      console.log('WebSocket listener cleaned up');
    }
  };

  /**
   * Fetch nearby spawns based on location
   * @param lat - Latitude coordinate
   * @param lng - Longitude coordinate
   */
  const fetchNearbySpawns = async (lat: number, lng: number): Promise<void> => {
    loading.value = true;
    error.value = null;

    // Store user location for WebSocket subscription
    userLocation.value = { lat, lng };

    try {
      const response = await apiClient<NearbySpawnsResponse>('/nearby/spawns', {
        method: 'GET',
        params: {
          lat,
          lng,
        },
      });

      if (response.success) {
        spawns.value = response.data;
        radiusInfo.value = response.meta.radius_info;
        
        // Initialize WebSocket listener after first fetch
        if (connected.value) {
          // Cleanup old connection if region changed
          if (wsCleanup.value) {
            cleanupWebSocket();
          }
          initializeWebSocket();
        }
      } else {
        throw new Error('Failed to fetch nearby spawns');
      }
    } catch (err: any) {
      console.error('Error fetching nearby spawns:', err);
      error.value = err.data?.message || err.message || 'Failed to fetch nearby spawns';
      spawns.value = [];
      radiusInfo.value = null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Clear spawns data
   */
  const clearSpawns = (): void => {
    spawns.value = [];
    radiusInfo.value = null;
    error.value = null;
    cleanupWebSocket();
  };

  /**
   * Get spawn by ID
   * @param spawnId - ID of the spawn
   */
  const getSpawnById = (spawnId: number): NearbySpawn | undefined => {
    return spawns.value.find((spawn) => spawn.id === spawnId);
  };

  /**
   * Capture a companion spawn
   * @param spawnCycleId - The active cycle ID to capture
   * @param lat - User's current latitude
   * @param lng - User's current longitude
   * @returns Object with success status, data, and error message
   */
  const captureSpawn = async (
    spawnCycleId: number,
    lat: number,
    lng: number
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response: any = await apiClient(`/spawn/${spawnCycleId}/capture`, {
        method: 'POST',
        body: { lat, lng },
      });

      // Remove the spawn from state after successful capture
      // Find the spawn that contains this cycle
      const spawnIndex = spawns.value.findIndex((spawn) =>
        spawn.active_cycles.some((cycle) => cycle.id === spawnCycleId)
      );

      if (spawnIndex !== -1) {
        // Remove the entire spawn since we're capturing the single cycle shown
        spawns.value.splice(spawnIndex, 1);
      }

      // API returns { message, data } structure
      return { success: true, data: response?.data || response };
    } catch (err: any) {
      const errorMessage =
        err.data?.errors?.spawn?.[0] ||
        err.data?.message ||
        'Failed to capture companion. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Get capturable spawns only
   */
  const capturableSpawns = computed<NearbySpawn[]>(() => {
    return spawns.value.filter((spawn) => spawn.capturable);
  });

  /**
   * Get spawns by distance
   */
  const spawnsByDistance = computed<NearbySpawn[]>(() => {
    return [...spawns.value].sort((a, b) => a.distance - b.distance);
  });

  /**
   * Get active companions count
   */
  const activeCompanionsCount = computed<number>(() => {
    return spawns.value.reduce((count, spawn) => {
      return count + spawn.active_cycles.length;
    }, 0);
  });

  // Watch for WebSocket connection and initialize listener
  watch(connected, (isConnected) => {
    if (isConnected && spawns.value.length > 0 && userLocation.value) {
      // Cleanup and reinitialize to ensure we're on the correct region
      if (wsCleanup.value) {
        cleanupWebSocket();
      }
      initializeWebSocket();
    } else if (!isConnected) {
      cleanupWebSocket();
    }
  });

  // Cleanup on unmount
  onBeforeUnmount(() => {
    cleanupWebSocket();
  });

  return {
    // State
    spawns: readonly(spawns),
    loading: readonly(loading),
    error: readonly(error),
    radiusInfo: readonly(radiusInfo),
    currentRegion: readonly(currentRegion),
    userLocation: readonly(userLocation),
    
    // Computed
    capturableSpawns,
    spawnsByDistance,
    activeCompanionsCount,
    
    // Actions
    fetchNearbySpawns,
    clearSpawns,
    getSpawnById,
    captureSpawn,
    initializeWebSocket,
    cleanupWebSocket,
  };
};
