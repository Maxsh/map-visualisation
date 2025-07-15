/**
 * Example usage of the Heatmap Visualization library
 * This file demonstrates various ways to use the HeatmapRenderer class
 */

import { HeatmapRenderer } from '../components/HeatmapRenderer'
import type { Location, HeatmapVisualization } from '../types'
import { generateRandomLocations, generateClusteredLocations } from '../data/sampleData'

/**
 * Example 1: Basic heatmap with city data
 */
export async function createBasicHeatmap(): Promise<HeatmapRenderer> {
  const cities: Location[] = [
    { id: 1, name: 'New York', coordinates: { lat: 40.7128, lng: -74.0060 }, intensity: 0.9 },
    { id: 2, name: 'Los Angeles', coordinates: { lat: 34.0522, lng: -118.2437 }, intensity: 0.7 },
    { id: 3, name: 'Chicago', coordinates: { lat: 41.8781, lng: -87.6298 }, intensity: 0.6 },
    { id: 4, name: 'Houston', coordinates: { lat: 29.7604, lng: -95.3698 }, intensity: 0.5 },
    { id: 5, name: 'Phoenix', coordinates: { lat: 33.4484, lng: -112.0740 }, intensity: 0.4 }
  ]

  const config: HeatmapVisualization = {
    locations: cities,
    mapConfig: {
      center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
      zoom: 4,
      maxZoom: 18,
      minZoom: 2
    },
    heatmapConfig: {
      radius: 30,
      maxOpacity: 0.8,
      minOpacity: 0.1,
      blur: 20,
      gradient: {
        0.0: 'blue',
        0.2: 'cyan',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red'
      }
    }
  }

  const renderer = new HeatmapRenderer('heatmap-container')
  await renderer.initialize(config)
  return renderer
}

/**
 * Example 2: Global heatmap with random data
 */
export async function createGlobalHeatmap(): Promise<HeatmapRenderer> {
  const randomLocations = generateRandomLocations(100)

  const config: HeatmapVisualization = {
    locations: randomLocations,
    mapConfig: {
      center: { lat: 20, lng: 0 }, // Global view
      zoom: 2,
      tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors'
    },
    heatmapConfig: {
      radius: 20,
      maxOpacity: 0.6,
      blur: 15,
      gradient: {
        0.0: '#000080',  // Navy
        0.25: '#0000FF', // Blue
        0.5: '#00FFFF',  // Cyan
        0.75: '#FFFF00', // Yellow
        1.0: '#FF0000'   // Red
      }
    }
  }

  const renderer = new HeatmapRenderer('global-heatmap')
  await renderer.initialize(config)
  return renderer
}

/**
 * Example 3: Clustered data around specific location
 */
export async function createClusteredHeatmap(): Promise<HeatmapRenderer> {
  // Generate clustered data around London
  const londonCenter = { lat: 51.5074, lng: -0.1278 }
  const clusteredData = generateClusteredLocations(londonCenter, 50, 0.1)

  const config: HeatmapVisualization = {
    locations: clusteredData,
    mapConfig: {
      center: londonCenter,
      zoom: 10,
      maxZoom: 15
    },
    heatmapConfig: {
      radius: 15,
      maxOpacity: 0.9,
      blur: 10,
      gradient: {
        0.0: 'transparent',
        0.1: 'blue',
        0.3: 'cyan',
        0.5: 'lime',
        0.7: 'yellow',
        1.0: 'red'
      }
    }
  }

  const renderer = new HeatmapRenderer('clustered-heatmap')
  await renderer.initialize(config)
  return renderer
}

/**
 * Example 4: Real-time data simulation
 */
export async function createRealTimeHeatmap(): Promise<HeatmapRenderer> {
  const renderer = new HeatmapRenderer('realtime-heatmap')

  // Initial configuration
  const config: HeatmapVisualization = {
    locations: [],
    mapConfig: {
      center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
      zoom: 11
    },
    heatmapConfig: {
      radius: 25,
      maxOpacity: 0.7,
      blur: 15
    }
  }

  await renderer.initialize(config)

  // Simulate real-time data updates
  let updateCount = 0
  const interval = setInterval(() => {
    updateCount++
    
    // Generate new data points around San Francisco
    const newLocations = generateClusteredLocations(
      { lat: 37.7749, lng: -122.4194 },
      20 + updateCount * 5, // Increase points over time
      0.05
    )

    renderer.updateData(newLocations)

    // Stop after 10 updates
    if (updateCount >= 10) {
      clearInterval(interval)
    }
  }, 2000) // Update every 2 seconds

  return renderer
}

