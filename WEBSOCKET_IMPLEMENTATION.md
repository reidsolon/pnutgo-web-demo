# WebSocket Implementation Guide - Spawn Cycles

## Overview

This document outlines the WebSocket implementation for real-time spawn cycle updates using Laravel Reverb. The system automatically listens to the `spawn-cycles` channel and updates the map markers in real-time when new spawns are created or existing ones are updated.

## Architecture

```
Backend (Laravel Reverb)
    ↓
spawn-cycles channel
    ↓
useWebSocket composable
    ↓
useNearbySpawns composable
    ↓
LeafletMap component
    ↓
Real-time marker updates on map
```

## Backend Payload Structure

The backend broadcasts spawn cycle updates on the `spawn-cycles` channel with the following payload structure:

```php
[
    'spawn' => [
        'id' => $spawn->id,
        'lat' => (float) $spawn->lat,
        'lng' => (float) $spawn->lng,
        'places_address' => $spawn->places_address,
        'spawned_at' => $spawn->spawned_at?->toISOString(),
        'expires_at' => $spawn->expires_at?->toISOString(),
        'is_active' => $spawn->isActive(),
        'active_cycles' => SpawnCycleResource::collection($spawn->activeSpawnCycles)->toArray(request()),
    ],
]
```

## Frontend Implementation

### 1. WebSocket Composable (`composables/use-websocket.ts`)

**Updated Method: `listenForSpawns`**

The `listenForSpawns` method now handles both private spawn events and the public `spawn-cycles` channel:

```typescript
const listenForSpawns = (callback: (data: any) => void) => {
  if (!echo.value) return;

  // Listen to public spawn-cycles channel for real-time updates
  const cyclesChannel = echo.value.channel('spawn-cycles');
  
  cyclesChannel.listen('.spawn-cycles', (data: any) => {
    console.log('Spawn cycle update received:', data);
    callback({ type: 'spawn:cycle-update', data });
  });

  // Listen to private spawns channel for specific events (optional)
  const privateChannel = echo.value.private('spawns');
  
  privateChannel.listen('SpawnCreated', (data: any) => {
    console.log('New spawn created:', data);
    callback({ type: 'spawn:new', data });
  });

  privateChannel.listen('SpawnExpired', (data: any) => {
    console.log('Spawn expired:', data);
    callback({ type: 'spawn:despawn', data });
  });

  return () => {
    cyclesChannel.stopListening('.spawn-cycles');
    echo.value?.leaveChannel('spawn-cycles');
    privateChannel.stopListening('SpawnCreated');
    privateChannel.stopListening('SpawnExpired');
  };
};
```

**Features:**
- Connects to the **public** `spawn-cycles` channel for real-time spawn cycle updates
- Also listens to private `spawns` channel for spawn creation/expiration events
- Returns cleanup function to stop listening and leave all channels
- Automatically handles connection lifecycle
- All spawn-related events consolidated in one method

### 2. Nearby Spawns Composable (`composables/use-nearby-spawns.ts`)

**New Features:**

#### State Management
```typescript
const wsCleanup = ref<(() => void) | null>(null);
```

#### Event Handler
```typescript
const handleSpawnCycleUpdate = (payload: any): void => {
  if (!payload.spawn) {
    console.warn('Received spawn cycle update without spawn data:', payload);
    return;
  }

  const newSpawn: NearbySpawn = {
    id: payload.spawn.id,
    lat: payload.spawn.lat,
    lng: payload.spawn.lng,
    places_address: payload.spawn.places_address,
    distance: 0,
    capturable: false,
    show_silhouette: false,
    spawned_at: payload.spawn.spawned_at,
    expires_at: payload.spawn.expires_at,
    is_active: payload.spawn.is_active,
    active_cycles: payload.spawn.active_cycles || [],
  };

  // Update existing spawn or add new spawn
  const existingIndex = spawns.value.findIndex((s) => s.id === newSpawn.id);

  if (existingIndex !== -1) {
    spawns.value[existingIndex] = {
      ...spawns.value[existingIndex],
      ...newSpawn,
    };
    console.log('Updated existing spawn:', newSpawn.id);
  } else {
    spawns.value.push(newSpawn);
    console.log('Added new spawn:', newSpawn.id);
  }

  // Remove inactive spawns
  spawns.value = spawns.value.filter((spawn) => spawn.is_active);
};
```

#### WebSocket Management
```typescript
const initializeWebSocket = (): void => {
  if (wsCleanup.value) {
    console.log('WebSocket listener already initialized');
    return;
  }

  wsCleanup.value = listenForSpawnCycles(handleSpawnCycleUpdate);
  console.log('WebSocket listener initialized for spawn-cycles');
};

const cleanupWebSocket = (): void => {
  if (wsCleanup.value) {
    wsCleanup.value();
    wsCleanup.value = null;
    console.log('WebSocket listener cleaned up');
  }
};
```

#### Auto-initialization
```typescript
// Watch for WebSocket connection and initialize listener
watch(connected, (isConnected) => {
  if (isConnected && spawns.value.length > 0) {
    initializeWebSocket();
  } else if (!isConnected) {
    cleanupWebSocket();
  }
});

// Cleanup on unmount
onBeforeUnmount(() => {
  cleanupWebSocket();
});
```

### 3. LeafletMap Component (`components/LeafletMap.vue`)

**Real-time Marker Updates:**

```typescript
// Watch for spawns changes to update markers in real-time
watch(spawns, async () => {
  if (map.value && !spawnsLoading.value) {
    console.log('Spawns updated, refreshing markers...');
    await updateCompanionMarkers();
  }
}, { deep: true });
```

