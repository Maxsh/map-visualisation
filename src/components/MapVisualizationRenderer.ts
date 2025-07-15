import L from 'leaflet';
import type { 
  Location, 
  VisualizationType, 
  DensityConfig,
  MarkerConfig,
  PointConfig,
  AlertMarker
} from '../types';
import { DensityCalculator } from '../utils/densityCalculator';
import { AlertIconGenerator } from '../utils/alertIconGenerator';

// Type for configuration specific to each visualization type
interface VisualizationTypeConfigs {
  heatmap?: {
    maxOpacity?: number;
    radius?: number;
    blur?: number;
    gradient?: Record<string, string>;
  };
  density?: DensityConfig;
  markers?: MarkerConfig;
  points?: PointConfig;
}

export interface MapVisualizationRendererOptions {
  container: string | HTMLElement;
  center?: [number, number];
  zoom?: number;
  visualizationType?: VisualizationType;
  config?: VisualizationTypeConfigs;
}

/**
 * Unified renderer for multiple map visualization types
 */
export class MapVisualizationRenderer {
  private map: L.Map;
  private heatmapContainer?: HTMLElement;
  private densityLayer: L.LayerGroup;
  private markerLayer: L.LayerGroup;
  private pointLayer: L.LayerGroup;
  
  private currentVisualizationType: VisualizationType = 'heatmap';
  private currentConfig: VisualizationTypeConfigs = {};
  private currentData: Location[] = [];

  constructor(options: MapVisualizationRendererOptions) {
    // Initialize map
    this.map = L.map(
      typeof options.container === 'string' 
        ? options.container 
        : options.container
    ).setView(
      options.center || [40.7128, -74.0060], 
      options.zoom || 10
    );

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Initialize layers
    this.densityLayer = L.layerGroup();
    this.markerLayer = L.layerGroup();
    this.pointLayer = L.layerGroup();
    
    // Set initial visualization type and config
    this.currentVisualizationType = options.visualizationType || 'heatmap';
    this.currentConfig = options.config || {};

    // Add CSS for alert markers
    this.injectAlertMarkerCSS();
  }

  /**
   * Render data with current visualization type
   */
  public render(data: Location[]): void {
    this.currentData = data;
    this.clearAllLayers();

    switch (this.currentVisualizationType) {
      case 'heatmap':
        this.renderHeatmap(data);
        break;
      case 'density':
        this.renderDensity(data);
        break;
      case 'markers':
        this.renderMarkers(data);
        break;
      case 'points':
        this.renderPoints(data);
        break;
      default:
        console.warn('Unknown visualization type:', this.currentVisualizationType);
        this.renderHeatmap(data);
    }

    // Fit map to data bounds if we have data
    if (data.length > 0) {
      this.fitMapToBounds(data);
    }
  }

  /**
   * Change visualization type and re-render
   */
  public setVisualizationType(type: VisualizationType, config?: VisualizationTypeConfigs): void {
    this.currentVisualizationType = type;
    if (config) {
      this.currentConfig = config;
    }
    this.render(this.currentData);
  }

  /**
   * Update visualization configuration
   */
  public updateConfig(config: VisualizationTypeConfigs): void {
    this.currentConfig = { ...this.currentConfig, ...config };
    this.render(this.currentData);
  }

  /**
   * Render heatmap visualization using canvas-based approach
   */
  private renderHeatmap(data: Location[]): void {
    // Create heatmap container if it doesn't exist
    if (!this.heatmapContainer) {
      this.heatmapContainer = document.createElement('canvas');
      this.heatmapContainer.style.position = 'absolute';
      this.heatmapContainer.style.top = '0';
      this.heatmapContainer.style.left = '0';
      this.heatmapContainer.style.pointerEvents = 'none';
      this.heatmapContainer.style.zIndex = '200';
      this.map.getContainer().appendChild(this.heatmapContainer);
    }

    this.drawHeatmapCanvas(data);
  }

  /**
   * Draw heatmap on canvas
   */
  private drawHeatmapCanvas(data: Location[]): void {
    if (!this.heatmapContainer) return;

    const canvas = this.heatmapContainer as HTMLCanvasElement;
    const container = this.map.getContainer();
    const size = this.map.getSize();

    canvas.width = size.x;
    canvas.height = size.y;
    canvas.style.width = container.style.width;
    canvas.style.height = container.style.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const heatmapConfig = this.currentConfig.heatmap || {};
    const radius = heatmapConfig.radius || 20;
    const maxOpacity = heatmapConfig.maxOpacity || 0.8;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heat points
    data.forEach(location => {
      if (location.coordinates) {
        const point = this.map.latLngToContainerPoint([
          location.coordinates.lat,
          location.coordinates.lng
        ]);

        const intensity = (location.intensity || 1) / 10; // Normalize intensity
        const alpha = Math.min(intensity * maxOpacity, maxOpacity);

        // Create radial gradient
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
        gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 0, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
      }
    });
  }

