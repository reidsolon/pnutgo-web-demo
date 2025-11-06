<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
    <div class="mx-auto max-w-4xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Grid Coordinates Test</h1>
        <p class="text-gray-600">Test the grid coordinate system for location-based features</p>
      </div>

      <!-- User Location Grid Coordinates -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Your Current Grid Location</h2>

        <button
          @click="getUserGrid"
          :disabled="loadingUserGrid"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-4"
        >
          {{ loadingUserGrid ? 'Loading...' : 'Get My Grid Coordinates' }}
        </button>

        <div v-if="userGridCoords" class="space-y-2">
          <div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <span class="text-sm font-medium text-gray-700">Grid X:</span>
            <span class="text-lg font-bold text-green-600">{{ userGridCoords.gridX }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span class="text-sm font-medium text-gray-700">Grid Y:</span>
            <span class="text-lg font-bold text-blue-600">{{ userGridCoords.gridY }}</span>
          </div>
          <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <span class="text-sm font-medium text-gray-700">Cell ID:</span>
            <code class="ml-2 text-sm font-mono text-purple-600">{{ gridCellId }}</code>
          </div>
          <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span class="text-sm font-medium text-gray-700">Cell Center:</span>
            <span class="ml-2 text-sm text-gray-600">
              {{ cellCenter.lat.toFixed(6) }}, {{ cellCenter.lng.toFixed(6) }}
            </span>
          </div>
        </div>

        <div v-if="userLocationError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ userLocationError }}</p>
        </div>
      </div>

      <!-- Manual Coordinate Input -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Calculate Grid from Coordinates</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
            <input
              v-model="manualLat"
              type="number"
              step="0.000001"
              placeholder="e.g., 14.5995"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
            <input
              v-model="manualLng"
              type="number"
              step="0.000001"
              placeholder="e.g., 120.9842"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          @click="calculateManualGrid"
          :disabled="!canCalculateManual"
          class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-4"
        >
          Calculate Grid Coordinates
        </button>

        <div v-if="manualGridCoords" class="space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div class="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <span class="block text-xs text-gray-600 mb-1">Grid X</span>
              <span class="text-2xl font-bold text-green-600">{{ manualGridCoords.gridX }}</span>
            </div>
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <span class="block text-xs text-gray-600 mb-1">Grid Y</span>
              <span class="text-2xl font-bold text-blue-600">{{ manualGridCoords.gridY }}</span>
            </div>
          </div>
          <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <span class="text-sm font-medium text-gray-700">Cell ID:</span>
            <code class="ml-2 text-sm font-mono text-purple-600">{{ manualCellId }}</code>
          </div>
        </div>
      </div>

      <!-- Mini Map -->
      <div v-if="userGridCoords && userLocation" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Grid Cell Visualization on Map</h2>
        <p class="text-sm text-gray-600 mb-4">
          Your current location on an interactive map with grid overlay. The blue box represents your grid cell.
        </p>

        <div class="w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-300" style="height: 500px;">
          <ClientOnly>
            <GridMapVisualization
              :lat="userLocation.lat"
              :lng="userLocation.lng"
              :grid-x="userGridCoords.gridX"
              :grid-y="userGridCoords.gridY"
              :cell-id="gridCellId"
              :grid-cell-size="GRID_CELL_SIZE"
            />
            <template #fallback>
              <div class="w-full h-full flex items-center justify-center bg-gray-100">
                <div class="text-center">
                  <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p class="text-sm text-gray-600">Loading map...</p>
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- Legend -->
        <div class="mt-4 flex items-center justify-center gap-6 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            <span class="text-gray-700">Your Location</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-blue-500/20 border-2 border-blue-500 rounded"></div>
            <span class="text-gray-700">Your Grid Cell</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-gray-400/20 border-2 border-gray-400 rounded"></div>
            <span class="text-gray-700">Adjacent Cells</span>
          </div>
        </div>

        <!-- Coordinates info -->
        <div class="mt-4 p-3 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-600 space-y-1">
            <div><strong>Your Exact Location:</strong> {{ userLocation.lat.toFixed(6) }}, {{ userLocation.lng.toFixed(6) }}</div>
            <div><strong>Grid Cell Center:</strong> {{ cellCenter.lat.toFixed(6) }}, {{ cellCenter.lng.toFixed(6) }}</div>
            <div><strong>Cell Size:</strong> ~{{ Math.round(GRID_CELL_SIZE * 111000) }}m × {{ Math.round(GRID_CELL_SIZE * 111000) }}m</div>
          </div>
        </div>
      </div>

      <!-- Adjacent Cells -->
      <div v-if="userGridCoords" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Adjacent Grid Cells</h2>
        <p class="text-sm text-gray-600 mb-4">
          These are the 9 cells (including center) around your current location
        </p>

        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="(cell, index) in adjacentCells"
            :key="index"
            :class="[
              'p-3 rounded-lg text-center border-2 transition-colors',
              isCenterCell(cell, userGridCoords)
                ? 'bg-blue-100 border-blue-500'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300',
            ]"
          >
            <div class="text-xs text-gray-500 mb-1">
              {{ isCenterCell(cell, userGridCoords) ? 'Your Cell' : 'Adjacent' }}
            </div>
            <div class="text-xs font-mono text-gray-700">
              {{ cell.gridX }},{{ cell.gridY }}
            </div>
          </div>
        </div>
      </div>

      <!-- Information -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">About Grid Coordinates</h2>
        <div class="space-y-3 text-sm text-gray-600">
          <p>
            <strong>Grid Cell Size:</strong> {{ GRID_CELL_SIZE }} degrees (~{{
              Math.round(GRID_CELL_SIZE * 111000)
            }}
            meters)
          </p>
          <p>
            <strong>Purpose:</strong> Grid coordinates convert lat/lng into integer cells for
            efficient location grouping, spawn management, and real-time updates.
          </p>
          <p>
            <strong>Use Cases:</strong> Grouping nearby players, managing spawn locations, WebSocket
            channels, caching strategies, and reducing database queries.
          </p>
          <p>
            <strong>Format:</strong> Grid coordinates are integers. Cell ID format is "X:Y" (e.g.,
            "120984:14599").
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  GRID_CELL_SIZE,
  getGridCoordinates,
  getUserGridCoordinates,
  gridToLocation,
  getAdjacentGridCells,
  getGridCellId,
} = useGridCoordinates();

