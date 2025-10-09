<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
    <!-- Header -->
    <header class="glass-strong p-6 border-b border-white/20">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold gradient-text">My Collection</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">Your captured companions</p>
        </div>
        
        <div class="text-right">
          <p class="text-sm text-gray-500">Captured</p>
          <p class="text-xl font-bold gradient-text">{{ companions.length }}</p>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 p-6 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-2 gap-4">
        <div v-for="i in 6" :key="i" class="loading-pulse h-32 rounded-2xl"></div>
      </div>

      <!-- Collection Grid -->
      <div v-else-if="companions.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="companion in companions"
          :key="companion.id"
          class="card-interactive p-4 text-center"
        >
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
            <Icon name="heroicons:sparkles" class="w-8 h-8 text-white" />
          </div>
          
          <h3 class="font-bold text-sm mb-1">{{ companion.name }}</h3>
          <p class="text-xs text-gray-500 capitalize mb-2">{{ companion.rarity }}</p>
          
          <div class="text-xs text-gray-400">
            <p>Captured {{ companion.capture_count }} time{{ companion.capture_count > 1 ? 's' : '' }}</p>
            <p>{{ formatDate(companion.first_captured_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <Icon name="heroicons:squares-2x2" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Companions Yet</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Start exploring the map to capture your first companion!</p>
        <NuxtLink to="/map" class="btn-gradient inline-flex items-center">
          <Icon name="heroicons:map" class="w-4 h-4 mr-2" />
          Explore Map
        </NuxtLink>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="glass-strong border-t border-white/20 p-4">
      <div class="flex items-center justify-around">
        <NuxtLink to="/map" class="nav-item">
          <Icon name="heroicons:map" class="w-6 h-6 mb-1" />
          <span class="text-xs font-medium">Map</span>
        </NuxtLink>
        
        <NuxtLink to="/quests" class="nav-item">
          <Icon name="heroicons:clipboard-document-list" class="w-6 h-6 mb-1" />
          <span class="text-xs font-medium">Quests</span>
        </NuxtLink>
        
        <NuxtLink to="/badges" class="nav-item">
          <Icon name="heroicons:trophy" class="w-6 h-6 mb-1" />
          <span class="text-xs font-medium">Badges</span>
        </NuxtLink>
        
        <NuxtLink to="/collection" class="nav-item active">
          <Icon name="heroicons:squares-2x2" class="w-6 h-6 mb-1" />
          <span class="text-xs font-medium">Collection</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: true
});

const { apiClient } = useApiClient();

const loading = ref(false);
const companions = ref<any[]>([]);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',    
    day: 'numeric'
  });
};

const fetchCollection = async () => {
  loading.value = true;
  
  try {
    const response = await apiClient('/me/companions');
    companions.value = response.data || [];
  } catch (err) {
    console.error('Failed to fetch collection:', err);
    // Demo data for development
    companions.value = [
      {
        id: 1,
        name: 'Fire Drake',
        rarity: 'rare',
        capture_count: 3,
        first_captured_at: '2025-01-20T09:15:45.000000Z'
      },
      {
        id: 2,
        name: 'Water Sprite',
        rarity: 'common',
        capture_count: 1,
        first_captured_at: '2025-01-18T16:45:12.000000Z'
      }
    ];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCollection();
});
</script>