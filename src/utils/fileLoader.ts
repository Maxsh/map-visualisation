import type { Location, Coordinate } from '../types';

/**
 * Supported file formats for data loading
 */
export type SupportedFileFormat = 'json' | 'csv' | 'geojson' | 'tsv';

/**
 * CSV/TSV column mapping configuration
 */
export interface ColumnMapping {
  lat: string;
  lng: string;
  intensity?: string;
  name?: string;
  id?: string;
}

/**
 * File loading options
 */
export interface FileLoadOptions {
  format?: SupportedFileFormat;
  columnMapping?: ColumnMapping;
  delimiter?: string; // For CSV/TSV files
  hasHeader?: boolean; // Whether CSV/TSV has header row
}

/**
 * File loading result
 */
export interface FileLoadResult {
  locations: Location[];
  errors: string[];
  summary: {
    totalRows: number;
    validLocations: number;
    invalidRows: number;
  };
}

/**
 * FileLoader class for handling various data file formats
 */
export class FileLoader {
  
  /**
   * Load location data from a file
   */
  static async loadFromFile(
    file: File, 
    options: FileLoadOptions = {}
  ): Promise<FileLoadResult> {
    const format = options.format || this.detectFormat(file.name);
    const text = await this.readFileAsText(file);
    
    switch (format) {
      case 'json':
        return this.parseJSON(text);
      case 'csv':
        return this.parseCSV(text, options);
      case 'tsv':
        return this.parseCSV(text, { ...options, delimiter: '\t' });
      case 'geojson':
        return this.parseGeoJSON(text);
      default:
        throw new Error(`Unsupported file format: ${format}`);
    }
  }

  /**
   * Load location data from a URL
   */
  static async loadFromUrl(
    url: string,
    options: FileLoadOptions = {}
  ): Promise<FileLoadResult> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      const format = options.format || this.detectFormat(url);
      
