<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-[#F5F3E8] z-50 flex flex-col overflow-hidden">
      <!-- Back Button -->
      <div class="absolute top-4 left-4 z-10">
        <button
          @click="$emit('close')"
          class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border-4 border-gray-900 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-lg"
        >
          <Icon name="heroicons:arrow-left" class="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
        </button>
      </div>

      <!-- SPOTTED! Banner -->
      <div class="flex justify-center pt-4 sm:pt-6 pb-2 sm:pb-4 px-4">
        <div class="relative">
          <div class="bg-gradient-to-r from-green-400 to-green-500 rounded-full px-6 sm:px-8 py-2 sm:py-3 shadow-lg border-3 sm:border-4 border-white">
            <h1 class="text-2xl sm:text-3xl font-black text-gray-900 tracking-wide">SPOTTED!</h1>
          </div>
          <div class="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
          <div class="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-4 pb-4">
        <div class="max-w-md mx-auto">
          <!-- Companion Card -->
          <div class="relative bg-gradient-to-b from-yellow-300 via-yellow-200 to-yellow-400 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-white mb-4 sm:mb-6">
            <!-- Heart Icon -->
            <button class="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
              <Icon name="heroicons:heart" class="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
            </button>

            <!-- Companion Image with decorative background -->
            <div class="relative h-56 sm:h-72 flex items-end justify-center overflow-hidden">
              <!-- Decorative clouds -->
              <div class="absolute top-4 sm:top-8 left-8 sm:left-12 w-16 sm:w-24 h-8 sm:h-12 bg-white/40 rounded-full blur-sm"></div>
              <div class="absolute top-6 sm:top-12 left-20 sm:left-32 w-20 sm:w-32 h-10 sm:h-14 bg-white/30 rounded-full blur-sm"></div>
              <div class="absolute top-8 sm:top-16 right-8 sm:right-12 w-18 sm:w-28 h-8 sm:h-12 bg-white/40 rounded-full blur-sm"></div>
              
              <!-- Grass/Ground elements -->
              <div class="absolute bottom-0 left-0 right-0 h-24 sm:h-32">
                <!-- Decorative flowers and plants -->
                <div class="absolute bottom-8 sm:bottom-12 left-6 sm:left-8 w-8 sm:w-12 h-8 sm:h-12 bg-green-600/30 rounded-full"></div>
                <div class="absolute bottom-10 sm:bottom-16 left-10 sm:left-16 w-6 sm:w-8 h-10 sm:h-16 bg-green-700/40 rounded-t-full"></div>
                <div class="absolute bottom-6 sm:bottom-8 right-8 sm:right-12 w-10 sm:w-16 h-10 sm:h-16">
                  <div class="absolute inset-0 bg-yellow-500/60 rounded-full"></div>
                  <div class="absolute inset-2 bg-orange-400/60 rounded-full"></div>
                </div>
                <div class="absolute bottom-10 sm:bottom-14 right-16 sm:right-24 w-8 sm:w-10 h-8 sm:h-10">
                  <div class="absolute inset-0 bg-red-400/50 rounded-full"></div>
                  <div class="absolute inset-2 bg-orange-300/50 rounded-full"></div>
                </div>
                
                <!-- Grass layers -->
                <div class="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-green-600/40 to-green-700/60 rounded-t-[50%]"></div>
                <div class="absolute bottom-0 left-0 right-0 h-10 sm:h-16 bg-gradient-to-b from-green-700/50 to-green-800/70 rounded-t-[50%]"></div>
              </div>

              <!-- Companion Image -->
              <div class="relative z-10 mb-8 sm:mb-12">
                <img 
                  v-if="spawn.show_silhouette && cycle.companion.silhouette_image"
                  :src="cycle.companion.silhouette_image.thumb_url"
                  :alt="cycle.companion.name"
                  class="w-48 h-48 sm:w-64 sm:h-64 object-contain drop-shadow-2xl"
                />
                <img 
                  v-else-if="!spawn.show_silhouette && cycle.companion.view_image"
                  :src="cycle.companion.view_image.thumb_url"
                  :alt="cycle.companion.name"
                  class="w-48 h-48 sm:w-64 sm:h-64 object-contain drop-shadow-2xl"
                />
                <div v-else class="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
                  <Icon name="heroicons:sparkles" class="w-24 h-24 sm:w-32 sm:h-32 text-white drop-shadow-xl" />
                </div>
                
                <!-- Lightning bolt decoration (if companion has lightning trait) -->
                <div 
                  v-if="!spawn.show_silhouette && cycle.companion.traits?.toLowerCase().includes('lightning')" 
                  class="absolute bottom-6 sm:bottom-8 -right-3 sm:-right-4 w-12 h-18 sm:w-16 sm:h-24"
                >
                  <svg viewBox="0 0 24 48" fill="none" class="w-full h-full drop-shadow-lg">
                    <path d="M12 0L8 20H16L12 48L20 16H12L12 0Z" fill="#FCD34D" stroke="#F59E0B" stroke-width="2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Info Card -->
          <div class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border-3 sm:border-4 border-gray-100 mb-4 sm:mb-6">
            <!-- Rarity Badge -->
            <div class="flex items-center mb-3 sm:mb-4">
              <div class="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md">
                <Icon name="heroicons:fire" class="w-4 h-4 sm:w-5 sm:h-5" />
                <span class="uppercase tracking-wide">{{ cycle.companion.rarity_label }}</span>
              </div>
            </div>

            <!-- Companion Name -->
            <h2 class="text-2xl sm:text-4xl font-black text-gray-900 mb-4 sm:mb-6">
              {{ spawn.show_silhouette ? '???' : cycle.companion.name }}
            </h2>

            <!-- Personality Section -->
            <div class="mb-4 sm:mb-6">
              <h3 class="text-sm sm:text-base font-bold text-gray-600 mb-1.5 sm:mb-2">Personality</h3>
              <p class="text-base sm:text-lg font-bold text-gray-900 leading-relaxed">
                {{ spawn.show_silhouette 
                  ? 'Get closer to discover this companion\'s personality...' 
                  : cycle.companion.personality || cycle.companion.description || 'A mysterious companion with hidden secrets'
                }}
              </p>
            </div>

            <!-- Traits Section -->
            <div class="mb-4 sm:mb-6">
              <h3 class="text-sm sm:text-base font-bold text-gray-600 mb-1.5 sm:mb-2">Traits</h3>
              <p class="text-base sm:text-lg font-bold text-gray-900 leading-relaxed">
                {{ spawn.show_silhouette 
                  ? 'Mysterious traits await discovery...' 
                  : cycle.companion.traits || 'Unique characteristics to be discovered'
                }}
              </p>
            </div>

            <!-- Additional Info (Distance, Captures, etc.) -->
            <div class="pt-4 sm:pt-6 border-t-2 border-gray-100 space-y-2 sm:space-y-3">
              <div class="flex items-center justify-between text-xs sm:text-sm">
                <span class="text-gray-600 font-semibold">Distance:</span>
                <span class="font-bold text-gray-900">{{ Math.round(spawn.distance) }}m away</span>
              </div>
              
              <div class="flex items-center justify-between text-xs sm:text-sm">
                <span class="text-gray-600 font-semibold">Remaining Captures:</span>
                <span class="font-bold text-gray-900">{{ cycle.remaining_captures }}/{{ cycle.capture_limit }}</span>
              </div>
              
              <div class="flex items-center justify-between text-xs sm:text-sm">
                <span class="text-gray-600 font-semibold">Expires:</span>
                <span class="font-bold text-gray-900">{{ formatExpiry(cycle.expires_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <button
            v-if="spawn.capturable"
            @click="$emit('capture', spawn.id)"
            :disabled="capturing"
            class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-black text-lg sm:text-xl py-4 sm:py-5 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 flex items-center justify-center gap-2 sm:gap-3"
          >
            <Icon
              v-if="capturing"
              name="heroicons:arrow-path"
              class="w-5 h-5 sm:w-6 sm:h-6 animate-spin"
            />
            <span v-if="capturing">Capturing...</span>
            <span v-else>Capture</span>
          </button>
          <button
            v-else-if="!spawn.show_silhouette"
            @click="$emit('mark-spotted', spawn.id)"
            :disabled="capturing"
            class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-black text-lg sm:text-xl py-4 sm:py-5 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 flex items-center justify-center gap-2 sm:gap-3"
          >
            <Icon
              v-if="capturing"
              name="heroicons:arrow-path"
              class="w-5 h-5 sm:w-6 sm:h-6 animate-spin"
            />
            <span v-if="capturing">Marking...</span>
            <span v-else>Mark as Spotted</span>
          </button>
          <div
            v-else
            class="w-full bg-gray-300 text-gray-600 font-black text-lg sm:text-xl py-4 sm:py-5 rounded-full text-center"
          >
            Too Far Away
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { NearbySpawn, ActiveCycle } from '~/composables/use-nearby-spawns';

interface Props {
  spawn: NearbySpawn;
  cycle: ActiveCycle;
  capturing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  capturing: false
});

const emit = defineEmits<{
  close: [];
  capture: [spawnId: number];
  'mark-spotted': [spawnId: number];
}>();

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
</script>

<style scoped>
/* Ensure smooth scrolling */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
</style>
