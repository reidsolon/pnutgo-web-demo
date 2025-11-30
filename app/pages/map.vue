<template>
  <NuxtLayout>
    <template #header>
      <AppHeader
        title="Search"
        :location-enabled="locationEnabled"
        :location-error="locationError"
        :show-location-features="true"
        @location-update="getUserLocation"
        @logout="logout"
      />
    </template>

    <!-- Map Container -->
    <ClientOnly>
      <div class="w-full h-full absolute inset-0">
        <LeafletMap
          v-if="mapReady"
          :user-location="userLocation"
          :location-enabled="locationEnabled"
          @location-update="getUserLocation"
          @companion-captured="handleCompanionCaptured"
        />
      </div>
      <template #fallback>
        <div class="w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-cyan-100 flex items-center justify-center">
          <div class="glass-strong p-8 rounded-2xl text-center">
            <Icon name="heroicons:map" class="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <p class="text-xl font-bold gradient-text mb-2">Loading Map...</p>
            <p class="text-gray-600 mb-4">Preparing your companion hunting experience...</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- Success Toast -->
    <Teleport to="body" v-if="showSuccessToast">
      <div class="fixed top-4 right-4 z-50 glass-strong p-4 rounded-xl shadow-xl animate-slide-down">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Icon name="heroicons:check" class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="font-medium text-green-700">Companion Captured!</p>
            <p class="text-sm text-gray-600">Added to your collection</p>
          </div>
        </div>
      </div>
    </Teleport>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

// Import SEO composable
const { setSEO, createWebPageStructuredData, createBreadcrumbStructuredData } = useSEO()

// Set SEO meta tags for the map page
setSEO({
  title: 'PnutGO',
  description: 'Explore the PnutGo interactive map to discover and capture magical companions in real-world locations. Use GPS tracking to find rare companions, complete location-based quests, and track your hunting progress.',
  keywords: [
    'PnutGo interactive map',
    'companion discovery map',
    'location-based companion hunting',
    'GPS companion tracking',
    'real-time companion spawns',
    'interactive game map',
    'companion locations',
    'nearby companions',
    'location-based gameplay',
    'real world exploration',
    'companion hunting interface',
    'GPS adventure map',
    'live companion tracking',
    'map-based gaming'
  ],
  ogType: 'website',
  twitterCard: 'summary_large_image',
  robots: 'noindex, follow', // Private game content
  structuredData: [
    createWebPageStructuredData({
      '@type': 'WebPage',
      name: 'PnutGo',
      description: 'Real-time interactive map for discovering and capturing companions in PnutGo',
      mainEntity: {
        '@type': 'Map',
        name: 'PnutGo',
        description: 'Interactive map showing real-time companion spawns and locations for hunting',
        mapType: 'VenueMap',
        hasMap: {
          '@type': 'Map',
          mapType: 'InteractiveMap'
        }
      },
      potentialAction: [
        {
          '@type': 'DiscoverAction',
          target: {
            '@type': 'Place',
            name: 'Companion Spawn Locations'
          },
          object: {
            '@type': 'Thing',
            name: 'Magical Companions'
          }
        },
        {
          '@type': 'PlayAction',
          target: {
            '@type': 'VideoGame',
            name: 'PnutGo Location-Based Gameplay'
          }
        }
      ]
    }),
    createBreadcrumbStructuredData([
      { name: 'PnutGo', url: 'https://pnutgo.com' },
      { name: 'Game Dashboard', url: 'https://pnutgo.com/dashboard' },
      { name: 'Interactive Map', url: 'https://pnutgo.com/map' }
    ])
  ]
})

const { user, logout } = useAuthentication();

// User location state
const userLocation = ref<{ lat: number; lng: number } | null>(null);
const locationEnabled = ref(false);
const showSuccessToast = ref(false);
const mapReady = ref(false);

// Location error handling
const locationError = ref<string | null>(null);
const locationPermissionState = ref<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

// Get user location with comprehensive error handling
const getUserLocation = async () => {
  // Client-side only check
  if (process.server) {
    return;
  }

  locationError.value = null;

  // Check if geolocation is supported
  if (!navigator?.geolocation) {
    locationError.value = 'Geolocation is not supported by this browser';
    locationEnabled.value = false;
    setFallbackLocation();
    return;
  }

  // Check permissions first if available
  if ('permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      locationPermissionState.value = permission.state;
      
      if (permission.state === 'denied') {
        locationError.value = 'Location access denied. Please enable location services in your browser settings.';
        locationEnabled.value = false;
        setFallbackLocation();
        return;
      }
    } catch (e) {
      console.log('Permissions API not fully supported', e);
    }
  }

  // Attempt to get location
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      userLocation.value = { lat: latitude, lng: longitude };
      locationEnabled.value = true;
      locationError.value = null;
      console.log(`✅ Location found: ${latitude}, ${longitude} (accuracy: ${Math.round(accuracy)}m)`);
    },
    (error) => {
      locationEnabled.value = false;
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          locationError.value = 'Location access denied. Click "Enable Location" to try again.';
          break;
        case error.POSITION_UNAVAILABLE:
          locationError.value = 'Location information unavailable. Using demo location.';
          break;
        case error.TIMEOUT:
          locationError.value = 'Location request timed out. Using demo location.';
          break;
        default:
          locationError.value = 'An unknown location error occurred. Using demo location.';
          break;
      }
      
      console.error('Location error:', {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      setFallbackLocation();
    },
    {
      enableHighAccuracy: true, // Use high accuracy GPS
      timeout: 10000, // 10 seconds timeout
      maximumAge: 0 // Don't use cached position
    }
  );
};

// Set fallback location (Manila, Philippines)
const setFallbackLocation = () => {
  userLocation.value = { lat: 14.5995, lng: 120.9842 };
  console.log('⚠️ Using fallback location: Manila, Philippines');
};

// Handle companion capture
const handleCompanionCaptured = (companionId: number) => {
  console.log('Companion captured:', companionId);
  showSuccessToast.value = true;
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 3000);
};

// Initialize location on mount
onMounted(() => {
  // Small delay to ensure client-side hydration is complete
  setTimeout(() => {
    getUserLocation();
    mapReady.value = true;
  }, 100);
});
</script>

<style scoped>
@keyframes slide-down {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes float-slow {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
    opacity: 0.6;
  }
}

@keyframes float-medium {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 0.4;
  }
  33% {
    transform: translateY(-8px) translateX(4px);
    opacity: 0.7;
  }
  66% {
    transform: translateY(-4px) translateX(-4px);
    opacity: 0.5;
  }
}

@keyframes float-fast {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.2;
  }
  50% {
    transform: translateY(-15px) scale(1.2);
    opacity: 0.8;
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out;
}

.animate-float-slow {
  animation: float-slow 4s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 3s ease-in-out infinite;
  animation-delay: 1s;
}

.animate-float-fast {
  animation: float-fast 2s ease-in-out infinite;
  animation-delay: 0.5s;
}
</style>