      switch (format) {
        case 'json':
          return this.parseJSON(text);
        case 'csv':
          return this.parseCSV(text, options);
        case 'tsv':
          return this.parseCSV(text, { ...options, delimiter: '\t' });
        case 'geojson':
          return this.parseGeoJSON(text);
        default:
          throw new Error(`Unsupported file format: ${format}`);
      }
    } catch (error) {
      return {
        locations: [],
        errors: [`Failed to load from URL: ${error instanceof Error ? error.message : 'Unknown error'}`],
        summary: {
          totalRows: 0,
          validLocations: 0,
          invalidRows: 0
        }
      };
    }
  }

  /**
   * Detect file format from filename
   */
  private static detectFormat(filename: string): SupportedFileFormat {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'json':
        return 'json';
      case 'csv':
        return 'csv';
      case 'tsv':
      case 'txt':
        return 'tsv';
      case 'geojson':
        return 'geojson';
      default:
        return 'json'; // Default fallback
    }
  }

  /**
   * Read file as text
   */
  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Parse JSON format
   */
  private static parseJSON(text: string): FileLoadResult {
    const errors: string[] = [];
    let data: any;
    
    try {
      data = JSON.parse(text);
    } catch (error) {
      return {
        locations: [],
        errors: ['Invalid JSON format'],
        summary: { totalRows: 0, validLocations: 0, invalidRows: 1 }
      };
    }

    // Handle different JSON structures
    let rawLocations: any[];
    
    if (Array.isArray(data)) {
      rawLocations = data;
    } else if (data.locations && Array.isArray(data.locations)) {
      rawLocations = data.locations;
    } else if (data.data && Array.isArray(data.data)) {
      rawLocations = data.data;
    } else {
      return {
        locations: [],
        errors: ['JSON must contain an array of locations or have a "locations"/"data" property with an array'],
        summary: { totalRows: 0, validLocations: 0, invalidRows: 1 }
      };
    }

    const locations: Location[] = [];
    
    rawLocations.forEach((item, index) => {
      try {
        const location = this.parseLocationObject(item, index);
        if (location) {
          locations.push(location);
        }
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    });

    return {
      locations,
      errors,
      summary: {
        totalRows: rawLocations.length,
        validLocations: locations.length,
        invalidRows: rawLocations.length - locations.length
      }
    };
  }

  /**
   * Parse CSV/TSV format
   */
  private static parseCSV(text: string, options: FileLoadOptions): FileLoadResult {
    const delimiter = options.delimiter || ',';
    const hasHeader = options.hasHeader !== false; // Default to true
    const columnMapping = options.columnMapping || {
      lat: 'lat',
      lng: 'lng',
      intensity: 'intensity',
      name: 'name',
      id: 'id'
    };

    const lines = text.trim().split('\n');
    const errors: string[] = [];
    const locations: Location[] = [];

    if (lines.length === 0) {
      return {
        locations: [],
        errors: ['File is empty'],
        summary: { totalRows: 0, validLocations: 0, invalidRows: 0 }
      };
    }

    let headers: string[] = [];
    let dataStartIndex = 0;

    if (hasHeader) {
      headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
      dataStartIndex = 1;
    } else {
      // Generate default headers
      const firstRow = lines[0].split(delimiter);
      headers = firstRow.map((_, i) => `column_${i}`);
    }

    // Process data rows
    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = this.parseCSVLine(line, delimiter);
        const rowData: Record<string, string> = {};
        
        values.forEach((value, index) => {
          if (headers[index]) {
            rowData[headers[index]] = value;
          }
        });

        const location = this.parseCSVRow(rowData, columnMapping, i + 1);
        if (location) {
          locations.push(location);
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    }

    return {
      locations,
      errors,
      summary: {
        totalRows: lines.length - dataStartIndex,
        validLocations: locations.length,
        invalidRows: (lines.length - dataStartIndex) - locations.length
      }
    };
  }

  /**
   * Parse GeoJSON format
   */
  private static parseGeoJSON(text: string): FileLoadResult {
    const errors: string[] = [];
    let geoData: any;
    
    try {
      geoData = JSON.parse(text);
    } catch (error) {
      return {
        locations: [],
        errors: ['Invalid GeoJSON format'],
        summary: { totalRows: 0, validLocations: 0, invalidRows: 1 }
      };
    }

    if (geoData.type !== 'FeatureCollection' || !Array.isArray(geoData.features)) {
      return {
        locations: [],
        errors: ['GeoJSON must be a FeatureCollection with features array'],
        summary: { totalRows: 0, validLocations: 0, invalidRows: 1 }
      };
    }

    const locations: Location[] = [];
    
    geoData.features.forEach((feature: any, index: number) => {
      try {
        if (feature.geometry?.type === 'Point' && feature.geometry.coordinates) {
          const [lng, lat] = feature.geometry.coordinates;
          const properties = feature.properties || {};
          
          // Smart extraction of common properties
          const name = properties.name || properties.title || properties.address || 
                      properties.description || `Point ${index + 1}`;
          const alertType = properties.alert_type || properties.alertType || 
                           properties.type || properties.category;
          
          const location: Location = {
            id: properties.id || feature.id || `geojson-${index}`,
            name: name,
            coordinates: { lat, lng },
            intensity: properties.intensity || properties.weight || properties.value || 0.5,
            metadata: {
              ...properties,
              // Add processed alertType to metadata for marker styling
              ...(alertType && { processedAlertType: alertType })
            }
          };

          if (this.validateCoordinate({ lat, lng })) {
            locations.push(location);
          } else {
            errors.push(`Feature ${index + 1}: Invalid coordinates (${lat}, ${lng})`);
          }
        } else {
          errors.push(`Feature ${index + 1}: Only Point geometries are supported`);
        }
      } catch (error) {
        errors.push(`Feature ${index + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    });

    return {
      locations,
      errors,
      summary: {
        totalRows: geoData.features.length,
        validLocations: locations.length,
        invalidRows: geoData.features.length - locations.length
      }
    };
  }

  /**
   * Parse a single location object from JSON
   */
  private static parseLocationObject(item: any, index: number): Location | null {
    // Handle different coordinate formats
    let coordinates: Coordinate;
    
    if (item.coordinates) {
      coordinates = item.coordinates;
    } else if (item.lat !== undefined && item.lng !== undefined) {
      coordinates = { lat: item.lat, lng: item.lng };
    } else if (item.latitude !== undefined && item.longitude !== undefined) {
      coordinates = { lat: item.latitude, lng: item.longitude };
    } else if (Array.isArray(item) && item.length >= 2) {
      coordinates = { lat: item[1], lng: item[0] }; // GeoJSON order [lng, lat]
    } else {
      throw new Error('Missing or invalid coordinates');
    }

    if (!this.validateCoordinate(coordinates)) {
      throw new Error(`Invalid coordinates (${coordinates.lat}, ${coordinates.lng})`);
    }

    return {
      id: item.id || index,
      name: item.name || item.title,
      coordinates,
      intensity: item.intensity || item.weight || item.value,
      metadata: item.metadata || item.properties
    };
  }

  /**
   * Parse a CSV row
   */
  private static parseCSVRow(
    rowData: Record<string, string>, 
    mapping: ColumnMapping, 
    rowNumber: number
  ): Location | null {
    const lat = parseFloat(rowData[mapping.lat]);
    const lng = parseFloat(rowData[mapping.lng]);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error(`Invalid coordinates: lat="${rowData[mapping.lat]}", lng="${rowData[mapping.lng]}"`);
    }

    const coordinates = { lat, lng };
    if (!this.validateCoordinate(coordinates)) {
      throw new Error(`Coordinates out of range (${lat}, ${lng})`);
    }

    const location: Location = {
      id: mapping.id ? rowData[mapping.id] : rowNumber,
      name: mapping.name ? rowData[mapping.name] : undefined,
      coordinates,
      intensity: mapping.intensity ? parseFloat(rowData[mapping.intensity]) || undefined : undefined
    };

    return location;
  }

  /**
   * Parse a CSV line respecting quoted values
   */
  private static parseCSVLine(line: string, delimiter: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values.map(v => v.replace(/^["']|["']$/g, ''));
  }

  /**
   * Validate coordinate values
   */
  private static validateCoordinate(coord: Coordinate): boolean {
    return (
      coord.lat >= -90 && 
      coord.lat <= 90 && 
      coord.lng >= -180 && 
      coord.lng <= 180 &&
      !isNaN(coord.lat) &&
      !isNaN(coord.lng)
    );
  }

  /**
   * Generate sample data files for testing
   */
  static generateSampleFiles(): Record<string, string> {
    return {
      'sample.json': JSON.stringify([
        { id: 1, name: 'New York', lat: 40.7128, lng: -74.0060, intensity: 0.9 },
        { id: 2, name: 'Los Angeles', lat: 34.0522, lng: -118.2437, intensity: 0.7 },
        { id: 3, name: 'Chicago', lat: 41.8781, lng: -87.6298, intensity: 0.6 }
      ], null, 2),
      
      'sample.csv': [
        'name,lat,lng,intensity',
        'New York,40.7128,-74.0060,0.9',
        'Los Angeles,34.0522,-118.2437,0.7',
        'Chicago,41.8781,-87.6298,0.6'
      ].join('\n'),
      
      'sample.geojson': JSON.stringify({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-74.0060, 40.7128] },
            properties: { name: 'New York', intensity: 0.9 }
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
            properties: { name: 'Los Angeles', intensity: 0.7 }
          }
        ]
      }, null, 2)
    };
  }
}
