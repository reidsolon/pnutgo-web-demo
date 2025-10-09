# WebSocket Quick Reference - Spawn Cycles

## Setup (Already Done for You)

The WebSocket is already configured and will work automatically when you:
1. Log in to the application
2. Navigate to the map page
3. Fetch nearby spawns

## Channel Details

**Channel Name**: `spawn-cycles`  
**Type**: Public (no auth required)  
**Event**: `.spawn-cycles`

## Backend Broadcasting

```php
// Broadcast from your Laravel backend
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('spawn-cycles')->broadcast([
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
]);
```

## Frontend Usage

### Automatic (Recommended)
Just use the map or fetch spawns - WebSocket automatically handles updates:

```vue
<script setup lang="ts">
const { spawns, fetchNearbySpawns } = useNearbySpawns();

// Fetch spawns - WebSocket listener auto-initializes
await fetchNearbySpawns(lat, lng);

// spawns will update automatically when backend broadcasts
</script>
```

### Manual Control (Advanced)
```vue
<script setup lang="ts">
const { 
  spawns,
  initializeWebSocket,
  cleanupWebSocket 
} = useNearbySpawns();

// Manually initialize listener
initializeWebSocket();

// Manually cleanup
cleanupWebSocket();
</script>
```

## Event Types

The frontend receives 3 types of spawn events:

1. **`spawn:cycle-update`** - Real-time spawn cycle updates (from public channel)
   - Automatically updates/adds spawn to map
   - Removes inactive spawns

2. **`spawn:new`** - New spawn created (from private channel)
   - Logs notification
   - Can trigger refetch if needed

3. **`spawn:despawn`** - Spawn expired (from private channel)
   - Removes spawn from map

## Console Logs to Look For

```bash
✅ "WebSocket connected"
✅ "WebSocket listener initialized for spawn events"
✅ "Spawn cycle update received:"
✅ "Updated existing spawn: 123"
✅ "Added new spawn: 456"
```

## Testing

### Quick Test
1. Open `/map` page
2. Open browser console
3. Have backend broadcast a spawn cycle update
4. Watch markers update in real-time

### Test Dashboard
Visit `/websocket-test` for a comprehensive testing interface with:
- Connection status
- Event logs
- Spawn list
- Manual controls

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No updates received | Check backend is broadcasting to `spawn-cycles` channel |
| WebSocket not connecting | Verify `NUXT_PUBLIC_WS_*` env variables |
| Markers not updating | Check console for "Spawns updated, refreshing markers..." |
| Updates stop after navigation | WebSocket re-initializes automatically on map page |

## Environment Variables

Ensure these are set in `.env`:

```bash
NUXT_PUBLIC_WS_KEY=your_reverb_key
NUXT_PUBLIC_WS_HOST=your_reverb_host
NUXT_PUBLIC_WS_PORT=8080
```

## Need More Info?

- **Full Documentation**: `WEBSOCKET_IMPLEMENTATION.md`
- **Changes Summary**: `WEBSOCKET_CHANGES_SUMMARY.md`
