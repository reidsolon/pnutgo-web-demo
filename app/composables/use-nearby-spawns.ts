// Types for nearby spawns API
export interface MediaImage {
  id: number;
  name: string;
  file_name: string;
  collection_name: string;
  mime_type: string;
  size: number;
  created_at: string;
  url: string;
  thumb_url: string;
  responsive_url: string;
}

export interface Companion {
  id: number;
  name: string;
  description: string;
  personality: string;
  traits: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  rarity_label: string;
  view_image: MediaImage;
  silhouette_image: MediaImage;
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
  const { listenForSpawns, connected } = useWebSocket();

  // State
  const spawns = useState<NearbySpawn[]>('nearby-spawns', () => []);
  const loading = useState<boolean>('nearby-spawns-loading', () => false);
  const error = useState<string | null>('nearby-spawns-error', () => null);
  const radiusInfo = useState<RadiusInfo | null>('nearby-spawns-radius-info', () => null);
  const wsCleanup = ref<(() => void) | null>(null);

  /**
   * Handle real-time spawn events
   * @param event - Spawn event from WebSocket
   */
  const handleSpawnEvent = (event: any): void => {
    console.log('Spawn event received:', event);

    // Handle spawn cycle updates from public channel
    if (event.type === 'spawn:created') {
      const payload = event.data;
      
      if (!payload.spawn) {
        console.warn('Received spawn cycle update without spawn data:', payload);
        return;
      }

      const newSpawn: NearbySpawn = {
        id: payload.spawn.id,
        lat: payload.spawn.lat,
        lng: payload.spawn.lng,
        places_address: payload.spawn.places_address,
        distance: 0, // Will be calculated by backend in next fetch if needed
        capturable: false, // Default, will be updated based on distance
        show_silhouette: false, // Default
        spawned_at: payload.spawn.spawned_at,
        expires_at: payload.spawn.expires_at,
        is_active: payload.spawn.is_active,
        active_cycles: payload.spawn.active_cycles || [],
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

      // Remove inactive spawns
      spawns.value = spawns.value.filter((spawn) => spawn.is_active);
    }
  };

  /**
   * Initialize WebSocket listener for spawn events
   */
  const initializeWebSocket = (): void => {
    if (wsCleanup.value) {
      console.log('WebSocket listener already initialized');
      return;
    }

    const cleanup = listenForSpawns(handleSpawnEvent);
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
    if (isConnected && spawns.value.length > 0) {
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
    
    // Computed
    capturableSpawns,
    spawnsByDistance,
    activeCompanionsCount,
    
    // Actions
    fetchNearbySpawns,
    clearSpawns,
    getSpawnById,
    initializeWebSocket,
    cleanupWebSocket,
  };
};
