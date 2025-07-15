import L from 'leaflet';
import 'heatmap.js';
import type { Location, MapConfig, HeatmapConfig, HeatmapVisualization } from '../types';
import { convertToHeatmapData } from '../utils/geoUtils';

declare global {
  interface Window {
    h337: any;
  }
}

/**
 * HeatmapRenderer class for creating and managing heatmap visualizations
 */
export class HeatmapRenderer {
  private map: L.Map | null = null;
  private heatmapLayer: any = null;
  private containerId: string;

  constructor(containerId: string) {
    this.containerId = containerId;
  }

  /**
   * Initialize the map and heatmap
   */
  public async initialize(config: HeatmapVisualization): Promise<void> {
    try {
      // Initialize the Leaflet map
      this.initializeMap(config.mapConfig);
      
      // Create and add heatmap layer
      await this.createHeatmapLayer(config.locations, config.heatmapConfig);
      
      // Fit map to show all locations if locations exist
      if (config.locations.length > 0) {
        this.fitMapToLocations(config.locations);
      }
    } catch (error) {
      console.error('Failed to initialize heatmap:', error);
      throw error;
    }
  }

  /**
   * Initialize the Leaflet map
   */
  private initializeMap(mapConfig: MapConfig): void {
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container with id '${this.containerId}' not found`);
    }

    // Clear any existing map
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(this.containerId, {
      center: [mapConfig.center.lat, mapConfig.center.lng],
      zoom: mapConfig.zoom,
      maxZoom: mapConfig.maxZoom || 18,
      minZoom: mapConfig.minZoom || 1
    });

    // Add tile layer
    L.tileLayer(mapConfig.tileLayerUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: mapConfig.attribution || '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  /**
   * Create and add heatmap layer
   */
  private async createHeatmapLayer(locations: Location[], heatmapConfig: HeatmapConfig): Promise<void> {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    // Convert locations to heatmap data format
    const heatmapData = convertToHeatmapData(locations);

    if (heatmapData.length === 0) {
      console.warn('No valid location data provided for heatmap');
      return;
    }

    // Create heatmap configuration
    const cfg = {
      radius: heatmapConfig.radius || 25,
      maxOpacity: heatmapConfig.maxOpacity || 0.8,
      minOpacity: heatmapConfig.minOpacity || 0,
      blur: heatmapConfig.blur || 15,
      gradient: heatmapConfig.gradient || {
        0.0: 'blue',
        0.2: 'cyan',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red'
      }
    };

    // Create heatmap layer using Leaflet heatmap plugin approach
    this.createLeafletHeatmapLayer(heatmapData, cfg);
  }

  /**
   * Create heatmap layer using a simple approach with Leaflet
   */
  private createLeafletHeatmapLayer(data: any[], config: any): void {
    if (!this.map) return;

    // Remove existing heatmap layer
    if (this.heatmapLayer) {
      this.map.removeLayer(this.heatmapLayer);
    }

    // Create canvas overlay for heatmap
    const bounds = this.map.getBounds();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('Could not get canvas context');
      return;
    }

    // Set canvas size
    const mapSize = this.map.getSize();
    canvas.width = mapSize.x;
    canvas.height = mapSize.y;

    // Draw heatmap points
    this.drawHeatmapPoints(context, data, config, canvas.width, canvas.height);

    // Create image overlay
    const imageUrl = canvas.toDataURL();
    this.heatmapLayer = L.imageOverlay(imageUrl, bounds, {
      opacity: config.maxOpacity,
      interactive: false
    }).addTo(this.map);

    // Update heatmap on map events
    this.map.on('zoom move', () => {
      setTimeout(() => this.updateHeatmapLayer(data, config), 100);
    });
  }

  /**
   * Draw heatmap points on canvas
   */
  private drawHeatmapPoints(
    context: CanvasRenderingContext2D,
    data: any[],
    config: any,
    width: number,
    height: number
  ): void {
    if (!this.map) return;

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Draw each point
    data.forEach(point => {
      const latLng = L.latLng(point.lat, point.lng);
      const pixelPoint = this.map!.latLngToContainerPoint(latLng);

      // Skip if point is outside visible area
      if (pixelPoint.x < 0 || pixelPoint.x > width || pixelPoint.y < 0 || pixelPoint.y > height) {
        return;
      }

      // Create radial gradient for this point
      const intensity = Math.min(1, Math.max(0, point.count));
      const radius = config.radius * intensity;
      
      const gradient = context.createRadialGradient(
        pixelPoint.x, pixelPoint.y, 0,
        pixelPoint.x, pixelPoint.y, radius
      );

      // Apply color gradient
      const alpha = config.maxOpacity * intensity;
      gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
      gradient.addColorStop(0.4, `rgba(255, 255, 0, ${alpha * 0.8})`);
      gradient.addColorStop(0.7, `rgba(0, 255, 255, ${alpha * 0.6})`);
      gradient.addColorStop(1, `rgba(0, 0, 255, 0)`);

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(pixelPoint.x, pixelPoint.y, radius, 0, Math.PI * 2);
      context.fill();
    });
  }

  /**
   * Update heatmap layer
   */
  private updateHeatmapLayer(data: any[], config: any): void {
    if (!this.map || !this.heatmapLayer) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return;

    const mapSize = this.map.getSize();
    canvas.width = mapSize.x;
    canvas.height = mapSize.y;

    this.drawHeatmapPoints(context, data, config, canvas.width, canvas.height);

    const imageUrl = canvas.toDataURL();
    const bounds = this.map.getBounds();
    
    this.map.removeLayer(this.heatmapLayer);
    this.heatmapLayer = L.imageOverlay(imageUrl, bounds, {
      opacity: config.maxOpacity,
      interactive: false
    }).addTo(this.map);
  }

  /**
   * Fit map view to show all locations
   */
  private fitMapToLocations(locations: Location[]): void {
    if (!this.map || locations.length === 0) return;

    const group = new L.FeatureGroup();
    
    locations.forEach(location => {
      const marker = L.marker([location.coordinates.lat, location.coordinates.lng]);
      group.addLayer(marker);
    });

    this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
    
    // Remove the temporary markers
    group.clearLayers();
  }

  /**
   * Update heatmap with new data
   */
  public updateData(locations: Location[], heatmapConfig?: HeatmapConfig): void {
    if (!this.map) {
      console.error('Map not initialized');
      return;
    }

    const config = heatmapConfig || {
      radius: 25,
      maxOpacity: 0.8,
      minOpacity: 0,
      blur: 15
    };

    this.createHeatmapLayer(locations, config);
    
    if (locations.length > 0) {
      this.fitMapToLocations(locations);
    }
  }

  /**
   * Destroy the map and cleanup
   */
  public destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.heatmapLayer = null;
  }

  /**
   * Get the current map instance
   */
  public getMap(): L.Map | null {
    return this.map;
  }
}
