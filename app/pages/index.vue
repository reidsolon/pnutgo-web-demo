<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 mb-6 shadow-xl animate-pulse">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
      </div>
      <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
        PnutGo
      </h1>
      <p class="text-gray-600 mb-6">Loading your adventure...</p>
      
      <NuxtLink 
        to="/welcome" 
        class="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
      >
        Continue to App
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// Import SEO composable
const { setSEO, createGameStructuredData, createOrganizationStructuredData } = useSEO()

// Set SEO meta tags for the landing page
setSEO({
  title: 'PnutGo - Location-Based Companion Hunting Game',
  description: 'Discover and capture magical companions in the real world with PnutGo. An immersive location-based mobile game featuring interactive maps, daily quests, and achievement badges. Start your adventure today!',
  keywords: [
    'PnutGo',
    'location-based game', 
    'companion hunting game',
    'mobile AR game',
    'GPS adventure game',
    'real world gaming',
    'interactive map game',
    'companion collection',
    'daily quests',
    'achievement system',
    'augmented reality',
    'location-based entertainment',
    'mobile adventure',
    'companion discovery',
    'real-time gameplay'
  ],
  ogType: 'website',
  twitterCard: 'summary_large_image',
  structuredData: [
    createGameStructuredData({
      '@type': 'VideoGame',
      name: 'PnutGo',
      alternateName: 'PnutGo: Companion Hunter',
      description: 'An immersive location-based companion hunting game that combines real-world exploration with digital companion collection and quest completion.',
      url: 'https://pnutgo.com',
      image: 'https://pnutgo.com/pnutgo-og-image.jpg',
      screenshot: [
        'https://pnutgo.com/screenshots/map-view.jpg',
        'https://pnutgo.com/screenshots/companion-capture.jpg',
        'https://pnutgo.com/screenshots/quest-board.jpg'
      ],
      trailer: {
        '@type': 'VideoObject',
        name: 'PnutGo - Companion Hunting Adventure',
        description: 'Experience the magic of companion hunting in the real world',
        thumbnailUrl: 'https://pnutgo.com/video-thumbnail.jpg',
        uploadDate: '2025-01-01'
      },
      gameItem: [
        {
          '@type': 'Thing',
          name: 'Fire Drake',
          description: 'A rare fire-type companion with powerful abilities'
        },
        {
          '@type': 'Thing', 
          name: 'Water Sprite',
          description: 'A common water-type companion perfect for beginners'
        }
      ],
      quest: [
        {
          '@type': 'Thing',
          name: 'Daily Explorer Challenge',
          description: 'Complete daily quests to earn experience and rewards'
        },
        {
          '@type': 'Thing',
          name: 'Badge Collection',
          description: 'Unlock achievement badges by mastering different companion types'
        }
      ]
    }),
    createOrganizationStructuredData()
  ]
})
</script>