// User location grid
const userGridCoords = ref<{ gridX: number; gridY: number } | null>(null);
const userLocation = ref<{ lat: number; lng: number } | null>(null);
const loadingUserGrid = ref(false);
const userLocationError = ref<string | null>(null);

// Manual input
const manualLat = ref<string>('14.5995');
const manualLng = ref<string>('120.9842');
const manualGridCoords = ref<{ gridX: number; gridY: number } | null>(null);

// Computed
const gridCellId = computed(() => {
  if (!userGridCoords.value) return '';
  return getGridCellId(userGridCoords.value.gridX, userGridCoords.value.gridY);
});

const cellCenter = computed(() => {
  if (!userGridCoords.value) return { lat: 0, lng: 0 };
  return gridToLocation(userGridCoords.value.gridX, userGridCoords.value.gridY);
});

const adjacentCells = computed(() => {
  if (!userGridCoords.value) return [];
  return getAdjacentGridCells(userGridCoords.value.gridX, userGridCoords.value.gridY);
});

const canCalculateManual = computed(() => {
  const lat = parseFloat(manualLat.value);
  const lng = parseFloat(manualLng.value);
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
});

const manualCellId = computed(() => {
  if (!manualGridCoords.value) return '';
  return getGridCellId(manualGridCoords.value.gridX, manualGridCoords.value.gridY);
});

// Grid cell bounds for visualization
const gridBounds = computed(() => {
  if (!userGridCoords.value) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }

  const minLat = userGridCoords.value.gridY * GRID_CELL_SIZE;
  const maxLat = (userGridCoords.value.gridY + 1) * GRID_CELL_SIZE;
  const minLng = userGridCoords.value.gridX * GRID_CELL_SIZE;
  const maxLng = (userGridCoords.value.gridX + 1) * GRID_CELL_SIZE;

  return { minLat, maxLat, minLng, maxLng };
});

// Calculate user position within the map (0-300 for SVG viewBox)
const userPositionInMap = computed(() => {
  if (!userLocation.value || !gridBounds.value) {
    return { x: 150, y: 150 }; // Center of map
  }

  const bounds = gridBounds.value;
  
  // Calculate position relative to grid cell (0-1 range)
  const relativeX = (userLocation.value.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng);
  const relativeY = (userLocation.value.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat);
  
  // Clamp values to prevent going outside cell
  const clampedX = Math.max(0, Math.min(1, relativeX));
  const clampedY = Math.max(0, Math.min(1, relativeY));
  
  // Convert to SVG coordinates (center cell is 100-200 in 300x300 viewBox)
  // Y is inverted for screen coordinates
  const x = 100 + clampedX * 100;
  const y = 200 - clampedY * 100;

  return { x, y };
});

// Grid cell visual boundaries - not needed anymore but keeping for compatibility
const gridCellVisual = computed(() => {
  return {
    x: 33.33,
    y: 33.33,
    width: 33.33,
    height: 33.33,
  };
});

// Methods
const getUserGrid = async () => {
  loadingUserGrid.value = true;
  userLocationError.value = null;

  return new Promise<void>((resolve) => {
    if (!navigator.geolocation) {
      userLocationError.value = 'Geolocation is not supported by this browser.';
      loadingUserGrid.value = false;
      resolve();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Store exact location
          userLocation.value = { lat: latitude, lng: longitude };
          
          // Calculate grid coordinates
          userGridCoords.value = getGridCoordinates(latitude, longitude);
          
          loadingUserGrid.value = false;
          resolve();
        } catch (error) {
          userLocationError.value = 'An error occurred while processing your location.';
          console.error('Error processing location:', error);
          loadingUserGrid.value = false;
          resolve();
        }
      },
      (error) => {
        userLocationError.value = `Unable to get your location: ${error.message}`;
        console.error('Geolocation error:', error);
        loadingUserGrid.value = false;
        resolve();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

const calculateManualGrid = () => {
  try {
    const lat = parseFloat(manualLat.value);
    const lng = parseFloat(manualLng.value);

    if (isNaN(lat) || isNaN(lng)) {
      return;
    }

    manualGridCoords.value = getGridCoordinates(lat, lng);
  } catch (error) {
    console.error('Error calculating grid:', error);
  }
};

const isCenterCell = (
  cell: { gridX: number; gridY: number },
  center: { gridX: number; gridY: number }
): boolean => {
  return cell.gridX === center.gridX && cell.gridY === center.gridY;
};

// SEO
useSeoMeta({
  title: 'Grid Coordinates Test - PnutGo',
  description: 'Test the grid coordinate system for location-based features',
});
</script>
