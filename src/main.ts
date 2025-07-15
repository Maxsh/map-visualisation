import './style.css';
import 'leaflet/dist/leaflet.css';
import { HeatmapRenderer } from './components/HeatmapRenderer';
import { MapVisualizationRenderer } from './components/MapVisualizationRenderer';
import { FileUploadComponent } from './components/FileUploadComponent';
import { getSampleDataByType } from './data/sampleAlertData';
import type { Location, VisualizationType } from './types';

class HeatmapApp {
  private heatmapRenderer?: HeatmapRenderer;
  private densityRenderer?: MapVisualizationRenderer;
  private markersRenderer?: MapVisualizationRenderer;
  private currentData: Location[] = [];
  private currentVisualizationType: VisualizationType = 'heatmap';

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    this.setupUI();
    this.initializeRenderers();
    this.loadSampleData();
  }

  private setupUI(): void {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>🗺️ Interactive Heatmap Visualization</h1>
          <p>Visualize location data with multiple rendering modes</p>
        </header>
        
        <nav class="app-nav">
          <div class="nav-tabs">
            <button class="tab-button active" data-tab="heatmap">Heatmap</button>
            <button class="tab-button" data-tab="density">Density Grid</button>
            <button class="tab-button" data-tab="markers">Markers</button>
            <button class="tab-button" data-tab="upload">File Upload</button>
          </div>
          
          <div class="nav-controls">
            <button id="load-sample-btn" class="btn btn-secondary">Load Sample Data</button>
            <button id="clear-data-btn" class="btn btn-secondary">Clear Data</button>
            <div class="data-stats">
              <span id="data-count">0 points</span>
            </div>
          </div>
        </nav>

        <main class="app-main">
          <!-- Visualization Tabs -->
          <div id="heatmap-tab" class="tab-content active">
            <div class="tab-header">
              <h2>🔥 Heatmap Visualization</h2>
              <p>Classic heatmap rendering showing intensity distribution</p>
              <div class="controls">
                <label>
                  Radius: 
                  <input type="range" id="heatmap-radius" min="10" max="60" value="35" />
                  <span id="heatmap-radius-value">35</span>px
                </label>
                <label>
                  Opacity: 
                  <input type="range" id="heatmap-opacity" min="0.1" max="1" step="0.1" value="0.9" />
                  <span id="heatmap-opacity-value">0.9</span>
                </label>
              </div>
            </div>
            <div id="heatmap-container" style="height: 500px; width: 100%;"></div>
          </div>

          <div id="density-tab" class="tab-content">
            <div class="tab-header">
              <h2>📊 Density Grid Visualization</h2>
              <p>Grid-based density analysis with configurable cell size</p>
              <div class="controls">
                <label>
                  Grid Size: 
                  <input type="range" id="grid-size" min="10" max="50" value="20" />
                  <span id="grid-size-value">20</span>
                </label>
              </div>
            </div>
            <div id="density-container" style="height: 500px; width: 100%;"></div>
          </div>

          <div id="markers-tab" class="tab-content">
            <div class="tab-header">
              <h2>🚨 Location Markers</h2>
              <p>Custom markers for all uploaded location data with alert-style icons</p>
              <div class="controls">
                <label>
                  <input type="checkbox" id="pulse-animation" checked />
                  Pulse Animation
                </label>
                <label>
                  Icon Size: 
                  <select id="icon-size">
                    <option value="24">Small (24px)</option>
                    <option value="32" selected>Medium (32px)</option>
                    <option value="48">Large (48px)</option>
                  </select>
                </label>
                <label>
                  Filter by Alert Type: 
                  <select id="alert-type-filter">
                    <option value="all" selected>All Types</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="danger">Danger</option>
                    <option value="success">Success</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </label>
              </div>
            </div>
            <div id="markers-container" style="height: 500px; width: 100%;"></div>
          </div>

          <div id="upload-tab" class="tab-content">
            <div class="tab-header">
              <h2>📁 File Upload</h2>
              <p>Load your own data from JSON, CSV, TSV, or GeoJSON files</p>
            </div>
            <div id="upload-container"></div>
          </div>
        </main>

        <footer class="app-footer">
          <p>Built with TypeScript, Vite, and Leaflet</p>
        </footer>
      </div>
    `;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const tabName = target.dataset.tab as VisualizationType | 'upload';
        this.switchTab(tabName);
      });
    });

    // Control buttons
    document.getElementById('load-sample-btn')?.addEventListener('click', () => {
      this.loadSampleData();
    });

    document.getElementById('clear-data-btn')?.addEventListener('click', () => {
      this.clearData();
    });

    // Heatmap controls
    const heatmapRadiusSlider = document.getElementById('heatmap-radius') as HTMLInputElement;
    const heatmapRadiusValue = document.getElementById('heatmap-radius-value');
    heatmapRadiusSlider?.addEventListener('input', () => {
      if (heatmapRadiusValue) heatmapRadiusValue.textContent = heatmapRadiusSlider.value;
      if (this.currentVisualizationType === 'heatmap') {
        this.renderVisualization();
      }
    });

    const heatmapOpacitySlider = document.getElementById('heatmap-opacity') as HTMLInputElement;
    const heatmapOpacityValue = document.getElementById('heatmap-opacity-value');
    heatmapOpacitySlider?.addEventListener('input', () => {
      if (heatmapOpacityValue) heatmapOpacityValue.textContent = heatmapOpacitySlider.value;
      if (this.currentVisualizationType === 'heatmap') {
        this.renderVisualization();
      }
    });

    // Density controls
    const gridSizeSlider = document.getElementById('grid-size') as HTMLInputElement;
    const gridSizeValue = document.getElementById('grid-size-value');
    gridSizeSlider?.addEventListener('input', () => {
      if (gridSizeValue) gridSizeValue.textContent = gridSizeSlider.value;
      if (this.currentVisualizationType === 'density') {
        this.renderVisualization();
      }
    });

    // Marker controls
    const pulseAnimation = document.getElementById('pulse-animation') as HTMLInputElement;
    const iconSize = document.getElementById('icon-size') as HTMLSelectElement;
    const alertTypeFilter = document.getElementById('alert-type-filter') as HTMLSelectElement;
    
    pulseAnimation?.addEventListener('change', () => {
      if (this.currentVisualizationType === 'markers') {
        this.renderVisualization();
      }
    });
    iconSize?.addEventListener('change', () => {
      if (this.currentVisualizationType === 'markers') {
        this.renderVisualization();
      }
    });
    alertTypeFilter?.addEventListener('change', () => {
      if (this.currentVisualizationType === 'markers') {
        this.renderVisualization();
      }
    });
  }

  private initializeRenderers(): void {
    // Initialize legacy heatmap renderer
    this.heatmapRenderer = new HeatmapRenderer('heatmap-container');

    // Initialize file upload component with CSS injection
    const style = document.createElement('style');
    style.textContent = FileUploadComponent.getCSS();
    document.head.appendChild(style);

    new FileUploadComponent('upload-container', (data: Location[]) => {
      this.currentData = data;
      this.updateDataStats();
      this.renderVisualization();
    });
  }

  private switchTab(tabName: string): void {
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`)?.classList.add('active');

    // Update current visualization type and render
    if (tabName !== 'upload') {
      this.currentVisualizationType = tabName as VisualizationType;
      
      // Use setTimeout to ensure the container is visible before rendering
      setTimeout(() => {
        this.renderVisualization();
        this.invalidateMaps();
      }, 50);
    }
  }

  /**
   * Invalidate map sizes after tab switch to ensure proper rendering
   */
  private invalidateMaps(): void {
    // Small delay to ensure DOM has updated
    setTimeout(() => {
      if (this.currentVisualizationType === 'density' && this.densityRenderer) {
        this.densityRenderer.getMap()?.invalidateSize();
      } else if (this.currentVisualizationType === 'markers' && this.markersRenderer) {
        this.markersRenderer.getMap()?.invalidateSize();
      } else if (this.currentVisualizationType === 'heatmap' && this.heatmapRenderer) {
        const map = this.heatmapRenderer.getMap();
        if (map) {
          map.invalidateSize();
        }
      }
    }, 100);
  }

  private loadSampleData(): void {
    this.currentData = getSampleDataByType(this.currentVisualizationType);
    this.updateDataStats();
    this.renderVisualization();
  }

  private clearData(): void {
    this.currentData = [];
    this.updateDataStats();
    this.renderVisualization();
  }

  private renderVisualization(): void {
    if (this.currentData.length === 0) return;

    try {
      switch (this.currentVisualizationType) {
        case 'heatmap':
          this.renderHeatmap();
          break;
        case 'density':
          this.renderDensity();
          break;
        case 'markers':
          this.renderMarkers();
          break;
      }
    } catch (error) {
      console.error(`Error rendering ${this.currentVisualizationType} visualization:`, error);
    }
  }

  private renderHeatmap(): void {
    // Ensure container is ready
    if (!this.isContainerReady('heatmap-container')) {
      console.warn('Heatmap container not ready, retrying...');
      setTimeout(() => this.renderHeatmap(), 100);
      return;
    }

    if (this.heatmapRenderer) {
      // Get dynamic values from controls
      const radius = parseInt((document.getElementById('heatmap-radius') as HTMLInputElement)?.value || '35');
      const maxOpacity = parseFloat((document.getElementById('heatmap-opacity') as HTMLInputElement)?.value || '0.9');

      // Use the existing HeatmapRenderer API
      const visualization = {
        locations: this.currentData,
        mapConfig: {
          center: { lat: 40.7128, lng: -74.0060 },
          zoom: 11,
          maxZoom: 18,
          minZoom: 2
        },
        heatmapConfig: {
          radius: radius,
          maxOpacity: maxOpacity,
          minOpacity: 0.1,
          blur: 0.85,
          gradient: {
            0.0: '#0080ff',
            0.2: '#00ff80', 
            0.4: '#80ff00',
            0.6: '#ffff00',
            0.8: '#ff8000',
            1.0: '#ff0000'
          }
        }
      };
      
      if (this.currentData.length === 0) {
        this.heatmapRenderer.updateData([], visualization.heatmapConfig);
      } else {
        this.heatmapRenderer.initialize(visualization).catch(console.error);
      }
    }
  }

  /**
   * Check if a container element is visible and has dimensions
   */
  private isContainerReady(containerId: string): boolean {
    const container = document.getElementById(containerId);
    if (!container) return false;
    
    const rect = container.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  private renderDensity(): void {
    // Ensure container is ready
    if (!this.isContainerReady('density-container')) {
      console.warn('Density container not ready, retrying...');
      setTimeout(() => this.renderDensity(), 100);
      return;
    }

    if (!this.densityRenderer) {
      this.densityRenderer = new MapVisualizationRenderer({
        container: 'density-container',
        center: [40.7128, -74.0060],
        zoom: 11,
        visualizationType: 'density'
      });
    }

    const gridSize = parseInt((document.getElementById('grid-size') as HTMLInputElement)?.value || '20');
    
    this.densityRenderer.setVisualizationType('density', {
      density: {
        gridSize,
        colorScale: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
        showGrid: true,
        aggregationMethod: 'count'
      }
    });
    
    this.densityRenderer.render(this.currentData);
  }

  private renderMarkers(): void {
    // Ensure container is ready
    if (!this.isContainerReady('markers-container')) {
      console.warn('Markers container not ready, retrying...');
      setTimeout(() => this.renderMarkers(), 100);
      return;
    }

    if (!this.markersRenderer) {
      this.markersRenderer = new MapVisualizationRenderer({
        container: 'markers-container',
        center: [40.7128, -74.0060],
        zoom: 11,
        visualizationType: 'markers'
      });
    }

    const pulseAnimation = (document.getElementById('pulse-animation') as HTMLInputElement)?.checked || false;
    const iconSize = parseInt((document.getElementById('icon-size') as HTMLSelectElement)?.value || '32');
    const alertTypeFilter = (document.getElementById('alert-type-filter') as HTMLSelectElement)?.value || 'all';

    // Filter data by alert type
    const filteredData = this.filterDataByAlertType(this.currentData, alertTypeFilter);

    this.markersRenderer.setVisualizationType('markers', {
      markers: {
        iconSize: [iconSize, iconSize],
        pulseAnimation,
        showPopups: true,
        clustering: false
      }
    });

    this.markersRenderer.render(filteredData);
  }

  /**
   * Filter data by alert type
   */
  private filterDataByAlertType(data: Location[], filterValue: string): Location[] {
    if (filterValue === 'all') {
      return data;
    }

    return data.filter(location => {
      // Check if location has alert type information in metadata
      const alertType = this.extractAlertTypeFromLocation(location);
      return alertType === filterValue;
    });
  }

  /**
   * Extract alert type from location data
   */
  private extractAlertTypeFromLocation(location: Location): string {
    // Check various possible sources for alert type
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
    if (location.metadata?.alertType) return String(location.metadata.alertType);
    if (location.metadata?.alert_type) return String(location.metadata.alert_type);
    if (location.metadata?.type) return String(location.metadata.type);

    // Default to info if no specific type found
    return 'info';
  }

  private updateDataStats(): void {
    const statsElement = document.getElementById('data-count');
    if (statsElement) {
      statsElement.textContent = `${this.currentData.length} points`;
    }
  }
}

// Initialize the application
new HeatmapApp();
