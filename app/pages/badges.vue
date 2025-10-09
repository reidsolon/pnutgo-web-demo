<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
    <!-- Header -->
    <header class="glass-strong p-6 border-b border-white/20">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold gradient-text">Badge Collection</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">Track your companion mastery</p>
        </div>
        
        <div class="text-right">
          <p class="text-sm text-gray-500">Total Badges</p>
          <p class="text-xl font-bold gradient-text">{{ earnedBadges.length }}/{{ allBadges.length }}</p>
        </div>
      </div>
    </header>

    <!-- Filter Tabs -->
    <div class="px-6 py-4">
      <div class="flex space-x-1 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-1">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          @click="activeFilter = tab.value"
          :class="[
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200',
            activeFilter === tab.value
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          ]"
        >
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="ml-1 text-xs opacity-75">
            ({{ tab.count }})
          </span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 px-6 pb-6 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-2 gap-4">
        <div v-for="i in 6" :key="i" class="loading-pulse h-40 rounded-2xl"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Badges</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
        <button @click="fetchBadges" class="btn-gradient">
          <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>

      <!-- Badges Grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <BadgeCard
          v-for="badge in filteredBadges"
          :key="badge.id"
          :badge="badge"
          @click="selectedBadge = badge"
        />
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && filteredBadges.length === 0" class="text-center py-12">
        <Icon name="heroicons:trophy" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Badges Found</h3>
        <p class="text-gray-600 dark:text-gray-400">
          {{ activeFilter === 'earned' ? 'Start capturing companions to earn badges!' : 'All badges are earned!' }}
        </p>
      </div>
    </div>

    <!-- Badge Detail Modal -->
    <div
      v-if="selectedBadge"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="selectedBadge = null"
    >
      <div
        class="glass-strong rounded-2xl p-6 max-w-sm w-full transform transition-all duration-300"
        @click.stop
      >
        <!-- Badge Icon -->
        <div class="text-center mb-6">
          <div
            :class="[
              'inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-all duration-200',
              selectedBadge.earned_at
                ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/30'
                : 'bg-gray-300 dark:bg-gray-600 grayscale'
            ]"
          >
            <Icon
              :name="getBadgeIcon(selectedBadge)"
              class="w-10 h-10 text-white"
            />
          </div>
          
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {{ selectedBadge.name }}
          </h3>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {{ selectedBadge.description }}
          </p>
        </div>

        <!-- Badge Progress -->
        <div v-if="selectedBadge.requirement" class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span class="text-sm text-gray-500">
              {{ getBadgeProgress(selectedBadge) }} / {{ selectedBadge.requirement.count }}
            </span>
          </div>
          
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div
              class="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
              :style="{ width: `${getBadgeProgressPercentage(selectedBadge)}%` }"
            ></div>
          </div>
          
          <p class="text-xs text-gray-500 text-center">
            {{ selectedBadge.earned_at ? 'Completed!' : `${selectedBadge.requirement.count - getBadgeProgress(selectedBadge)} more to go` }}
          </p>
        </div>

        <!-- Badge Level -->
        <div v-if="selectedBadge.level" class="mb-6 text-center">
          <div class="flex items-center justify-center space-x-1 mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Level</span>
            <div class="flex space-x-1">
              <div
                v-for="i in 5"
                :key="i"
                :class="[
                  'w-4 h-4 rounded-full border-2',
                  i <= selectedBadge.level
                    ? 'bg-yellow-400 border-yellow-400'
                    : 'border-gray-300 dark:border-gray-600'
                ]"
              ></div>
            </div>
          </div>
          <p class="text-xs text-gray-500">
            {{ selectedBadge.level === 5 ? 'Master Level!' : `Level ${selectedBadge.level} of 5` }}
          </p>
        </div>

        <!-- Companion Info -->
        <div v-if="selectedBadge.companion" class="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Icon name="heroicons:sparkles" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 class="font-semibold text-blue-700 dark:text-blue-300">
                {{ selectedBadge.companion.name }}
              </h4>
              <p class="text-xs text-blue-600 dark:text-blue-400 capitalize">
                {{ selectedBadge.companion.rarity }} Companion
              </p>
            </div>
          </div>
        </div>

        <!-- Earned Date -->
        <div v-if="selectedBadge.earned_at" class="mb-6 text-center">
          <p class="text-xs text-gray-500 mb-1">Earned on</p>
          <p class="font-medium text-gray-700 dark:text-gray-300">
            {{ formatDate(selectedBadge.earned_at) }}
          </p>
        </div>

        <!-- Close Button -->
        <button
          @click="selectedBadge = null"
          class="w-full btn-gradient"
        >
          Close
        </button>
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
        
        <NuxtLink to="/badges" class="nav-item active">
          <Icon name="heroicons:trophy" class="w-6 h-6 mb-1" />
          <span class="text-xs font-medium">Badges</span>
        </NuxtLink>
        
        <NuxtLink to="/collection" class="nav-item">
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

