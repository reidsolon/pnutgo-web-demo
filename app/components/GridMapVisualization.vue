<template>
  <div class="w-full h-full relative">
    <div ref="mapContainer" class="w-full h-full rounded-lg"></div>
    
    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
    >
      <div class="bg-white p-6 rounded-2xl text-center shadow-lg">
        <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm font-medium">Loading map...</p>
      </div>
    </div>

    <!-- Grid Info Panel -->
    <div class="absolute z-99 top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <h3 class="text-sm font-bold text-gray-900 mb-2">Grid Information</h3>
      <div class="space-y-1 text-xs text-gray-600">
        <div><strong>Grid Cell:</strong> {{ gridX }}, {{ gridY }}</div>
        <div><strong>Cell ID:</strong> {{ cellId }}</div>
        <div><strong>Cell Size:</strong> ~{{ Math.round(gridCellSize * 111000) }}m</div>
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

    <!-- Toggle Grid Button -->
    <div class="absolute top-4 right-4 z-10">
      <button
        @click="toggleGrid"
        :class="[
          'px-4 py-2 rounded-lg shadow-lg font-medium text-sm transition-colors',
          showGrid 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-white text-gray-700 hover:bg-gray-100'
        ]"
      >
        {{ showGrid ? 'Hide Grid' : 'Show Grid' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  lat: number;
  lng: number;
  gridX: number;
  gridY: number;
  cellId: string;
  gridCellSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  gridCellSize: 0.001,
});

const { getAdjacentGridCells, gridToLocation } = useGridCoordinates();

// Import Leaflet only on client-side
let L: any = null;
if (process.client) {
  L = (await import('leaflet')).default;
  await import('leaflet/dist/leaflet.css');
}

const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = ref<any>(null);
const loading = ref(true);
const showGrid = ref(true);
const gridLayers = ref<any[]>([]);
const userMarker = ref<any>(null);

const initializeMap = () => {
  if (!mapContainer.value || !L) return;

  try {
    // Create map
    const map = L.map(mapContainer.value, {
      center: [props.lat, props.lng],
      zoom: 17,
      zoomControl: true,
    });

    mapInstance.value = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add user marker
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative">
          <div class="absolute -translate-x-1/2 -translate-y-1/2">
            <div class="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
            <div class="w-6 h-6 bg-red-500/50 rounded-full border-2 border-red-500 absolute top-0 left-0 animate-ping"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    userMarker.value = L.marker([props.lat, props.lng], { icon }).addTo(map);

    // Draw grid
    drawGrid(map);

    loading.value = false;
  } catch (error) {
    console.error('Error initializing map:', error);
    loading.value = false;
  }
};

const drawGrid = (map: any) => {
  if (!L) return;
  
  // Clear existing grid layers
  gridLayers.value.forEach(layer => map.removeLayer(layer));
  gridLayers.value = [];

  if (!showGrid.value) return;

  // Get adjacent cells
  const cells = getAdjacentGridCells(props.gridX, props.gridY);

  cells.forEach(cell => {
    const isUserCell = cell.gridX === props.gridX && cell.gridY === props.gridY;

    // Calculate cell bounds
    const minLat = cell.gridY * props.gridCellSize;
    const maxLat = (cell.gridY + 1) * props.gridCellSize;
    const minLng = cell.gridX * props.gridCellSize;
    const maxLng = (cell.gridX + 1) * props.gridCellSize;

    const bounds = [
      [minLat, minLng],
      [maxLat, maxLng],
    ];

    // Create rectangle with different styles for user cell vs adjacent cells
    const rectangle = L.rectangle(bounds, {
      color: isUserCell ? '#3B82F6' : '#9CA3AF',
      weight: isUserCell ? 3 : 2,
      fillColor: isUserCell ? '#3B82F6' : '#9CA3AF',
      fillOpacity: isUserCell ? 0.1 : 0.05,
      dashArray: isUserCell ? undefined : '5, 5',
    }).addTo(map);

    // Add tooltip with cell info
    const cellCenter = gridToLocation(cell.gridX, cell.gridY);
    rectangle.bindTooltip(
      `
        <div class="text-xs">
          <strong>${isUserCell ? 'Your Cell' : 'Adjacent Cell'}</strong><br>
          Grid: ${cell.gridX}, ${cell.gridY}<br>
          Center: ${cellCenter.lat.toFixed(6)}, ${cellCenter.lng.toFixed(6)}
        </div>
      `,
      { sticky: true }
    );

    gridLayers.value.push(rectangle);
  });
};

const toggleGrid = () => {
  showGrid.value = !showGrid.value;
  if (mapInstance.value) {
    drawGrid(mapInstance.value);
  }
};

// Watch for prop changes
watch(() => [props.lat, props.lng, props.gridX, props.gridY], () => {
  if (mapInstance.value) {
    // Update map center
    mapInstance.value.setView([props.lat, props.lng]);
    
    // Update user marker
    if (userMarker.value) {
      userMarker.value.setLatLng([props.lat, props.lng]);
    }
    
    // Redraw grid
    drawGrid(mapInstance.value);
  }
});

watch(showGrid, () => {
  if (mapInstance.value) {
    drawGrid(mapInstance.value);
  }
});

onMounted(() => {
  nextTick(() => {
    initializeMap();
  });
});

onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.remove();
  }
});
</script>

<style scoped>
:deep(.custom-marker) {
  background: transparent;
  border: none;
}

:deep(.leaflet-tooltip) {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
</style>
