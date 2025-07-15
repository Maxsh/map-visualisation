# Heatmap Visualization Project

A comprehensive TypeScript project for rendering multiple types of interactive map visualizations based on location coordinates using Leaflet and modern web technologies.

## Features

- 🗺️ **Interactive Maps**: Built with Leaflet for smooth pan, zoom, and navigation
- 🔥 **Dynamic Heatmaps**: Real-time heatmap rendering based on location data
- 📊 **Density Grid**: Grid-based density analysis with configurable cell size
- 🚨 **Alert Markers**: Interactive alert markers with custom icons and severity levels
- 🎨 **Customizable**: Configurable colors, intensity, radius, and opacity for all visualization types
- 📱 **Responsive**: Works on desktop and mobile devices
- 🌙 **Dark/Light Theme**: Automatic theme detection and styling
- ⚡ **Fast**: Built with Vite for optimal performance
- 📁 **File Loading**: Support for JSON, CSV, TSV, and GeoJSON data files
- 🌐 **URL Loading**: Load data directly from web URLs
- 🔄 **Drag & Drop**: Easy file upload with drag and drop interface
- 🎛️ **Interactive Controls**: Real-time configuration for each visualization type
- 🔧 **Robust Tab Switching**: Intelligent map rendering with container validation and automatic resizing

## Visualization Types

### 🔥 Heatmap
Classic intensity-based heatmap showing data distribution with smooth color gradients.

### 📊 Density Grid  
Grid-based visualization showing point density within configurable cells. Features:
- Adjustable grid size (10-50 cells)
- Color-coded density representation
- Cell-specific statistics (point count, density, area)
- Intelligent container sizing and rendering
- Automatic map invalidation on tab switching

### 🚨 Alert Markers (Unified Location Markers)
Interactive markers with custom icons for all location data visualization. Features:
- Multiple alert types (critical, warning, info, danger, success)
- Severity levels (1-5) with visual indicators
- Rich popups with location details
- Optional pulse animations
- Customizable icon sizes and styles
- Works with any uploaded location data

## Technical Improvements

### Tab Switching Architecture
The application uses separate renderer instances for each visualization type to prevent cross-contamination and ensure proper map rendering:

- **Isolated Renderers**: Each visualization type (heatmap, density, markers) maintains its own dedicated renderer instance
- **Container Validation**: Before rendering, the system checks if containers are visible and have proper dimensions
- **Automatic Retry**: If a container isn't ready, the system automatically retries rendering after a short delay
- **Map Invalidation**: After tab switches, maps are automatically resized to fit their containers correctly
- **Error Handling**: Comprehensive error handling prevents crashes from rendering issues

## Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Usage

### Basic Example

The application now supports multiple visualization types through a unified interface:

```typescript
import { MapVisualizationRenderer } from './components/MapVisualizationRenderer'
import type { Location, VisualizationType } from './types'

// Create location data
const locations: Location[] = [
  {
    id: 1,
    name: 'New York',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    intensity: 0.9
  },
  {
    id: 2,
    name: 'Los Angeles', 
    coordinates: { lat: 34.0522, lng: -118.2437 },
    intensity: 0.7
  }
]

// Initialize unified renderer
const renderer = new MapVisualizationRenderer({
  container: 'map-container',
  center: [39.8283, -98.5795],
  zoom: 4,
  visualizationType: 'heatmap'
})

// Switch between visualization types
renderer.setVisualizationType('density', {
  density: {
    gridSize: 20,
    colorScale: ['#ffffcc', '#fd8d3c', '#800026'],
    aggregationMethod: 'count'
  }
})

renderer.render(locations)
```

### Alert Marker Example

```typescript
import type { AlertMarker } from './types'

const alertData: AlertMarker[] = [
  {
    id: 'alert-001',
    name: 'Critical System Failure',
    coordinates: { lat: 40.7580, lng: -73.9855 },
    alertType: 'critical',
    severity: 5,
    status: 'active',
    description: 'Multiple server failures detected',
    timestamp: new Date()
  }
]

// Render alert markers
renderer.setVisualizationType('markers', {
  markers: {
    iconSize: [32, 32],
    pulseAnimation: true,
    showPopups: true
  }
})

renderer.render(alertData)
```

### Loading Data from Files

The application supports loading location data from various file formats:

#### Supported Formats

- **JSON**: Array of location objects or nested structure
- **CSV**: Comma-separated values with customizable column mapping  
- **TSV**: Tab-separated values
- **GeoJSON**: Standard geographic data format

#### File Loading Example

```typescript
import { FileLoader } from './utils/fileLoader'

// Load from file
const file = document.getElementById('fileInput').files[0]
const result = await FileLoader.loadFromFile(file, {
  format: 'csv',
  hasHeader: true,
  columnMapping: {
    lat: 'latitude',
    lng: 'longitude', 
    intensity: 'weight',
    name: 'city_name'
  }
})

// Load from URL
const urlResult = await FileLoader.loadFromUrl('https://example.com/data.json')

// Use the loaded data
renderer.updateData(result.locations)
```