**Cleanup:**
```typescript
onUnmounted(() => {
  cleanupWebSocket();
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});
```

## How It Works

### 1. Initial Load
1. User navigates to the map page
2. `useAuthentication` connects to WebSocket via `auth.client.ts` plugin
3. User location is obtained
4. `fetchNearbySpawns()` is called with user coordinates
5. WebSocket listener is initialized after successful fetch

### 2. Real-time Updates
1. Backend broadcasts spawn cycle update to **public** `spawn-cycles` channel
2. `useWebSocket.listenForSpawns()` receives the event as `spawn:cycle-update` type
3. `handleSpawnEvent()` processes the payload based on event type:
   - `spawn:cycle-update`: Creates/updates spawn in state
   - `spawn:new`: Logs new spawn creation
   - `spawn:despawn`: Removes expired spawn from state
4. Vue's reactivity system detects state change
5. LeafletMap's watcher triggers `updateCompanionMarkers()`
6. Map markers are updated in real-time

### 3. Cleanup
1. Component unmounts or user navigates away
2. `cleanupWebSocket()` is called
3. WebSocket listener stops and leaves the channel
4. Map resources are released

## Usage Example

### In a Component
```vue
<script setup lang="ts">
const { 
  spawns, 
  loading, 
  error,
  fetchNearbySpawns,
  initializeWebSocket,
  cleanupWebSocket
} = useNearbySpawns();

// Fetch spawns
await fetchNearbySpawns(14.5995, 120.9842);

// WebSocket is auto-initialized after fetch
// spawns will update automatically when backend broadcasts to spawn-cycles channel

// Cleanup when done
onBeforeUnmount(() => {
  cleanupWebSocket();
});
</script>
```

## Configuration

### Environment Variables
Ensure these are set in your `.env` or `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      wsKey: process.env.NUXT_PUBLIC_WS_KEY,
      wsHost: process.env.NUXT_PUBLIC_WS_HOST,
      wsPort: process.env.NUXT_PUBLIC_WS_PORT,
    }
  }
});
```

### Channel Type
The `spawn-cycles` channel is configured as a **public channel** (no authentication required). This allows any connected client to receive spawn cycle updates in real-time.

```typescript
// Public channel (no auth required) - used for spawn-cycles
const channel = echo.value.channel('spawn-cycles');

// Private channel (auth required) - used for user-specific events
const channel = echo.value.private('spawns');

// Presence channel (auth + tracking) - if needed in future
const channel = echo.value.join('spawn-cycles');
```

**Why Public Channel?**
- Spawn cycles are location-based and visible to all users in the area
- No sensitive user data in spawn cycle broadcasts
- Lower latency without authentication overhead
- Scales better for many concurrent users

## Testing

### Manual Testing
1. Open the map page in your browser
2. Open browser DevTools console
3. Look for these log messages:
   - `"WebSocket connected"`
   - `"WebSocket listener initialized for spawn-cycles"`
   - `"Spawn cycle update received:"` (when updates arrive)
   - `"Updated existing spawn:"` or `"Added new spawn:"`

### Simulating Updates
From your Laravel backend, broadcast a test event:

```php
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('spawn-cycles')->broadcast([
    'spawn' => [
        'id' => 123,
        'lat' => 14.5995,
        'lng' => 120.9842,
        'places_address' => 'Test Location',
        'spawned_at' => now()->toISOString(),
        'expires_at' => now()->addHour()->toISOString(),
        'is_active' => true,
        'active_cycles' => [],
    ],
]);
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Missing spawn data**: Logs warning and returns early
2. **WebSocket disconnection**: Auto-reconnects and re-initializes listeners
3. **Component unmount**: Properly cleans up listeners and channels
4. **Connection failures**: Handled by `useWebSocket` error state

## Performance Considerations

1. **Marker Updates**: Uses Vue's reactivity to efficiently update only changed markers
2. **Memory Management**: Properly cleans up listeners and map resources
3. **State Management**: Uses `useState` for SSR-compatible state sharing
4. **Debouncing**: Consider adding debouncing if updates are too frequent:

```typescript
import { useDebounceFn } from '@vueuse/core';

const debouncedMarkerUpdate = useDebounceFn(async () => {
  await updateCompanionMarkers();
}, 500);

watch(spawns, () => {
  if (map.value && !spawnsLoading.value) {
    debouncedMarkerUpdate();
  }
}, { deep: true });
```

## Troubleshooting

### WebSocket Not Connecting
- Check environment variables are set correctly
- Verify Reverb is running on backend
- Check browser console for connection errors

### No Updates Received
- Verify channel name matches backend: `spawn-cycles`
- Check event name matches: `.spawn-cycles`
- Ensure backend is broadcasting to correct channel

### Markers Not Updating
- Check Vue DevTools for state changes in `spawns`
- Verify watcher is firing (add console.log)
- Ensure map instance exists before updating markers

## Future Enhancements

1. **Selective Updates**: Only update markers within viewport
2. **Animation**: Add smooth transitions for marker updates
3. **Notifications**: Show toast when new spawns appear nearby
4. **Batch Updates**: Batch multiple updates for better performance
5. **Reconnection Strategy**: Implement exponential backoff for reconnections

## References

- [Laravel Echo Documentation](https://laravel.com/docs/broadcasting#client-side-installation)
- [Laravel Reverb Documentation](https://laravel.com/docs/reverb)
- [Pusher Protocol](https://pusher.com/docs/channels/library_auth_reference/pusher-websockets-protocol/)
