<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 mb-6 shadow-xl animate-pulse">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
      </div>
      <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
        Welcome to PnutGo
      </h1>
      <p class="text-gray-600 mb-6">Discover and collect companions in the real world</p>
      
      <div class="space-y-4">
        <NuxtLink 
          to="/login" 
          class="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Get Started
        </NuxtLink>
        
        <div class="text-sm text-gray-500 space-y-2">
          <p>✨ Interactive Map with Location-Based Gameplay</p>
          <p>🏆 Quest System with Daily Challenges</p>
          <p>🎖️ Badge Collection & Achievement Tracking</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Simple welcome page without TypeScript errors
</script>