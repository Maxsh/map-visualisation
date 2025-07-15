import './style.css'
import 'leaflet/dist/leaflet.css'
import { HeatmapRenderer } from './components/HeatmapRenderer'
import { FileUploadComponent } from './components/FileUploadComponent'
import { sampleLocations, defaultMapConfig, defaultHeatmapConfig } from './data/sampleData'
import type { HeatmapVisualization } from './types'

// Add FileUploadComponent CSS
const style = document.createElement('style')
style.textContent = FileUploadComponent.getCSS()
document.head.appendChild(style)

// Set up the page
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Heatmap Visualization</h1>
    
    <div class="tabs">
      <button class="tab-button active" data-tab="map">Map View</button>
      <button class="tab-button" data-tab="upload">Load Data</button>
    </div>
    
    <div class="tab-content active" id="map-tab">
      <div id="controls">
        <button id="loadSample">Load Sample Data</button>
        <button id="loadRandom">Load Random Data</button>
        <button id="clearData">Clear Heatmap</button>
      </div>
      <div id="map" style="height: 600px; width: 100%; margin-top: 20px; border: 1px solid #ccc;"></div>
      <div id="info">
        <h3>Instructions</h3>
        <p>Use the buttons above to load different datasets and see the heatmap visualization.</p>
        <ul>
          <li><strong>Load Sample Data:</strong> Shows major cities around the world</li>
          <li><strong>Load Random Data:</strong> Generates random location points</li>
          <li><strong>Clear Heatmap:</strong> Removes all data points</li>
        </ul>
        <p>Switch to the "Load Data" tab to upload your own data files (JSON, CSV, TSV, GeoJSON).</p>
      </div>
    </div>
    
    <div class="tab-content" id="upload-tab" style="display: none;">
      <div id="fileUpload"></div>
    </div>
  </div>
`

// Initialize heatmap renderer
const heatmapRenderer = new HeatmapRenderer('map')

// Initialize with empty data
const initialConfig: HeatmapVisualization = {
  locations: [],
  mapConfig: defaultMapConfig,
  heatmapConfig: defaultHeatmapConfig
}

heatmapRenderer.initialize(initialConfig).catch(console.error)

// Initialize file upload component
new FileUploadComponent('fileUpload', (locations, result) => {
  console.log(`Loaded ${locations.length} locations from file:`, result.summary)
  heatmapRenderer.updateData(locations, defaultHeatmapConfig)
  
  // Switch to map tab to show results
  switchTab('map')
})

// Tab switching functionality
function switchTab(tabName: string) {
  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active')
  })
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active')
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active')
    ;(content as HTMLElement).style.display = 'none'
  })
  const activeTab = document.getElementById(`${tabName}-tab`)
  if (activeTab) {
    activeTab.classList.add('active')
    activeTab.style.display = 'block'
  }
}

// Setup tab click handlers
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.getAttribute('data-tab')
    if (tabName) {
      switchTab(tabName)
    }
  })
})

// Set up event handlers
document.getElementById('loadSample')?.addEventListener('click', () => {
  const config: HeatmapVisualization = {
    locations: sampleLocations,
    mapConfig: defaultMapConfig,
    heatmapConfig: defaultHeatmapConfig
  }
  
  heatmapRenderer.updateData(config.locations, config.heatmapConfig)
  console.log('Loaded sample data with', sampleLocations.length, 'locations')
})

document.getElementById('loadRandom')?.addEventListener('click', () => {
  // Generate random locations
  const randomLocations = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    name: `Random Location ${i + 1}`,
    coordinates: {
      lat: (Math.random() - 0.5) * 180, // -90 to 90
      lng: (Math.random() - 0.5) * 360  // -180 to 180
    },
    intensity: Math.random()
  }))
  
  heatmapRenderer.updateData(randomLocations, defaultHeatmapConfig)
  console.log('Loaded random data with', randomLocations.length, 'locations')
})

document.getElementById('clearData')?.addEventListener('click', () => {
  heatmapRenderer.updateData([], defaultHeatmapConfig)
  console.log('Cleared all data')
})

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  heatmapRenderer.destroy()
})
