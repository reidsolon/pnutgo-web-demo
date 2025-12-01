<template>
  <div class="w-full h-full relative">
    <div ref="mapContainer" class="w-full h-full absolute inset-0"></div>
    
    <!-- Loading Overlay -->
    <div
      v-if="mapLoading"
      class="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
    >
      <div class="glass-strong p-6 rounded-2xl text-center">
        <Icon name="heroicons:arrow-path" class="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
        <p class="text-sm font-medium">Loading map...</p>
      </div>
    </div>

    <!-- Spawns Loading Indicator -->
    <div
      v-if="!mapLoading && spawnsLoading"
      class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
    >
      <div class="glass-strong px-4 py-2 rounded-full flex items-center space-x-2">
        <Icon name="heroicons:arrow-path" class="w-4 h-4 text-blue-500 animate-spin" />
        <span class="text-sm font-medium">Loading companions...</span>
      </div>
    </div>

    <!-- Spawns Error -->
    <div
      v-if="!mapLoading && spawnsError"
      class="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
    >
      <div class="glass-strong px-4 py-2 rounded-full flex items-center space-x-2 bg-red-100/90 border border-red-300">
        <Icon name="heroicons:exclamation-triangle" class="w-4 h-4 text-red-600" />
        <span class="text-sm font-medium text-red-700">{{ spawnsError }}</span>
      </div>
    </div>

    <!-- Radius Toggle Controls -->
    <div class="absolute top-4 right-4 z-10 flex space-x-2">
      <button
        @click="toggleRadiusVisibility('capture')"
        :class="[
          'w-12 h-12 rounded-full glass transition-all duration-200 flex items-center justify-center shadow-lg border-2',
          visibleRadius.capture
            ? 'bg-green-500/20 border-green-500 text-green-700 shadow-green-500/20'
            : 'border-white/30 hover:bg-white/30 hover:border-white/50'
        ]"
        :title="`Capture Radius (${radiusInfo?.capture_radius_meters || 50}m)`"
      >
        <Icon name="heroicons:hand-raised" class="w-5 h-5" />
      </button>
      
      <button
        @click="toggleRadiusVisibility('discovery')"
        :class="[
          'w-12 h-12 rounded-full glass transition-all duration-200 flex items-center justify-center shadow-lg border-2',
          visibleRadius.discovery
            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-700 shadow-yellow-500/20'
            : 'border-white/30 hover:bg-white/30 hover:border-white/50'
        ]"
        :title="`Discovery Radius (${radiusInfo?.discovery_radius_meters || 2000}m)`"
      >
        <Icon name="heroicons:eye" class="w-5 h-5" />
      </button>
      
      <button
        @click="toggleRadiusVisibility('shadow')"
        :class="[
          'w-12 h-12 rounded-full glass transition-all duration-200 flex items-center justify-center shadow-lg border-2',
          visibleRadius.shadow
            ? 'bg-gray-500/20 border-gray-500 text-gray-700 shadow-gray-500/20'
            : 'border-white/30 hover:bg-white/30 hover:border-white/50'
        ]"
        :title="`Load Radius (${radiusInfo?.load_radius_meters || 5000}m)`"
      >
        <Icon name="heroicons:moon" class="w-5 h-5" />
      </button>

      <!-- Grid Toggle Button -->
      <button
        @click="toggleGrid"
        :class="[
          'w-12 h-12 rounded-full glass transition-all duration-200 flex items-center justify-center shadow-lg border-2',
          showGrid
            ? 'bg-blue-500/20 border-blue-500 text-blue-700 shadow-blue-500/20'
            : 'border-white/30 hover:bg-white/30 hover:border-white/50'
        ]"
        title="Toggle Grid"
      >
        <Icon name="heroicons:squares-2x2" class="w-5 h-5" />
      </button>
    </div>

    <!-- Grid Info Panel (bottom left when active) -->
    <div
      v-if="showGrid && currentGridInfo"
      class="absolute bottom-4 left-4 z-50 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 w-72 border-2 border-blue-500/20"
    >
      <h3 class="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Icon name="heroicons:squares-2x2" class="w-4 h-4 text-blue-500" />
        Grid Information
      </h3>
      <div class="space-y-1 text-xs text-gray-600">
        <div><strong>Grid X:</strong> {{ currentGridInfo.gridX }}</div>
        <div><strong>Grid Y:</strong> {{ currentGridInfo.gridY }}</div>
        <div><strong>Cell ID:</strong> {{ currentGridInfo.cellId }}</div>
        <div><strong>Cell Center:</strong> {{ currentGridInfo.center.lat.toFixed(6) }}, {{ currentGridInfo.center.lng.toFixed(6) }}</div>
        <div><strong>Cell Size:</strong> ~{{ Math.round(currentGridInfo.cellSize * 111000) }}m</div>
        <div><strong>Load Radius:</strong> {{ radiusInfo?.load_radius_meters || 0 }}m</div>
        <div><strong>Visible Cells:</strong> {{ gridLayers.length }}</div>
      </div>
      <div class="mt-3 flex items-center gap-2">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 border-2 border-blue-500 bg-blue-500/20"></div>
          <span class="text-xs text-gray-600">Your Cell</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 border-2 border-gray-400 bg-gray-400/20"></div>
          <span class="text-xs text-gray-600">Adjacent</span>
        </div>
      </div>
    </div>

    <!-- Bottom Right Controls -->
    <div class="absolute bottom-4 right-4 z-10 flex space-x-3">
      <!-- Manual Refresh Button -->
      <button
        @click="manualRefresh"
        :disabled="spawnsLoading"
        class="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white shadow-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center border-2 border-white/20"
        title="Refresh companions"
      >
        <Icon 
          name="heroicons:arrow-path" 
          :class="[
            'w-5 h-5',
            spawnsLoading ? 'animate-spin' : ''
          ]" 
        />
      </button>

      <!-- Locate Button -->
      <button
        @click="centerOnUser"
        class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center border-2 border-white/20"
        title="Center on my location"
      >
        <Icon name="heroicons:map-pin" class="w-6 h-6" />
      </button>
    </div>

    <!-- Companion Detail Modal -->
    <AnimalDetailModal
      v-if="selectedCompanion && selectedAnimal && spawnData"
      :animal="selectedAnimal"
      :show-map-actions="true"
      :spawn-data="spawnData"
      :capturing="capturing"
      :error="captureError"
      @close="closeCompanionModal"
      @capture="captureCompanion"
      @mark-spotted="markAsSpotted"
    />
  </div>
