import type { Location, MapConfig, HeatmapConfig } from '../types';

/**
 * Sample location data for demonstration
 * These represent various cities around the world with different intensities
 */
export const sampleLocations: Location[] = [
  // North America
  { id: 1, name: 'New York', coordinates: { lat: 40.7128, lng: -74.0060 }, intensity: 0.9 },
  { id: 2, name: 'Los Angeles', coordinates: { lat: 34.0522, lng: -118.2437 }, intensity: 0.7 },
  { id: 3, name: 'Chicago', coordinates: { lat: 41.8781, lng: -87.6298 }, intensity: 0.6 },
  { id: 4, name: 'Toronto', coordinates: { lat: 43.6532, lng: -79.3832 }, intensity: 0.5 },
  { id: 5, name: 'San Francisco', coordinates: { lat: 37.7749, lng: -122.4194 }, intensity: 0.8 },
  
  // Europe
  { id: 6, name: 'London', coordinates: { lat: 51.5074, lng: -0.1278 }, intensity: 0.95 },
  { id: 7, name: 'Paris', coordinates: { lat: 48.8566, lng: 2.3522 }, intensity: 0.85 },
  { id: 8, name: 'Berlin', coordinates: { lat: 52.5200, lng: 13.4050 }, intensity: 0.65 },
  { id: 9, name: 'Madrid', coordinates: { lat: 40.4168, lng: -3.7038 }, intensity: 0.55 },
  { id: 10, name: 'Rome', coordinates: { lat: 41.9028, lng: 12.4964 }, intensity: 0.6 },
  
  // Asia
  { id: 11, name: 'Tokyo', coordinates: { lat: 35.6762, lng: 139.6503 }, intensity: 1.0 },
  { id: 12, name: 'Shanghai', coordinates: { lat: 31.2304, lng: 121.4737 }, intensity: 0.9 },
  { id: 13, name: 'Mumbai', coordinates: { lat: 19.0760, lng: 72.8777 }, intensity: 0.8 },
  { id: 14, name: 'Seoul', coordinates: { lat: 37.5665, lng: 126.9780 }, intensity: 0.75 },
  { id: 15, name: 'Singapore', coordinates: { lat: 1.3521, lng: 103.8198 }, intensity: 0.7 },
  
  // Australia/Oceania
  { id: 16, name: 'Sydney', coordinates: { lat: -33.8688, lng: 151.2093 }, intensity: 0.65 },
  { id: 17, name: 'Melbourne', coordinates: { lat: -37.8136, lng: 144.9631 }, intensity: 0.6 },
  
  // South America
  { id: 18, name: 'São Paulo', coordinates: { lat: -23.5505, lng: -46.6333 }, intensity: 0.7 },
  { id: 19, name: 'Buenos Aires', coordinates: { lat: -34.6118, lng: -58.3960 }, intensity: 0.6 },
  
  // Africa
  { id: 20, name: 'Cairo', coordinates: { lat: 30.0444, lng: 31.2357 }, intensity: 0.5 },
  { id: 21, name: 'Cape Town', coordinates: { lat: -33.9249, lng: 18.4241 }, intensity: 0.45 }
];

/**
 * Default map configuration
 */
export const defaultMapConfig: MapConfig = {
  center: { lat: 20, lng: 0 }, // Center of the world
  zoom: 2,
  maxZoom: 18,
  minZoom: 1,
  tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors'
};

/**
 * Default heatmap configuration
 */
export const defaultHeatmapConfig: HeatmapConfig = {
  radius: 25,
  maxOpacity: 0.8,
  minOpacity: 0,
  blur: 15,
  gradient: {
    0.0: 'blue',
    0.2: 'cyan',
    0.4: 'lime',
    0.6: 'yellow',
    0.8: 'orange',
    1.0: 'red'
  }
};

/**
 * Generate random locations for testing
 */
export function generateRandomLocations(count: number): Location[] {
  const locations: Location[] = [];
  
  for (let i = 0; i < count; i++) {
    locations.push({
      id: i,
      name: `Location ${i + 1}`,
      coordinates: {
        lat: (Math.random() - 0.5) * 180, // -90 to 90
        lng: (Math.random() - 0.5) * 360  // -180 to 180
      },
      intensity: Math.random()
    });
  }
  
  return locations;
}

/**
 * Generate clustered locations around a center point
 */
export function generateClusteredLocations(
  center: { lat: number; lng: number },
  count: number,
  radius: number = 0.1
): Location[] {
  const locations: Location[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    
    locations.push({
      id: i,
      name: `Clustered Location ${i + 1}`,
      coordinates: {
        lat: center.lat + Math.cos(angle) * distance,
        lng: center.lng + Math.sin(angle) * distance
      },
      intensity: Math.random()
    });
  }
  
  return locations;
}
