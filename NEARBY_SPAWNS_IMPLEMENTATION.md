# Nearby Spawns Implementation

## Overview
This document describes the implementation of the nearby spawns API integration for the PnutGo map feature.

## Files Created/Modified

### 1. New Composable: `app/composables/use-nearby-spawns.ts`
A composable that handles fetching and managing nearby companion spawns data.

**Features:**
- TypeScript interfaces for all API response types
- State management for spawns, loading, errors, and radius info
- `fetchNearbySpawns(lat, lng)` - Fetch spawns based on location
- `clearSpawns()` - Clear spawns data
- `getSpawnById(id)` - Get a specific spawn
- Computed properties:
  - `capturableSpawns` - Filter only capturable spawns
  - `spawnsByDistance` - Sort spawns by distance
  - `activeCompanionsCount` - Count total active companions

**State:**
- `spawns` - Array of nearby spawn objects
- `loading` - Loading state
- `error` - Error message if any
- `radiusInfo` - Radius settings from API (capture, discovery, load)

### 2. Modified Component: `app/components/LeafletMap.vue`
Updated to use the new nearby spawns composable and display real API data.

**Changes:**
- Integrated `useNearbySpawns` composable
- Updated spawn marker rendering to show all active cycles
- Added loading/error indicators for spawn data
- Updated companion info modal to show:
  - Companion name and rarity
  - Distance from user
  - Remaining captures
  - Expiry time
  - Capturable status
- Dynamic radius circles based on API radius info
- Support for silhouette display (show_silhouette flag)

## API Integration

### Endpoint
```
GET /api/nearby/spawns?lat={latitude}&lng={longitude}
```

### Response Structure
```typescript
{
  data: [
    {
      id: number;
      lat: number;
      lng: number;
      places_address: string;
      distance: number;
      capturable: boolean;
      show_silhouette: boolean;
      spawned_at: string;
      expires_at: string | null;
      is_active: boolean;
      active_cycles: [
        {
          id: number;
          companion: {
            id: number;
            name: string;
            rarity: 'common' | 'rare' | 'epic' | 'legendary';
            rarity_label: string;
          };
          expires_at: string;
          capture_limit: number;
          current_captures: number;
          remaining_captures: number;
          is_active: boolean;
        }
      ];
    }
  ];
  meta: {
    count: number;
    search_location: { lat: string; lng: string; };
    radius_info: {
      capture_radius_meters: number;
      discovery_radius_meters: number;
      load_radius_meters: number;
    };
  };
}
```

## Features Implemented

### 1. Real-time Spawn Loading
- Spawns are fetched when user location is obtained
- Loading indicator shows while fetching
- Error handling with user-friendly messages

### 2. Multi-Companion Spawns
- Each spawn can have multiple active cycles
- Each cycle represents a different companion
- Markers are created for each active cycle

### 3. Visual Indicators
- **Capturable**: Green pulse indicator, animated bounce
- **Silhouette**: Question mark icon, reduced opacity
- **Rarity Colors**:
  - Common: Gray gradient
  - Rare: Blue-purple gradient
  - Epic: Purple-pink gradient
  - Legendary: Yellow-orange gradient

### 4. Radius Visualization
- Three radius types from API:
  - Capture radius (green) - Within this range, companions can be captured
  - Discovery radius (yellow) - Companions visible in full detail
  - Load radius (gray/shadow) - All spawns loaded from API
- Toggle buttons to show/hide each radius
- Dynamic values from API response

### 5. Companion Info Modal
- Displays when clicking on a marker
- Shows:
  - Companion name and rarity
  - Distance from user
  - Remaining captures vs total limit
  - Time until expiry
  - Capturable status
  - Capture button (if capturable)

### 6. State Management
- Uses `useState` for SSR-compatible reactive state
- Readonly exports to prevent direct mutations
- Proper cleanup and error handling

## Usage Example

```vue
<script setup lang="ts">
const { userLocation } = useUserLocation();

// The composable is auto-imported
const {
  spawns,
  loading,
  error,
  radiusInfo,
  fetchNearbySpawns,
  capturableSpawns,
  spawnsByDistance,
  activeCompanionsCount
} = useNearbySpawns();

// Fetch spawns when location changes
watch(userLocation, async (newLocation) => {
  if (newLocation) {
    await fetchNearbySpawns(newLocation.lat, newLocation.lng);
  }
});

// Access computed values
console.log('Total active companions:', activeCompanionsCount.value);
console.log('Capturable spawns:', capturableSpawns.value);
console.log('Closest spawns:', spawnsByDistance.value);
</script>
```

## Future Enhancements

### To Be Implemented:
1. **Capture API Integration**
   - Replace mock capture with actual API call
   - Endpoint: `POST /api/map/spawns/{id}/capture`
   - Include companion_id for multi-companion spawns

2. **Auto-refresh**
   - Periodic refresh of spawns (every 30-60 seconds)
   - Check for expired companions
   - Update capture limits

3. **Real-time Updates**
   - WebSocket integration for live spawn updates
   - Notifications when new companions spawn nearby
   - Real-time capture count updates

4. **Caching**
   - Cache spawn data to reduce API calls
   - Smart refresh based on user movement
   - Offline support with cached data

5. **Performance Optimizations**
   - Lazy load markers when zooming
   - Cluster markers when too many spawns
   - Debounce location updates

## Testing Checklist

- [ ] Spawns load when map is initialized
- [ ] Loading indicator appears during fetch
- [ ] Error message displays on API failure
- [ ] Markers appear on map for each spawn
- [ ] Multiple markers for multi-companion spawns
- [ ] Clicking marker opens info modal
- [ ] Modal displays correct companion information
- [ ] Capturable spawns show capture button
- [ ] Non-capturable spawns show "Too Far" status
- [ ] Radius circles display correctly
- [ ] Radius toggle buttons work
- [ ] Map centers on user location
- [ ] Spawns refresh after location change
- [ ] Expiry time updates correctly

## Notes

- No tests written per user request
- Mock capture functionality (to be replaced with real API)
- Follow project's component and composable guidelines
- All state management uses Nuxt's `useState` for SSR compatibility
- TypeScript types are fully defined for all API responses
