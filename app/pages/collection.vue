<template>
  <NuxtLayout>
    <template #header>
      <AppHeader title="My Collection" />
    </template>

    <!-- Content -->
    <div class="w-full h-full overflow-y-auto p-6 space-y-8">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-8">
        <div class="space-y-4">
          <div class="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="i in 8" :key="i" class="loading-pulse h-40 rounded-2xl"></div>
          </div>
        </div>
      </div>

      <template v-else>
        <!-- Captured Section -->
        <section v-if="capturedAnimals.length > 0">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Collected
            </h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ capturedAnimals.length }} captured
            </span>
          </div>

          <!-- Group by Rarity -->
          <div class="space-y-8">
            <div 
              v-for="rarity in capturedByRarity" 
              :key="rarity.name"
              class="space-y-4"
            >
              <!-- Rarity Header -->
              <div class="flex items-center gap-3">
                <h3 
                  class="text-lg font-bold px-4 py-2 rounded-full inline-block"
                  :class="getRarityClass(rarity.name)"
                >
                  {{ rarity.label }}
                </h3>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  ({{ rarity.animals.length }})
                </span>
              </div>

              <!-- Animals Grid (3 columns) -->
              <div class="grid grid-cols-3 gap-4">
                <div
                  v-for="animal in rarity.animals"
                  :key="animal.id"
                  class="card-interactive p-4 text-center cursor-pointer"
                  @click="openAnimalModal(animal)"
                >
                  <!-- Animal Image -->
                  <div class="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <img 
                      v-if="animal.view_image?.url" 
                      :src="animal.view_image.url" 
                      :alt="animal.name"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                    />
                    <Icon v-else name="heroicons:sparkles" class="w-10 h-10 text-purple-500" />
                  </div>
                  
                  <h3 class="font-bold text-sm text-gray-900 dark:text-white">
                    {{ animal.name }}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- In The Wild Section -->
        <section v-if="wildAnimals.length > 0">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icon name="heroicons:eye" class="w-6 h-6" />
              In The Wild
            </h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ wildAnimals.length }} undiscovered
            </span>
          </div>

          <!-- Group by Rarity -->
          <div class="space-y-8">
            <div 
              v-for="rarity in wildByRarity" 
              :key="rarity.name"
              class="space-y-4"
            >
              <!-- Rarity Header -->
              <div class="flex items-center gap-3">
                <h3 
                  class="text-lg font-bold px-4 py-2 rounded-full inline-block"
                  :class="getRarityClass(rarity.name)"
                >
                  {{ rarity.label }}
                </h3>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  ({{ rarity.animals.length }})
                </span>
              </div>

              <!-- Animals Grid (3 columns) -->
              <div class="grid grid-cols-3 gap-4">
                <div
                  v-for="animal in rarity.animals"
                  :key="animal.id"
                  class="card-interactive p-4 text-center opacity-75 hover:opacity-90 transition-opacity cursor-pointer"
                  @click="openAnimalModal(animal)"
                >
                  <!-- Silhouette -->
                  <div class="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center relative">
                    <img 
                      v-if="animal.silhouette_image?.url" 
                      :src="animal.silhouette_image.url" 
                      :alt="animal.name"
                      class="w-full h-full object-cover filter brightness-0"
                    />
                    <Icon v-else name="heroicons:question-mark-circle" class="w-10 h-10 text-gray-600" />
                    
                    <!-- Lock overlay -->
                    <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <Icon name="heroicons:lock-closed" class="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 class="font-bold text-sm text-gray-600 dark:text-gray-400">
                    {{ animal.name }}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Empty State -->
        <div v-if="capturedAnimals.length === 0 && wildAnimals.length === 0" class="text-center py-12">
          <Icon name="heroicons:squares-2x2" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Companions Available</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">Start exploring the map to discover companions!</p>
          <NuxtLink to="/map" class="btn-gradient inline-flex items-center">
            <Icon name="heroicons:map" class="w-4 h-4 mr-2" />
            Explore Map
          </NuxtLink>
        </div>
      </template>
    </div>

    <!-- Animal Detail Modal -->
    <AnimalDetailModal
      v-if="selectedAnimal"
      :animal="selectedAnimal"
      @close="closeAnimalModal"
    />

  </NuxtLayout>
</template>

<script setup lang="ts">
import type { RarityKey, Animal } from '~/types';
import { RARITY_ORDER_LIST, RARITY_LABELS, getRarityClass } from '~/types';

definePageMeta({
  layout: 'default',
  auth: true
});

// Import SEO composable
const { setSEO, createWebPageStructuredData, createBreadcrumbStructuredData } = useSEO()