#### File Format Examples

**JSON Format:**
```json
[
  {
    "id": 1,
    "name": "New York",
    "lat": 40.7128,
    "lng": -74.0060,
    "intensity": 0.9
  }
]
```

**CSV Format:**
```csv
name,lat,lng,intensity
New York,40.7128,-74.0060,0.9
Los Angeles,34.0522,-118.2437,0.7
```

#### File Format Examples

**JSON Format:**
```json
[
  {
    "id": 1,
    "name": "New York",
    "lat": 40.7128,
    "lng": -74.0060,
    "intensity": 0.9
  }
]
```

**CSV Format:**
```csv
name,lat,lng,intensity
New York,40.7128,-74.0060,0.9
Los Angeles,34.0522,-118.2437,0.7
```

**GeoJSON Format with Custom Properties:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-74.0060, 40.7128]
      },
      "properties": {
        "name": "New York",
        "intensity": 0.9,
        "address": "М.Харьківська,2, Київ, Україна",
        "alert_type": "2🔵 вийшли з патрульки і спустились в переход",
        "operator": "Patrol Unit Alpha",
        "priority": "medium",
        "custom_field": "Any custom data"
      }
    }
  ]
}
```

> **📋 Custom Properties Support**: All properties from GeoJSON features are automatically displayed in marker popups. The application intelligently extracts common fields like `address`, `alert_type`, `operator`, etc., and displays them in an organized format within the marker details.

### Enhanced GeoJSON Properties Display

The application provides rich support for displaying custom properties from GeoJSON data:

#### ✨ **Automatic Property Detection**
- **Smart Field Mapping**: Automatically detects common fields like `address`, `alert_type`, `operator`, `priority`
- **Flexible Naming**: Supports various naming conventions (`alert_type`, `alertType`, `type`, `category`)
- **Unicode Support**: Properly displays emoji and special characters in property values
- **Multilingual**: Full support for international text and addresses

#### 🎨 **Intelligent Display Formatting**
- **Organized Layout**: Properties are displayed in a clean, organized format within marker popups
- **Key Formatting**: Property names are automatically formatted for better readability
- **Value Processing**: Handles different data types (strings, numbers, booleans, objects)
- **Visual Hierarchy**: Important properties are highlighted and organized logically

#### 📋 **Property Categories**
The system automatically categorizes and displays properties:
- **Core Information**: Name, description, coordinates
- **Alert Details**: Alert type, severity, status, timestamp
- **Location Data**: Address, geographical information
- **Custom Properties**: Any additional fields from your GeoJSON data
- **Operational Data**: Operator, priority, response times, etc.

#### Example Property Display:
For the GeoJSON example above, the marker popup will show:
```
📍 Location Details
Type: INFO
Severity: ★★★☆☆
Time: [timestamp]
Coordinates: 40.712800, -74.006000

📋 Additional Information
Address: М.Харьківська,2, Київ, Україна
Alert Type: 2🔵 вийшли з патрульки і спустились в переход
Operator: Patrol Unit Alpha
Priority: medium
```

### Data Formats

#### Location Object
```typescript
interface Location {
  id?: string | number;          // Optional unique identifier
  name?: string;                 // Optional location name
  coordinates: {                 // Required coordinates
    lat: number;                 // Latitude (-90 to 90)
    lng: number;                 // Longitude (-180 to 180)
  };
  intensity?: number;            // Heat intensity (0-1)
  metadata?: Record<string, any>; // Optional additional data
}
```

#### Alert Marker Object
```typescript
interface AlertMarker extends Location {
  alertType?: 'critical' | 'warning' | 'info' | 'resolved' | 'danger' | 'success';
  timestamp?: Date;              // Alert timestamp
  description?: string;          // Alert description
  severity?: number;             // Severity level (1-5)
  status?: 'active' | 'acknowledged' | 'resolved';
}
```

#### Visualization Configurations
```typescript
// Density visualization config
interface DensityConfig {
  gridSize?: number;                    // Grid cell count (default: 20)
  colorScale?: string[];               // Color gradient array
  opacity?: number;                    // Cell opacity
  aggregationMethod?: 'count' | 'sum' | 'average';
  showGrid?: boolean;                  // Show grid lines
}

// Marker visualization config
interface MarkerConfig {
  iconType?: 'alert' | 'warning' | 'info' | 'danger' | 'success' | 'critical';
  iconSize?: [number, number];        // Icon dimensions
  clustering?: boolean;               // Enable marker clustering
  showPopups?: boolean;              // Show popup on click
  pulseAnimation?: boolean;          // Enable pulse animation
}

