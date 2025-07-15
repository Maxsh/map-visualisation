import './style.css'
import 'leaflet/dist/leaflet.css'
import { HeatmapRenderer } from './components/HeatmapRenderer'
import { sampleLocations, defaultMapConfig, defaultHeatmapConfig } from './data/sampleData'
import type { HeatmapVisualization } from './types'

// Set up the page
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Heatmap Visualization</h1>
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
