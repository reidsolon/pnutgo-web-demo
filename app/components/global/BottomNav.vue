<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/20 p-4 backdrop-blur-xl">
    <div class="flex items-center justify-around">
      <NuxtLink to="/map" class="nav-item" :class="{ active: isActive('/map') }">
        <Icon name="heroicons:map" class="w-6 h-6 mb-1" />
        <span class="text-xs font-medium">Map</span>
      </NuxtLink>
      
      <NuxtLink to="/quests" class="nav-item" :class="{ active: isActive('/quests') }">
        <Icon name="heroicons:clipboard-document-list" class="w-6 h-6 mb-1" />
        <span class="text-xs font-medium">Quests</span>
      </NuxtLink>
      
      <NuxtLink to="/badges" class="nav-item" :class="{ active: isActive('/badges') }">
        <Icon name="heroicons:trophy" class="w-6 h-6 mb-1" />
        <span class="text-xs font-medium">Badges</span>
      </NuxtLink>
      
      <NuxtLink to="/collection" class="nav-item" :class="{ active: isActive('/collection') }">
        <Icon name="heroicons:squares-2x2" class="w-6 h-6 mb-1" />
        <span class="text-xs font-medium">Collection</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute();

const isActive = (path: string): boolean => {
  return route.path === path;
};
</script>
