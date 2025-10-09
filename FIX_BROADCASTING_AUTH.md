# Fix: Removed Broadcasting Auth 404 Error

## Issue
When connecting to WebSocket, the browser was making a request to `/broadcasting/auth` which resulted in a 404 error:
```
POST http://localhost:3000/broadcasting/auth 404 (Page not found: /broadcasting/auth)
```

## Root Cause
The code was attempting to subscribe to a **private channel** (`spawns`) which requires authentication. Laravel Echo automatically tries to authenticate private channels by calling the `/broadcasting/auth` endpoint.

## Solution
Since `spawn-cycles` is a **public channel** and doesn't require authentication, I removed the private channel listeners from `listenForSpawns()`.

### What Was Removed:
```typescript
// ❌ Removed - This was causing the auth request
const privateChannel = echo.value.private('spawns');

privateChannel.listen('SpawnCreated', (data: any) => {
  console.log('New spawn created:', data);
  callback({ type: 'spawn:new', data });
});

privateChannel.listen('SpawnExpired', (data: any) => {
  console.log('Spawn expired:', data);
  callback({ type: 'spawn:despawn', data });
});
```

### What Remains:
```typescript
// ✅ Kept - Public channel, no auth required
const cyclesChannel = echo.value.channel('spawn-cycles');

cyclesChannel.listen('spawn-cycle.created', (data: any) => {
  console.log('🎯 Spawn cycle update received:', data);
  callback({ type: 'spawn:created', data });
});
```

## Result
✅ No more 404 errors  
✅ Only subscribes to public `spawn-cycles` channel  
✅ No authentication required  
✅ Cleaner, simpler implementation  

## If You Need Private Channels Later

If you need to add private channels in the future, you'll need to:

1. **Enable auth in Echo config** (`use-websocket.ts`):
```typescript
echo.value = new Echo({
  broadcaster: 'reverb',
  key: config.public.wsKey,
  wsHost: config.public.wsHost,
  wsPort: config.public.wsPort,
  wssPort: config.public.wsPort,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  auth: {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
  },
});
```

2. **Create auth endpoint in Nuxt** (`server/api/broadcasting/auth.post.ts`):
```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '');
  
  // Forward auth request to Laravel backend
  const response = await $fetch('http://your-backend/broadcasting/auth', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body,
  });
  
  return response;
});
```

3. **Then use private channels**:
```typescript
const privateChannel = echo.value.private('spawns');
```

## Current Configuration

**Channel**: `spawn-cycles` (public)  
**Event**: `spawn-cycle.created`  
**Auth Required**: ❌ No  
**Endpoint**: None needed  
