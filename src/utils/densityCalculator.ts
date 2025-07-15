import type { Location, Coordinate } from '../types';
import type { DensityGridCell, DensityConfig } from '../types';

/**
 * Utility class for calculating density grids from location data
 */
export class DensityCalculator {
  
  /**
   * Calculate density grid from location data
   */
  public static calculateDensityGrid(
    locations: Location[], 
    bounds: { north: number; south: number; east: number; west: number },
    config: DensityConfig
  ): DensityGridCell[] {
    const gridSize = config.gridSize || 20;
    const method = config.aggregationMethod || 'count';
    
    const latStep = (bounds.north - bounds.south) / gridSize;
    const lngStep = (bounds.east - bounds.west) / gridSize;
    
    const grid: DensityGridCell[] = [];
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cellBounds = {
          south: bounds.south + (i * latStep),
          north: bounds.south + ((i + 1) * latStep),
          west: bounds.west + (j * lngStep),
          east: bounds.west + ((j + 1) * lngStep)
        };
        
        const cellCenter: Coordinate = {
          lat: cellBounds.south + (latStep / 2),
          lng: cellBounds.west + (lngStep / 2)
        };
        
        const locationsInCell = this.getLocationsInBounds(locations, cellBounds);
        const cellValue = this.calculateCellValue(locationsInCell, method);
        
        if (cellValue > 0) {
          grid.push({
            coordinates: cellCenter,
            count: locationsInCell.length,
            value: cellValue,
            bounds: cellBounds
          });
        }
      }
    }
    
    return grid;
  }

  /**
   * Get locations within specific bounds
   */
  private static getLocationsInBounds(
    locations: Location[],
    bounds: { north: number; south: number; east: number; west: number }
  ): Location[] {
    return locations.filter(location => 
      location.coordinates.lat >= bounds.south &&
      location.coordinates.lat <= bounds.north &&
      location.coordinates.lng >= bounds.west &&
      location.coordinates.lng <= bounds.east
    );
  }

  /**
   * Calculate aggregated value for a cell
   */
  private static calculateCellValue(
    locations: Location[],
    method: 'count' | 'sum' | 'average'
  ): number {
    if (locations.length === 0) return 0;
    
    switch (method) {
      case 'count':
        return locations.length;
      
      case 'sum':
        return locations.reduce((sum, loc) => sum + (loc.intensity || 1), 0);
      
      case 'average':
        const total = locations.reduce((sum, loc) => sum + (loc.intensity || 1), 0);
        return total / locations.length;
      
      default:
        return locations.length;
    }
  }

  /**
   * Calculate optimal grid size based on data density
   */
  public static calculateOptimalGridSize(locations: Location[]): number {
    if (locations.length < 10) return 5;
    if (locations.length < 50) return 10;
    if (locations.length < 200) return 15;
    if (locations.length < 500) return 20;
    return 25;
  }

  /**
   * Generate color scale for density values
   */
  public static generateDensityColorScale(): string[] {
    const steps = 5;
    const colors: string[] = [];
    
    for (let i = 0; i < steps; i++) {
      const intensity = i / (steps - 1);
      const r = Math.round(255 * intensity);
      const g = Math.round(255 * (1 - intensity * 0.8));
      const b = Math.round(255 * (1 - intensity));
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    
    return colors;
  }

  /**
   * Get color for specific density value
   */
  public static getColorForDensity(
    value: number,
    maxValue: number,
    colorScale: string[]
  ): string {
    if (maxValue === 0) return colorScale[0];
    
    const normalizedValue = value / maxValue;
    const index = Math.floor(normalizedValue * (colorScale.length - 1));
    return colorScale[Math.min(index, colorScale.length - 1)];
  }

  /**
   * Calculate bounds from locations
   */
  public static calculateBounds(locations: Location[]): {
    north: number;
    south: number;
    east: number;
    west: number;
  } {
    if (locations.length === 0) {
      return { north: 90, south: -90, east: 180, west: -180 };
    }

    const lats = locations.map(loc => loc.coordinates.lat);
    const lngs = locations.map(loc => loc.coordinates.lng);
    
    const bounds = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };

    // Add some padding
    const latPadding = (bounds.north - bounds.south) * 0.1;
    const lngPadding = (bounds.east - bounds.west) * 0.1;
    
    return {
      north: bounds.north + latPadding,
      south: bounds.south - latPadding,
      east: bounds.east + lngPadding,
      west: bounds.west - lngPadding
    };
  }
}
