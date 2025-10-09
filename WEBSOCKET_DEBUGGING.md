# WebSocket Debugging Guide

## Event Configuration

**Channel Name**: `spawn-cycles` (public channel)  
**Event Name**: `spawn-cycle.created`

## Debugging Steps

### 1. Check WebSocket Connection

Open the browser console and look for:
```
✅ WebSocket connected
```

If not connected, check:
- Environment variables are set correctly
- Reverb server is running on backend
- No CORS issues

### 2. Check Channel Subscription

After initializing the listener, you should see:
```
📡 Subscribing to spawn-cycles channel...
✅ Successfully subscribed to spawn-cycles channel
```

If you see an error:
```
❌ Failed to subscribe to spawn-cycles channel: [error details]
```

This indicates a subscription problem. Check:
- Channel name is correct: `spawn-cycles`
- Channel is public (no auth required)
- Reverb server is accepting subscriptions

### 3. Check Active Channels

In the console, you can check active channels. The test page at `/websocket-test` will show:
- Active channels list
- Should include `spawn-cycles`

### 4. Test Backend Broadcasting

From your Laravel backend, test broadcasting:

```php
use Illuminate\Support\Facades\Broadcast;

// Test broadcast
broadcast(new \App\Events\SpawnCycleCreated($spawn));

// Or manually:
Broadcast::channel('spawn-cycles')->broadcast('spawn-cycle.created', [
    'spawn' => [
        'id' => 1,
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

### 5. Check for Event Reception

When backend broadcasts, you should see in console:
```
🎯 Spawn cycle update received: { spawn: {...} }
```

If you don't see this:
- Verify event name matches: `spawn-cycle.created`
- Check channel name matches: `spawn-cycles`
- Ensure payload structure is correct

## Common Issues

### Issue 1: 404 error on /broadcasting/auth
**Symptoms**: `POST http://localhost:3000/broadcasting/auth 404 (Page not found: /broadcasting/auth)`

**Solution**: 
This error occurs when trying to authenticate for private channels. Since `spawn-cycles` is a **public channel**, the implementation has been updated to only use the public channel and not attempt to authenticate.

✅ **Fixed**: Removed private channel listeners that were causing the authentication request.

### Issue 2: Not receiving events
**Symptoms**: Channel subscribed but no events received

**Solutions**:
1. Check event name exactly matches: `spawn-cycle.created`
2. Verify backend is broadcasting to correct channel: `spawn-cycles`
3. Check Laravel event class has correct `broadcastOn()` and `broadcastAs()` methods

```php
public function broadcastOn()
{
    return new Channel('spawn-cycles'); // Use Channel for public
}

public function broadcastAs()
{
    return 'spawn-cycle.created'; // Must match frontend
}
```

### Issue 2: Subscription fails
**Symptoms**: `❌ Failed to subscribe to spawn-cycles channel`

**Solutions**:
1. Ensure channel is public (not private/presence)
2. Check Reverb server logs for errors
3. Verify WebSocket connection is established first

### Issue 3: Events received but not processed
**Symptoms**: Event logged but spawns not updating

**Solutions**:
1. Check payload structure matches expected format
2. Verify `handleSpawnEvent()` is processing `spawn:created` type
3. Check console for warnings about missing data

## Manual Testing with Browser Console

```javascript
// Check if Echo is available
window.Echo

// Check connection state
window.Echo.connector.pusher.connection.state

// List all channels
Object.keys(window.Echo.connector.channels)

// Check specific channel
window.Echo.connector.channels['spawn-cycles']

// Manually listen to channel (for testing)
window.Echo.channel('spawn-cycles')
  .listen('.spawn-cycle.created', (data) => {
    console.log('Manual listener received:', data);
  });
```

## Backend Event Example

Ensure your Laravel event looks like this:

```php
<?php

namespace App\Events;

use App\Models\Spawn;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SpawnCycleCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Spawn $spawn
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('spawn-cycles');
    }

    public function broadcastAs(): string
    {
        return 'spawn-cycle.created';
    }

    public function broadcastWith(): array
    {
        return [
            'spawn' => [
                'id' => $this->spawn->id,
                'lat' => (float) $this->spawn->lat,
                'lng' => (float) $this->spawn->lng,
                'places_address' => $this->spawn->places_address,
                'spawned_at' => $this->spawn->spawned_at?->toISOString(),
                'expires_at' => $this->spawn->expires_at?->toISOString(),
                'is_active' => $this->spawn->isActive(),
                'active_cycles' => SpawnCycleResource::collection($this->spawn->activeSpawnCycles)->toArray(request()),
            ],
        ];
    }
}
```

## Debugging Console Logs

Expected log sequence:

1. **Connection**:
   ```
   WebSocket connected
   ```

2. **Listener Initialization**:
   ```
   📡 Subscribing to spawn-cycles channel...
   WebSocket listener initialized for spawn events
   ```

3. **Subscription Success**:
   ```
   ✅ Successfully subscribed to spawn-cycles channel
   ```

4. **Event Reception** (when backend broadcasts):
   ```
   🎯 Spawn cycle update received: {spawn: {...}}
   Spawn event received: {type: 'spawn:created', data: {...}}
   Added new spawn: 123
   ```

5. **Map Update**:
   ```
   Spawns updated, refreshing markers...
   ```

## Reverb Server Logs

Check your Reverb server logs for:

```
[timestamp] Connection accepted from [ip]
[timestamp] Subscribed to channel: spawn-cycles
[timestamp] Broadcasting spawn-cycle.created to spawn-cycles
```

## Network Tab

In Chrome DevTools > Network > WS tab:
1. Find the WebSocket connection
2. Click on it
3. Go to "Messages" tab
4. You should see messages with:
   - `pusher:subscription_succeeded` for spawn-cycles
   - `spawn-cycle.created` when events are broadcast

## Still Not Working?

1. **Check environment variables**:
   ```bash
   NUXT_PUBLIC_WS_KEY=your_key
   NUXT_PUBLIC_WS_HOST=localhost
   NUXT_PUBLIC_WS_PORT=8080
   ```

2. **Verify Reverb is running**:
   ```bash
   php artisan reverb:start
   ```

3. **Test with simple broadcast**:
   ```bash
   php artisan tinker
   >>> broadcast(new \App\Events\SpawnCycleCreated($spawn));
   ```

4. **Enable Pusher debug mode** (add to `use-websocket.ts`):
   ```typescript
   window.Pusher.logToConsole = true;
   ```

5. **Check browser console for errors**:
   - Look for red errors
   - Check for CORS issues
   - Verify no ad blockers blocking WebSocket
