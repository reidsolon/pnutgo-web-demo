/**
 * Central Type Exports
 * 
 * This file aggregates and re-exports all type definitions from the types directory.
 * Import types from this file for cleaner, more maintainable imports.
 * 
 * @example
 * // Instead of:
 * import type { RarityKey } from '~/types/rarity';
 * import type { MediaImage } from '~/types/media';
 * import type { Animal } from '~/types/animal';
 * 
 * // You can do:
 * import type { RarityKey, MediaImage, Animal } from '~/types';
 */

// Rarity types
export type { RarityKey, RarityLabel, RarityConfig } from './rarity';
export { 
  RARITY_ORDER, 
  RARITY_ORDER_LIST, 
  RARITY_LABELS, 
  RARITY_GRADIENT_CLASSES,
  getRarityClass,
  getRarityLabel,
  getRarityOrder
} from './rarity';

// Media types
export type { MediaImage } from './media';

// Animal types
export type { Animal } from './animal';

// Badge types
export type { Badge } from './badge';

// Quest types
export type { Quest } from './quest';

// Map types
export type { MapProps, SelectedCompanion } from './map';
