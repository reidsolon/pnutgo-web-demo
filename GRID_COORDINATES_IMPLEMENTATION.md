# Grid Coordinates Implementation

## Overview
This document describes the implementation of the grid coordinate system for PnutGo. Grid coordinates convert geographic lat/lng positions into discrete integer cells, which is useful for location-based game mechanics, spawn management, and efficient real-time updates.

## Files Created

### 1. Composable: `app/composables/use-grid-coordinates.ts`
A comprehensive composable that provides grid coordinate functionality.

**Key Features:**
- Convert lat/lng to grid X/Y coordinates
- Get user's current grid position via Geolocation API
- Convert grid coordinates back to lat/lng (cell center)
- Check if two locations are in the same grid cell
- Get adjacent grid cells (3x3 surrounding cells)
- Calculate distance between grid cells
- Generate unique cell identifiers for WebSocket channels/caching

**Core Functions:**

```typescript
// Get grid coordinates from lat/lng
const coords = getGridCoordinates(14.5995, 120.9842);
// Returns: { gridX: 120984, gridY: 14599 }

// Get user's current grid position
const userCoords = await getUserGridCoordinates();

// Convert grid back to geographic coordinates
const location = gridToLocation(120984, 14599);
// Returns: { lat: 14.5995, lng: 120.9842 }

// Check if locations are in same cell
const isSame = areInSameGridCell(loc1, loc2);

// Get 9 surrounding cells (including center)
const cells = getAdjacentGridCells(120984, 14599);

// Generate unique cell ID for WebSocket/caching
const cellId = getGridCellId(120984, 14599);
// Returns: "120984:14599"
```

**Configuration:**
- Default grid cell size: `0.001` degrees (~111 meters)
- Adjustable via `GRID_CELL_SIZE` constant
- Options:
  - `0.001` = ~111m cells (detailed grid)
  - `0.01` = ~1.1km cells (medium grid)
  - `0.1` = ~11km cells (large grid)

### 2. Test Page: `app/pages/grid-test.vue`
A comprehensive test page demonstrating all grid coordinate features.

**Features:**
1. **User Location Detection**
   - Get current grid coordinates via GPS
   - Display grid X/Y values
   - Show cell ID and center coordinates
   - Error handling for permission denials

2. **Mini Map Visualization**
   - SVG-based map showing current grid cell
   - Animated user position marker (red dot with pulse effect)
   - Grid cell boundary highlighted in blue
   - Corner coordinates displayed
   - Shows exact position within cell
   - Cell size information

3. **Manual Coordinate Input**
   - Enter any lat/lng to calculate grid
   - Instant grid coordinate calculation
   - Cell ID generation

4. **Adjacent Cells Display**
   - Shows 9 cells in 3x3 grid
   - Center cell highlighted
   - Grid coordinate labels

5. **Information Section**
   - Grid system documentation
   - Cell size details
   - Use case examples

## Use Cases

### 1. Spawn Management
Group spawns by grid cell for efficient querying:
```typescript
const { getGridCoordinates, getGridCellId } = useGridCoordinates();

// When creating a spawn
const spawnCoords = getGridCoordinates(spawn.lat, spawn.lng);
const cellId = getGridCellId(spawnCoords.gridX, spawnCoords.gridY);

// Query spawns by cell ID
await db.spawns.where({ cellId }).find();
```

### 2. WebSocket Channels
Subscribe users to location-specific channels:
```typescript
const { getUserGridCoordinates, getGridCellId } = useGridCoordinates();

const userCoords = await getUserGridCoordinates();
if (userCoords) {
  const cellId = getGridCellId(userCoords.gridX, userCoords.gridY);
  
  // Subscribe to cell-specific channel
  Echo.channel(`grid.${cellId}`)
    .listen('SpawnCreated', (event) => {
      // Handle spawn in user's grid cell
    });
}
```

### 3. Nearby Player Detection
Find players in same or adjacent cells:
```typescript
const { getGridCoordinates, getAdjacentGridCells } = useGridCoordinates();

const userCoords = getGridCoordinates(userLat, userLng);
const nearbyCells = getAdjacentGridCells(userCoords.gridX, userCoords.gridY);

// Query players in nearby cells
const nearbyPlayers = await db.players
  .where('gridX').in(nearbyCells.map(c => c.gridX))
  .where('gridY').in(nearbyCells.map(c => c.gridY))
  .find();
```

