<template>
  <div class="w-full h-full relative min-h-[70vh]">
    <div ref="mapContainer" class="w-full h-full rounded-lg absolute inset-0"></div>
    
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
        :title="`Capture Radius (${radiusInfo?.capture_radius_meters || 30}m)`"
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
        :title="`Discovery Radius (${radiusInfo?.discovery_radius_meters || 500}m)`"
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
        :title="`Load Radius (${radiusInfo?.load_radius_meters || 700}m)`"
      >
        <Icon name="heroicons:moon" class="w-5 h-5" />
      </button>
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

    <!-- Companion Info Modal -->
    <Teleport to="body" v-if="selectedCompanion">
      <div class="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-end p-4">
        <div class="glass-strong rounded-2xl overflow-hidden w-full max-w-sm mx-auto transform transition-all duration-300 animate-slide-up">
          <!-- Companion Image Header -->
          <div class="relative w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500">
            <img 
              v-if="selectedCompanion.spawn.show_silhouette && selectedCompanion.cycle.companion.silhouette_image"
              :src="selectedCompanion.cycle.companion.silhouette_image.thumb_url"
              :alt="selectedCompanion.cycle.companion.name"
              class="w-full h-full object-contain opacity-70 p-4"
            />
            <img 
              v-else-if="!selectedCompanion.spawn.show_silhouette && selectedCompanion.cycle.companion.view_image"
              :src="selectedCompanion.cycle.companion.view_image.thumb_url"
              :alt="selectedCompanion.cycle.companion.name"
              class="w-full h-full object-contain p-4"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Icon name="heroicons:sparkles" class="w-20 h-20 text-white" />
            </div>
            
            <!-- Close Button -->
            <button
              @click="selectedCompanion = null"
              class="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5 text-white" />
            </button>
          </div>
          
          <!-- Companion Info Content -->
          <div class="p-6">
            <!-- Name and Rarity -->
            <div class="mb-4">
              <h3 class="font-bold text-xl gradient-text mb-1">
                {{ selectedCompanion.spawn.show_silhouette ? '???' : selectedCompanion.cycle.companion.name }}
              </h3>
              <p class="text-sm text-gray-500 capitalize">{{ selectedCompanion.cycle.companion.rarity_label }}</p>
            </div>
            
            <!-- Description (only if not silhouette) -->
            <p v-if="!selectedCompanion.spawn.show_silhouette" class="text-sm text-gray-600 mb-4">
              {{ selectedCompanion.cycle.companion.description }}
            </p>
            <p v-else class="text-sm text-gray-600 mb-4 italic">
              Get closer to reveal this companion's identity...
            </p>
            
            <div class="space-y-3 mb-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Distance:</span>
                <span class="font-medium">{{ Math.round(selectedCompanion.spawn.distance) }}m away</span>
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Remaining Captures:</span>
                <span class="font-medium">{{ selectedCompanion.cycle.remaining_captures }}/{{ selectedCompanion.cycle.capture_limit }}</span>
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Expires:</span>
                <span class="font-medium">{{ formatExpiry(selectedCompanion.cycle.expires_at) }}</span>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="text-sm">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    selectedCompanion.spawn.capturable
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  ]"
                >
                  {{ selectedCompanion.spawn.capturable ? 'Capturable' : 'Too Far' }}
                </span>
              </div>
              
              <button
                v-if="selectedCompanion.spawn.capturable"
                @click="captureCompanion(selectedCompanion.spawn.id)"
                :disabled="capturing"
                class="btn-gradient text-sm px-6 py-2 disabled:opacity-50 flex items-center space-x-2"
              >
                <Icon
                  v-if="capturing"
                  name="heroicons:arrow-path"
                  class="w-4 h-4 animate-spin"
                />
                <span>{{ capturing ? 'Capturing...' : 'Capture' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { NearbySpawn, ActiveCycle } from '~/composables/use-nearby-spawns';

interface MapProps {
  userLocation?: { lat: number; lng: number } | null;
  locationEnabled?: boolean;
}

const props = withDefaults(defineProps<MapProps>(), {
  userLocation: null,
  locationEnabled: false
});

const emit = defineEmits<{
  locationUpdate: [location: { lat: number; lng: number }];
  companionCaptured: [companionId: number];
}>();

// Use nearby spawns composable
const { 
  spawns, 
  loading: spawnsLoading, 
  error: spawnsError, 
  radiusInfo, 
  fetchNearbySpawns,
  initializeWebSocket,
  cleanupWebSocket
} = useNearbySpawns();

// Map state
const mapLoading = ref(true);
const map = ref<any>(null);
const userMarker = ref<any>(null);
const radiusCircles = ref<{ [key: string]: any }>({});
const companionMarkers = ref<any[]>([]);
const mapContainer = ref<HTMLElement | null>(null);

// Radius visibility
const visibleRadius = reactive({
  capture: true,
  discovery: false,
  shadow: false
});

// Selected companion state
interface SelectedCompanion {
  spawn: NearbySpawn;
  cycle: ActiveCycle;
}
const selectedCompanion = ref<SelectedCompanion | null>(null);
const capturing = ref(false);

// Computed for getting mutable copy of spawns
const mutableSpawns = computed(() => spawns.value);

// Helper to format expiry time
const formatExpiry = (expiresAt: string): string => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff < 0) return 'Expired';
  
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  
  return `${minutes}m`;
};

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

        const rarityColors = {
          common: 'from-gray-400 to-gray-600',
          rare: 'from-blue-500 to-purple-600',
          epic: 'from-purple-500 to-pink-600',
          legendary: 'from-yellow-500 to-orange-600'
        };

        const isSilhouette = spawn.show_silhouette;
        const isCapturable = spawn.capturable;
        
        // Determine which image to use
        const imageUrl = isSilhouette 
          ? cycle.companion.silhouette_image?.thumb_url 
          : cycle.companion.view_image?.thumb_url;

        const markerHtml = `
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
const captureCompanion = async (spawnId: number) => {
  capturing.value = true;
  
  try {
    // Mock capture - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Refresh spawns after capture
    if (props.userLocation) {
      await fetchNearbySpawns(props.userLocation.lat, props.userLocation.lng);
      await updateCompanionMarkers();
    }
    
    selectedCompanion.value = null;
    
    // Emit capture event
    emit('companionCaptured', spawnId);
  } catch (error) {
    console.error('Failed to capture companion:', error);
  } finally {
    capturing.value = false;
  }
};

// Watch for user location changes
watch(() => props.userLocation, async (newLocation) => {
  if (newLocation && map.value) {
    await updateUserMarker();
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