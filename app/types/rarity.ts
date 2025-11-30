export type RarityKey = 'ultra_rare' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';

export type RarityLabel = 'Ultra Rare' | 'Legendary' | 'Epic' | 'Rare' | 'Uncommon' | 'Common';

export interface RarityConfig {
  key: RarityKey;
  label: RarityLabel;
  order: number;
  gradientClass: string;
}

export const RARITY_ORDER: Record<RarityKey, number> = {
  ultra_rare: 5,
  legendary: 4,
  epic: 3,
  rare: 2,
  uncommon: 1.5,
  common: 1,
} as const;

export const RARITY_LABELS: Record<RarityKey, RarityLabel> = {
  ultra_rare: 'Ultra Rare',
  legendary: 'Legendary',
  epic: 'Epic',
  rare: 'Rare',
  uncommon: 'Uncommon',
  common: 'Common',
} as const;

export const RARITY_GRADIENT_CLASSES: Record<RarityKey, string> = {
  ultra_rare: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  legendary: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
  epic: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
  rare: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  uncommon: 'bg-gradient-to-r from-green-500 to-teal-500 text-white',
  common: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
} as const;

export const RARITY_ORDER_LIST: RarityKey[] = ['ultra_rare', 'legendary', 'epic', 'rare', 'uncommon', 'common'] as const;

export const getRarityClass = (rarity: RarityKey): string => {
  return RARITY_GRADIENT_CLASSES[rarity] || RARITY_GRADIENT_CLASSES.common;
};

export const getRarityLabel = (rarity: RarityKey): RarityLabel => {
  return RARITY_LABELS[rarity] || RARITY_LABELS.common;
};

export const getRarityOrder = (rarity: RarityKey): number => {
  return RARITY_ORDER[rarity] || RARITY_ORDER.common;
};
