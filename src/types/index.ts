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

/**
 * Visualization types supported by the application
 */
export type VisualizationType = 'heatmap' | 'density' | 'markers' | 'points';

/**
 * Complete visualization configuration supporting multiple types
 */
export interface VisualizationConfig {
  type: VisualizationType;
  locations: Location[];
  mapConfig: MapConfig;
  styleConfig: VisualizationStyleConfig;
}

/**
 * Style configurations for different visualization types
 */
export interface VisualizationStyleConfig {
  heatmap?: HeatmapConfig;
  density?: DensityConfig;
  markers?: MarkerConfig;
  points?: PointConfig;
}

/**
 * Density visualization configuration
 */
export interface DensityConfig {
  gridSize?: number;
  colorScale?: string[];
  opacity?: number;
  strokeWidth?: number;
  strokeColor?: string;
  showLabels?: boolean;
  aggregationMethod?: 'count' | 'sum' | 'average';
  showGrid?: boolean;
}

/**
 * Marker visualization configuration
 */
export interface MarkerConfig {
  iconType?: 'alert' | 'warning' | 'info' | 'danger' | 'success' | 'critical';
  iconSize?: [number, number];
  clustering?: boolean;
  showPopups?: boolean;
  customIconUrl?: string;
  shadowUrl?: string;
  pulseAnimation?: boolean;
}

/**
 * Point visualization configuration
 */
export interface PointConfig {
  radius?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  intensityBased?: boolean;
  colorScale?: string[];
  showLabels?: boolean;
}

/**
 * Enhanced location interface for alert markers
 */
export interface AlertMarker extends Location {
  alertType?: 'critical' | 'warning' | 'info' | 'resolved' | 'danger' | 'success';
  timestamp?: Date;
  description?: string;
  severity?: number; // 1-5 scale
  status?: 'active' | 'acknowledged' | 'resolved';
}

/**
 * Density grid cell for density visualization
 */
export interface DensityGridCell {
  coordinates: Coordinate;
  count: number;
  value: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}