### 4. Caching Strategy
Use grid cells as cache keys:
```typescript
const { getGridCoordinates, getGridCellId } = useGridCoordinates();

const coords = getGridCoordinates(lat, lng);
const cacheKey = `spawns:${getGridCellId(coords.gridX, coords.gridY)}`;

// Check cache first
let spawns = cache.get(cacheKey);
if (!spawns) {
  spawns = await fetchSpawnsForCell(coords.gridX, coords.gridY);
  cache.set(cacheKey, spawns, 300); // 5 min TTL
}
```

### 5. Load Optimization
Only load data for visible grid cells:
```typescript
const { getGridCoordinates, getAdjacentGridCells } = useGridCoordinates();

// Get user's cell and adjacent cells
const userCoords = getGridCoordinates(userLat, userLng);
const visibleCells = getAdjacentGridCells(userCoords.gridX, userCoords.gridY);

// Only fetch spawns for visible cells
const spawns = await Promise.all(
  visibleCells.map(cell => 
    fetchSpawnsForCell(cell.gridX, cell.gridY)
  )
);
```

## Integration Examples

### With Nearby Spawns Composable
```typescript
// app/composables/use-nearby-spawns.ts
import { useGridCoordinates } from './use-grid-coordinates';

export const useNearbySpawns = () => {
  const { getGridCoordinates, getAdjacentGridCells } = useGridCoordinates();
  
  const fetchNearbySpawns = async (lat: number, lng: number) => {
    // Get grid cell
    const coords = getGridCoordinates(lat, lng);
    
    // Fetch spawns for current and adjacent cells
    const cells = getAdjacentGridCells(coords.gridX, coords.gridY);
    const cellIds = cells.map(c => getGridCellId(c.gridX, c.gridY));
    
    // API call with grid cells
    const response = await apiClient('/nearby/spawns', {
      params: { 
        lat, 
        lng,
        grid_cells: cellIds.join(',') 
      }
    });
    
    return response.data;
  };
  
  return { fetchNearbySpawns };
};
```

### With WebSocket Composable
```typescript
// app/composables/use-websocket.ts
import { useGridCoordinates } from './use-grid-coordinates';

export const useWebSocket = () => {
  const { getGridCoordinates, getGridCellId, getAdjacentGridCells } = useGridCoordinates();
  const subscribedCells = ref<Set<string>>(new Set());
  
  const subscribeToUserLocation = async (lat: number, lng: number) => {
    const coords = getGridCoordinates(lat, lng);
    const cells = getAdjacentGridCells(coords.gridX, coords.gridY);
    
    // Subscribe to all adjacent cells
    cells.forEach(cell => {
      const cellId = getGridCellId(cell.gridX, cell.gridY);
      
      if (!subscribedCells.value.has(cellId)) {
        Echo.channel(`grid.${cellId}`)
          .listen('SpawnCreated', handleSpawnEvent);
        
        subscribedCells.value.add(cellId);
      }
    });
    
    // Unsubscribe from cells no longer visible
    subscribedCells.value.forEach(cellId => {
      const coords = parseGridCellId(cellId);
      if (!cells.some(c => c.gridX === coords.gridX && c.gridY === coords.gridY)) {
        Echo.leave(`grid.${cellId}`);
        subscribedCells.value.delete(cellId);
      }
    });
  };
  
  return { subscribeToUserLocation };
};
```

## Backend Integration

### Database Schema
Add grid columns to relevant tables:

```sql
-- Add to spawns table
ALTER TABLE spawns 
  ADD COLUMN grid_x INTEGER,
  ADD COLUMN grid_y INTEGER,
  ADD COLUMN grid_cell_id VARCHAR(50);

-- Add index for efficient queries
CREATE INDEX idx_spawns_grid ON spawns(grid_x, grid_y);
CREATE INDEX idx_spawns_grid_cell_id ON spawns(grid_cell_id);

-- Add to users table for location tracking
ALTER TABLE users
  ADD COLUMN last_grid_x INTEGER,
  ADD COLUMN last_grid_y INTEGER,
  ADD COLUMN last_grid_cell_id VARCHAR(50);
```