</template>

<script setup lang="ts">
import type { MapProps, SelectedCompanion } from '~/types';

const props = withDefaults(defineProps<MapProps>(), {
  userLocation: null,
  locationEnabled: false
});

const emit = defineEmits<{
  locationUpdate: [location: { lat: number; lng: number }];
  companionCaptured: [companion: any];
}>();

// Use nearby spawns composable
const { 
  spawns, 
  loading: spawnsLoading, 
  error: spawnsError, 
  radiusInfo, 
  fetchNearbySpawns,
  captureSpawn,
  initializeWebSocket,
  cleanupWebSocket
} = useNearbySpawns();

const captureError = ref<string | null>(null);

// Use grid coordinates composable
const { 
  getGridCoordinates, 
  getAdjacentGridCells, 
  gridToLocation,
  getGridCellId,
  GRID_CELL_SIZE
} = useGridCoordinates();

// Map state
const mapLoading = ref(true);
const map = ref<any>(null);
const userMarker = ref<any>(null);
const radiusCircles = ref<{ [key: string]: any }>({});
const companionMarkers = ref<any[]>([]);
const mapContainer = ref<HTMLElement | null>(null);

// Grid state
const showGrid = ref(false);
const gridLayers = ref<any[]>([]);
const currentGridInfo = ref<{
  gridX: number;
  gridY: number;
  cellId: string;
  center: { lat: number; lng: number };
  cellSize: number;
} | null>(null);

