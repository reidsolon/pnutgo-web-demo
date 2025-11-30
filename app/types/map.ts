/**
 * Map Types
 * 
 * These types are used for map functionality, including markers,
 * user location, and companion spawn visualization.
 */

import type { NearbySpawn, ActiveCycle } from '~/composables/use-nearby-spawns';

export interface MapProps {
  userLocation?: { lat: number; lng: number } | null;
  locationEnabled?: boolean;
}

export interface SelectedCompanion {
  spawn: NearbySpawn;
  cycle: ActiveCycle;
}
