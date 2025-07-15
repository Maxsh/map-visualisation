/**
 * Advanced data processing utilities for heatmap visualizations
 */

import type { Location, Coordinate } from '../types';

/**
 * Data clustering utilities
 */
export class DataProcessor {
  
  /**
   * Group locations by proximity using simple grid-based clustering
   */
  static clusterByProximity(
    locations: Location[], 
    gridSize: number = 0.1
  ): Location[][] {
    const clusters = new Map<string, Location[]>();
    
    locations.forEach(location => {
      const gridX = Math.floor(location.coordinates.lat / gridSize);
      const gridY = Math.floor(location.coordinates.lng / gridSize);
      const key = `${gridX},${gridY}`;
      
      if (!clusters.has(key)) {
        clusters.set(key, []);
      }
      clusters.get(key)!.push(location);
    });
    
    return Array.from(clusters.values());
  }

  /**
   * Calculate density-based intensity values
   */
  static calculateDensityIntensity(
    locations: Location[],
    radius: number = 0.1
  ): Location[] {
    return locations.map(location => {
      let density = 0;
      
      locations.forEach(other => {
        const distance = this.calculateDistance(
          location.coordinates,
          other.coordinates
        );
        
        if (distance <= radius) {
          density++;
        }
      });
      
      return {
        ...location,
        intensity: Math.min(1, density / 10) // Normalize to 0-1
      };
    });
  }

  /**
   * Filter locations by geographic bounds
   */
  static filterByBounds(
    locations: Location[],
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    }
  ): Location[] {
    return locations.filter(location => {
      const { lat, lng } = location.coordinates;
      return (
        lat <= bounds.north &&
        lat >= bounds.south &&
        lng <= bounds.east &&
        lng >= bounds.west
      );
    });
  }

  /**
   * Sample locations by taking every nth item
   */
  static sampleLocations(locations: Location[], sampleRate: number): Location[] {
    if (sampleRate <= 0 || sampleRate > 1) {
      throw new Error('Sample rate must be between 0 and 1');
    }
    
    const step = Math.round(1 / sampleRate);
    return locations.filter((_, index) => index % step === 0);
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private static calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Smooth intensity values using moving average
   */
  static smoothIntensities(
    locations: Location[],
    windowSize: number = 3
  ): Location[] {
    const sorted = [...locations].sort((a, b) => 
      a.coordinates.lat - b.coordinates.lat
    );
    
    return sorted.map((location, index) => {
      const start = Math.max(0, index - Math.floor(windowSize / 2));
      const end = Math.min(sorted.length, start + windowSize);
      
      const window = sorted.slice(start, end);
      const avgIntensity = window.reduce(
        (sum, loc) => sum + (loc.intensity || 0), 
        0
      ) / window.length;
      
      return {
        ...location,
        intensity: avgIntensity
      };
    });
  }

  /**
   * Remove outliers based on intensity values
   */
  static removeOutliers(
    locations: Location[],
    threshold: number = 2
  ): Location[] {
    const intensities = locations
      .map(loc => loc.intensity || 0)
      .filter(intensity => intensity > 0);
    
    if (intensities.length === 0) return locations;
    
    const mean = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
    const variance = intensities.reduce(
      (sum, val) => sum + Math.pow(val - mean, 2), 
      0
    ) / intensities.length;
    const stdDev = Math.sqrt(variance);
    
    const lowerBound = mean - threshold * stdDev;
    const upperBound = mean + threshold * stdDev;
    
    return locations.filter(location => {
      const intensity = location.intensity || 0;
      return intensity >= lowerBound && intensity <= upperBound;
    });
  }

  /**
   * Generate interpolated points between existing locations
   */
  static interpolatePoints(
    start: Location,
    end: Location,
    steps: number
  ): Location[] {
    const points: Location[] = [];
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const lat = start.coordinates.lat + 
        (end.coordinates.lat - start.coordinates.lat) * ratio;
      const lng = start.coordinates.lng + 
        (end.coordinates.lng - start.coordinates.lng) * ratio;
      const intensity = (start.intensity || 0) + 
        ((end.intensity || 0) - (start.intensity || 0)) * ratio;
      
      points.push({
        id: `interpolated_${start.id}_${end.id}_${i}`,
        coordinates: { lat, lng },
        intensity
      });
    }
    
    return points;
  }
}

/**
 * Statistical analysis utilities
 */
export class StatsCalculator {
  
  /**
   * Calculate basic statistics for intensity values
   */
  static calculateStats(locations: Location[]): {
    count: number;
    min: number;
    max: number;
    mean: number;
    median: number;
    stdDev: number;
  } {
    const intensities = locations
      .map(loc => loc.intensity || 0)
      .filter(intensity => intensity > 0)
      .sort((a, b) => a - b);
    
    if (intensities.length === 0) {
      return { count: 0, min: 0, max: 0, mean: 0, median: 0, stdDev: 0 };
    }
    
    const count = intensities.length;
    const min = intensities[0];
    const max = intensities[count - 1];
    const mean = intensities.reduce((sum, val) => sum + val, 0) / count;
    const median = count % 2 === 0
      ? (intensities[count / 2 - 1] + intensities[count / 2]) / 2
      : intensities[Math.floor(count / 2)];
    
    const variance = intensities.reduce(
      (sum, val) => sum + Math.pow(val - mean, 2), 
      0
    ) / count;
    const stdDev = Math.sqrt(variance);
    
    return { count, min, max, mean, median, stdDev };
  }

  /**
   * Calculate geographic bounds of all locations
   */
  static calculateBounds(locations: Location[]): {
    north: number;
    south: number;
    east: number;
    west: number;
    center: Coordinate;
  } {
    if (locations.length === 0) {
      return {
        north: 0, south: 0, east: 0, west: 0,
        center: { lat: 0, lng: 0 }
      };
    }
    
    const lats = locations.map(loc => loc.coordinates.lat);
    const lngs = locations.map(loc => loc.coordinates.lng);
    
    const north = Math.max(...lats);
    const south = Math.min(...lats);
    const east = Math.max(...lngs);
    const west = Math.min(...lngs);
    
    return {
      north, south, east, west,
      center: {
        lat: (north + south) / 2,
        lng: (east + west) / 2
      }
    };
  }
}
