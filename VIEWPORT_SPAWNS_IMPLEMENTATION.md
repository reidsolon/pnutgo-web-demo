# Viewport-Based Spawns Implementation

## Overview
This implementation adds viewport-based spawn fetching that displays static purple circle markers on the map for spawns outside the discovery radius.

## Features

### 1. Viewport Bounds API Integration
- **Endpoint**: `/api/v1/viewport/spawns`
- **Parameters**:
  - `ne_lat`: Northeast latitude (top-right corner of viewport)
  - `ne_lng`: Northeast longitude (top-right corner of viewport)
  - `sw_lat`: Southwest latitude (bottom-left corner of viewport)
  - `sw_lng`: Southwest longitude (bottom-left corner of viewport)
  - `user_lat`: User's current latitude
  - `user_lng`: User's current longitude

### 2. Response Format
```typescript
{
  data: [
    {
      id: number,
      lat: number,
      lng: number
    }
  ],
  http_status: number,
  success: boolean
}
```

### 3. Visual Representation
- **Marker Type**: Small purple circles (CircleMarker)
- **Color**: Purple (#9333ea fill, #7c3aed border)
- **Radius**: 6 pixels
- **Opacity**: 80% border, 60% fill
- **Tooltip**: Shows spawn ID on hover

## Implementation Details

### Composable: `use-distant-spawns.ts`

#### Key Functions:
1. **`fetchViewportSpawns(bounds, userLat, userLng, forceRefresh)`**
   - Fetches spawns within the viewport bounds
   - Uses caching to reduce API calls
   - Cache duration: 2 minutes
   - Cache invalidation: When bounds differ by more than ~1km

2. **Caching Strategy**:
   - Stores viewport bounds with spawn data
   - Compares new bounds with cached bounds
   - Only fetches if bounds changed significantly or cache expired

### LeafletMap Component Updates

#### New State:
- `distantSpawns`: Array of distant spawn data
- `distantSpawnMarkers`: Array of Leaflet marker references
- `moveEndTimeout`: Debounce timeout for map movement

#### Event Handling:
1. **`moveend` Event**: Triggered when map camera stops moving
2. **Debounce**: 500ms delay after movement stops before fetching
3. **Automatic Update**: Markers update reactively when data changes

#### New Functions:
1. **`handleMapMoveEnd()`**: Debounces viewport spawn fetching
2. **`fetchViewportSpawnsDebounced()`**: Gets current map bounds and fetches spawns
3. **`updateDistantSpawnMarkers()`**: Renders purple circle markers for distant spawns

## Usage Flow

1. **Map Initialization**: 
   - Map loads with tile layers and user marker
   - `moveend` event listener is registered

2. **Camera Movement**:
   - User pans or zooms the map
   - Movement triggers `moveend` event

3. **Debounced Fetch**:
   - After 500ms of no movement, viewport spawns are fetched
   - Current map bounds are calculated
   - API request includes bounds and user location

4. **Marker Display**:
   - Response data is stored in state
   - Purple circle markers are rendered for each spawn
   - Old markers are removed before adding new ones

5. **Cache Optimization**:
   - Subsequent requests check cache first
   - Cache is valid for 2 minutes
   - Cache is invalidated if bounds change significantly

## Performance Considerations

### Debouncing
- 500ms delay prevents excessive API calls during rapid map movements
- User can continuously pan/zoom without triggering multiple requests

### Caching
- Reduces redundant API calls for similar viewport bounds
- 2-minute cache duration balances freshness with performance
- ~1km threshold prevents cache hits for significantly different views

### Marker Management
- Old markers are properly removed before adding new ones
- Prevents memory leaks from abandoned markers
- Efficient marker creation using Leaflet's CircleMarker

## Error Handling
- Loading states are displayed to users
- Errors are caught and logged
- Cache is cleared on errors to prevent stale data
- Graceful fallback: No markers shown if fetch fails

## Future Enhancements
1. Cluster markers when many spawns are in viewport
2. Different colors/sizes based on spawn rarity
3. Click interaction to show spawn details
4. Animation when markers appear/disappear
5. Filter controls to show/hide distant spawns
