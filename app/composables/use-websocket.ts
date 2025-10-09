import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Extend window object for Pusher
declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

export const useWebSocket = () => {
  const config = useRuntimeConfig();
  const { token } = useAuthentication();
  
  const echo = ref<Echo | null>(null);
  const connected = ref(false);
  const error = ref<string | null>(null);

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
  const listenForSpawns = (callback: (data: any) => void) => {
    if (!echo.value) return;

    // Listen to public spawn-cycles channel for real-time updates
    const cyclesChannel = echo.value.channel('spawn-cycles');

    console.log('📡 Subscribing to spawn-cycles channel...');
    
    // Debug: Log when channel is subscribed
    cyclesChannel.subscription.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Successfully subscribed to spawn-cycles channel');
    });

    cyclesChannel.subscription.bind('pusher:subscription_error', (error: any) => {
      console.error('❌ Failed to subscribe to spawn-cycles channel:', error);
    });
    
    cyclesChannel.listen('.spawn-cycle.created', (data: any) => {
      console.log('🎯 Spawn cycle update received:', data);
      callback({ type: 'spawn:created', data });
    });

    return () => {
      cyclesChannel.stopListening('.spawn-cycle.created');
      echo.value?.leaveChannel('spawn-cycles');
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
    connect,
    disconnect,
    listenForSpawns,
    listenForQuestUpdates,
    listenForBadgeUpdates,
    getActiveChannels
  };
};