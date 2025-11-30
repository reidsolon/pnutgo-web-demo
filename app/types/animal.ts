/**
 * Animal & Companion Types
 * 
 * These types represent the core animal/companion entities in the game.
 * Used for collection display, capture mechanics, and companion management.
 */

import type { RarityKey, RarityLabel } from './rarity';
import type { MediaImage } from './media';

export interface Animal {
  id: number;
  name: string;
  description?: string;
  personality?: string;
  traits?: string;
  rarity: RarityKey;
  rarity_label: RarityLabel;
  view_image?: MediaImage | null;
  silhouette_image?: MediaImage | null;
  is_captured: boolean;
  capture_count: number;
  times_captured: number;
}
