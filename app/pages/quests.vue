<template>
  <NuxtLayout>
    <template #header>
      <AppHeader title="Quest Board" />
    </template>

    <!-- Content -->
    <div class="w-full h-full overflow-y-auto p-6">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="loading-pulse h-32 rounded-2xl"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Quests</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
        <button @click="fetchQuests" class="btn-gradient">
          <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>

      <!-- Quests Content -->
      <div v-else class="space-y-6">
        <!-- Daily Quests -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Icon name="heroicons:sun" class="w-6 h-6 text-yellow-500 mr-2" />
              Daily Quests
            </h2>
            <div class="text-sm text-gray-500">
              Resets in {{ timeUntilReset }}
            </div>
          </div>
          
          <div class="grid grid-cols-1 gap-4">
            <QuestCard
              v-for="quest in dailyQuests"
              :key="quest.id"
              :quest="quest"
              type="daily"
              @complete="completeQuest"
            />
          </div>
        </section>

        <!-- Weekly Quests -->
        <section v-if="weeklyQuests.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Icon name="heroicons:calendar-days" class="w-6 h-6 text-purple-500 mr-2" />
              Weekly Quests
            </h2>
          </div>
          
          <div class="grid grid-cols-1 gap-4">
            <QuestCard
              v-for="quest in weeklyQuests"
              :key="quest.id"
              :quest="quest"
              type="weekly"
              @complete="completeQuest"
            />
          </div>
        </section>

        <!-- Special Events -->
        <section v-if="eventQuests.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Icon name="heroicons:sparkles" class="w-6 h-6 text-orange-500 mr-2" />
              Special Events
            </h2>
          </div>
          
          <div class="grid grid-cols-1 gap-4">
            <QuestCard
              v-for="quest in eventQuests"
              :key="quest.id"
              :quest="quest"
              type="event"
              @complete="completeQuest"
            />
          </div>
        </section>

        <!-- Empty State -->
        <div v-if="allQuests.length === 0" class="text-center py-12">
          <Icon name="heroicons:clipboard-document-list" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Quests Available</h3>
          <p class="text-gray-600 dark:text-gray-400">Check back later for new adventures!</p>
        </div>
      </div>
    </div>

  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  auth: true
});

// Import SEO composable
const { setSEO, createWebPageStructuredData, createBreadcrumbStructuredData } = useSEO()

// Set SEO meta tags for the quests page
setSEO({
  title: 'Quest Board - Daily Challenges & Rewards | PnutGo',
  description: 'Complete daily, weekly, and special event quests in PnutGo. Earn experience points, unlock rewards, and progress through challenging companion hunting missions. Active quest tracking and completion.',
  keywords: [
    'PnutGo quest board',
    'daily quests PnutGo',
    'companion hunting quests',
    'quest completion rewards',
    'daily challenges',
    'weekly quest missions',
    'special event quests',
    'quest tracking system',
    'experience point quests',
    'reward earning quests',
    'mission completion',
    'challenge progression',
    'quest achievement system',
    'gaming daily tasks'
  ],
  ogType: 'website',
  twitterCard: 'summary_large_image',
  robots: 'noindex, follow', // Private game content
  structuredData: [
    createWebPageStructuredData({
      '@type': 'WebPage',
      name: 'PnutGo Quest Board',
      description: 'Daily challenges and quest missions for PnutGo companion hunting game',
      mainEntity: {
        '@type': 'ItemList',
        name: 'Active Quests',
        description: 'Available daily, weekly, and special event quests',
        numberOfItems: '{{ allQuests.length }}',
        itemListElement: [
          {
            '@type': 'Quest',
            name: 'Daily Explorer Challenge',
            description: 'Complete daily exploration tasks to earn experience and rewards',
            difficulty: 'Beginner',
            reward: {
              '@type': 'Thing',
              name: 'Experience Points',
              value: '100-500 XP'
            }
          },
          {
            '@type': 'Quest',
            name: 'Weekly Collector Mission',
            description: 'Capture specific types of companions throughout the week',
            difficulty: 'Intermediate',
            reward: {
              '@type': 'Thing',
              name: 'Special Items',
              value: 'Rare companion lures and badges'
            }
          },
          {
            '@type': 'Quest',
            name: 'Special Event Quests',
            description: 'Limited-time challenges with exclusive rewards',
            difficulty: 'Advanced',
            reward: {
              '@type': 'Thing',
              name: 'Exclusive Companions',
              value: 'Event-specific legendary companions'
            }
          }
        ]
      },
      potentialAction: [
        {
          '@type': 'CompleteAction',
          target: {
            '@type': 'Quest',
            name: 'Daily Challenges'
          },
          result: {
            '@type': 'Thing',
            name: 'Quest Rewards'
          }
        },
        {
          '@type': 'TrackAction',
          target: {
            '@type': 'Thing',
            name: 'Quest Progress'
          }
        }
      ]
    }),
    createBreadcrumbStructuredData([
      { name: 'PnutGo', url: 'https://pnutgo.com' },
      { name: 'Game Dashboard', url: 'https://pnutgo.com/dashboard' },
      { name: 'Quest Board', url: 'https://pnutgo.com/quests' }
    ])
  ]
})

