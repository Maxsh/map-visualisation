/**
 * Geographic coordinate representation
 */
export interface Coordinate {
  lat: number;
  lng: number;
}

/**
 * Location with coordinates and optional metadata
 */
export interface Location {
  id?: string | number;
  name?: string;
  coordinates: Coordinate;
  intensity?: number; // Value for heatmap intensity (0-1)
  metadata?: Record<string, any>;
}

/**
 * Heatmap configuration options
 */
export interface HeatmapConfig {
  radius?: number;
  maxOpacity?: number;
  minOpacity?: number;
  blur?: number;
  gradient?: Record<string, string>;
  maxZoom?: number;
}

/**
 * Map configuration options
 */
export interface MapConfig {
  center: Coordinate;
  zoom: number;
  maxZoom?: number;
  minZoom?: number;
  tileLayerUrl?: string;
  attribution?: string;
}

/**
 * Heatmap data point for visualization libraries
 */
export interface HeatmapDataPoint {
  lat: number;
  lng: number;
  count: number; // intensity value
}

/**
 * Complete heatmap visualization configuration
 */
export interface HeatmapVisualization {
  locations: Location[];
  mapConfig: MapConfig;
  heatmapConfig: HeatmapConfig;
}
