import './style.css';
import 'leaflet/dist/leaflet.css';
import { MapVisualizationRenderer } from './components/MapVisualizationRenderer';
import { FileUploadComponent } from './components/FileUploadComponent';
import { getSampleDataByType } from './data/sampleAlertData';
import type { Location, VisualizationType } from './types';

class HeatmapApp {
  private renderer?: MapVisualizationRenderer;
  private currentData: Location[] = [];
  private currentVisualizationType: VisualizationType = 'heatmap';
  private readonly DATA_STORAGE_KEY = 'heatmap_app_data';

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    this.setupUI();
    this.initializeRenderers();
    this.loadStoredData();
  }

  /**
   * Save current data to localStorage
   */
  private saveDataToStorage(): void {
    try {
      const dataToStore = {
        data: this.currentData,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem(this.DATA_STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.warn('Failed to save data to localStorage:', error);
    }
  }

  /**
   * Load data from localStorage
   */
  private loadStoredData(): void {
    try {
      const storedData = localStorage.getItem(this.DATA_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.data && Array.isArray(parsed.data)) {
          this.currentData = parsed.data;
          this.updateDataStats();
          this.renderVisualization();
          console.log(`Loaded ${this.currentData.length} points from storage`);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load data from localStorage:', error);
    }
    
    // Fallback to sample data if no stored data or error
    this.loadSampleData();
  }

  /**
   * Clear data from storage
   */
  private clearStoredData(): void {
    try {
      localStorage.removeItem(this.DATA_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear data from localStorage:', error);
    }
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
                  <input type="range" id="heatmap-radius" min="20" max="80" value="50" />
                  <span id="heatmap-radius-value">50</span>px
                </label>
                <label>
                  Opacity: 
                  <input type="range" id="heatmap-opacity" min="0.3" max="1" step="0.1" value="0.8" />
                  <span id="heatmap-opacity-value">0.8</span>
                </label>
                <label>
                  Intensity: 
                  <input type="range" id="heatmap-intensity" min="0.5" max="2" step="0.1" value="1.2" />
                  <span id="heatmap-intensity-value">1.2</span>x
                </label>
                <label>
                  Filter by Alert Type: 
                  <select id="heatmap-alert-type-filter">
                    <option value="all" selected>All Types</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="danger">Danger</option>
                    <option value="success">Success</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </label>
                <label>
                  Filter by Time: 
                  <select id="heatmap-time-filter">
                    <option value="0" selected>All Time</option>
                    <option value="1">Last 1 hour</option>
                    <option value="2">Last 2 hours</option>
                    <option value="3">Last 3 hours</option>
                    <option value="4">Last 4 hours</option>
                    <option value="5">Last 5 hours</option>
                    <option value="6">Last 6 hours</option>
                    <option value="7">Last 7 hours</option>
                    <option value="8">Last 8 hours</option>
                  </select>
                </label>
                <div class="filter-status" id="heatmap-filter-status">
                  <span id="heatmap-filter-count">Showing all data points</span>
                </div>
              </div>
            </div>
            <div id="heatmap-container" style="height: 750px; width: 100%;"></div>
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
                <label>
                  Filter by Alert Type: 
                  <select id="density-alert-type-filter">
                    <option value="all" selected>All Types</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="danger">Danger</option>
                    <option value="success">Success</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </label>
                <label>
                  Filter by Time: 
                  <select id="density-time-filter">
                    <option value="0" selected>All Time</option>
                    <option value="1">Last 1 hour</option>
                    <option value="2">Last 2 hours</option>
                    <option value="3">Last 3 hours</option>
                    <option value="4">Last 4 hours</option>
                    <option value="5">Last 5 hours</option>
                    <option value="6">Last 6 hours</option>
                    <option value="7">Last 7 hours</option>
                    <option value="8">Last 8 hours</option>
                  </select>
                </label>
                <div class="filter-status" id="density-filter-status">
                  <span id="density-filter-count">Showing all data points</span>
                </div>
              </div>
            </div>
            <div id="density-container" style="height: 750px; width: 100%;"></div>
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
                <label>
                  Filter by Time: 
                  <select id="time-filter">
                    <option value="0" selected>All Time</option>
                    <option value="1">Last 1 hour</option>
                    <option value="2">Last 2 hours</option>
                    <option value="3">Last 3 hours</option>
                    <option value="4">Last 4 hours</option>
                    <option value="5">Last 5 hours</option>
                    <option value="6">Last 6 hours</option>
                    <option value="7">Last 7 hours</option>
                    <option value="8">Last 8 hours</option>
                  </select>
                </label>
                <div class="filter-status" id="filter-status">
                  <span id="filter-count">Showing all markers</span>
                </div>
              </div>
            </div>
            <div id="markers-container" style="height: 750px; width: 100%;"></div>
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
    this.setupCustomEventListeners();
  }

  /**
   * Setup custom event listeners for inter-component communication
   */
  private setupCustomEventListeners(): void {
    // Listen for export data event from file upload component
    window.addEventListener('exportData', () => {
      this.exportCurrentData();
    });
  }

  /**
   * Export current data as JSON file
   */
  private exportCurrentData(): void {
    if (this.currentData.length === 0) {
      alert('No data to export');
      return;
    }

    const dataToExport = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalPoints: this.currentData.length,
        version: '1.0'
      },
      data: this.currentData
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heatmap-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

    const heatmapIntensitySlider = document.getElementById('heatmap-intensity') as HTMLInputElement;
    const heatmapIntensityValue = document.getElementById('heatmap-intensity-value');
    heatmapIntensitySlider?.addEventListener('input', () => {
      if (heatmapIntensityValue) heatmapIntensityValue.textContent = heatmapIntensitySlider.value;
      if (this.currentVisualizationType === 'heatmap') {
        this.renderVisualization();
      }
    });

    // Heatmap filter controls
    const heatmapAlertTypeFilter = document.getElementById('heatmap-alert-type-filter') as HTMLSelectElement;
    const heatmapTimeFilter = document.getElementById('heatmap-time-filter') as HTMLSelectElement;
    
    heatmapAlertTypeFilter?.addEventListener('change', () => {
      if (this.currentVisualizationType === 'heatmap') {
        this.renderVisualization();
      }
    });
    
    heatmapTimeFilter?.addEventListener('change', () => {
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

    // Density filter controls
    const densityAlertTypeFilter = document.getElementById('density-alert-type-filter') as HTMLSelectElement;
    const densityTimeFilter = document.getElementById('density-time-filter') as HTMLSelectElement;
    
    densityAlertTypeFilter?.addEventListener('change', () => {
      if (this.currentVisualizationType === 'density') {
        this.renderVisualization();
      }
    });
    
    densityTimeFilter?.addEventListener('change', () => {
      if (this.currentVisualizationType === 'density') {
        this.renderVisualization();
      }
    });

    // Marker controls
    const pulseAnimation = document.getElementById('pulse-animation') as HTMLInputElement;
    const iconSize = document.getElementById('icon-size') as HTMLSelectElement;
    const alertTypeFilter = document.getElementById('alert-type-filter') as HTMLSelectElement;
    const timeFilter = document.getElementById('time-filter') as HTMLSelectElement;
    
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
    timeFilter?.addEventListener('change', () => {
      if (this.currentVisualizationType === 'markers') {
        this.renderVisualization();
      }
    });
  }

  private initializeRenderers(): void {
    // Initialize unified renderer
    this.renderer = new MapVisualizationRenderer({
      container: 'heatmap-container',
      center: [40.7128, -74.0060],
      zoom: 11,
      visualizationType: 'heatmap'
    });

    // Initialize file upload component with CSS injection
    const style = document.createElement('style');
    style.textContent = FileUploadComponent.getCSS();
    document.head.appendChild(style);

    new FileUploadComponent('upload-container', (data: Location[], _result: any, shouldAppend: boolean = false) => {
      if (shouldAppend) {
        // Append new data to existing data
        this.currentData = [...this.currentData, ...data];
        console.log(`Appended ${data.length} points. Total: ${this.currentData.length} points`);
      } else {
        // Replace existing data
        this.currentData = data;
        console.log(`Loaded ${data.length} points`);
      }
      this.saveDataToStorage();
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
      
      // Update container for the new visualization type
      this.updateRendererContainer(tabName as VisualizationType);
      
      // Use setTimeout to ensure the container is visible before rendering
      setTimeout(() => {
        this.renderVisualization();
        this.invalidateMaps();
      }, 50);
    }
  }

  /**
   * Update renderer container for different visualization types
   */
  private updateRendererContainer(visualizationType: VisualizationType): void {
    if (!this.renderer) return;

    const containerMap: Record<VisualizationType, string> = {
      'heatmap': 'heatmap-container',
      'density': 'density-container',
      'markers': 'markers-container',
      'points': 'markers-container' // Use markers container for points
    };

    const containerId = containerMap[visualizationType];
    if (containerId) {
      // Create new renderer for the specific container
      this.renderer.destroy();
      this.renderer = new MapVisualizationRenderer({
        container: containerId,
        center: [40.7128, -74.0060],
        zoom: 11,
        visualizationType: visualizationType
      });
    }
  }

  /**
   * Invalidate map sizes after tab switch to ensure proper rendering
   */
  private invalidateMaps(): void {
    // Small delay to ensure DOM has updated
    setTimeout(() => {
      if (this.renderer) {
        this.renderer.getMap()?.invalidateSize();
      }
    }, 100);
  }

  private loadSampleData(): void {
    this.currentData = getSampleDataByType(this.currentVisualizationType);
    this.saveDataToStorage();
    this.updateDataStats();
    this.renderVisualization();
  }

  private clearData(): void {
    this.currentData = [];
    this.clearStoredData();
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
        case 'points':
          this.renderPoints();
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

    if (!this.renderer) return;

    // Get dynamic values from controls
    const radius = parseInt((document.getElementById('heatmap-radius') as HTMLInputElement)?.value || '25');
    const maxOpacity = parseFloat((document.getElementById('heatmap-opacity') as HTMLInputElement)?.value || '0.8');
    const intensityMultiplier = parseFloat((document.getElementById('heatmap-intensity') as HTMLInputElement)?.value || '1.2');
    
    // Get filter values
    const alertTypeFilter = (document.getElementById('heatmap-alert-type-filter') as HTMLSelectElement)?.value || 'all';
    const timeFilterHours = parseInt((document.getElementById('heatmap-time-filter') as HTMLSelectElement)?.value || '0');

    // Filter data by alert type and time
    const filteredData = this.filterDataByAlertTypeAndTime(this.currentData, alertTypeFilter, timeFilterHours);

    // Apply intensity multiplier to the data
    const intensifiedData = filteredData.map(location => ({
      ...location,
      intensity: (location.intensity || 0.5) * intensityMultiplier
    }));

    // Update filter status for heatmap
    this.updateHeatmapFilterStatus(filteredData.length, alertTypeFilter, timeFilterHours);

    // Configure and render heatmap
    this.renderer.updateConfig({
      heatmap: {
        radius: radius,
        maxOpacity: maxOpacity,
        blur: 15,
        gradient: {
          0.4: 'blue',
          0.6: 'cyan',
          0.7: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        }
      }
    });

    this.renderer.setVisualizationType('heatmap');
    this.renderer.render(intensifiedData);
  }

  private renderDensity(): void {
    // Ensure container is ready
    if (!this.isContainerReady('density-container')) {
      console.warn('Density container not ready, retrying...');
      setTimeout(() => this.renderDensity(), 100);
      return;
    }

    if (!this.renderer) return;

    const gridSize = parseInt((document.getElementById('grid-size') as HTMLInputElement)?.value || '20');
    
    // Get filter values
    const alertTypeFilter = (document.getElementById('density-alert-type-filter') as HTMLSelectElement)?.value || 'all';
    const timeFilterHours = parseInt((document.getElementById('density-time-filter') as HTMLSelectElement)?.value || '0');

    // Filter data by alert type and time
    const filteredData = this.filterDataByAlertTypeAndTime(this.currentData, alertTypeFilter, timeFilterHours);

    // Update filter status for density
    this.updateDensityFilterStatus(filteredData.length, alertTypeFilter, timeFilterHours);
    
    this.renderer.setVisualizationType('density', {
      density: {
        gridSize,
        colorScale: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
        showGrid: true,
        aggregationMethod: 'count'
      }
    });
    
    this.renderer.render(filteredData);
  }

  private renderMarkers(): void {
    // Ensure container is ready
    if (!this.isContainerReady('markers-container')) {
      console.warn('Markers container not ready, retrying...');
      setTimeout(() => this.renderMarkers(), 100);
      return;
    }

    if (!this.renderer) return;

    const pulseAnimation = (document.getElementById('pulse-animation') as HTMLInputElement)?.checked || false;
    const iconSize = parseInt((document.getElementById('icon-size') as HTMLSelectElement)?.value || '32');
    const alertTypeFilter = (document.getElementById('alert-type-filter') as HTMLSelectElement)?.value || 'all';
    const timeFilterHours = parseInt((document.getElementById('time-filter') as HTMLSelectElement)?.value || '0');

    // Filter data by alert type and time
    const filteredData = this.filterDataByAlertTypeAndTime(this.currentData, alertTypeFilter, timeFilterHours);

    // Update filter status
    this.updateFilterStatus(filteredData.length, alertTypeFilter, timeFilterHours);

    this.renderer.setVisualizationType('markers', {
      markers: {
        iconSize: [iconSize, iconSize],
        pulseAnimation,
        showPopups: true,
        clustering: false
      }
    });

    this.renderer.render(filteredData);
  }

  private renderPoints(): void {
    if (!this.renderer) return;

    // Use markers renderer for points
    this.renderer.setVisualizationType('points');
    this.renderer.render(this.currentData);
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

  /**
   * Filter data by alert type and time
   */
  private filterDataByAlertTypeAndTime(data: Location[], alertTypeFilter: string, timeFilterHours: number): Location[] {
    let filteredData = data;

    // Apply alert type filter
    if (alertTypeFilter !== 'all') {
      filteredData = filteredData.filter(location => {
        const alertType = this.extractAlertTypeFromLocation(location);
        return alertType === alertTypeFilter;
      });
    }

    // Apply time filter
    if (timeFilterHours > 0) {
      const cutoffTime = new Date(Date.now() - timeFilterHours * 60 * 60 * 1000);
      filteredData = filteredData.filter(location => {
        const timestamp = this.extractTimestampFromLocation(location);
        return timestamp && timestamp >= cutoffTime;
      });
    }

    return filteredData;
  }

  /**
   * Extract timestamp from location data
   */
  private extractTimestampFromLocation(location: Location): Date | null {
    // Check if it's already an AlertMarker with timestamp
    if ((location as any).timestamp) {
      return new Date((location as any).timestamp);
    }

    // Check metadata for timestamp fields
    if (location.metadata?.timestamp) {
      return new Date(location.metadata.timestamp);
    }
    
    if (location.metadata?.date_time) {
      return new Date(location.metadata.date_time);
    }
    
    if (location.metadata?.createdAt) {
      return new Date(location.metadata.createdAt);
    }
    
    if (location.metadata?.created_at) {
      return new Date(location.metadata.created_at);
    }

    // For sample data, generate a timestamp within the last 24 hours
    if (!location.metadata?.timestamp) {
      const randomHours = Math.random() * 24;
      const timestamp = new Date(Date.now() - randomHours * 60 * 60 * 1000);
      
      // Store it in metadata for consistency
      if (!location.metadata) {
        location.metadata = {};
      }
      location.metadata.timestamp = timestamp.toISOString();
      
      return timestamp;
    }

    return null;
  }

  /**
   * Update filter status display
   */
  private updateFilterStatus(filteredCount: number, alertTypeFilter: string, timeFilterHours: number): void {
    const statusElement = document.getElementById('filter-count');
    if (statusElement) {
      let statusText = `Showing ${filteredCount} markers`;
      
      const filters = [];
      if (alertTypeFilter !== 'all') {
        filters.push(`type: ${alertTypeFilter}`);
      }
      if (timeFilterHours > 0) {
        filters.push(`time: last ${timeFilterHours} hour${timeFilterHours > 1 ? 's' : ''}`);
      }
      
      if (filters.length > 0) {
        statusText += ` (filtered by ${filters.join(', ')})`;
      }
      
      statusElement.textContent = statusText;
    }
  }

  /**
   * Update heatmap filter status display
   */
  private updateHeatmapFilterStatus(filteredCount: number, alertTypeFilter: string, timeFilterHours: number): void {
    const statusElement = document.getElementById('heatmap-filter-count');
    if (statusElement) {
      let statusText = `Showing ${filteredCount} data points`;
      
      const filters = [];
      if (alertTypeFilter !== 'all') {
        filters.push(`type: ${alertTypeFilter}`);
      }
      if (timeFilterHours > 0) {
        filters.push(`time: last ${timeFilterHours} hour${timeFilterHours > 1 ? 's' : ''}`);
      }
      
      if (filters.length > 0) {
        statusText += ` (filtered by ${filters.join(', ')})`;
      }
      
      statusElement.textContent = statusText;
    }
  }

  /**
   * Update density filter status display
   */
  private updateDensityFilterStatus(filteredCount: number, alertTypeFilter: string, timeFilterHours: number): void {
    const statusElement = document.getElementById('density-filter-count');
    if (statusElement) {
      let statusText = `Showing ${filteredCount} data points`;
      
      const filters = [];
      if (alertTypeFilter !== 'all') {
        filters.push(`type: ${alertTypeFilter}`);
      }
      if (timeFilterHours > 0) {
        filters.push(`time: last ${timeFilterHours} hour${timeFilterHours > 1 ? 's' : ''}`);
      }
      
      if (filters.length > 0) {
        statusText += ` (filtered by ${filters.join(', ')})`;
      }
      
      statusElement.textContent = statusText;
    }
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
