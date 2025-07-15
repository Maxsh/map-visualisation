import type { Coordinate, Location, HeatmapDataPoint } from '../types';

/**
 * Validates if coordinates are within valid geographic bounds
 */
export function validateCoordinates(coord: Coordinate): boolean {
  return (
    coord.lat >= -90 && 
    coord.lat <= 90 && 
    coord.lng >= -180 && 
    coord.lng <= 180
  );
}

/**
 * Calculates the distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converts Location objects to HeatmapDataPoint format
 */
export function convertToHeatmapData(locations: Location[]): HeatmapDataPoint[] {
  return locations
    .filter(loc => validateCoordinates(loc.coordinates))
    .map(loc => ({
      lat: loc.coordinates.lat,
      lng: loc.coordinates.lng,
      count: loc.intensity || 1
    }));
}

/**
 * Calculates the center point of a collection of locations
 */
export function calculateCenter(locations: Location[]): Coordinate {
  if (locations.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const sum = locations.reduce(
    (acc, loc) => ({
      lat: acc.lat + loc.coordinates.lat,
      lng: acc.lng + loc.coordinates.lng
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / locations.length,
    lng: sum.lng / locations.length
  };
}

/**
 * Normalizes intensity values to 0-1 range
 */
export function normalizeIntensities(locations: Location[]): Location[] {
  const intensities = locations
    .map(loc => loc.intensity || 1)
    .filter(intensity => intensity > 0);
  
  if (intensities.length === 0) return locations;
  
  const max = Math.max(...intensities);
  const min = Math.min(...intensities);
  const range = max - min;
  
  if (range === 0) return locations;
  
  return locations.map(loc => ({
    ...loc,
    intensity: loc.intensity ? (loc.intensity - min) / range : 0
  }));
}

/**
 * Filters locations within a geographic bounding box
 */
export function filterLocationsByBounds(
  locations: Location[],
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }
): Location[] {
  return locations.filter(loc => 
    loc.coordinates.lat <= bounds.north &&
    loc.coordinates.lat >= bounds.south &&
    loc.coordinates.lng <= bounds.east &&
    loc.coordinates.lng >= bounds.west
  );
}