// Radius visibility
const visibleRadius = reactive({
  capture: true,
  discovery: false,
  shadow: false
});

// Selected companion state
const selectedCompanion = ref<SelectedCompanion | null>(null);
const capturing = ref(false);

// Computed to convert selected companion to Animal format
const selectedAnimal = computed(() => {
  if (!selectedCompanion.value) return null;
  
  const companion = selectedCompanion.value.cycle.companion;
  return {
    id: companion.id,
    name: companion.name,
    description: companion.description || '',
    personality: companion.personality || '',
    traits: companion.traits || '',
    rarity: companion.rarity as any,
    rarity_label: companion.rarity_label,
    view_image: companion.view_image,
    silhouette_image: companion.silhouette_image,
    is_captured: !selectedCompanion.value.spawn.show_silhouette,
    capture_count: 0,
    times_captured: 0
  };
});

// Computed to provide spawn data for map actions
const spawnData = computed(() => {
  if (!selectedCompanion.value) return null;
  
  const spawn = selectedCompanion.value.spawn;
  const cycle = selectedCompanion.value.cycle;
  
  return {
    spawn_id: spawn.id,
    cycle_id: cycle.id,
    distance: spawn.distance,
    expires_at: cycle.expires_at,
    remaining_captures: cycle.remaining_captures,
    capturable: spawn.capturable
  };
});

// Close companion modal
const closeCompanionModal = () => {
  selectedCompanion.value = null;
  captureError.value = null;
};

// Computed for getting mutable copy of spawns
const mutableSpawns = computed(() => spawns.value);

// Initialize map
const initMap = async () => {
  if (!mapContainer.value) {
    console.error('Map container not found');
    mapLoading.value = false;
    return;
  }

  try {
    // Dynamic import Leaflet
    const L = await import('leaflet');
    
    // Import Leaflet CSS
    await import('leaflet/dist/leaflet.css');

    console.log('Initializing Leaflet map...');

    map.value = L.default.map(mapContainer.value, {
      center: [14.5995, 120.9842], // Manila default
      zoom: 16,
      minZoom: 13,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false
    });

    console.log('Map instance created');

    // Add tile layer with better styling
    L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map.value);

    console.log('Tile layer added');

    // Custom zoom control
    L.default.control.zoom({
      position: 'bottomleft'
    }).addTo(map.value);

    mapLoading.value = false;
    console.log('✅ Map initialized successfully');
    
    // Small delay to ensure map is rendered
    await nextTick();
    map.value.invalidateSize();
    
    // If we have user location, update the marker
    if (props.userLocation) {
      await updateUserMarker();
    }
  } catch (error) {
    console.error('❌ Failed to initialize map:', error);
    mapLoading.value = false;
  }
};