// Set SEO meta tags for the collection page
setSEO({
  title: 'My Companion Collection - View Captured Companions | PnutGo',
  description: 'Browse your personal companion collection in PnutGo. View all captured companions, track capture statistics, and see your hunting progress. Manage your companion inventory and achievements.',
  keywords: [
    'PnutGo companion collection',
    'captured companions',
    'companion inventory',
    'hunting progress',
    'companion statistics',
    'collection management',
    'companion hunting achievements',
    'captured creature collection',
    'companion discovery history',
    'hunting trophy collection',
    'companion mastery progress',
    'personal companion library',
    'hunting success tracker',
    'companion collection game'
  ],
  ogType: 'website',
  twitterCard: 'summary_large_image',
  robots: 'noindex, follow', // Private game content
  structuredData: [
    createWebPageStructuredData({
      '@type': 'WebPage',
      name: 'PnutGo Companion Collection',
      description: 'Personal collection of captured companions in PnutGo hunting game',
      mainEntity: {
        '@type': 'CollectionPage',
        name: 'Companion Collection',
        description: 'Personal inventory of captured magical companions',
        numberOfItems: '{{ companions.length }}',
        about: {
          '@type': 'VideoGame',
          name: 'PnutGo',
          gameItem: {
            '@type': 'Thing',
            name: 'Captured Companions',
            description: 'Magical creatures discovered and captured during gameplay'
          }
        },
        hasPart: [
          {
            '@type': 'Thing',
            name: 'Fire Drake',
            description: 'Rare fire-type companion with powerful abilities'
          },
          {
            '@type': 'Thing',
            name: 'Water Sprite', 
            description: 'Common water-type companion perfect for beginners'
          }
        ]
      },
      potentialAction: [
        {
          '@type': 'ViewAction',
          target: {
            '@type': 'WebPage',
            name: 'Companion Details'
          }
        },
        {
          '@type': 'SearchAction',
          target: {
            '@type': 'WebPage',
            name: 'Find More Companions',
            url: 'https://pnutgo.com/map'
          }
        }
      ]
    }),
    createBreadcrumbStructuredData([
      { name: 'PnutGo', url: 'https://pnutgo.com' },
      { name: 'Game Dashboard', url: 'https://pnutgo.com/dashboard' },
      { name: 'Companion Collection', url: 'https://pnutgo.com/collection' }
    ])
  ]
})

const { apiClient } = useApiClient();

const loading = ref(false);
const capturedAnimals = ref<Animal[]>([]);
const wildAnimals = ref<Animal[]>([]);
const selectedAnimal = ref<Animal | null>(null);

// Group captured animals by rarity
const capturedByRarity = computed(() => {
  const grouped = RARITY_ORDER_LIST
    .map(rarity => {
      const animals = capturedAnimals.value.filter(
        animal => animal.rarity === rarity
      );
      return {
        name: rarity,
        label: RARITY_LABELS[rarity],
        animals
      };
    })
    .filter(group => group.animals.length > 0);
  
  return grouped;
});

// Group wild animals by rarity
const wildByRarity = computed(() => {
  const grouped = RARITY_ORDER_LIST
    .map(rarity => {
      const animals = wildAnimals.value.filter(
        animal => animal.rarity === rarity
      );
      return {
        name: rarity,
        label: RARITY_LABELS[rarity],
        animals
      };
    })
    .filter(group => group.animals.length > 0);
  
  return grouped;
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',    
    day: 'numeric'
  });
};

const handleImageError = (event: Event) => {
  // Hide broken image, fallback icon will show
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};

const openAnimalModal = (animal: Animal) => {
  selectedAnimal.value = animal;
};

const closeAnimalModal = () => {
  selectedAnimal.value = null;
};

const fetchAnimals = async () => {
  loading.value = true;
  
  try {
    // Fetch captured animals
    const capturedResponse = await apiClient('/animals', {
      query: {
        'filter[captured]': 'true'
      }
    }) as { data: Record<string, Animal[]> };
    
    // Fetch wild (not captured) animals
    const wildResponse = await apiClient('/animals', {
      query: {
        'filter[captured]': 'false'
      }
    }) as { data: Record<string, Animal[]> };
    
    // Flatten the grouped response into a single array
    const capturedFlat: Animal[] = [];
    const wildFlat: Animal[] = [];
    
    // Process captured animals
    Object.keys(capturedResponse.data).forEach(rarityKey => {
      if (Array.isArray(capturedResponse.data[rarityKey])) {
        capturedFlat.push(...capturedResponse.data[rarityKey]);
      }
    });
    
    // Process wild animals
    Object.keys(wildResponse.data).forEach(rarityKey => {
      if (Array.isArray(wildResponse.data[rarityKey])) {
        wildFlat.push(...wildResponse.data[rarityKey]);
      }
    });
    
    capturedAnimals.value = capturedFlat;
    wildAnimals.value = wildFlat;

    console.log(wildResponse)
    
  } catch (err) {
    console.error('Failed to fetch animals:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAnimals();
});
</script>