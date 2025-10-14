<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="relative overflow-hidden glass-strong border-b border-white/20">
      <!-- Background with animated gradient -->
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 opacity-90"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
      
      <!-- Animated background particles -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-2 left-10 w-2 h-2 bg-white/20 rounded-full animate-float-slow"></div>
        <div class="absolute top-8 right-20 w-1 h-1 bg-white/30 rounded-full animate-float-fast"></div>
        <div class="absolute bottom-4 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-float-medium"></div>
        <div class="absolute top-6 left-1/2 w-1 h-1 bg-white/20 rounded-full animate-float-slow"></div>
      </div>
      
      <div class="relative z-10 p-6">
        <div class="flex items-center justify-between">
          <!-- User Profile Section -->
          <div class="flex items-center space-x-4">
            <!-- Enhanced Avatar -->
            <div class="relative">
              <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-xl">
                <Icon name="heroicons:user" class="w-6 h-6 text-white" />
              </div>
              <!-- Online status indicator -->
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <!-- User Info -->
            <div class="flex flex-col">
              <h1 class="text-2xl font-bold text-white drop-shadow-sm">
                {{ user?.full_name || 'Trainer' }}
              </h1>
            </div>
          </div>
          
          <!-- GPS Status -->
          <div class="flex items-center space-x-3">
            <button
              @click="getUserLocation"
              :class="[
                'flex items-center space-x-2 px-3 py-2 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-105',
                locationEnabled 
                  ? 'bg-green-500/20 border-green-400/50 text-green-100' 
                  : locationError 
                    ? 'bg-red-500/20 border-red-400/50 text-red-100'
                    : 'bg-yellow-500/20 border-yellow-400/50 text-yellow-100'
              ]"
              :title="locationError || (locationEnabled ? 'Location active' : 'Click to enable location')"
            >
              <Icon
                :name="locationEnabled ? 'heroicons:map-pin' : locationError ? 'heroicons:exclamation-triangle' : 'heroicons:arrow-path'"
                :class="[
                  'w-4 h-4',
                  !locationEnabled && !locationError ? 'animate-spin' : ''
                ]"
              />
              <span class="text-sm font-medium">
                {{ 
                  locationEnabled 
                    ? 'Active' 
                    : locationError 
                      ? 'Error' 
                      : 'Locating...' 
                }}
              </span>
            </button>
            
            <!-- Logout Button -->
            <button
              @click="logout"
              class="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200 hover:scale-105"
              title="Logout"
            >
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Map Container -->
    <div class="flex-1 relative p-4 min-h-0 overflow-hidden">
      <ClientOnly>
        <div class="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white">
          <LeafletMap
            v-if="mapReady"
            :user-location="userLocation"
            :location-enabled="locationEnabled"
            @location-update="getUserLocation"
            @companion-captured="handleCompanionCaptured"
          />
        </div>
        <template #fallback>
          <div class="w-full h-full rounded-2xl bg-gradient-to-br from-blue-100 via-purple-50 to-cyan-100 flex items-center justify-center min-h-[400px] shadow-2xl border border-white/20">
            <div class="glass-strong p-8 rounded-2xl text-center">
              <Icon name="heroicons:map" class="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
              <p class="text-xl font-bold gradient-text mb-2">Loading Map...</p>
              <p class="text-gray-600 mb-4">Preparing your companion hunting experience...</p>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Bottom Navigation -->
    <nav class="glass-strong border-t border-white/20 p-4 backdrop-blur-xl">
      <div class="flex items-center justify-around">
        <NuxtLink to="/map" class="nav-item active">
          <Icon name="heroicons:map" class="w-6 h-6 mb-1" />
          <span class="text-xs font-medium">Map</span>
        </NuxtLink>
        
        <NuxtLink to="/quests" class="nav-item">
          <Icon name="heroicons:clipboard-document-list" class="w-6 h-6 mb-1" />
          <span class="text-xs font-medium">Quests</span>
        </NuxtLink>
        
        <NuxtLink to="/badges" class="nav-item">
          <Icon name="heroicons:trophy" class="w-6 h-6 mb-1" />
          <span class="text-xs font-medium">Badges</span>
        </NuxtLink>
        
        <NuxtLink to="/collection" class="nav-item">
          <Icon name="heroicons:squares-2x2" class="w-6 h-6 mb-1" />
          <span class="text-xs font-medium">Collection</span>
        </NuxtLink>
      </div>
    </nav>
    
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
  </div>
</template>

<script setup lang="ts">
// Import SEO composable
const { setSEO, createWebPageStructuredData, createBreadcrumbStructuredData } = useSEO()

// Set SEO meta tags for the map page
setSEO({
  title: 'Interactive Map - Discover Companions Near You | PnutGo',
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
      name: 'PnutGo Interactive Map',
      description: 'Real-time interactive map for discovering and capturing companions in PnutGo',
      mainEntity: {
        '@type': 'Map',
        name: 'PnutGo Companion Discovery Map',
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