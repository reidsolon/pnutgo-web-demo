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
            <h1 class="text-2xl sm:text-3xl font-black text-gray-900 tracking-wide">
              {{ animal.is_captured ? 'COLLECTED!' : 'IN THE WILD!' }}
            </h1>
          </div>
          <div class="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
          <div class="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-4 pb-4">
        <div class="max-w-md mx-auto">
          <!-- Companion Card -->
          <div class="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-white mb-4 sm:mb-6">
            <!-- Heart Icon -->
            <button class="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
              <Icon name="heroicons:heart" class="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
            </button>

            <!-- Companion Image -->
            <div class="relative w-full aspect-square flex items-center justify-center p-4 sm:p-6">
              <img 
                v-if="!animal.is_captured && animal.silhouette_image?.url"
                :src="animal.silhouette_image.url"
                :alt="animal.name"
                class="w-full h-full object-contain drop-shadow-2xl filter brightness-0"
              />
              <img 
                v-else-if="animal.is_captured && animal.view_image?.url"
                :src="animal.view_image.url"
                :alt="animal.name"
                class="w-full h-full object-contain drop-shadow-2xl"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Icon name="heroicons:sparkles" class="w-24 h-24 sm:w-32 sm:h-32 text-gray-400 drop-shadow-xl" />
              </div>
              
              <!-- Lightning bolt decoration (if companion has lightning trait) -->
              <div 
                v-if="animal.is_captured && animal.traits?.toLowerCase().includes('lightning')" 
                class="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 w-12 h-18 sm:w-16 sm:h-24"
              >
                <svg viewBox="0 0 24 48" fill="none" class="w-full h-full drop-shadow-lg">
                  <path d="M12 0L8 20H16L12 48L20 16H12L12 0Z" fill="#FCD34D" stroke="#F59E0B" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Info Card -->
          <div class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border-3 sm:border-4 border-gray-100 mb-4 sm:mb-6">
            <!-- Rarity Badge -->
            <div class="flex items-center mb-3 sm:mb-4">
              <div 
                class="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md"
                :class="getRarityBadgeClass(animal.rarity)"
              >
                <Icon name="heroicons:fire" class="w-4 h-4 sm:w-5 sm:h-5" />
                <span class="uppercase tracking-wide">{{ animal.rarity_label }}</span>
              </div>
            </div>

            <!-- Companion Name -->
            <h2 class="text-2xl sm:text-4xl font-black text-gray-900 mb-4 sm:mb-6">
              {{ animal.name }}
            </h2>

            <!-- Personality Section -->
            <div class="mb-4 sm:mb-6">
              <h3 class="text-sm sm:text-base font-bold text-gray-600 mb-1.5 sm:mb-2">Personality</h3>
              <p class="text-base sm:text-lg font-bold text-gray-900 leading-relaxed">
                {{ animal.personality || animal.description || 'A mysterious companion with hidden secrets' }}
              </p>
            </div>

            <!-- Traits Section -->
            <div class="mb-4 sm:mb-6">
              <h3 class="text-sm sm:text-base font-bold text-gray-600 mb-1.5 sm:mb-2">Traits</h3>
              <p class="text-base sm:text-lg font-bold text-gray-900 leading-relaxed">
                {{ animal.traits || 'Unique characteristics to be discovered' }}
              </p>
            </div>

            <!-- Additional Info (Captures, etc.) -->
            <div v-if="animal.is_captured" class="pt-4 sm:pt-6 border-t-2 border-gray-100 space-y-2 sm:space-y-3">
              <div class="flex items-center justify-between text-xs sm:text-sm">
                <span class="text-gray-600 font-semibold">Times Captured:</span>
                <span class="font-bold text-gray-900">{{ animal.times_captured }}</span>
              </div>
              
              <div class="flex items-center justify-between text-xs sm:text-sm">
                <span class="text-gray-600 font-semibold">Total in Collection:</span>
                <span class="font-bold text-gray-900">{{ animal.capture_count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Animal } from '~/types';
import { getRarityClass } from '~/types';

interface Props {
  animal: Animal;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const getRarityBadgeClass = getRarityClass;
</script>

<style scoped>
/* Ensure smooth scrolling */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
</style>
