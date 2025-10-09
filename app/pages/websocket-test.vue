<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold gradient-text mb-2">WebSocket Test Dashboard</h1>
        <p class="text-gray-600">Monitor real-time spawn cycle updates from the spawn-cycles channel</p>
      </div>

      <!-- Connection Status -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="glass-strong p-6 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-600">WebSocket Status</h3>
            <div
              :class="[
                'w-3 h-3 rounded-full',
                wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              ]"
            ></div>
          </div>
          <p class="text-2xl font-bold">
            {{ wsConnected ? 'Connected' : 'Disconnected' }}
          </p>
          <p class="text-xs text-gray-500 mt-2">
            Active channels: {{ activeChannels.length }}
          </p>
          <div v-if="activeChannels.length > 0" class="mt-2 space-y-1">
            <div
              v-for="channel in activeChannels"
              :key="channel"
              class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
            >
              {{ channel }}
            </div>
          </div>
        </div>

        <div class="glass-strong p-6 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-600">Total Spawns</h3>
            <Icon name="heroicons:map-pin" class="w-5 h-5 text-blue-500" />
          </div>
          <p class="text-2xl font-bold">{{ spawns.length }}</p>
        </div>

        <div class="glass-strong p-6 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-600">Updates Received</h3>
            <Icon name="heroicons:arrow-path" class="w-5 h-5 text-purple-500" />
          </div>
          <p class="text-2xl font-bold">{{ updateCount }}</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="glass-strong p-6 rounded-xl mb-8">
        <h3 class="text-lg font-semibold mb-4">Controls</h3>
        <div class="flex flex-wrap gap-3">
          <button
            @click="fetchSpawns"
            :disabled="loading"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <Icon
              :name="loading ? 'heroicons:arrow-path' : 'heroicons:arrow-down-tray'"
              :class="['w-4 h-4', loading ? 'animate-spin' : '']"
            />
            <span>{{ loading ? 'Fetching...' : 'Fetch Spawns' }}</span>
          </button>

          <button
            @click="initializeWebSocket"
            :disabled="!wsConnected"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <Icon name="heroicons:signal" class="w-4 h-4" />
            <span>Initialize Listener</span>
          </button>

          <button
            @click="cleanupWebSocket"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Icon name="heroicons:x-circle" class="w-4 h-4" />
            <span>Cleanup Listener</span>
          </button>

          <button
            @click="clearLogs"
            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Icon name="heroicons:trash" class="w-4 h-4" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      <!-- Event Logs -->
      <div class="glass-strong p-6 rounded-xl mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Event Logs</h3>
          <span class="text-sm text-gray-600">{{ eventLogs.length }} events</span>
        </div>
        <div class="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          <div v-if="eventLogs.length === 0" class="text-gray-500 text-center py-8">
            No events received yet. Waiting for spawn-cycles updates...
          </div>
          <div
            v-for="(log, index) in eventLogs"
            :key="index"
            class="mb-2 pb-2 border-b border-gray-800 last:border-0"
          >
            <div class="flex items-start justify-between mb-1">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  log.type === 'info' ? 'bg-blue-500/20 text-blue-300' : 
                  log.type === 'success' ? 'bg-green-500/20 text-green-300' :
                  log.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                ]"
              >
                {{ log.type.toUpperCase() }}
              </span>
              <span class="text-gray-500 text-xs">{{ log.timestamp }}</span>
            </div>
            <div class="text-gray-300">{{ log.message }}</div>
            <pre v-if="log.data" class="text-xs text-gray-400 mt-1 overflow-x-auto">{{ JSON.stringify(log.data, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Spawns List -->
      <div class="glass-strong p-6 rounded-xl">
        <h3 class="text-lg font-semibold mb-4">Active Spawns</h3>
        <div v-if="spawns.length === 0" class="text-center py-12 text-gray-500">
          <Icon name="heroicons:map-pin" class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p class="text-lg font-medium">No spawns available</p>
          <p class="text-sm">Click "Fetch Spawns" to load nearby spawns</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="spawn in spawns"
            :key="spawn.id"
            class="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:shadow-lg transition-all"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h4 class="font-semibold text-lg">Spawn #{{ spawn.id }}</h4>
                <p class="text-xs text-gray-600">{{ spawn.places_address }}</p>
              </div>
              <div
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  spawn.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                ]"
              >
                {{ spawn.is_active ? 'Active' : 'Inactive' }}
              </div>
            </div>

            <div class="space-y-2 text-sm mb-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Latitude:</span>
                <span class="font-medium">{{ spawn.lat }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Longitude:</span>
                <span class="font-medium">{{ spawn.lng }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Capturable:</span>
                <span :class="spawn.capturable ? 'text-green-600' : 'text-yellow-600'">
                  {{ spawn.capturable ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>

            <div class="border-t border-gray-200 pt-3 mt-3">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-gray-600">Active Companions:</span>
                <span class="text-xs font-bold">{{ spawn.active_cycles.length }}</span>
              </div>
              <div v-if="spawn.active_cycles.length > 0" class="space-y-2">
                <div
                  v-for="cycle in spawn.active_cycles"
                  :key="cycle.id"
                  class="bg-gradient-to-r from-blue-50 to-purple-50 rounded p-2"
                >
                  <p class="text-xs font-medium">{{ cycle.companion.name }}</p>
                  <p class="text-xs text-gray-600 capitalize">{{ cycle.companion.rarity_label }}</p>
                  <div class="flex justify-between mt-1 text-xs">
                    <span class="text-gray-600">Captures:</span>
                    <span class="font-medium">{{ cycle.remaining_captures }}/{{ cycle.capture_limit }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              <div class="flex justify-between">
                <span>Spawned:</span>
                <span>{{ formatDate(spawn.spawned_at) }}</span>
              </div>
              <div v-if="spawn.expires_at" class="flex justify-between">
                <span>Expires:</span>
                <span>{{ formatDate(spawn.expires_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: true
});

const { user, logout } = useAuthentication();

// Use composables
const { connected: wsConnected, getActiveChannels } = useWebSocket();
const {
  spawns,
  loading,
  error,
  fetchNearbySpawns,
  initializeWebSocket,
  cleanupWebSocket
} = useNearbySpawns();

// Local state
const updateCount = ref(0);
const activeChannels = ref<string[]>([]);
const eventLogs = ref<Array<{
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  data?: any;
  timestamp: string;
}>>([]);

// Add log entry
const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string, data?: any) => {
  eventLogs.value.unshift({
    type,
    message,
    data,
    timestamp: new Date().toLocaleTimeString()
  });
  
  // Keep only last 50 logs
  if (eventLogs.value.length > 50) {
    eventLogs.value = eventLogs.value.slice(0, 50);
  }
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

// Fetch spawns
const fetchSpawns = async () => {
  addLog('info', 'Fetching spawns...');
  
  // Use Manila coordinates as default
  const lat = 14.5995;
  const lng = 120.9842;
  
  await fetchNearbySpawns(lat, lng);
  
  if (error.value) {
    addLog('error', 'Failed to fetch spawns', { error: error.value });
  } else {
    addLog('success', `Successfully fetched ${spawns.value.length} spawns`);
  }
};

// Clear logs
const clearLogs = () => {
  eventLogs.value = [];
  updateCount.value = 0;
  addLog('info', 'Logs cleared');
};

// Watch for spawn changes
watch(spawns, (newSpawns, oldSpawns) => {
  if (oldSpawns.length > 0) {
    updateCount.value++;
    addLog('success', 'Spawns updated via WebSocket', {
      previousCount: oldSpawns.length,
      newCount: newSpawns.length
    });
  }
}, { deep: true });

// Watch for WebSocket connection status
watch(wsConnected, (connected) => {
  if (connected) {
    addLog('success', 'WebSocket connected to spawn-cycles channel');
    // Update active channels
    setTimeout(() => {
      activeChannels.value = getActiveChannels();
      addLog('info', `Active channels: ${activeChannels.value.join(', ') || 'none'}`);
    }, 1000);
  } else {
    addLog('warning', 'WebSocket disconnected');
    activeChannels.value = [];
  }
});

// Periodically check active channels
onMounted(() => {
  addLog('info', 'WebSocket Test Dashboard initialized');
  addLog('info', 'Waiting for spawn-cycles channel updates...');
  
  const interval = setInterval(() => {
    if (wsConnected.value) {
      activeChannels.value = getActiveChannels();
    }
  }, 5000);
  
  onUnmounted(() => clearInterval(interval));
});
</script>
