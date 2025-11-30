/**
 * Badge Types
 * 
 * These types represent player achievements and badges in the game.
 * Used for badge display, progress tracking, and achievement management.
 */

import type { RarityKey } from './rarity';

export interface Badge {
  id: number;
  name: string;
  description: string;
  level?: number;
  requirement?: {
    type: string;
    count: number;
    companion_type?: string;
    companion_rarity?: RarityKey;
    time_limit?: number;
  };
  companion?: {
    id: number;
    name: string;
    rarity: RarityKey;
  } | null;
  earned_at?: string | null;
  created_at: string;
  updated_at: string;
}