### Laravel Model
```php
// app/Models/Spawn.php
class Spawn extends Model
{
    protected static function booted()
    {
        static::creating(function ($spawn) {
            // Calculate grid coordinates
            $gridX = floor($spawn->lng / 0.001);
            $gridY = floor($spawn->lat / 0.001);
            
            $spawn->grid_x = $gridX;
            $spawn->grid_y = $gridY;
            $spawn->grid_cell_id = "{$gridX}:{$gridY}";
        });
    }
    
    // Query scope for grid cell
    public function scopeInGridCell($query, $gridX, $gridY)
    {
        return $query->where('grid_x', $gridX)
                    ->where('grid_y', $gridY);
    }
    
    // Query scope for adjacent cells
    public function scopeInAdjacentCells($query, $gridX, $gridY)
    {
        $cells = [];
        for ($dx = -1; $dx <= 1; $dx++) {
            for ($dy = -1; $dy <= 1; $dy++) {
                $cells[] = ['grid_x' => $gridX + $dx, 'grid_y' => $gridY + $dy];
            }
        }
        
        return $query->where(function($q) use ($cells) {
            foreach ($cells as $cell) {
                $q->orWhere(function($sq) use ($cell) {
                    $sq->where('grid_x', $cell['grid_x'])
                       ->where('grid_y', $cell['grid_y']);
                });
            }
        });
    }
}
```

### API Controller
```php
// app/Http/Controllers/Api/SpawnController.php
public function nearby(Request $request)
{
    $lat = $request->input('lat');
    $lng = $request->input('lng');
    
    // Calculate grid coordinates
    $gridX = floor($lng / 0.001);
    $gridY = floor($lat / 0.001);
    
    // Get spawns in current and adjacent cells
    $spawns = Spawn::inAdjacentCells($gridX, $gridY)
        ->active()
        ->get();
    
    return response()->json([
        'data' => $spawns,
        'meta' => [
            'grid_cell' => [
                'x' => $gridX,
                'y' => $gridY,
                'id' => "{$gridX}:{$gridY}"
            ]
        ]
    ]);
}
```

## Performance Benefits

1. **Reduced Database Queries**
   - Query by integer grid coordinates instead of floating-point ranges
   - Indexed grid columns are faster than geographic bounds queries

2. **Efficient Caching**
   - Cache data by grid cell ID
   - Predictable cache keys
   - Easy cache invalidation

3. **Optimized WebSocket Subscriptions**
   - Subscribe only to relevant grid cells
   - Reduce broadcast overhead
   - Scalable channel management

4. **Better Spatial Partitioning**
   - Distribute load across grid cells
   - Balance server resources
   - Efficient horizontal scaling

## Testing

### Access the Test Page
1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/grid-test`
3. Click "Get My Grid Coordinates" and allow location access
4. View your grid position on the mini map
5. Test manual coordinates with different lat/lng values

### Test Scenarios
- [ ] GPS location permission granted
- [ ] GPS location permission denied
- [ ] Manual coordinate input with valid values
- [ ] Manual coordinate input with invalid values
- [ ] Grid cell visualization accuracy
- [ ] Adjacent cells calculation
- [ ] Cell ID generation
- [ ] Coordinates near equator
- [ ] Coordinates near poles
- [ ] Negative coordinates (Southern/Western hemispheres)

## Future Enhancements

1. **Dynamic Grid Size**
   - Adjust cell size based on zoom level
   - Different sizes for urban vs rural areas

2. **Grid Hierarchy**
   - Multi-level grid system (macro → micro cells)
   - Efficient querying at different scales

3. **Grid Clustering**
   - Combine adjacent cells with low activity
   - Dynamic cell boundaries

4. **Analytics**
   - Track user movement patterns by grid
   - Popular grid cells for spawn placement

---

*Created: November 6, 2025*
*Grid Cell Size: 0.001 degrees (~111 meters)*
