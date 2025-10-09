# Multi-Companion Spawn Quick Reference

## Quick Start Guide

This is a condensed reference for developers working with the new multi-companion spawn system.

## Key Concepts

- **Legacy Spawn**: Single companion spawn using `companion_id` field (backward compatible)
- **Multi-Companion Spawn**: Multiple companions using `spawn_companions` pivot table
- **Hybrid System**: Both types coexist seamlessly

## Common Patterns

### Creating Spawns

```php
use App\Actions\GenerateSpawnsAction;

$action = new GenerateSpawnsAction();

// Legacy/automatic (uses spawn rules)
$spawns = $action->execute($lat, $lng, $radius);

// Single companion
$spawns = $action->execute($lat, $lng, $radius, [123]);

// Multi-companion  
$spawns = $action->execute($lat, $lng, $radius, [123, 456, 789]);
```

### Capturing Companions

```php
use App\Actions\CaptureCompanionAction;

$action = new CaptureCompanionAction();

// Capture from legacy spawn (no companion ID needed)
$userCompanion = $action->execute($user, $spawn);

// Capture specific companion from multi-companion spawn
$userCompanion = $action->execute($user, $spawn, $companionId);

// Capture default companion from multi-companion spawn
$userCompanion = $action->execute($user, $spawn);
```

### Working with Spawn Models

```php
// Check spawn type
if ($spawn->isLegacySpawn()) {
    $companion = $spawn->companion;
} else {
    $companions = $spawn->companions;
}

// Get all companions (works for both types)
$allCompanions = $spawn->getAllCompanions();

// Get primary companion for display
$primary = $spawn->getPrimaryCompanion();

// Check if multi-companion
if ($spawn->hasMultipleCompanions()) {
    // Show companion selection UI
}
```

### Database Queries

```php
// Efficient loading for mixed spawn types
$spawns = Spawn::with(['companion', 'companions'])
    ->isActive()
    ->get();

// Query multi-companion spawns specifically
$multiSpawns = Spawn::whereNull('companion_id')
    ->with('companions')
    ->get();

// Query legacy spawns specifically  
$legacySpawns = Spawn::whereNotNull('companion_id')
    ->with('companion')
    ->get();
```

## Model Methods Reference

### Spawn Model

| Method | Description | Returns |
|--------|-------------|---------|
| `isLegacySpawn()` | Check if single companion spawn | `bool` |
| `hasMultipleCompanions()` | Check if multi-companion spawn | `bool` |
| `getAllCompanions()` | Get all companions (unified interface) | `Collection` |
| `getPrimaryCompanion()` | Get main companion for display | `Companion\|null` |
| `companions()` | Many-to-many relationship | `BelongsToMany` |

### Action Parameters

#### GenerateSpawnsAction::execute()
- `float $lat` - Latitude
- `float $lng` - Longitude  
- `float $radius = 0.01` - Spawn radius
- `?array $companionIds = null` - Optional companion IDs

#### CaptureCompanionAction::execute()
- `User $user` - User capturing
- `Spawn $spawn` - Spawn to capture from
- `?int $companionId = null` - Optional specific companion

## Testing Patterns

```php
// Test multi-companion spawn creation
$spawn = Spawn::factory()->create(['companion_id' => null]);
$spawn->companions()->attach([123, 456]);

// Test capture with specific companion
$action = new CaptureCompanionAction();
$result = $action->execute($user, $spawn, $companionId);

// Assert spawn type
expect($spawn->isLegacySpawn())->toBeFalse();
expect($spawn->hasMultipleCompanions())->toBeTrue();
```

## Migration Commands

```bash
# Run the migrations
php artisan migrate

# Check migration status
php artisan migrate:status

# Run tests
php artisan test --filter=Spawn
```

## Database Schema

### spawn_companions Table
```sql
spawn_id (foreign key to spawns.id)
companion_id (foreign key to companions.id)
created_at, updated_at
UNIQUE(spawn_id, companion_id)
```

### spawns Table Changes
```sql
companion_id NULLABLE (was NOT NULL)
```

## Error Handling

```php
try {
    $userCompanion = $captureAction->execute($user, $spawn, $companionId);
} catch (\InvalidArgumentException $e) {
    // Handle cases like:
    // - "Spawn is no longer active"
    // - "Specified companion is not available in this spawn"  
    // - "This companion from the spawn has already been captured by this user"
}
```

## Performance Tips

1. **Eager Loading**: Always load relationships when querying multiple spawns
2. **Specific Queries**: Query legacy vs multi-companion spawns separately when possible
3. **Indexing**: Leverage existing indexes on pivot table
4. **Batch Operations**: Use `attach()` for multiple companions

---

For complete documentation, see `MULTI_COMPANION_SPAWN_IMPLEMENTATION.md`