const { apiClient } = useApiClient();

// Quest state
const loading = ref(false);
const error = ref<string | null>(null);
const quests = ref<any[]>([]);
const completingQuest = ref<number | null>(null);

// Computed properties
const allQuests = computed(() => quests.value);
const dailyQuests = computed(() => quests.value.filter(q => q.type === 'daily'));
const weeklyQuests = computed(() => quests.value.filter(q => q.type === 'weekly'));
const eventQuests = computed(() => quests.value.filter(q => q.type === 'event'));

const totalQuestPoints = computed(() => {
  return quests.value.reduce((total, quest) => {
    return total + (quest.completed ? quest.reward?.experience || 0 : 0);
  }, 0);
});

// Time until daily reset (demo calculation)
const timeUntilReset = computed(() => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
});

// Fetch quests
const fetchQuests = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await apiClient('/quests');
    quests.value = response.data || [];
  } catch (err: any) {
    console.error('Failed to fetch quests:', err);
    error.value = err.message || 'Failed to load quests';
    
    // Demo data for development
    if (process.dev) {
      quests.value = [
        {
          id: 1,
          title: 'First Steps',
          description: 'Capture your first companion to begin your journey.',
          type: 'daily',
          status: 'active',
          progress: { current: 0, required: 1 },
          reward: { experience: 100, items: ['Starter Badge'] },
          expires_at: null,
          completed: false,
          requirement: { action: 'capture', count: 1 }
        },
        {
          id: 2,
          title: 'Explorer',
          description: 'Visit 5 different locations to discover new companions.',
          type: 'daily',
          status: 'active',
          progress: { current: 2, required: 5 },
          reward: { experience: 250, items: ['Explorer Badge'] },
          expires_at: null,
          completed: false,
          requirement: { action: 'visit_location', count: 5 }
        },
        {
          id: 3,
          title: 'Collector',
          description: 'Capture 10 companions of any type.',
          type: 'weekly',
          status: 'active',
          progress: { current: 3, required: 10 },
          reward: { experience: 500, items: ['Collector Badge', 'Rare Lure'] },
          expires_at: '2025-01-27T23:59:59Z',
          completed: false,
          requirement: { action: 'capture', count: 10 }
        },
        {
          id: 4,
          title: 'Holiday Spirit',
          description: 'Capture special holiday companions during the winter event.',
          type: 'event',
          status: 'active',
          progress: { current: 1, required: 3 },
          reward: { experience: 750, items: ['Holiday Badge', 'Special Companion'] },
          expires_at: '2025-01-31T23:59:59Z',
          completed: false,
          requirement: { action: 'capture', companion_type: 'holiday', count: 3 }
        }
      ];
    }
  } finally {
    loading.value = false;
  }
};

// Complete quest
const completeQuest = async (questId: number) => {
  if (completingQuest.value) return;
  
  completingQuest.value = questId;
  
  try {
    const response = await apiClient(`/quests/${questId}/complete`, {
      method: 'POST'
    });
    
    // Update quest status
    const questIndex = quests.value.findIndex(q => q.id === questId);
    if (questIndex !== -1) {
      quests.value[questIndex].completed = true;
      quests.value[questIndex].status = 'completed';
    }
    
    // Show success message (implement toast notification)
    console.log('Quest completed!', response);
  } catch (err: any) {
    console.error('Failed to complete quest:', err);
    // Show error message
  } finally {
    completingQuest.value = null;
  }
};

// Initialize
onMounted(() => {
  fetchQuests();
});
</script>