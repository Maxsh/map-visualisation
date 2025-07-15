# File Loading Guide

This guide explains how to load location data from various file formats into the heatmap visualization.

## Supported File Formats

### 1. JSON Format

The most flexible format that supports nested structures and complex metadata.

#### Simple Array Format
```json
[
  {
    "id": 1,
    "name": "New York",
    "lat": 40.7128,
    "lng": -74.0060,
    "intensity": 0.9
  },
  {
    "id": 2,
    "name": "Los Angeles",
    "lat": 34.0522,
    "lng": -118.2437,
    "intensity": 0.7
  }
]
```

#### Nested Structure Format
```json
{
  "locations": [
    {
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "name": "New York",
      "intensity": 0.9,
      "metadata": {
        "population": 8419000,
        "country": "USA"
      }
    }
  ]
}
```

#### Alternative Coordinate Formats
```json
[
  {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "weight": 0.9
  },
  {
    "coords": [40.7128, -74.0060],
    "value": 0.9
  }
]
```

### 2. CSV (Comma-Separated Values)

Simple tabular format that's easy to create and edit in spreadsheet applications.

#### Basic CSV with Header
```csv
name,lat,lng,intensity
New York,40.7128,-74.0060,0.9
Los Angeles,34.0522,-118.2437,0.7
Chicago,41.8781,-87.6298,0.6
```

#### CSV with Custom Columns
```csv
city_name,latitude,longitude,weight,category,population
New York,40.7128,-74.0060,0.9,major_city,8419000
Los Angeles,34.0522,-118.2437,0.7,major_city,3980000
```

#### CSV without Header
```csv
40.7128,-74.0060,0.9,New York
34.0522,-118.2437,0.7,Los Angeles
41.8781,-87.6298,0.6,Chicago
```

### 3. TSV (Tab-Separated Values)

Similar to CSV but uses tabs as delimiters.

```tsv
name	lat	lng	intensity
New York	40.7128	-74.0060	0.9
Los Angeles	34.0522	-118.2437	0.7
```

### 4. GeoJSON

Standard geographic data format used by many mapping applications.

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
        "population": 8419000
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-118.2437, 34.0522]
      },
      "properties": {
        "name": "Los Angeles",
        "intensity": 0.7,
        "population": 3980000
      }
    }
  ]
}
```

## Using the File Upload Interface

### Step 1: Access the Upload Tab
1. Open the application
2. Click on the "Load Data" tab

### Step 2: Choose Upload Method

#### Drag and Drop
1. Drag files directly onto the drop zone
2. Multiple files can be uploaded at once

#### File Browser
1. Click on the drop zone to open file browser
2. Select one or more files

#### URL Loading
1. Paste a URL pointing to your data file
2. Click "Load URL"

### Step 3: Configure Options

#### File Format
- **Auto-detect**: Automatically determine format from file extension
- **JSON**: Force JSON parsing
- **CSV**: Force CSV parsing with comma delimiter
- **TSV**: Force TSV parsing with tab delimiter
- **GeoJSON**: Force GeoJSON parsing

#### CSV/TSV Options
- **Has header row**: Check if first row contains column names
- **Delimiter**: Choose comma, semicolon, tab, or pipe
- **Column mapping**: Map your column names to required fields

### Step 4: Review Results
- View loading summary with success/error counts
- Check error messages for any data issues
- Data automatically loads into the map

## Column Mapping for CSV/TSV

When uploading CSV or TSV files, you can customize which columns contain location data:

| Field | Description | Required | Default | Alternatives |
|-------|-------------|----------|---------|--------------|
| Latitude | Latitude coordinate | Yes | `lat` | `latitude`, `y` |
| Longitude | Longitude coordinate | Yes | `lng` | `longitude`, `lon`, `x` |
| Intensity | Heat intensity value | No | `intensity` | `weight`, `value` |
| Name | Location name | No | `name` | `title`, `label` |
| ID | Unique identifier | No | `id` | `uid`, `index` |

## Data Validation

The file loader automatically validates:

- **Coordinate ranges**: Latitude (-90 to 90), Longitude (-180 to 180)
- **Data types**: Numeric values for coordinates and intensity
- **Required fields**: Presence of latitude and longitude
- **File format**: Valid JSON, CSV structure, etc.

## Error Handling

Common errors and solutions:

### "Invalid coordinates"
- Check that latitude values are between -90 and 90
- Check that longitude values are between -180 and 180
- Ensure coordinates are numeric values

### "Missing required columns"
- Verify column names match your mapping configuration
- Check that header row is present if "Has header row" is checked
- Ensure CSV delimiter matches actual file format

### "Invalid JSON format"
- Validate JSON syntax using a JSON validator
- Check for missing commas, brackets, or quotes
- Ensure proper nested structure

### "No valid location data"
- Check that your file contains the expected data
- Verify coordinate format matches one of the supported formats
- Ensure at least some rows have valid coordinates

## Sample Files

The application provides sample files for testing:

- **JSON Sample**: Demonstrates object structure and metadata
- **CSV Sample**: Shows proper column format and headers
- **GeoJSON Sample**: Illustrates geographic feature format

## Loading from URLs

You can load data directly from web URLs:

### Supported URLs
- Direct file URLs (e.g., `https://example.com/data.json`)
- API endpoints returning JSON data
- Public datasets from government or research sources

### CORS Considerations
- Target server must allow cross-origin requests
- Some public APIs may require authentication
- Consider using a proxy service for restricted APIs

## Best Practices

### File Size
- Keep files under 10MB for best performance
- For large datasets, consider data sampling or clustering
- Use appropriate intensity values to avoid overcrowding

### Data Quality
- Remove duplicate locations
- Normalize intensity values to 0-1 range
- Include meaningful names for better user experience

### File Organization
- Use consistent column naming conventions
- Include metadata for context
- Document data sources and collection methods

## Programmatic Usage

You can also load files programmatically:

```typescript
import { FileLoader } from './utils/fileLoader'

// Load from file input
const fileInput = document.getElementById('file') as HTMLInputElement
const file = fileInput.files?.[0]

if (file) {
  const result = await FileLoader.loadFromFile(file, {
    format: 'csv',
    hasHeader: true,
    columnMapping: {
      lat: 'latitude',
      lng: 'longitude',
      intensity: 'weight'
    }
  })
  
  console.log(`Loaded ${result.locations.length} locations`)
  console.log('Errors:', result.errors)
}

// Load from URL
const urlResult = await FileLoader.loadFromUrl(
  'https://api.example.com/locations.json'
)
```

This provides complete flexibility for integrating the file loading functionality into your own applications.