/**
 * Example 5: Custom styled heatmap
 */
export async function createCustomStyledHeatmap(): Promise<HeatmapRenderer> {
  const locations: Location[] = [
    { coordinates: { lat: 48.8566, lng: 2.3522 }, intensity: 1.0 },   // Paris
    { coordinates: { lat: 51.5074, lng: -0.1278 }, intensity: 0.9 },  // London
    { coordinates: { lat: 52.5200, lng: 13.4050 }, intensity: 0.8 },  // Berlin
    { coordinates: { lat: 41.9028, lng: 12.4964 }, intensity: 0.7 },  // Rome
    { coordinates: { lat: 40.4168, lng: -3.7038 }, intensity: 0.6 },  // Madrid
  ]

  const config: HeatmapVisualization = {
    locations,
    mapConfig: {
      center: { lat: 48.8566, lng: 2.3522 },
      zoom: 5,
      // Custom dark tile layer
      tileLayerUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© OpenStreetMap © CartoDB'
    },
    heatmapConfig: {
      radius: 40,
      maxOpacity: 0.8,
      minOpacity: 0.2,
      blur: 25,
      // Custom purple-pink gradient
      gradient: {
        0.0: 'rgba(0, 0, 255, 0)',
        0.2: 'rgba(128, 0, 255, 0.5)',
        0.4: 'rgba(255, 0, 255, 0.7)',
        0.6: 'rgba(255, 100, 100, 0.8)',
        0.8: 'rgba(255, 200, 0, 0.9)',
        1.0: 'rgba(255, 255, 255, 1.0)'
      }
    }
  }

  const renderer = new HeatmapRenderer('custom-heatmap')
  await renderer.initialize(config)
  return renderer
}

/**
 * Example 6: Performance test with large dataset
 */
export async function createLargeDatasetHeatmap(): Promise<HeatmapRenderer> {
  console.log('Generating large dataset...')
  const startTime = performance.now()
  
  // Generate 1000 random locations
  const largeDataset = generateRandomLocations(1000)
  
  const generationTime = performance.now() - startTime
  console.log(`Generated ${largeDataset.length} locations in ${generationTime.toFixed(2)}ms`)

  const config: HeatmapVisualization = {
    locations: largeDataset,
    mapConfig: {
      center: { lat: 0, lng: 0 },
      zoom: 2
    },
    heatmapConfig: {
      radius: 10, // Smaller radius for performance
      maxOpacity: 0.5,
      blur: 5
    }
  }

  const renderer = new HeatmapRenderer('large-dataset-heatmap')
  
  const renderStartTime = performance.now()
  await renderer.initialize(config)
  const renderTime = performance.now() - renderStartTime
  
  console.log(`Rendered heatmap with ${largeDataset.length} points in ${renderTime.toFixed(2)}ms`)
  
  return renderer
}

/**
 * Utility function to demonstrate updating heatmap data
 */
export function demonstrateDataUpdate(renderer: HeatmapRenderer): void {
  const newLocations = generateRandomLocations(25)
  
  console.log('Updating heatmap with new data...')
  renderer.updateData(newLocations, {
    radius: 35,
    maxOpacity: 0.9,
    gradient: {
      0.0: 'green',
      0.5: 'yellow',
      1.0: 'red'
    }
  })
}

/**
 * Example usage in an HTML page:
 * 
 * <div id="heatmap-container" style="height: 400px; width: 100%;"></div>
 * <script>
 *   import { createBasicHeatmap } from './examples/usage-examples'
 *   createBasicHeatmap().then(renderer => {
 *     console.log('Heatmap initialized!', renderer.getMap())
 *   })
 * </script>
 */
