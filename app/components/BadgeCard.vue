<template>
  <div
    :class="[
      'badge-container cursor-pointer transform transition-all duration-200 hover:scale-105',
      badge.earned_at ? 'badge-earned' : 'badge-locked'
    ]"
    @click="$emit('click')"
  >
    <!-- Badge Icon -->
    <div class="text-center mb-4">
      <div
        :class="[
          'inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 transition-all duration-200',
          badge.earned_at
            ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/30'
            : 'bg-gray-300 dark:bg-gray-600'
        ]"
      >
        <Icon
          :name="getBadgeIcon(badge)"
          :class="[
            'w-8 h-8',
            badge.earned_at ? 'text-white' : 'text-gray-500'
          ]"
        />
      </div>
      
      <!-- Badge Level -->
      <div v-if="badge.level" class="flex items-center justify-center space-x-1">
        <div
          v-for="i in 5"
          :key="i"
          :class="[
            'w-2 h-2 rounded-full',
            i <= badge.level
              ? badge.earned_at
                ? 'bg-yellow-400'
                : 'bg-gray-400'
              : 'bg-gray-200 dark:bg-gray-700'
          ]"
        ></div>
      </div>
    </div>

    <!-- Badge Info -->
    <div class="text-center">
      <h3
        :class="[
          'font-bold text-sm mb-2 line-clamp-2',
          badge.earned_at
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-500 dark:text-gray-400'
        ]"
      >
        {{ badge.name }}
      </h3>
      
      <p
        :class="[
          'text-xs leading-relaxed line-clamp-3',
          badge.earned_at
            ? 'text-gray-600 dark:text-gray-300'
            : 'text-gray-400 dark:text-gray-500'
        ]"
      >
        {{ badge.description }}
      </p>
    </div>

    <!-- Progress Bar (for locked badges) -->
    <div v-if="!badge.earned_at && badge.requirement" class="mt-3">
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
        <div
          class="h-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <p class="text-xs text-gray-400 mt-1 text-center">
        {{ currentProgress }}/{{ badge.requirement.count }}
      </p>
    </div>

    <!-- Earned Date -->
    <div v-if="badge.earned_at" class="mt-3 text-center">
      <p class="text-xs text-green-600 dark:text-green-400 font-medium">
        Earned {{ formatEarnedDate(badge.earned_at) }}
      </p>
    </div>

    <!-- Companion Badge Indicator -->
    <div v-if="badge.companion" class="absolute top-2 right-2">
      <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
        <Icon name="heroicons:sparkles" class="w-3 h-3 text-white" />
      </div>
    </div>

    <!-- Earned Overlay Effect -->
    <div
      v-if="badge.earned_at"
      class="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent rounded-2xl pointer-events-none"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Badge {
  id: number;
  name: string;
  description: string;
  level?: number;
  requirement?: {
    type: string;
    count: number;
    companion_type?: string;
    companion_rarity?: string;
    time_limit?: number;
  };
  companion?: {
    id: number;
    name: string;
    rarity: string;
  } | null;
  earned_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  badge: Badge;
}

const props = defineProps<Props>();

defineEmits<{
  click: [];
}>();

// Demo progress calculation (would come from API in real app)
const currentProgress = computed(() => {
  if (props.badge.earned_at || !props.badge.requirement) return props.badge.requirement?.count || 0;
  
  // Generate consistent "progress" based on badge ID for demo
  const seed = props.badge.id;
  const maxProgress = props.badge.requirement.count;
  return Math.floor((seed * 7) % maxProgress);
});

const progressPercentage = computed(() => {
  if (!props.badge.requirement) return 0;
  return Math.min((currentProgress.value / props.badge.requirement.count) * 100, 100);
});

// Helper functions
const getBadgeIcon = (badge: Badge) => {
  if (badge.companion) {
    // Return icon based on companion type/rarity
    switch (badge.companion.rarity) {
      case 'legendary':
        return 'heroicons:star';
      case 'epic':
        return 'heroicons:bolt';
      case 'rare':
        return 'heroicons:gem';
      default:
        return 'heroicons:sparkles';
    }
  }
  
  // Return icon based on badge type
  if (badge.requirement) {
    switch (badge.requirement.type) {
      case 'capture':
        return 'heroicons:hand-raised';
      case 'visit':
        return 'heroicons:map-pin';
      case 'capture_time':
        return 'heroicons:clock';
      default:
        return 'heroicons:trophy';
    }
  }
  
  return 'heroicons:trophy';
};

const formatEarnedDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>