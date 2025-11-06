/**
 * Grid Coordinates Composable
 * 
 * Converts geographic coordinates (latitude/longitude) to grid coordinates (X/Y).
 * This is useful for grouping nearby locations into cells for game mechanics,
 * spawn management, and real-time updates.
 */

export interface GridCoordinates {
  gridX: number;
  gridY: number;
}

export interface Location {
  lat: number;
  lng: number;
}

export const useGridCoordinates = () => {
  /**
   * Grid cell size in degrees
   * Default: 0.001 degrees (~111 meters at equator)
   * Adjust this value based on your game's requirements:
   * - 0.001 = ~111m cells (detailed grid)
   * - 0.01 = ~1.1km cells (medium grid)
   * - 0.1 = ~11km cells (large grid)
   */
  const GRID_CELL_SIZE = 0.001;

  /**
   * Convert latitude/longitude to grid X/Y coordinates
   * 
   * @param lat - Latitude coordinate (-90 to 90)
   * @param lng - Longitude coordinate (-180 to 180)
   * @returns Object with gridX and gridY integer coordinates
   * 
   * @example
   * const coords = getGridCoordinates(14.5995, 120.9842);
   * // Returns: { gridX: 120984, gridY: 14599 }
   */
  const getGridCoordinates = (lat: number, lng: number): GridCoordinates => {
    // Validate input
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (lng < -180 || lng > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    // Convert to grid coordinates by dividing by cell size and flooring
    const gridX = Math.floor(lng / GRID_CELL_SIZE);
    const gridY = Math.floor(lat / GRID_CELL_SIZE);

    return {
      gridX,
      gridY,
    };
  };

  /**
   * Get grid coordinates from user's current location
   * Uses the browser's Geolocation API
   * 
   * @returns Promise that resolves with grid coordinates or null if unavailable
   * 
   * @example
   * const coords = await getUserGridCoordinates();
   * if (coords) {
   *   console.log(`User is in grid cell: ${coords.gridX}, ${coords.gridY}`);
   * }
   */
  const getUserGridCoordinates = async (): Promise<GridCoordinates | null> => {
    return new Promise((resolve) => {
      if (!process.client) {
        console.warn('Geolocation is only available in the browser');
        resolve(null);
        return;
      }

      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const gridCoords = getGridCoordinates(latitude, longitude);
          resolve(gridCoords);
        },
        (error) => {
          console.error('Error getting user location:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  /**
   * Convert grid coordinates back to geographic coordinates (center of cell)
   * 
   * @param gridX - Grid X coordinate
   * @param gridY - Grid Y coordinate
   * @returns Object with lat and lng coordinates
   * 
   * @example
   * const location = gridToLocation(120984, 14599);
   * // Returns: { lat: 14.599, lng: 120.984 }
   */
  const gridToLocation = (gridX: number, gridY: number): Location => {
    const lat = gridY * GRID_CELL_SIZE + GRID_CELL_SIZE / 2;
    const lng = gridX * GRID_CELL_SIZE + GRID_CELL_SIZE / 2;

    return {
      lat,
      lng,
    };
  };

  /**
   * Check if two locations are in the same grid cell
   * 
   * @param loc1 - First location with lat/lng
   * @param loc2 - Second location with lat/lng
   * @returns True if locations are in the same grid cell
   * 
   * @example
   * const isSameCell = areInSameGridCell(
   *   { lat: 14.5995, lng: 120.9842 },
   *   { lat: 14.5996, lng: 120.9843 }
   * );
   */
  const areInSameGridCell = (loc1: Location, loc2: Location): boolean => {
    const grid1 = getGridCoordinates(loc1.lat, loc1.lng);
    const grid2 = getGridCoordinates(loc2.lat, loc2.lng);

    return grid1.gridX === grid2.gridX && grid1.gridY === grid2.gridY;
  };

  /**
   * Get adjacent grid cells (8 surrounding cells + center)
   * Useful for loading spawns in nearby cells
   * 
   * @param gridX - Grid X coordinate
   * @param gridY - Grid Y coordinate
   * @returns Array of 9 grid coordinate objects (center + 8 adjacent)
   * 
   * @example
   * const cells = getAdjacentGridCells(120984, 14599);
   * // Returns array of 9 grid coordinates
   */
  const getAdjacentGridCells = (gridX: number, gridY: number): GridCoordinates[] => {
    const cells: GridCoordinates[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        cells.push({
          gridX: gridX + dx,
          gridY: gridY + dy,
        });
      }
    }

    return cells;
  };

  /**
   * Calculate distance between two grid cells (Manhattan distance)
   * 
   * @param grid1 - First grid coordinates
   * @param grid2 - Second grid coordinates
   * @returns Integer distance in grid cells
   * 
   * @example
   * const distance = getGridDistance(
   *   { gridX: 120984, gridY: 14599 },
   *   { gridX: 120985, gridY: 14600 }
   * );
   * // Returns: 2
   */
  const getGridDistance = (grid1: GridCoordinates, grid2: GridCoordinates): number => {
    return Math.abs(grid1.gridX - grid2.gridX) + Math.abs(grid1.gridY - grid2.gridY);
  };

  /**
   * Generate a unique grid cell identifier string
   * Useful for WebSocket channels, caching keys, etc.
   * 
   * @param gridX - Grid X coordinate
   * @param gridY - Grid Y coordinate
   * @returns String identifier in format "X:Y"
   * 
   * @example
   * const cellId = getGridCellId(120984, 14599);
   * // Returns: "120984:14599"
   */
  const getGridCellId = (gridX: number, gridY: number): string => {
    return `${gridX}:${gridY}`;
  };

  /**
   * Parse grid cell identifier back to coordinates
   * 
   * @param cellId - Grid cell identifier string
   * @returns Grid coordinates object or null if invalid
   * 
   * @example
   * const coords = parseGridCellId("120984:14599");
   * // Returns: { gridX: 120984, gridY: 14599 }
   */
  const parseGridCellId = (cellId: string): GridCoordinates | null => {
    const parts = cellId.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

    const gridX = parseInt(parts[0], 10);
    const gridY = parseInt(parts[1], 10);

    if (isNaN(gridX) || isNaN(gridY)) return null;

    return { gridX, gridY };
  };

  return {
    // Constants
    GRID_CELL_SIZE,

    // Core functions
    getGridCoordinates,
    getUserGridCoordinates,
    gridToLocation,

    // Utility functions
    areInSameGridCell,
    getAdjacentGridCells,
    getGridDistance,
    getGridCellId,
    parseGridCellId,
  };
};