// Badge state
const loading = ref(false);
const error = ref<string | null>(null);
const badges = ref<any[]>([]);
const selectedBadge = ref<any | null>(null);
const activeFilter = ref<'all' | 'earned' | 'locked'>('all');

// Computed properties
const allBadges = computed(() => badges.value);
const earnedBadges = computed(() => badges.value.filter(b => b.earned_at));
const lockedBadges = computed(() => badges.value.filter(b => !b.earned_at));

const filteredBadges = computed(() => {
  switch (activeFilter.value) {
    case 'earned':
      return earnedBadges.value;
    case 'locked':
      return lockedBadges.value;
    default:
      return allBadges.value;
  }
});

const filterTabs = computed(() => [
  { label: 'All', value: 'all' as const, count: allBadges.value.length },
  { label: 'Earned', value: 'earned' as const, count: earnedBadges.value.length },
  { label: 'Locked', value: 'locked' as const, count: lockedBadges.value.length }
]);

// Helper functions
const getBadgeIcon = (badge: any) => {
  if (badge.companion) {
    // Return icon based on companion type
    return 'heroicons:sparkles';
  }
  return 'heroicons:trophy';
};

const getBadgeProgress = (badge: any) => {
  // This would normally come from the API
  // For demo purposes, return a random progress
  if (badge.earned_at) return badge.requirement?.count || 0;
  return Math.floor(Math.random() * (badge.requirement?.count || 10));
};

const getBadgeProgressPercentage = (badge: any) => {
  if (!badge.requirement) return 100;
  const progress = getBadgeProgress(badge);
  return Math.min((progress / badge.requirement.count) * 100, 100);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Fetch badges
const fetchBadges = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await apiClient('/me/badges');
    badges.value = response.data || [];
  } catch (err: any) {
    console.error('Failed to fetch badges:', err);
    error.value = err.message || 'Failed to load badges';
    
    // Demo data for development
    if (process.dev) {
      badges.value = [
        {
          id: 1,
          name: 'Fire Master',
          description: 'Capture 10 fire-type companions to master the flames.',
          level: 3,
          requirement: { type: 'capture', companion_type: 'fire', count: 10 },
          companion: { 
            id: 1, 
            name: 'Fire Drake', 
            rarity: 'rare' 
          },
          earned_at: '2025-01-15T10:30:00.000000Z',
          created_at: '2025-01-01T00:00:00.000000Z',
          updated_at: '2025-01-01T00:00:00.000000Z'
        },
        {
          id: 2,
          name: 'Water Guardian',
          description: 'Capture 15 water-type companions to become a water guardian.',
          level: 2,
          requirement: { type: 'capture', companion_type: 'water', count: 15 },
          companion: { 
            id: 2, 
            name: 'Water Sprite', 
            rarity: 'common' 
          },
          earned_at: null,
          created_at: '2025-01-01T00:00:00.000000Z',
          updated_at: '2025-01-01T00:00:00.000000Z'
        },
        {
          id: 3,
          name: 'First Steps',
          description: 'Capture your very first companion!',
          level: 1,
          requirement: { type: 'capture', count: 1 },
          companion: null,
          earned_at: '2025-01-10T08:15:00.000000Z',
          created_at: '2025-01-01T00:00:00.000000Z',
          updated_at: '2025-01-01T00:00:00.000000Z'
        },
        {
          id: 4,
          name: 'Explorer',
          description: 'Visit 25 different locations in your quest.',
          level: 4,
          requirement: { type: 'visit', count: 25 },
          companion: null,
          earned_at: null,
          created_at: '2025-01-01T00:00:00.000000Z',
          updated_at: '2025-01-01T00:00:00.000000Z'
        },
        {
          id: 5,
          name: 'Legendary Hunter',
          description: 'Capture a legendary companion - the ultimate achievement!',
          level: 5,
          requirement: { type: 'capture', companion_rarity: 'legendary', count: 1 },
          companion: { 
            id: 5, 
            name: 'Phoenix King', 
            rarity: 'legendary' 
          },
          earned_at: null,
          created_at: '2025-01-01T00:00:00.000000Z',
          updated_at: '2025-01-01T00:00:00.000000Z'
        },
        {
          id: 6,
          name: 'Speed Runner',
          description: 'Capture 5 companions in under 1 hour.',
          level: 2,
          requirement: { type: 'capture_time', count: 5, time_limit: 3600 },
          companion: null,
          earned_at: '2025-01-12T14:22:00.000000Z',
          created_at: '2025-01-01T00:00:00.000000Z',
          updated_at: '2025-01-01T00:00:00.000000Z'
        }
      ];
    }
  } finally {
    loading.value = false;
  }
};

// Initialize
onMounted(() => {
  fetchBadges();
});
</script>