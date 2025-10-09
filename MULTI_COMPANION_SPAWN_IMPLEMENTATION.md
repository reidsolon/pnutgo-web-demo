# Multi-Companion Spawn Implementation

## Overview

This document describes the implementation of multi-companion spawn functionality in the PnutGo application. The system has been enhanced to support spawns that can contain multiple companions, while maintaining full backward compatibility with existing single-companion spawns.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Database Schema Changes](#database-schema-changes)
- [Model Changes](#model-changes)
- [Action Changes](#action-changes)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Migration Guide](#migration-guide)
- [API Impact](#api-impact)

## Architecture Overview

The multi-companion spawn system introduces a hybrid approach:

1. **Legacy Mode**: Existing single companion spawns continue to use the `companion_id` field directly
2. **Multi-Companion Mode**: New spawns can have multiple companions via the `spawn_companions` pivot table
3. **Unified Interface**: Both modes are accessible through consistent model methods and actions

### Key Design Decisions

- **Backward Compatibility**: Existing spawns continue to work without modification
- **Gradual Migration**: New spawns can use either single or multi-companion approach
- **Data Integrity**: Foreign key constraints ensure referential integrity
- **Flexible Capture**: Users can select specific companions from multi-companion spawns

## Database Schema Changes

### New Table: `spawn_companions`

```sql
CREATE TABLE spawn_companions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    spawn_id BIGINT UNSIGNED NOT NULL,
    companion_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (spawn_id) REFERENCES spawns(id) ON DELETE CASCADE,
    FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_spawn_companion (spawn_id, companion_id),
    INDEX idx_spawn_id (spawn_id),
    INDEX idx_companion_id (companion_id)
);
```

### Modified Table: `spawns`

```sql
-- companion_id is now nullable to support multi-companion spawns
ALTER TABLE spawns 
MODIFY COLUMN companion_id BIGINT UNSIGNED NULL;
```

### Migration Files

- `2025_09_25_122241_create_spawn_companions_table.php`
- `2025_09_25_122308_make_companion_id_nullable_in_spawns_table.php`

## Model Changes

### New Model: `SpawnCompanion`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class SpawnCompanion extends Pivot
{
    protected $table = 'spawn_companions';
    
    protected $fillable = [
        'spawn_id',
        'companion_id',
    ];

    public function spawn(): BelongsTo
    {
        return $this->belongsTo(Spawn::class);
    }

    public function companion(): BelongsTo
    {
        return $this->belongsTo(Companion::class);
    }
}
```

### Enhanced `Spawn` Model

#### New Relationships

```php
public function companions(): BelongsToMany
{
    return $this->belongsToMany(Companion::class, 'spawn_companions')
        ->using(SpawnCompanion::class)
        ->withTimestamps();
}
```

#### New Helper Methods

```php
/**
 * Get all companions for this spawn (both single and multiple)
 */
public function getAllCompanions()
{
    if ($this->companion_id) {
        return collect([$this->companion]);
    }
    return $this->companions;
}

/**
 * Check if this spawn has multiple companions
 */
public function hasMultipleCompanions(): bool
{
    return $this->companions()->count() > 1;
}

/**
 * Check if this spawn is a legacy single companion spawn
 */
public function isLegacySpawn(): bool
{
    return $this->companion_id !== null;
}

/**
 * Get the primary companion for display purposes
 */
public function getPrimaryCompanion(): ?Companion
{
    if ($this->companion_id) {
        return $this->companion;
    }
    return $this->companions()->first();
}
```

### Enhanced `Companion` Model

#### New Relationship

```php
public function spawnCompanions(): BelongsToMany
{
    return $this->belongsToMany(Spawn::class, 'spawn_companions')
        ->using(SpawnCompanion::class)
        ->withTimestamps();
}
```

## Action Changes

### Enhanced `GenerateSpawnsAction`

#### Method Signature Change

```php
public function execute(float $lat, float $lng, float $radius = 0.01, ?array $companionIds = null): Collection
```

#### New Functionality

1. **Single Companion Creation**: When one companion ID is provided
2. **Multi-Companion Creation**: When multiple companion IDs are provided  
3. **Legacy Behavior**: When no companion IDs provided (uses spawn rules)

#### Implementation Details

```php
// Multi-companion spawn creation
private function createMultiCompanionSpawn(array $companionIds, float $lat, float $lng, float $radius): Collection
{
    $spawnLocation = $this->generateSpawnLocation($lat, $lng, $radius);
    
    $spawn = Spawn::create([
        'companion_id' => null, // Multi-companion spawn
        'lat' => $spawnLocation['lat'],
        'lng' => $spawnLocation['lng'],
        'spawned_at' => now(),
        'expires_at' => now()->addHours(2),
    ]);

    // Attach companions to spawn via pivot table
    $spawn->companions()->attach($companionIds);
    
    return collect([$spawn->load('companions')]);
}
```

### Enhanced `CaptureCompanionAction`

#### Method Signature Change

```php
public function execute(User $user, Spawn $spawn, ?int $companionId = null): UserCompanion
```

#### New Functionality

1. **Companion Selection**: Users can specify which companion to capture from multi-companion spawns
2. **Validation**: Ensures the requested companion exists in the spawn
3. **Progressive Capture**: Multi-companion spawns are only marked as captured when all companions are captured

#### Key Methods

```php
private function determineTargetCompanion(Spawn $spawn, ?int $companionId): Companion
{
    // For legacy single companion spawns
    if ($spawn->isLegacySpawn()) {
        if ($companionId && $companionId !== $spawn->companion_id) {
            throw new \InvalidArgumentException('Specified companion is not available in this spawn');
        }
        return $spawn->companion;
    }

    // For multi-companion spawns
    $availableCompanions = $spawn->companions;
    
    if ($companionId) {
        $targetCompanion = $availableCompanions->firstWhere('id', $companionId);
        if (!$targetCompanion) {
            throw new \InvalidArgumentException('Specified companion is not available in this spawn');
        }
        return $targetCompanion;
    }

    // Default to first companion if no specific companion requested
    return $availableCompanions->first();
}

private function areAllCompanionsCaptured(Spawn $spawn): bool
{
    if ($spawn->isLegacySpawn()) {
        return $spawn->isCaptured();
    }

    $totalCompanions = $spawn->companions()->count();
    $capturedCompanions = UserCompanion::where('spawn_id', $spawn->id)
        ->distinct('companion_id')
        ->count();
    
    return $capturedCompanions >= $totalCompanions;
}
```

## Usage Examples

### Creating Single Companion Spawn

```php
$generateAction = new GenerateSpawnsAction();

// Legacy approach (uses spawn rules)
$spawns = $generateAction->execute(14.5995, 120.9842, 0.01);

// Direct single companion approach
$spawns = $generateAction->execute(14.5995, 120.9842, 0.01, [123]);
```

### Creating Multi-Companion Spawn

```php
$generateAction = new GenerateSpawnsAction();

// Create spawn with multiple companions
$companionIds = [123, 456, 789];
$spawns = $generateAction->execute(14.5995, 120.9842, 0.01, $companionIds);
```

### Capturing from Multi-Companion Spawn

```php
$captureAction = new CaptureCompanionAction();

// Capture specific companion from multi-companion spawn
$userCompanion = $captureAction->execute($user, $spawn, $companionId);

// Capture default companion (first one)
$userCompanion = $captureAction->execute($user, $spawn);
```

### Checking Spawn Type

```php
// Check if spawn has multiple companions
if ($spawn->hasMultipleCompanions()) {
    $companions = $spawn->getAllCompanions();
    // Present companion selection UI
}

// Check if legacy spawn
if ($spawn->isLegacySpawn()) {
    $companion = $spawn->companion;
    // Handle single companion
}

// Get primary companion for display
$primaryCompanion = $spawn->getPrimaryCompanion();
```

## Testing

### Test Coverage

The implementation includes comprehensive tests covering:

#### `CaptureCompanionActionTest`
- ✅ Legacy single companion capture
- ✅ Multi-companion spawn capture with specific companion selection
- ✅ Multi-companion spawn capture with default companion
- ✅ Spawn marking as captured when all companions are captured
- ✅ Error handling for invalid companion selection
- ✅ Error handling for already captured companions

#### `GenerateSpawnsActionTest`
- ✅ Single companion spawn creation
- ✅ Multi-companion spawn creation
- ✅ Pivot table record creation
- ✅ Location generation for multi-companion spawns
- ✅ Legacy spawn rule behavior

### Running Tests

```bash
# Run all spawn-related tests
php artisan test --filter=Spawn

# Run specific action tests
php artisan test --filter=CaptureCompanionActionTest
php artisan test --filter=GenerateSpawnsActionTest

# Run all tests to ensure no regressions
php artisan test
```

## Migration Guide

### For Existing Applications

1. **Run Migrations**:
   ```bash
   php artisan migrate
   ```

2. **No Code Changes Required**: Existing functionality continues to work without modification

3. **Optional: Migrate to Multi-Companion**:
   ```php
   // Convert existing spawn to multi-companion (optional)
   $spawn = Spawn::find(1);
   if ($spawn->companion_id) {
       $spawn->companions()->attach($spawn->companion_id);
       $spawn->update(['companion_id' => null]);
   }
   ```

### Database Considerations

- **Storage**: Multi-companion spawns require additional storage in the pivot table
- **Indexing**: Proper indexes are in place for efficient queries
- **Performance**: No impact on existing single companion spawn queries

## API Impact

### Backward Compatibility

All existing API endpoints continue to work without changes:

- `GET /api/companions` - No changes
- `GET /api/map/companions` - No changes  
- `POST /api/map/spawns/{spawn}/capture` - No changes (captures default companion)

### New API Capabilities

#### Enhanced Capture Endpoint

The capture endpoint can now optionally accept a companion ID:

```http
POST /api/map/spawns/{spawn}/capture
Content-Type: application/json

{
  "companion_id": 123  // Optional: specify which companion to capture
}
```

#### Spawn Resource Enhancement

Spawn resources now include companion information for both modes:

```json
{
  "id": 1,
  "lat": 14.5995,
  "lng": 120.9842,
  "spawned_at": "2025-09-25T12:00:00Z",
  "expires_at": "2025-09-25T14:00:00Z",
  "is_legacy_spawn": false,
  "has_multiple_companions": true,
  "companion": null,  // null for multi-companion spawns
  "companions": [     // array for multi-companion spawns
    {
      "id": 123,
      "name": "Forest Spirit",
      "rarity": "rare"
    },
    {
      "id": 456,
      "name": "Water Nymph", 
      "rarity": "epic"
    }
  ]
}
```

## Performance Considerations

### Query Optimization

- **Eager Loading**: Use `with('companions')` for multi-companion spawns
- **Lazy Loading**: Single companion spawns continue to use existing relationships
- **Indexing**: Proper indexes on pivot table for efficient lookups

### Memory Usage

- **Legacy Spawns**: No additional memory overhead
- **Multi-Companion Spawns**: Minimal overhead for pivot table relationships

### Recommended Practices

```php
// Efficient querying for mixed spawn types
$spawns = Spawn::with(['companion', 'companions'])
    ->where('lat', '>', $minLat)
    ->where('lat', '<', $maxLat)
    ->get();

// Handle both types efficiently
foreach ($spawns as $spawn) {
    $companions = $spawn->getAllCompanions();
    // Process companions uniformly
}
```

## Future Enhancements

### Potential Improvements

1. **Companion Rarity Balancing**: Weight companion selection in multi-companion spawns by rarity
2. **Spawn Analytics**: Track capture rates for multi-companion vs single companion spawns
3. **UI Enhancements**: Implement companion selection interface for mobile app
4. **Advanced Capture Logic**: Allow capturing multiple companions from a single spawn simultaneously

### Migration Path

The current implementation provides a solid foundation for future enhancements while maintaining complete backward compatibility with existing functionality.

---

## Conclusion

The multi-companion spawn implementation successfully extends the PnutGo spawn system to support multiple companions per spawn while maintaining full backward compatibility. The hybrid approach allows for gradual adoption of the new functionality without disrupting existing gameplay or requiring immediate UI changes.

The implementation follows Laravel best practices, includes comprehensive test coverage, and provides clear migration paths for both data and application logic.
