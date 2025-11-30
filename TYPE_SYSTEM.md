# Type System Documentation

This document provides an overview of the centralized type system in the PnutGo application.

## Overview

All shared type definitions have been extracted from individual components and pages into centralized type files located in `/app/types/`. This approach ensures:

- **Single Source of Truth**: Each type is defined once and imported where needed
- **Maintainability**: Updates to types propagate automatically across the application
- **Type Safety**: TypeScript prevents type mismatches across components
- **Developer Experience**: Cleaner imports and better IDE autocomplete

## Type Files

### 📁 `/app/types/rarity.ts`
**Purpose**: Rarity system for companions and items

**Exports**:
- `RarityKey`: Union type for rarity levels
- `RarityLabel`: Union type for human-readable rarity labels
- `RarityConfig`: Configuration interface for rarity settings
- `RARITY_ORDER`: Record mapping rarity keys to order
- `RARITY_ORDER_LIST`: Array of rarity keys in descending order
- `RARITY_LABELS`: Record mapping rarity keys to labels
- `RARITY_GRADIENT_CLASSES`: Record mapping rarity keys to Tailwind classes
- `getRarityClass()`: Helper function to get Tailwind classes
- `getRarityLabel()`: Helper function to get display label
- `getRarityOrder()`: Helper function to get sort order

**Used by**: `collection.vue`, `AnimalDetailModal.vue`, `BadgeCard.vue`, `LeafletMap.vue`, `use-nearby-spawns.ts`

---

### 📁 `/app/types/media.ts`
**Purpose**: Media image assets from API

**Exports**:
- `MediaImage`: Interface for image data including URLs

**Used by**: `animal.ts`, `use-nearby-spawns.ts`, formerly used in `collection.vue` and `AnimalDetailModal.vue`

---

### 📁 `/app/types/animal.ts`
**Purpose**: Animal/Companion entity definitions

**Exports**:
- `Animal`: Interface for animal/companion data including rarity, images, and capture status

**Used by**: `collection.vue`, `AnimalDetailModal.vue`

---

### 📁 `/app/types/badge.ts`
**Purpose**: Player achievement and badge definitions

**Exports**:
- `Badge`: Interface for badge data including requirements, levels, and earned status

**Used by**: `BadgeCard.vue`

---

### 📁 `/app/types/quest.ts`
**Purpose**: Game quest and mission definitions

**Exports**:
- `Quest`: Interface for quest data including progress, rewards, and completion status

**Used by**: `QuestCard.vue`

---

### 📁 `/app/types/map.ts`
**Purpose**: Map-related types for location and spawn visualization

**Exports**:
- `MapProps`: Props interface for map components
- `SelectedCompanion`: Interface for selected spawn with cycle data

**Used by**: `LeafletMap.vue`

---

### 📁 `/app/types/index.ts`
**Purpose**: Central export hub for all types

**What it does**: Re-exports all type definitions from individual type files for cleaner imports

**Usage**:
```typescript
// ✅ Clean import from index
import type { RarityKey, MediaImage, Animal, Badge } from '~/types';
import { getRarityClass, RARITY_LABELS } from '~/types';

// ❌ Avoid importing from individual files (unless needed)
import type { RarityKey } from '~/types/rarity';
import type { MediaImage } from '~/types/media';
```

---

## Component-Specific Props

The following components keep their local `Props` interfaces as they are component-specific and not shared:

- `AppHeader.vue` - Header props (title, subtitle, etc.)
- `MapHeader.vue` - Map header props
- `GridMapVisualization.vue` - Grid visualization props
- `SpawnDetailModal.vue` - Spawn detail modal props
- `AnimalDetailModal.vue` - Animal detail modal props (wraps Animal type)
- `BadgeCard.vue` - Badge card props (wraps Badge type)
- `QuestCard.vue` - Quest card props (wraps Quest type)

These Props interfaces serve as component API definitions and should remain local to their respective components.

---

## Migration Examples

### Before (Duplicate Interfaces)
```vue
<!-- collection.vue -->
<script setup lang="ts">
interface MediaImage {
  id: number;
  name: string;
  url: string;
  // ... more fields
}

interface Animal {
  id: number;
  name: string;
  rarity: string;
  view_image?: MediaImage;
  // ... more fields
}
</script>

<!-- AnimalDetailModal.vue -->
<script setup lang="ts">
// Same interfaces duplicated!
interface MediaImage { /* ... */ }
interface Animal { /* ... */ }
</script>
```

### After (Centralized Types)
```vue
<!-- collection.vue -->
<script setup lang="ts">
import type { Animal } from '~/types';
import { getRarityClass, RARITY_LABELS } from '~/types';
</script>

<!-- AnimalDetailModal.vue -->
<script setup lang="ts">
import type { Animal } from '~/types';
import { getRarityClass } from '~/types';
</script>
```

---

## Best Practices

### ✅ Do's
1. **Import from central index**: `import type { Animal } from '~/types'`
2. **Update types in one place**: Modify `/app/types/[type].ts` files
3. **Document new types**: Add comments explaining the purpose
4. **Keep component Props local**: Unless shared across multiple components
5. **Use type imports**: Use `import type` for type-only imports

### ❌ Don'ts
1. **Don't duplicate interfaces**: Check `/app/types/` first
2. **Don't import from sub-files**: Use index.ts for cleaner imports
3. **Don't mix data and types**: Keep types separate from implementation
4. **Don't make everything global**: Component-specific types can stay local

---

## File Structure
```
app/
├── types/
│   ├── index.ts           # Central export hub ⭐
│   ├── rarity.ts          # Rarity system types
│   ├── media.ts           # Media/image types
│   ├── animal.ts          # Animal/Companion types
│   ├── badge.ts           # Badge/Achievement types
│   ├── quest.ts           # Quest/Mission types
│   └── map.ts             # Map-related types
├── components/
│   ├── AnimalDetailModal.vue    # Uses Animal type
│   ├── BadgeCard.vue            # Uses Badge type
│   ├── QuestCard.vue            # Uses Quest type
│   └── LeafletMap.vue           # Uses MapProps type
├── pages/
│   └── collection.vue           # Uses Animal type
└── composables/
    └── use-nearby-spawns.ts     # Uses MediaImage type
```

---

## Adding New Types

When you need to add a new shared type:

1. **Create a new type file** in `/app/types/` (e.g., `inventory.ts`)
2. **Export the type** with proper documentation
3. **Add to index.ts** for central access
4. **Update this documentation** with the new type

Example:
```typescript
// app/types/inventory.ts
/**
 * Inventory Types
 * 
 * Types for player inventory management
 */
export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  type: 'consumable' | 'equipment' | 'quest';
}
```

```typescript
// app/types/index.ts
export type { InventoryItem } from './inventory';
```

---

## Summary

✅ All shared type definitions centralized in `/app/types/`
✅ Single source of truth for type definitions
✅ Clean imports via index.ts
✅ Component-specific Props remain local
✅ No duplicate interface definitions
✅ Type-safe development experience