  /**
   * Render density grid visualization
   */
  private renderDensity(data: Location[]): void {
    const densityConfig = this.currentConfig.density || {} as DensityConfig;
    const bounds = this.map.getBounds();
    const mapBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };
    const gridCells = DensityCalculator.calculateDensityGrid(data, mapBounds, densityConfig);
    
    this.densityLayer.clearLayers();

    // Calculate max value for color scaling
    const maxValue = Math.max(...gridCells.map(cell => cell.value), 1);
    const colorScale = densityConfig.colorScale || ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'];

    gridCells.forEach((cell: any) => {
      const bounds = L.latLngBounds(
        [cell.bounds.south, cell.bounds.west],
        [cell.bounds.north, cell.bounds.east]
      );

      // Calculate additional properties
      const cellColor = DensityCalculator.getColorForDensity(cell.value, maxValue, colorScale);
      const cellArea = this.calculateCellArea(cell.bounds);
      const density = cellArea > 0 ? cell.value / cellArea : 0;

      const rectangle = L.rectangle(bounds, {
        fillColor: cellColor,
        fillOpacity: 0.6,
        color: '#ffffff',
        weight: 1,
        opacity: 0.3
      });

      // Add popup with density information
      rectangle.bindPopup(`
        <div>
          <strong>Density Grid Cell</strong><br>
          Points: ${cell.count || 0}<br>
          Value: ${cell.value ? cell.value.toFixed(3) : '0.000'}<br>
          Density: ${density ? density.toFixed(3) : '0.000'}<br>
          Area: ${cellArea ? cellArea.toFixed(2) : '0.00'} km²
        </div>
      `);

      this.densityLayer.addLayer(rectangle);
    });

