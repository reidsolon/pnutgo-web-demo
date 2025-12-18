/**
 * Composable for managing distant spawns (outside discovery radius)
 * These are spawns that are visible on the map but not near enough to interact with
 * Fetches spawns based on viewport bounds
 */

export interface DistantSpawn {
  id: number;
  lat: number;
  lng: number;
}

export interface ViewportBounds {
  ne_lat: number;
  ne_lng: number;
  sw_lat: number;
  sw_lng: number;
}

export interface DistantSpawnsResponse {
  data: DistantSpawn[];
  http_status: number;
  success: boolean;
}

interface CachedDistantSpawns {
  data: DistantSpawn[];
  bounds: ViewportBounds;
  timestamp: number;
  expiresAt: number;
}

export const useDistantSpawns = () => {
  const { apiClient } = useApiClient();

  // Cache configuration
  const CACHE_KEY = "pnutgo:viewport-spawns";
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for viewport-based data

  // State
  const distantSpawns = useState<DistantSpawn[]>("distant-spawns", () => []);
  const loading = useState<boolean>("distant-spawns-loading", () => false);
  const error = useState<string | null>("distant-spawns-error", () => null);

  /**
   * Check if two bounds are similar enough to use cached data
   */
  const boundsAreSimilar = (bounds1: ViewportBounds, bounds2: ViewportBounds): boolean => {
    const threshold = 0.01; // ~1km difference threshold
    return (
      Math.abs(bounds1.ne_lat - bounds2.ne_lat) < threshold &&
      Math.abs(bounds1.ne_lng - bounds2.ne_lng) < threshold &&
      Math.abs(bounds1.sw_lat - bounds2.sw_lat) < threshold &&
      Math.abs(bounds1.sw_lng - bounds2.sw_lng) < threshold
    );
  };

  /**
   * Get cached viewport spawns if valid
   */
  const getCachedSpawns = (bounds: ViewportBounds): DistantSpawn[] | null => {
    if (process.server) return null; // Don't use cache on server

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cachedData: CachedDistantSpawns = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now > cachedData.expiresAt) {
        console.log("⏰ Viewport spawns cache expired");
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      // Check if bounds are similar enough
      if (!boundsAreSimilar(bounds, cachedData.bounds)) {
        console.log("📍 Viewport bounds changed significantly, cache invalid");
        return null;
      }

      console.log(`✅ Using cached viewport spawns (${cachedData.data.length} spawns)`);
      return cachedData.data;
    } catch (err) {
      console.error("Error reading viewport spawns cache:", err);
      return null;
    }
  };

  /**
   * Save viewport spawns to cache
   */
  const setCachedSpawns = (
    data: DistantSpawn[],
    bounds: ViewportBounds
  ): void => {
    if (process.server) return; // Don't cache on server

    try {
      const cachedData: CachedDistantSpawns = {
        data,
        bounds,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
      console.log(`💾 Cached ${data.length} viewport spawns (expires in ${CACHE_DURATION / 1000}s)`);
    } catch (err) {
      console.error("Error saving viewport spawns cache:", err);
    }
  };

  /**
   * Clear the cache
   */
  const clearCache = (): void => {
    if (process.server) return;

    try {
      localStorage.removeItem(CACHE_KEY);
      console.log("🗑️ Distant spawns cache cleared");
    } catch (err) {
      console.error("Error clearing distant spawns cache:", err);
    }
  };

  /**
   * Fetch viewport spawns from the API (with caching)
   * @param bounds - The viewport bounds (northeast and southwest corners)
   * @param userLat - User's latitude
   * @param userLng - User's longitude
   * @param forceRefresh - Force a fresh fetch, bypassing cache
   */
  const fetchViewportSpawns = async (
    bounds: ViewportBounds,
    userLat: number,
    userLng: number,
    forceRefresh: boolean = false
  ): Promise<void> => {
    console.log(`🔍 Fetching viewport spawns for bounds:`, bounds);
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedSpawns(bounds);
      if (cachedData) {
        distantSpawns.value = cachedData;
        return;
      }
    }

    console.log(`🌐 Making API call to /viewport/spawns`);
    loading.value = true;
    error.value = null;

    try {
      const response = await apiClient<DistantSpawnsResponse>("/viewport/spawns", {
        method: "GET",
        params: {
          ne_lat: bounds.ne_lat,
          ne_lng: bounds.ne_lng,
          sw_lat: bounds.sw_lat,
          sw_lng: bounds.sw_lng,
          user_lat: userLat,
          user_lng: userLng,
        },
      });

      if (response.success && response.data) {
        distantSpawns.value = response.data;
        setCachedSpawns(response.data, bounds);
        console.log(`✅ Fetched ${response.data.length} viewport spawns from API`);
      } else {
        throw new Error("Failed to fetch viewport spawns");
      }
    } catch (err: any) {
      console.error("❌ Error fetching viewport spawns:", err);
      error.value = err.message || "Failed to fetch viewport spawns";
      distantSpawns.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Clear distant spawns and cache
   */
  const clearDistantSpawns = (): void => {
    distantSpawns.value = [];
    error.value = null;
    clearCache();
  };

  return {
    distantSpawns,
    loading,
    error,
    fetchViewportSpawns,
    clearDistantSpawns,
    clearCache,
  };
};
