import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Extend window object for Pusher
declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

// Region definitions
const REGIONS = {
  'north-america': {
    lat_min: 15.0,
    lat_max: 72.0,
    lng_min: -168.0,
    lng_max: -52.0,
  },
  'south-america': {
    lat_min: -56.0,
    lat_max: 15.0,
    lng_min: -82.0,
    lng_max: -34.0,
  },
  'europe': {
    lat_min: 36.0,
    lat_max: 71.0,
    lng_min: -10.0,
    lng_max: 40.0,
  },
  'africa': {
    lat_min: -35.0,
    lat_max: 37.0,
    lng_min: -18.0,
    lng_max: 52.0,
  },
  'asia-pacific': {
    lat_min: -10.0,
    lat_max: 55.0,
    lng_min: 60.0,
    lng_max: 180.0,
  },
  'southeast-asia': {
    lat_min: -10.0,
    lat_max: 25.0,
    lng_min: 95.0,
    lng_max: 140.0,
  },
  'oceania': {
    lat_min: -47.0,
    lat_max: -10.0,
    lng_min: 110.0,
    lng_max: 180.0,
  },
} as const;

/**
 * Get region based on user coordinates
 * Returns the smallest (most specific) matching region when coordinates fall within multiple regions
 */
const getRegionFromCoordinates = (lat: number, lng: number): string => {
  const matches: Record<string, number> = {};

  for (const [region, bounds] of Object.entries(REGIONS)) {
    if (
      lat >= bounds.lat_min &&
      lat <= bounds.lat_max &&
      lng >= bounds.lng_min &&
      lng <= bounds.lng_max
    ) {
      const area = (bounds.lat_max - bounds.lat_min) * (bounds.lng_max - bounds.lng_min);
      matches[region] = area;
    }
  }

  if (Object.keys(matches).length === 0) {
    return 'global';
  }

  // Sort by area (ascending) and return the smallest region
  const sortedRegions = Object.entries(matches).sort(([, a], [, b]) => a - b);
  return sortedRegions[0][0];
};

export const useWebSocket = () => {
  const config = useRuntimeConfig();
  const { token } = useAuthentication();
  
  const echo = ref<Echo | null>(null);
  const connected = ref(false);
  const error = ref<string | null>(null);
  const currentRegion = ref<string | null>(null);
  const activeSpawnChannel = ref<any>(null);

  // Initialize Echo connection
  const connect = () => {
    if (echo.value || !token.value) return;

    try {
      // Set up Pusher
      window.Pusher = Pusher;

      echo.value = new Echo({
        broadcaster: 'reverb',
        key: config.public.wsKey,
        wsHost: config.public.wsHost,
        wsPort: config.public.wsPort,
        wssPort: config.public.wsPort,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        // auth: {
        //   headers: {
        //     Authorization: `Bearer ${token.value}`,
        //   },
        // },
      });

      echo.value.connector.pusher.connection.bind('connected', () => {
        connected.value = true;
        error.value = null;
        console.log('WebSocket connected');
      });

      echo.value.connector.pusher.connection.bind('disconnected', () => {
        connected.value = false;
        console.log('WebSocket disconnected');
      });

      echo.value.connector.pusher.connection.bind('error', (err: any) => {
        error.value = err.message || 'WebSocket connection error';
        console.error('WebSocket error:', err);
      });

    } catch (err: any) {
      console.error('Failed to initialize WebSocket:', err);
      error.value = err.message || 'Failed to initialize WebSocket';
    }
  };

  // Disconnect Echo
  const disconnect = () => {
    if (echo.value) {
      echo.value.disconnect();
      echo.value = null;
      connected.value = false;
    }
  };

  // Listen for spawn events
  const listenForSpawns = (lat: number, lng: number, callback: (data: any) => void) => {
    if (!echo.value) return;

    // Determine region based on coordinates
    const region = getRegionFromCoordinates(lat, lng);
    const channelName = `spawn-cycles.${region}`;

    // If we're already subscribed to this region, don't resubscribe
    if (currentRegion.value === region && activeSpawnChannel.value) {
      console.log(`📡 Already subscribed to ${channelName}`);
      return () => {
        if (activeSpawnChannel.value) {
          activeSpawnChannel.value.stopListening('.spawn-cycle.created');
          echo.value?.leaveChannel(channelName);
          activeSpawnChannel.value = null;
          currentRegion.value = null;
        }
      };
    }

    // Cleanup previous channel if exists
    if (activeSpawnChannel.value && currentRegion.value) {
      const oldChannelName = `spawn-cycles.${currentRegion.value}`;
      console.log(`🔄 Switching from ${oldChannelName} to ${channelName}`);
      activeSpawnChannel.value.stopListening('.spawn-cycle.created');
      echo.value?.leaveChannel(oldChannelName);
    }

    // Subscribe to the region-specific channel
    activeSpawnChannel.value = echo.value.channel(channelName);
    currentRegion.value = region;

    console.log(`📡 Subscribing to ${channelName} channel...`);
    
    // Debug: Log when channel is subscribed
    activeSpawnChannel.value.subscription.bind('pusher:subscription_succeeded', () => {
      console.log(`✅ Successfully subscribed to ${channelName} channel`);
    });

    activeSpawnChannel.value.subscription.bind('pusher:subscription_error', (error: any) => {
      console.error(`❌ Failed to subscribe to ${channelName} channel:`, error);
    });
    
    activeSpawnChannel.value.listen('.spawn-cycle.created', (data: any) => {
      console.log(`🎯 Spawn cycle update received from ${region}:`, data);
      callback({ type: 'spawn:created', data, region });
    });

    return () => {
      if (activeSpawnChannel.value) {
        activeSpawnChannel.value.stopListening('.spawn-cycle.created');
        echo.value?.leaveChannel(channelName);
        activeSpawnChannel.value = null;
        currentRegion.value = null;
      }
    };
  };

  // Listen for quest updates
  const listenForQuestUpdates = (callback: (data: any) => void) => {
    if (!echo.value) return;

    const channel = echo.value.private('quests');
    
    channel.listen('QuestProgressUpdated', (data: any) => {
      console.log('Quest progress updated:', data);
      callback({ type: 'quest:update', data });
    });

    channel.listen('QuestCompleted', (data: any) => {
      console.log('Quest completed:', data);
      callback({ type: 'quest:completed', data });
    });

    return () => {
      channel.stopListening('QuestProgressUpdated');
      channel.stopListening('QuestCompleted');
    };
  };

  // Listen for badge updates
  const listenForBadgeUpdates = (callback: (data: any) => void) => {
    if (!echo.value) return;

    const channel = echo.value.private('badges');
    
    channel.listen('BadgeEarned', (data: any) => {
      console.log('Badge earned:', data);
      callback({ type: 'badge:earned', data });
    });

    return () => {
      channel.stopListening('BadgeEarned');
    };
  };

  // Debug: Check active channels
  const getActiveChannels = () => {
    if (!echo.value) return [];
    return Object.keys(echo.value.connector.channels);
  };

  // Auto-connect when token is available
  watch(token, (newToken) => {
    if (newToken && !echo.value) {
      connect();
    } else if (!newToken && echo.value) {
      disconnect();
    }
  }, { immediate: true });

  // Cleanup on unmount
  onBeforeUnmount(() => {
    disconnect();
  });

  return {
    echo: readonly(echo),
    connected: readonly(connected),
    error: readonly(error),
    currentRegion: readonly(currentRegion),
    connect,
    disconnect,
    listenForSpawns,
    listenForQuestUpdates,
    listenForBadgeUpdates,
    getActiveChannels,
    getRegionFromCoordinates,
  };
};