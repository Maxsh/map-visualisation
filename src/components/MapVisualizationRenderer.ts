import L from 'leaflet';
import 'leaflet.heat';
import type { 
  Location, 
  VisualizationType, 
  DensityConfig,
  MarkerConfig,
  PointConfig,
  AlertMarker
} from '../types';
import { AlertIconGenerator } from '../utils/alertIconGenerator';
import { calculateDistrictDensities } from '../data/kyivDistricts';

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
  private heatLayer?: L.HeatLayer;
  private densityLayer: L.LayerGroup;
  private markerLayer: L.LayerGroup;
  private pointLayer: L.LayerGroup;
  private clickedDistrictLabels: Map<string, L.Marker> = new Map();
  
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
    
    // Add event listeners for map updates
    this.setupMapEventListeners();
  }

  /**
   * Setup event listeners for map updates
   */
  private setupMapEventListeners(): void {
    this.map.on('moveend zoomend', () => {
      // Leaflet.heat handles map updates automatically
      // No need to manually redraw
    });
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
   * Render heatmap visualization using Leaflet.heat for natural organic shapes
   */
  private renderHeatmap(data: Location[]): void {
    // Remove existing heat layer if it exists
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
    }

    // Convert location data to Leaflet.heat format
    const heatData = data
      .filter(location => location.coordinates)
      .map(location => [
        location.coordinates!.lat,
        location.coordinates!.lng,
        (location.intensity || 0.8) * 1.5 // Increased default intensity and multiplier
      ] as [number, number, number]);

    // Create heat layer with enhanced sensitivity settings
    const heatmapConfig = this.currentConfig.heatmap || {};
    this.heatLayer = L.heatLayer(heatData, {
      radius: heatmapConfig.radius || 25,
      blur: heatmapConfig.blur || 15,
      maxZoom: 17,
      max: 0.5, // Reduced max value for higher sensitivity
      minOpacity: 0.0,
      gradient: heatmapConfig.gradient || {
        0.2: 'blue',
        0.4: 'cyan',
        0.5: 'lime',
        0.6: 'yellow',
        0.7: 'orange',
        1.0: 'red'
      }
    });

    // Add to map
    this.heatLayer.addTo(this.map);
  }

  /**
   * Render density visualization based on Kyiv districts
   */
  private renderDensity(data: Location[]): void {
    this.densityLayer.clearLayers();

    // Get configuration
    const densityConfig = this.currentConfig.density || {} as DensityConfig;
    const showPopulation = densityConfig.showPopulation ?? true;

    // Calculate district densities
    const districtStats = calculateDistrictDensities(data);
    
    // Find max density for color scaling
    const maxDensity = Math.max(...districtStats.map(stat => stat.density), 0.001);
    
    // Color scale for districts
    const colorScale = densityConfig.colorScale || [
      '#ffffcc', '#ffeda0', '#fed976', '#feb24c', 
      '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'
    ];

    districtStats.forEach(stat => {
      const { district, count, density } = stat;
      
      // Validate coordinates before creating polygon
      if (!district.bounds || !Array.isArray(district.bounds) || district.bounds.length === 0) {
        console.warn(`Invalid bounds for district ${district.name}:`, district.bounds);
        return;
      }
      
      // Filter out any invalid coordinates
      const validCoordinates = district.bounds.filter(coord => 
        coord && 
        Array.isArray(coord) && 
        coord.length === 2 && 
        typeof coord[0] === 'number' && 
        typeof coord[1] === 'number' &&
        !isNaN(coord[0]) && 
        !isNaN(coord[1])
      );
      
      if (validCoordinates.length === 0) {
        console.warn(`No valid coordinates for district ${district.name}`);
        return;
      }
      
      try {
        // Create polygon for district - coordinates are already in [lat, lng] format
        const polygon = L.polygon(validCoordinates as L.LatLngTuple[], {
          fillColor: this.getColorForDensity(density, maxDensity, colorScale),
          fillOpacity: 0.7,
          color: '#ffffff',
          weight: 2,
          opacity: 0.8
        });

        // Add popup with district information
        const populationInfo = showPopulation && district.population ? 
          `• Population: <strong>${district.population.toLocaleString()}</strong><br>` : '';
        
        const popupContent = `
          <div style="min-width: 200px;">
            <strong>${district.nameUa} (${district.name})</strong><br>
            <div style="margin-top: 8px;">
              <strong>📊 Statistics:</strong><br>
              • Points: <strong>${count}</strong><br>
              • Area: <strong>${district.area.toFixed(1)} km²</strong><br>
              • Density: <strong>${density.toFixed(2)} points/km²</strong><br>
              ${populationInfo}
            </div>
            <div style="margin-top: 8px; font-size: 0.9em; color: #666;">
              Click to focus on this district
            </div>
          </div>
        `;

        polygon.bindPopup(popupContent);

        // Add click handler to focus on district and toggle label
        polygon.on('click', () => {
          const bounds = L.latLngBounds(validCoordinates as L.LatLngTuple[]);
          this.map.fitBounds(bounds, { padding: [20, 20] });
          
          // Toggle district label on click
          this.toggleDistrictLabel(district, count, density, validCoordinates as L.LatLngTuple[], showPopulation);
        });

        // Add hover effects
        polygon.on('mouseover', () => {
          polygon.setStyle({
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8
          });
        });

        polygon.on('mouseout', () => {
          polygon.setStyle({
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.7
          });
        });

        this.densityLayer.addLayer(polygon);
        
      } catch (error) {
        console.error(`Error creating polygon for ${district.name}:`, error);
        return;
      }
    });

    this.densityLayer.addTo(this.map);

    // Add legend
    this.addDensityLegend(maxDensity, colorScale);
  }

  /**
   * Get color for density value
   */
  private getColorForDensity(density: number, maxDensity: number, colorScale: string[]): string {
    if (density === 0) return colorScale[0];
    
    const normalizedDensity = Math.min(density / maxDensity, 1);
    const index = Math.floor(normalizedDensity * (colorScale.length - 1));
    return colorScale[Math.min(index, colorScale.length - 1)];
  }

  /**
   * Add density legend to the map
   */
  private addDensityLegend(maxDensity: number, colorScale: string[]): void {
    const legend = new L.Control({ position: 'bottomright' });
    
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'density-legend');
      div.style.cssText = `
        background: rgba(255, 255, 255, 0.95);
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        font-size: 12px;
        line-height: 1.4;
        color: #333;
        border: 1px solid #ccc;
      `;

      let legendHtml = '<strong style="color: #333;">Density (points/km²)</strong><br>';
      
      // Create legend entries
      const steps = 5;
      for (let i = 0; i < steps; i++) {
        const density = (maxDensity * i / (steps - 1));
        const color = this.getColorForDensity(density, maxDensity, colorScale);
        legendHtml += `
          <div style="margin: 2px 0; color: #333;">
            <span style="
              display: inline-block;
              width: 20px;
              height: 12px;
              background: ${color};
              border: 1px solid #666;
              margin-right: 5px;
              vertical-align: middle;
            "></span>
            ${density.toFixed(1)}
          </div>
        `;
      }

      div.innerHTML = legendHtml;
      return div;
    };

    legend.addTo(this.map);
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
          alertType: this.determineAlertType(location),
          severity: location.intensity ? Math.ceil(location.intensity * 5) : 3,
          status: 'active',
          description: this.extractDescription(location, index),
          timestamp: location.metadata?.date_time ? new Date(location.metadata?.date_time) : undefined,
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
  private determineAlertType(location: Location): AlertMarker['alertType'] {
    // Check if GeoJSON properties contain alert type information
    if (location.metadata?.processedAlertType) {
      const geoAlertType = String(location.metadata.processedAlertType).toLowerCase();
      // Map common GeoJSON alert types to our internal types
      if (geoAlertType.includes('critical') || geoAlertType.includes('🔴')) return 'critical';
      if (geoAlertType.includes('warning') || geoAlertType.includes('⚠️') || geoAlertType.includes('🟡')) return 'warning';
      if (geoAlertType.includes('success') || geoAlertType.includes('✅') || geoAlertType.includes('🟢')) return 'success';
      if (geoAlertType.includes('danger') || geoAlertType.includes('❌')) return 'danger';
      if (geoAlertType.includes('resolved') || geoAlertType.includes('✔️')) return 'resolved';
      if (geoAlertType.includes('info') || geoAlertType.includes('🔵')) return 'info';
    }
    
    // Check if it's already an AlertMarker with alertType
    if ((location as any).alertType) {
      return (location as any).alertType;
    }

    // Check metadata for direct alert type fields
    if (location.metadata?.alertType) {
      const alertType = String(location.metadata.alertType).toLowerCase();
      if (['critical', 'warning', 'info', 'danger', 'success', 'resolved'].includes(alertType)) {
        return alertType as AlertMarker['alertType'];
      }
    }
    
    if (location.metadata?.alert_type) {
      const alertType = String(location.metadata.alert_type).toLowerCase();
      if (['critical', 'warning', 'info', 'danger', 'success', 'resolved'].includes(alertType)) {
        return alertType as AlertMarker['alertType'];
      }
    }
    
    if (location.metadata?.type) {
      const alertType = String(location.metadata.type).toLowerCase();
      if (['critical', 'warning', 'info', 'danger', 'success', 'resolved'].includes(alertType)) {
        return alertType as AlertMarker['alertType'];
      }
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
    // Clear heat layer
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
      this.heatLayer = undefined;
    }

    // Clear other layers
    this.densityLayer.clearLayers();
    this.markerLayer.clearLayers();
    this.pointLayer.clearLayers();
    
    // Clear clicked district labels
    this.clickedDistrictLabels.clear();

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
   * Toggle district label on click
   */
  private toggleDistrictLabel(
    district: { name: string; nameUa: string; population: number; area: number },
    count: number,
    density: number,
    coordinates: L.LatLngTuple[],
    showPopulation: boolean
  ): void {
    const labelKey = district.name;
    
    // Check if label already exists
    if (this.clickedDistrictLabels.has(labelKey)) {
      // Remove existing label
      const existingLabel = this.clickedDistrictLabels.get(labelKey);
      if (existingLabel) {
        this.densityLayer.removeLayer(existingLabel);
        this.clickedDistrictLabels.delete(labelKey);
      }
    } else {
      // Create new label
      const populationLabel = showPopulation && district.population ? 
        `<br><span style="font-size: 9px; color: #666;">Pop: ${(district.population / 1000).toFixed(0)}k</span>` : '';
      
      const labelIcon = L.divIcon({
        className: 'district-label',
        html: `<div style="
          background: rgba(255, 255, 255, 0.95);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
          color: #333;
          border: 1px solid #ddd;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          white-space: nowrap;
          text-align: center;
        ">
          ${district.nameUa}
          <br><span style="font-size: 10px; color: #666;">
            ${count} pts (${density.toFixed(1)}/km²)
          </span>
          ${populationLabel}
        </div>`,
        iconSize: [120, 50],
        iconAnchor: [60, 25]
      });

      // Calculate center from bounds
      const bounds = L.latLngBounds(coordinates);
      const center = bounds.getCenter();
      
      const label = L.marker(center, { icon: labelIcon });
      this.densityLayer.addLayer(label);
      this.clickedDistrictLabels.set(labelKey, label);
    }
  }

  /**
   * Destroy the renderer and clean up resources
   */
  public destroy(): void {
    this.clearAllLayers();
    
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
