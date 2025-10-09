<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="glass-strong p-4 border-b border-white/20 backdrop-blur-xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Icon name="heroicons:user" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="font-bold text-lg gradient-text">{{ user?.full_name || 'Trainer' }}</h1>
            <p class="text-xs text-gray-500">Level 1 Companion Hunter</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- Location Status -->
          <div
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-sm cursor-pointer',
              locationEnabled 
                ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-150' 
                : locationError 
                  ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-150'
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-150'
            ]"
            @click="getUserLocation"
            :title="locationError || (locationEnabled ? 'Location active' : 'Click to enable location')"
          >
            <Icon
              :name="locationEnabled ? 'heroicons:map-pin' : locationError ? 'heroicons:exclamation-triangle' : 'heroicons:arrow-path'"
              :class="[
                'w-4 h-4',
                !locationEnabled && !locationError ? 'animate-spin' : ''
              ]"
            />
            <span>
              {{ 
                locationEnabled 
                  ? 'GPS Active' 
                  : locationError 
                    ? 'GPS Error' 
                    : 'Getting GPS...' 
              }}
            </span>
          </div>
          
          <!-- Settings -->
          <button
            @click="logout"
            class="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover:shadow-lg"
          >
            <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 text-gray-600" />
          </button>
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
definePageMeta({
  auth: true
});

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

.animate-slide-down {
  animation: slide-down 0.3s ease-out;
}
</style>