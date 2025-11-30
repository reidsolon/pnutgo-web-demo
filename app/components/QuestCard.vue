<template>
  <div
    :class="[
      'quest-card relative p-6 rounded-2xl border-l-4 transition-all duration-200 hover:shadow-lg',
      {
        'quest-daily border-l-green-500': type === 'daily',
        'quest-weekly border-l-purple-500': type === 'weekly',
        'quest-special border-l-orange-500': type === 'event',
        'opacity-60': quest.completed
      }
    ]"
  >
    <!-- Quest Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center space-x-2 mb-2">
          <Icon
            :name="getQuestIcon(type)"
            :class="[
              'w-5 h-5',
              {
                'text-green-600': type === 'daily',
                'text-purple-600': type === 'weekly',
                'text-orange-600': type === 'event'
              }
            ]"
          />
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ quest.title }}
          </h3>
          <div
            v-if="quest.completed"
            class="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"
          >
            Completed
          </div>
        </div>
        
        <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {{ quest.description }}
        </p>
      </div>
      
      <!-- Quest Status -->
      <div class="ml-4 text-right">
        <div
          v-if="quest.expires_at"
          class="text-xs text-gray-500 mb-1"
        >
          Expires {{ formatExpiry(quest.expires_at) }}
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="quest.progress" class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Progress
        </span>
        <span class="text-sm text-gray-500">
          {{ quest.progress.current }} / {{ quest.progress.required }}
        </span>
      </div>
      
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          :class="[
            'h-2 rounded-full transition-all duration-500',
            {
              'bg-green-500': type === 'daily',
              'bg-purple-500': type === 'weekly',
              'bg-orange-500': type === 'event'
            }
          ]"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Rewards -->
    <div v-if="quest.reward" class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rewards</h4>
      <div class="flex flex-wrap gap-2">
        <div
          v-if="quest.reward.experience"
          class="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center space-x-1"
        >
          <Icon name="heroicons:star" class="w-3 h-3" />
          <span>{{ quest.reward.experience }} XP</span>
        </div>
        
        <div
          v-for="item in (quest.reward.items || [])"
          :key="item"
          class="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium flex items-center space-x-1"
        >
          <Icon name="heroicons:gift" class="w-3 h-3" />
          <span>{{ item }}</span>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <Icon name="heroicons:clock" class="w-4 h-4" />
        <span>{{ getQuestTypeLabel(type) }}</span>
      </div>
      
      <button
        v-if="canComplete"
        @click="$emit('complete', quest.id)"
        :disabled="completing"
        class="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-sm hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div class="flex items-center space-x-1">
          <Icon
            v-if="completing"
            name="heroicons:arrow-path"
            class="w-4 h-4 animate-spin"
          />
          <span>{{ completing ? 'Completing...' : 'Complete' }}</span>
        </div>
      </button>
      
      <div
        v-else-if="quest.completed"
        class="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium text-sm"
      >
        <Icon name="heroicons:check" class="w-4 h-4 inline mr-1" />
        Completed
      </div>
      
      <div
        v-else
        class="px-4 py-2 rounded-lg bg-gray-100 text-gray-500 font-medium text-sm"
      >
        In Progress
      </div>
    </div>

    <!-- Completion Effect -->
    <div
      v-if="quest.completed"
      class="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl pointer-events-none"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { Quest } from '~/types';

interface Props {
  quest: Quest;
  type: 'daily' | 'weekly' | 'event';
  completing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  completing: false
});

defineEmits<{
  complete: [questId: number];
}>();

// Computed properties
const progressPercentage = computed(() => {
  if (!props.quest.progress) return 0;
  return Math.min((props.quest.progress.current / props.quest.progress.required) * 100, 100);
});

const canComplete = computed(() => {
  if (props.quest.completed) return false;
  if (!props.quest.progress) return false;
  return props.quest.progress.current >= props.quest.progress.required;
});

// Helper functions
const getQuestIcon = (type: string) => {
  switch (type) {
    case 'daily':
      return 'heroicons:sun';
    case 'weekly':
      return 'heroicons:calendar-days';
    case 'event':
      return 'heroicons:sparkles';
    default:
      return 'heroicons:clipboard-document-list';
  }
};

const getQuestTypeLabel = (type: string) => {
  switch (type) {
    case 'daily':
      return 'Daily Quest';
    case 'weekly':
      return 'Weekly Quest';
    case 'event':
      return 'Special Event';
    default:
      return 'Quest';
  }
};

const formatExpiry = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h`;
  return 'Soon';
};
</script>