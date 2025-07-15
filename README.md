# Heatmap Visualization Project

A TypeScript project for rendering interactive heatmaps based on location coordinates using Leaflet and modern web technologies.

## Features

- 🗺️ **Interactive Maps**: Built with Leaflet for smooth pan, zoom, and navigation
- 🔥 **Dynamic Heatmaps**: Real-time heatmap rendering based on location data
- 📍 **Location Support**: Handle any geographic coordinates with validation
- 🎨 **Customizable**: Configurable colors, intensity, radius, and opacity
- 📱 **Responsive**: Works on desktop and mobile devices
- 🌙 **Dark/Light Theme**: Automatic theme detection and styling
- ⚡ **Fast**: Built with Vite for optimal performance

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

```typescript
import { HeatmapRenderer } from './components/HeatmapRenderer'
import type { Location, HeatmapVisualization } from './types'

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

// Initialize renderer
const renderer = new HeatmapRenderer('map-container')

// Configure and render
const config: HeatmapVisualization = {
  locations,
  mapConfig: {
    center: { lat: 39.8283, lng: -98.5795 },
    zoom: 4
  },
  heatmapConfig: {
    radius: 25,
    maxOpacity: 0.8,
    blur: 15
  }
}

await renderer.initialize(config)
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

#### Configuration Options
```typescript
// Map configuration
interface MapConfig {
  center: { lat: number; lng: number };  // Map center
  zoom: number;                          // Initial zoom level
  maxZoom?: number;                      // Maximum zoom (default: 18)
  minZoom?: number;                      // Minimum zoom (default: 1)
  tileLayerUrl?: string;                 // Custom tile server
  attribution?: string;                  // Map attribution
}

// Heatmap configuration  
interface HeatmapConfig {
  radius?: number;              // Point radius (default: 25)
  maxOpacity?: number;          // Maximum opacity (default: 0.8)
  minOpacity?: number;          // Minimum opacity (default: 0)
  blur?: number;                // Blur amount (default: 15)
  gradient?: Record<string, string>; // Color gradient
}
```

## API Reference

### HeatmapRenderer

#### Methods

- `initialize(config: HeatmapVisualization): Promise<void>`
  - Initialize map and heatmap with configuration

- `updateData(locations: Location[], config?: HeatmapConfig): void`
  - Update heatmap with new location data

- `destroy(): void`
  - Clean up and remove map instance

- `getMap(): L.Map | null`
  - Get the underlying Leaflet map instance

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
│   └── HeatmapRenderer.ts
├── data/              # Sample data and generators
│   └── sampleData.ts
├── types/             # TypeScript interfaces
│   └── index.ts
├── utils/             # Utility functions
│   └── geoUtils.ts
├── main.ts            # Application entry point
└── style.css          # Global styles
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
