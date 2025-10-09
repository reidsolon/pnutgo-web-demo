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
// Import SEO composable
const { setSEO, createWebPageStructuredData, createFAQStructuredData } = useSEO()

// Set SEO meta tags for the welcome page
setSEO({
  title: 'Welcome to PnutGo - Start Your Companion Hunting Adventure',
  description: 'Join millions of players in PnutGo! Explore interactive maps, complete daily quests, collect achievement badges, and discover magical companions in the real world. Free to play!',
  keywords: [
    'PnutGo welcome',
    'start companion hunting',
    'join PnutGo',
    'mobile game onboarding',
    'companion hunting tutorial',
    'location-based game features',
    'interactive map exploration',
    'daily quest system',
    'achievement badges',
    'real world adventure',
    'companion collection game',
    'GPS-based gameplay',
    'augmented reality gaming',
    'mobile AR experience'
  ],
  ogType: 'website',
  twitterCard: 'summary_large_image',
  structuredData: [
    createWebPageStructuredData({
      mainEntity: {
        '@type': 'VideoGame',
        name: 'PnutGo',
        description: 'Welcome to PnutGo - the ultimate location-based companion hunting experience'
      },
      about: [
        {
          '@type': 'Thing',
          name: 'Interactive Map Gameplay',
          description: 'Explore real-world locations with our interactive map system'
        },
        {
          '@type': 'Thing',
          name: 'Quest System',
          description: 'Complete daily challenges and special events for rewards'
        },
        {
          '@type': 'Thing',
          name: 'Achievement Tracking',
          description: 'Collect badges and track your companion mastery progress'
        }
      ]
    }),
    createFAQStructuredData([
      {
        question: 'What is PnutGo?',
        answer: 'PnutGo is a location-based companion hunting game where you explore the real world to discover and capture magical companions using your mobile device.'
      },
      {
        question: 'How do I start playing PnutGo?',
        answer: 'Simply click "Get Started" to create your account, enable location services, and begin exploring the interactive map to find your first companion.'
      },
      {
        question: 'What features does PnutGo offer?',
        answer: 'PnutGo features interactive maps with location-based gameplay, a comprehensive quest system with daily challenges, achievement badges for progression tracking, and real-time companion collection.'
      },
      {
        question: 'Is PnutGo free to play?',
        answer: 'Yes! PnutGo is completely free to play. You can explore, capture companions, complete quests, and earn badges without any cost.'
      },
      {
        question: 'Do I need to enable location services?',
        answer: 'Yes, PnutGo requires location services to provide the location-based gameplay experience. This allows you to discover companions in real-world locations.'
      }
    ])
  ]
})
</script>