// Update user marker
const updateUserMarker = async () => {
  if (!map.value || !props.userLocation) return;

  try {
    const L = await import('leaflet');

    if (userMarker.value) {
      map.value.removeLayer(userMarker.value);
    }

    const userIcon = L.default.divIcon({
      className: 'user-marker',
      html: `
        <div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center animate-pulse">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    userMarker.value = L.default.marker([props.userLocation.lat, props.userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000
    }).addTo(map.value);

    // Center map on user
    map.value.setView([props.userLocation.lat, props.userLocation.lng], 16);
    
    // Update radius circles
    await updateRadiusCircles();
    
    // Fetch nearby companions
    await fetchNearbyCompanions();
  } catch (error) {
    console.error('Failed to update user marker:', error);
  }
};

// Update radius circles
const updateRadiusCircles = async () => {
  if (!map.value || !props.userLocation || !radiusInfo.value) return;

  try {
    const L = await import('leaflet');

    // Remove existing circles
    Object.values(radiusCircles.value).forEach(circle => {
      if (circle && map.value) {
        map.value.removeLayer(circle);
      }
    });
    radiusCircles.value = {};

    // Get radius settings from API
    const RADIUS_SETTINGS = {
      capture: radiusInfo.value.capture_radius_meters,
      discovery: radiusInfo.value.discovery_radius_meters,
      shadow: radiusInfo.value.load_radius_meters
    };

    // Add visible radius circles
    Object.entries(visibleRadius).forEach(([type, visible]) => {
      if (!visible || !props.userLocation) return;

      const radius = RADIUS_SETTINGS[type as keyof typeof RADIUS_SETTINGS];
      const colors = {
        capture: '#10b981',
        discovery: '#f59e0b',
        shadow: '#6b7280'
      };

      const circle = L.default.circle([props.userLocation.lat, props.userLocation.lng], {
        radius,
        color: colors[type as keyof typeof colors],
        fillColor: colors[type as keyof typeof colors],
        fillOpacity: 0.15,
        weight: 2,
        dashArray: type === 'shadow' ? '10, 5' : undefined
      }).addTo(map.value);

      radiusCircles.value[type] = circle;
    });
  } catch (error) {
    console.error('Failed to update radius circles:', error);
  }
};

// Toggle radius visibility
const toggleRadiusVisibility = (type: keyof typeof visibleRadius) => {
  visibleRadius[type] = !visibleRadius[type];
  updateRadiusCircles();
};

// Toggle grid visibility
const toggleGrid = () => {
  showGrid.value = !showGrid.value;
  if (showGrid.value && props.userLocation) {
    drawGrid();
  } else {
    clearGrid();
  }
};

// Draw grid on map
const drawGrid = async () => {
  if (!map.value || !props.userLocation || !radiusInfo.value) return;

  try {
    const L = await import('leaflet');
    
    // Calculate current grid coordinates
    const gridCoords = getGridCoordinates(props.userLocation.lat, props.userLocation.lng);
    const cellId = getGridCellId(gridCoords.gridX, gridCoords.gridY);
    const cellCenter = gridToLocation(gridCoords.gridX, gridCoords.gridY);
    
    // Update grid info
    currentGridInfo.value = {
      gridX: gridCoords.gridX,
      gridY: gridCoords.gridY,
      cellId,
      center: cellCenter,
      cellSize: GRID_CELL_SIZE
    };
    
    // Clear existing grid
    clearGrid();
    
    // Calculate how many cells to show based on load radius
    const loadRadiusMeters = radiusInfo.value.load_radius_meters;
    const cellSizeMeters = GRID_CELL_SIZE * 111000; // Convert degrees to meters (approximate)
    const cellsToShow = Math.ceil(loadRadiusMeters / cellSizeMeters);
    
    // Generate cells within the load radius
    const cells: Array<{ gridX: number; gridY: number }> = [];
    for (let dx = -cellsToShow; dx <= cellsToShow; dx++) {
      for (let dy = -cellsToShow; dy <= cellsToShow; dy++) {
        const cellX = gridCoords.gridX + dx;
        const cellY = gridCoords.gridY + dy;
        
        // Calculate cell center
        const cellCenterCoords = gridToLocation(cellX, cellY);
        
        // Calculate distance from user location to cell center
        const distance = calculateDistance(
          props.userLocation.lat,
          props.userLocation.lng,
          cellCenterCoords.lat,
          cellCenterCoords.lng
        );
        
        // Only include cells within load radius
        if (distance <= loadRadiusMeters) {
          cells.push({ gridX: cellX, gridY: cellY });
        }
      }
    }
    
    console.log(`Drawing ${cells.length} grid cells within ${loadRadiusMeters}m radius`);
    
    cells.forEach(cell => {
      const isUserCell = cell.gridX === gridCoords.gridX && cell.gridY === gridCoords.gridY;
      
      // Calculate cell bounds
      const minLat = cell.gridY * GRID_CELL_SIZE;
      const maxLat = (cell.gridY + 1) * GRID_CELL_SIZE;
      const minLng = cell.gridX * GRID_CELL_SIZE;
      const maxLng = (cell.gridX + 1) * GRID_CELL_SIZE;
      
      const bounds = [
        [minLat, minLng],
        [maxLat, maxLng],
      ];
      
      // Create rectangle
      const rectangle = L.default.rectangle(bounds, {
        color: isUserCell ? '#3B82F6' : '#9CA3AF',
        weight: isUserCell ? 3 : 2,
        fillColor: isUserCell ? '#3B82F6' : '#9CA3AF',
        fillOpacity: isUserCell ? 0.15 : 0.05,
        dashArray: isUserCell ? undefined : '5, 5',
      }).addTo(map.value);
      
      // Add tooltip
      const cellCenterCoords = gridToLocation(cell.gridX, cell.gridY);
      const distanceFromUser = calculateDistance(
        props.userLocation.lat,
        props.userLocation.lng,
        cellCenterCoords.lat,
        cellCenterCoords.lng
      );
      
      rectangle.bindTooltip(
        `
          <div class="text-xs">
            <strong>${isUserCell ? 'Your Cell' : 'Adjacent Cell'}</strong><br>
            Grid: ${cell.gridX}, ${cell.gridY}<br>
            Center: ${cellCenterCoords.lat.toFixed(6)}, ${cellCenterCoords.lng.toFixed(6)}<br>
            Distance: ${Math.round(distanceFromUser)}m
          </div>
        `,
        { sticky: true }
      );
      
      gridLayers.value.push(rectangle);
    });
  } catch (error) {
    console.error('Failed to draw grid:', error);
  }
};

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Clear grid from map
const clearGrid = () => {
  if (!map.value) return;
  
  gridLayers.value.forEach(layer => {
    if (map.value) {
      map.value.removeLayer(layer);
    }
  });
  gridLayers.value = [];
  currentGridInfo.value = null;
};

// Center map on user
const centerOnUser = () => {
  if (props.userLocation && map.value) {
    map.value.setView([props.userLocation.lat, props.userLocation.lng], 16);
  } else {
    // Emit event to parent to get location
    emit('locationUpdate', { lat: 0, lng: 0 });
  }
};

// Manual refresh companions
const manualRefresh = async () => {
  if (!props.userLocation || spawnsLoading.value) return;
  
  console.log('Manual refresh triggered');
  await fetchNearbyCompanions();
};

// Fetch nearby companions from API
const fetchNearbyCompanions = async () => {
  if (!props.userLocation) return;

  try {
    await fetchNearbySpawns(props.userLocation.lat, props.userLocation.lng);
    
    if (spawnsError.value) {
      console.error('Error fetching spawns:', spawnsError.value);
      return;
    }

    await updateCompanionMarkers();
  } catch (error) {
    console.error('Failed to fetch companions:', error);
  }
};

// Update companion markers
const updateCompanionMarkers = async () => {
  if (!map.value) return;

  try {
    const L = await import('leaflet');

    // Remove existing markers
    companionMarkers.value.forEach(marker => {
      if (marker && map.value) {
        map.value.removeLayer(marker);
      }
    });
    companionMarkers.value = [];

    // Add new markers for each spawn and their active cycles
    mutableSpawns.value.forEach(spawn => {
      // Skip if no active cycles or spawn is not active
      if (!spawn.is_active || !spawn.active_cycles.length) return;

      spawn.active_cycles.forEach(cycle => {
        if (!cycle.is_active) return;

        const rarityColors: Record<string, string> = {
          ultra_rare: 'from-purple-500 to-pink-600',
          legendary: 'from-yellow-500 to-orange-600',
          epic: 'from-purple-500 to-pink-600',
          rare: 'from-blue-500 to-purple-600',
          uncommon: 'from-green-500 to-teal-600',
          common: 'from-gray-400 to-gray-600'
        };

        const isSilhouette = spawn.show_silhouette;
        const isCapturable = spawn.capturable;
        
        // Determine which image to use
        const imageUrl = isSilhouette 
          ? cycle.companion.silhouette_image?.thumb_url 
          : cycle.companion.view_image?.thumb_url;

        const markerHtml = `
          <div class="companion-marker-wrapper">
            <div class="spawn-id-label">${spawn.id}</div>
            <div class="companion-marker transform hover:scale-110 transition-all duration-200 cursor-pointer relative">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br ${rarityColors[cycle.companion.rarity] || rarityColors.common} p-1 shadow-xl">
                <div class="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  ${imageUrl 
                    ? `<img src="${imageUrl}" alt="${cycle.companion.name}" class="w-full h-full object-cover ${isSilhouette ? 'opacity-70' : ''}" />`
                    : `<div class="text-xl">${isSilhouette ? '❓' : '✨'}</div>`
                  }
                </div>
              </div>
              ${isCapturable ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>' : ''}
            </div>
          </div>
        `;

        const companionIcon = L.default.divIcon({
          className: 'companion-icon',
          html: markerHtml,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });

        const marker = L.default.marker([spawn.lat, spawn.lng], {
          icon: companionIcon,
          zIndexOffset: 500
        }).addTo(map.value);

        marker.on('click', () => {
          selectedCompanion.value = {
            spawn: JSON.parse(JSON.stringify(spawn)),
            cycle: JSON.parse(JSON.stringify(cycle))
          };
        });

        companionMarkers.value.push(marker);
      });
    });
  } catch (error) {
    console.error('Failed to update companion markers:', error);
  }
};

// Capture companion
const captureCompanion = async (spawnCycleId: number) => {
  if (!props.userLocation) {
    console.error('User location not available');
    return;
  }

  capturing.value = true;
  captureError.value = null;
  
  try {
    const { success, data, error } = await captureSpawn(
      spawnCycleId,
      props.userLocation.lat,
      props.userLocation.lng
    );

    if (success) {
      // Close modal
      selectedCompanion.value = null;
      
      // Markers will update automatically via reactivity
      await nextTick();
      await updateCompanionMarkers();
      
      // Emit capture event with companion data
      emit('companionCaptured', data?.companion || data);
    } else {
      // Set error to display in modal
      captureError.value = error || 'Capture failed';
    }
  } catch (error) {
    console.error('Failed to capture companion:', error);
    captureError.value = 'An unexpected error occurred. Please try again.';
  } finally {
    capturing.value = false;
  }
};

// Mark as spotted
const markAsSpotted = async (spawnId: number) => {
  capturing.value = true;
  
  try {
    // Mock mark as spotted - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    selectedCompanion.value = null;
    
    // You can emit a different event or show a success message
    console.log('Marked spawn as spotted:', spawnId);
  } catch (error) {
    console.error('Failed to mark as spotted:', error);
  } finally {
    capturing.value = false;
  }
};

// Watch for user location changes
watch(() => props.userLocation, async (newLocation) => {
  if (newLocation && map.value) {
    await updateUserMarker();
    
    // Redraw grid if it's visible
    if (showGrid.value) {
      await drawGrid();
    }
  }
}, { deep: true });

// Watch for spawns changes to update markers in real-time
watch(spawns, async () => {
  if (map.value && !spawnsLoading.value) {
    console.log('Spawns updated, refreshing markers...');
    await updateCompanionMarkers();
  }
}, { deep: true });

// Initialize on mount
onMounted(async () => {
  console.log('LeafletMap component mounted');
  await nextTick();
  setTimeout(async () => {
    await initMap();
  }, 200);
});

// Cleanup on unmount
onUnmounted(() => {
  cleanupWebSocket();
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});
</script>

<style scoped>
:deep(.user-marker) {
  background: none !important;
  border: none !important;
}

:deep(.companion-icon) {
  background: none !important;
  border: none !important;
}

.companion-marker-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.spawn-id-label {
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.leaflet-container) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
  font-family: inherit;
  height: 100% !important;
  width: 100% !important;
  z-index: 0;
}

:deep(.leaflet-pane) {
  z-index: 400;
}

:deep(.leaflet-tile-pane) {
  z-index: 200;
}

:deep(.leaflet-control-zoom a) {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #374151 !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background: rgba(255, 255, 255, 0.95) !important;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>