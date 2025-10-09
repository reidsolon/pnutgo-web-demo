# Quick Reference: Using the Nearby Spawns API

## Composable API

### Import (Auto-imported by Nuxt)
```typescript
const { 
  spawns, 
  loading, 
  error, 
  radiusInfo,
  fetchNearbySpawns,
  clearSpawns,
  getSpawnById,
  capturableSpawns,
  spawnsByDistance,
  activeCompanionsCount
} = useNearbySpawns();
```

## Methods

### `fetchNearbySpawns(lat: number, lng: number): Promise<void>`
Fetch nearby spawns from the API.

```typescript
await fetchNearbySpawns(14.5995, 120.9842);
```

### `clearSpawns(): void`
Clear all spawns data.

```typescript
clearSpawns();
```

### `getSpawnById(spawnId: number): NearbySpawn | undefined`
Get a specific spawn by ID.

```typescript
const spawn = getSpawnById(18);
```

## State (Readonly)

### `spawns: Ref<NearbySpawn[]>`
Array of all spawns from the API.

```typescript
console.log(spawns.value.length); // Number of spawns
```

### `loading: Ref<boolean>`
Loading state during API fetch.

```typescript
if (loading.value) {
  // Show loading indicator
}
```

### `error: Ref<string | null>`
Error message if API call fails.

```typescript
if (error.value) {
  console.error(error.value);
}
```

### `radiusInfo: Ref<RadiusInfo | null>`
Radius settings from the API.

```typescript
if (radiusInfo.value) {
  console.log(radiusInfo.value.capture_radius_meters); // e.g., 30
  console.log(radiusInfo.value.discovery_radius_meters); // e.g., 500
  console.log(radiusInfo.value.load_radius_meters); // e.g., 700
}
```

## Computed Properties

### `capturableSpawns: ComputedRef<NearbySpawn[]>`
Only spawns that can be captured.

```typescript
const canCapture = capturableSpawns.value.filter(spawn => spawn.capturable);
```

### `spawnsByDistance: ComputedRef<NearbySpawn[]>`
Spawns sorted by distance (closest first).

```typescript
const nearest = spawnsByDistance.value[0];
```

### `activeCompanionsCount: ComputedRef<number>`
Total number of active companions across all spawns.

```typescript
console.log(`${activeCompanionsCount.value} companions nearby`);
```

## TypeScript Types

### `NearbySpawn`
```typescript
interface NearbySpawn {
  id: number;
  lat: number;
  lng: number;
  places_address: string;
  distance: number; // meters
  capturable: boolean;
  show_silhouette: boolean;
  spawned_at: string; // ISO date string
  expires_at: string | null;
  is_active: boolean;
  active_cycles: ActiveCycle[];
}
```

### `ActiveCycle`
```typescript
interface ActiveCycle {
  id: number;
  companion: Companion;
  expires_at: string; // ISO date string
  capture_limit: number;
  current_captures: number;
  remaining_captures: number;
  is_active: boolean;
}
```

### `Companion`
```typescript
interface Companion {
  id: number;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  rarity_label: string; // e.g., "Common", "Rare"
}
```

### `RadiusInfo`
```typescript
interface RadiusInfo {
  capture_radius_meters: number;
  discovery_radius_meters: number;
  load_radius_meters: number;
}
```

## Common Patterns

### Fetch spawns on location change
```typescript
watch(() => userLocation.value, async (newLocation) => {
  if (newLocation) {
    await fetchNearbySpawns(newLocation.lat, newLocation.lng);
  }
}, { deep: true });
```

### Display loading state
```vue
<div v-if="loading">
  <Icon name="heroicons:arrow-path" class="animate-spin" />
  <span>Loading companions...</span>
</div>
```

### Display error state
```vue
<div v-if="error" class="error-message">
  {{ error }}
</div>
```

### Show spawn count
```vue
<div>
  {{ activeCompanionsCount }} companion{{ activeCompanionsCount !== 1 ? 's' : '' }} nearby
</div>
```

### Filter by rarity
```typescript
const legendarySpawns = spawns.value.filter(spawn => 
  spawn.active_cycles.some(cycle => 
    cycle.companion.rarity === 'legendary'
  )
);
```

### Get closest capturable spawn
```typescript
const closestCapturable = spawnsByDistance.value.find(spawn => spawn.capturable);
```

### Check if any spawns are capturable
```typescript
const hasCapturable = capturableSpawns.value.length > 0;
```

## API Endpoint

```
GET https://api.pnutgo-new.test/api/nearby/spawns?lat={lat}&lng={lng}
```

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `lat` (required): Latitude coordinate
- `lng` (required): Longitude coordinate

**Response**: See TypeScript types above