// Point visualization config
interface PointConfig {
  radius?: number;                   // Circle radius
  fillColor?: string;               // Fill color
  strokeColor?: string;             // Border color
  strokeWidth?: number;             // Border width
  fillOpacity?: number;             // Fill transparency
  strokeOpacity?: number;           // Border transparency
}
```

## API Reference

### MapVisualizationRenderer

#### Constructor
```typescript
new MapVisualizationRenderer({
  container: string | HTMLElement,     // Map container
  center?: [number, number],          // Initial center coordinates
  zoom?: number,                      // Initial zoom level
  visualizationType?: VisualizationType,
  config?: VisualizationTypeConfigs
})
```

#### Methods

- `render(data: Location[]): void`
  - Render data with current visualization type

- `setVisualizationType(type: VisualizationType, config?: VisualizationTypeConfigs): void`
  - Change visualization type and optionally update config

- `updateConfig(config: VisualizationTypeConfigs): void`
  - Update visualization configuration

- `getStats(): object`
  - Get current visualization statistics

- `destroy(): void`
  - Clean up and remove map instance

- `getMap(): L.Map`
  - Get the underlying Leaflet map instance

### HeatmapRenderer (Legacy)

#### Methods

- `initialize(config: HeatmapVisualization): Promise<void>`
  - Initialize map and heatmap with configuration

- `updateData(locations: Location[], config?: HeatmapConfig): void`
  - Update heatmap with new location data

- `destroy(): void`
  - Clean up and remove map instance

- `getMap(): L.Map | null`
  - Get the underlying Leaflet map instance

### Utility Classes

#### DensityCalculator

- `calculateDensityGrid(locations: Location[], bounds: Bounds, config: DensityConfig): DensityGridCell[]`
  - Calculate density grid from location data

- `getColorForDensity(value: number, maxValue: number, colorScale: string[]): string`
  - Get color for specific density value

- `calculateOptimalGridSize(locations: Location[]): number`
  - Calculate optimal grid size based on data density

#### AlertIconGenerator

- `createAlertIcon(alertType: string, severity: number, config: MarkerConfig): L.DivIcon`
  - Generate custom alert icon

- `createAlertPopup(alert: AlertMarker): string`
  - Create popup content for alert markers

- `getAlertMarkerCSS(): string`
  - Get CSS styles for alert markers

### Utility Functions

- `validateCoordinates(coord: Coordinate): boolean`
  - Validate geographic coordinates

- `calculateDistance(coord1: Coordinate, coord2: Coordinate): number`
  - Calculate distance between two points in kilometers

- `convertToHeatmapData(locations: Location[]): HeatmapDataPoint[]`
  - Convert Location objects to heatmap format

- `calculateCenter(locations: Location[]): Coordinate`
  - Calculate geographic center of locations

- `normalizeIntensities(locations: Location[]): Location[]`
  - Normalize intensity values to 0-1 range

### FileLoader

#### Methods

- `loadFromFile(file: File, options?: FileLoadOptions): Promise<FileLoadResult>`
  - Load location data from uploaded file

- `loadFromUrl(url: string, options?: FileLoadOptions): Promise<FileLoadResult>`
  - Load location data from web URL

- `generateSampleFiles(): Record<string, string>`
  - Generate sample data files for testing

#### File Load Options

```typescript
interface FileLoadOptions {
  format?: 'json' | 'csv' | 'tsv' | 'geojson';
  columnMapping?: {
    lat: string;
    lng: string;
    intensity?: string;
    name?: string;
    id?: string;
  };
  delimiter?: string;
  hasHeader?: boolean;
}
```

## Built With

- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[Leaflet](https://leafletjs.com/)** - Interactive map library
- **[heatmap.js](https://www.patrick-wied.at/static/heatmapjs/)** - Heatmap visualization

## Browser Support

- Chrome 87+
- Firefox 78+
- Safari 14+
- Edge 88+

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
src/
├── components/         # Reusable components
│   ├── HeatmapRenderer.ts          # Legacy heatmap renderer
│   ├── MapVisualizationRenderer.ts # Unified multi-type renderer
│   └── FileUploadComponent.ts      # File upload interface
├── data/              # Sample data and generators
│   ├── sampleData.ts              # Original sample data
│   └── sampleAlertData.ts         # Alert and visualization samples
├── utils/             # Utility functions
│   ├── geoUtils.ts               # Geographic calculations
│   ├── dataProcessor.ts          # Data processing utilities
│   ├── fileLoader.ts             # File loading utilities
│   ├── densityCalculator.ts      # Density grid calculations
│   └── alertIconGenerator.ts     # Alert icon generation
├── types/             # TypeScript interfaces
│   └── index.ts                  # Type definitions
├── main.ts            # Application entry point
└── style.css          # Global styles and theming
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenStreetMap contributors for map tiles
- Leaflet team for the excellent mapping library
- Patrick Wied for heatmap.js