    this.densityLayer.addTo(this.map);
  }

  /**
   * Calculate approximate area of a grid cell in km²
   */
  private calculateCellArea(bounds: { north: number; south: number; east: number; west: number }): number {
    const R = 6371; // Earth's radius in km
    const latDiff = (bounds.north - bounds.south) * Math.PI / 180;
    const lngDiff = (bounds.east - bounds.west) * Math.PI / 180;
    const avgLat = ((bounds.north + bounds.south) / 2) * Math.PI / 180;
    
    const area = R * R * latDiff * lngDiff * Math.cos(avgLat);
    return Math.abs(area);
  }

  /**
   * Render alert markers for all location data
   */
  private renderMarkers(data: Location[]): void {
    const markerConfig = this.currentConfig.markers || {} as MarkerConfig;
    
    this.markerLayer.clearLayers();

    data.forEach((location, index) => {
      if (location.coordinates) {
        // Convert location to alert marker format
        const alertMarker: AlertMarker = {
          ...location,
          alertType: this.determineAlertType(location, markerConfig),
          severity: location.intensity ? Math.ceil(location.intensity * 5) : 3,
          status: 'active',
          description: this.extractDescription(location, index),
          timestamp: new Date()
        };

        const icon = AlertIconGenerator.createAlertIcon(
          alertMarker.alertType,
          alertMarker.severity,
          markerConfig
        );

        const marker = L.marker(
          [alertMarker.coordinates.lat, alertMarker.coordinates.lng],
          { icon }
        );

        // Add popup with alert information
        const popupContent = AlertIconGenerator.createAlertPopup(alertMarker);
        marker.bindPopup(popupContent, {
          maxWidth: 350,
          className: 'alert-popup-container'
        });

        // Add tooltip for quick info
        marker.bindTooltip(
          `${alertMarker.name || 'Location'} (${alertMarker.alertType})`,
          {
            direction: 'top',
            offset: [0, -32]
          }
        );

        this.markerLayer.addLayer(marker);
      }
    });

    this.markerLayer.addTo(this.map);
  }

  /**
   * Determine the appropriate alert type for a location
   */
  private determineAlertType(location: Location, markerConfig: MarkerConfig): AlertMarker['alertType'] {
    // First check if user has selected a specific marker style
    if (markerConfig.iconType) {
      return markerConfig.iconType as AlertMarker['alertType'];
    }
    
    // Then check if GeoJSON properties contain alert type information
    if (location.metadata?.processedAlertType) {
      const geoAlertType = String(location.metadata.processedAlertType).toLowerCase();
      // Map common GeoJSON alert types to our internal types
      if (geoAlertType.includes('critical') || geoAlertType.includes('🔴')) return 'critical';
      if (geoAlertType.includes('warning') || geoAlertType.includes('⚠️') || geoAlertType.includes('🟡')) return 'warning';
      if (geoAlertType.includes('success') || geoAlertType.includes('✅') || geoAlertType.includes('🟢')) return 'success';
      if (geoAlertType.includes('danger') || geoAlertType.includes('❌')) return 'danger';
      if (geoAlertType.includes('info') || geoAlertType.includes('🔵')) return 'info';
    }
    
    // Default to info
    return 'info';
  }

  /**
   * Extract description from location metadata
   */
  private extractDescription(location: Location, index: number): string {
    // Try various properties for description
    if (location.metadata?.description) return String(location.metadata.description);
    if (location.metadata?.alert_type) return String(location.metadata.alert_type);
    if (location.metadata?.info) return String(location.metadata.info);
    if (location.metadata?.details) return String(location.metadata.details);
    if (location.name) return `Location: ${location.name}`;
    
    return `Data point ${index + 1}`;
  }

  /**
   * Render simple point markers
   */
  private renderPoints(data: Location[]): void {
    const pointConfig = this.currentConfig.points || {} as PointConfig;
    
    this.pointLayer.clearLayers();

    data.forEach((location, index) => {
      if (location.coordinates) {
        const circle = L.circleMarker(
          [location.coordinates.lat, location.coordinates.lng],
          {
            radius: pointConfig.radius || 6,
            fillColor: pointConfig.fillColor || '#3498db',
            color: pointConfig.strokeColor || '#ffffff',
            weight: pointConfig.strokeWidth || 2,
            opacity: pointConfig.strokeOpacity || 1,
            fillOpacity: pointConfig.fillOpacity || 0.8
          }
        );

        // Add popup with location information
        circle.bindPopup(`
          <div>
            <strong>${location.name || `Point ${index + 1}`}</strong><br>
            ${(location as any).description ? `${(location as any).description}<br>` : ''}
            <small>
              Lat: ${location.coordinates.lat.toFixed(6)}<br>
              Lng: ${location.coordinates.lng.toFixed(6)}
            </small>
          </div>
        `);

        this.pointLayer.addLayer(circle);
      }
    });

    this.pointLayer.addTo(this.map);
  }

  /**
   * Clear all visualization layers
   */
  private clearAllLayers(): void {
    // Clear heatmap canvas
    if (this.heatmapContainer) {
      const canvas = this.heatmapContainer as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Clear other layers
    this.densityLayer.clearLayers();
    this.markerLayer.clearLayers();
    this.pointLayer.clearLayers();

    // Remove layers from map
    this.map.removeLayer(this.densityLayer);
    this.map.removeLayer(this.markerLayer);
    this.map.removeLayer(this.pointLayer);
  }

  /**
   * Fit map view to data bounds
   */
  private fitMapToBounds(data: Location[]): void {
    const validCoordinates = data
      .filter(location => location.coordinates)
      .map(location => [location.coordinates!.lat, location.coordinates!.lng] as [number, number]);

    if (validCoordinates.length > 0) {
      const bounds = L.latLngBounds(validCoordinates);
      this.map.fitBounds(bounds, { padding: [20, 20] });
    }
  }

  /**
   * Inject CSS for alert markers
   */
  private injectAlertMarkerCSS(): void {
    const existingStyle = document.getElementById('alert-marker-styles');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'alert-marker-styles';
      style.textContent = AlertIconGenerator.getAlertMarkerCSS();
      document.head.appendChild(style);
    }
  }

  /**
   * Get current visualization statistics
   */
  public getStats(): { 
    totalPoints: number; 
    visualizationType: VisualizationType;
    layerCounts: Record<string, number>;
  } {
    return {
      totalPoints: this.currentData.length,
      visualizationType: this.currentVisualizationType,
      layerCounts: {
        density: this.densityLayer.getLayers().length,
        markers: this.markerLayer.getLayers().length,
        points: this.pointLayer.getLayers().length
      }
    };
  }

  /**
   * Destroy the renderer and clean up resources
   */
  public destroy(): void {
    this.clearAllLayers();
    
    // Remove heatmap canvas
    if (this.heatmapContainer && this.heatmapContainer.parentNode) {
      this.heatmapContainer.parentNode.removeChild(this.heatmapContainer);
    }
    
    this.map.remove();
    AlertIconGenerator.clearCache();
    
    // Remove injected CSS
    const style = document.getElementById('alert-marker-styles');
    if (style) {
      style.remove();
    }
  }

  /**
   * Get the underlying Leaflet map instance
   */
  public getMap(): L.Map {
    return this.map;
  }
}
