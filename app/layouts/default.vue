<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
    <!-- Header Slot -->
    <slot name="header" />

    <!-- Main Content -->
    <main class="flex-1 relative overflow-hidden min-h-0">
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
// Layout logic can be added here if needed
</script>
