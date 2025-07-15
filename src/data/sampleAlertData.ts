import type { Location, AlertMarker } from '../types';

/**
 * Sample heatmap locations
 */
export const sampleLocations: Location[] = [
  {
    id: 1,
    name: "Central Park",
    coordinates: { lat: 40.7829, lng: -73.9654 },
    intensity: 0.8
  },
  {
    id: 2,
    name: "Times Square",
    coordinates: { lat: 40.7580, lng: -73.9855 },
    intensity: 0.9
  },
  {
    id: 3,
    name: "Brooklyn Bridge",
    coordinates: { lat: 40.7061, lng: -73.9969 },
    intensity: 0.7
  },
  {
    id: 4,
    name: "Empire State Building",
    coordinates: { lat: 40.7484, lng: -73.9857 },
    intensity: 0.85
  },
  {
    id: 5,
    name: "Staten Island Ferry",
    coordinates: { lat: 40.6892, lng: -74.0445 },
    intensity: 0.6
  },
  {
    id: 6,
    name: "High Line",
    coordinates: { lat: 40.7480, lng: -74.0048 },
    intensity: 0.75
  },
  {
    id: 7,
    name: "One World Trade Center",
    coordinates: { lat: 40.7127, lng: -74.0134 },
    intensity: 0.8
  },
  {
    id: 8,
    name: "Yankee Stadium",
    coordinates: { lat: 40.8296, lng: -73.9262 },
    intensity: 0.65
  }
];

/**
 * Sample alert markers with different types and severities
 */
export const sampleAlertMarkers: AlertMarker[] = [
  {
    id: 'alert-001',
    name: 'Critical System Failure',
    coordinates: { lat: 40.7580, lng: -73.9855 },
    alertType: 'critical',
    severity: 5,
    status: 'active',
    description: 'Multiple server failures detected in the Times Square data center. Immediate attention required.',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    intensity: 1.0
  },
  {
    id: 'alert-002', 
    name: 'High Traffic Warning',
    coordinates: { lat: 40.7829, lng: -73.9654 },
    alertType: 'warning',
    severity: 3,
    status: 'acknowledged',
    description: 'Unusual traffic patterns detected in Central Park area. Monitor for potential congestion.',
    timestamp: new Date('2024-01-15T09:15:00Z'),
    intensity: 0.7
  },
  {
    id: 'alert-003',
    name: 'Security Breach Attempt',
    coordinates: { lat: 40.7484, lng: -73.9857 },
    alertType: 'danger',
    severity: 4,
    status: 'active',
    description: 'Suspicious login attempts detected from Empire State Building location.',
    timestamp: new Date('2024-01-15T08:45:00Z'),
    intensity: 0.9
  },
  {
    id: 'alert-004',
    name: 'Maintenance Complete',
    coordinates: { lat: 40.7061, lng: -73.9969 },
    alertType: 'success',
    severity: 1,
    status: 'resolved',
    description: 'Scheduled maintenance on Brooklyn Bridge sensors completed successfully.',
    timestamp: new Date('2024-01-15T07:00:00Z'),
    intensity: 0.3
  },
  {
    id: 'alert-005',
    name: 'Network Performance Degradation',
    coordinates: { lat: 40.7480, lng: -74.0048 },
    alertType: 'warning',
    severity: 2,
    status: 'active',
    description: 'Slight decrease in network performance observed at High Line monitoring station.',
    timestamp: new Date('2024-01-15T11:20:00Z'),
    intensity: 0.5
  },
  {
    id: 'alert-006',
    name: 'Information Update',
    coordinates: { lat: 40.6892, lng: -74.0445 },
    alertType: 'info',
    severity: 1,
    status: 'active',
    description: 'Regular status update from Staten Island Ferry monitoring system.',
    timestamp: new Date('2024-01-15T12:00:00Z'),
    intensity: 0.2
  },
  {
    id: 'alert-007',
    name: 'Emergency Response Required',
    coordinates: { lat: 40.7127, lng: -74.0134 },
    alertType: 'critical',
    severity: 5,
    status: 'active',
    description: 'Fire alarm triggered at One World Trade Center. Emergency teams dispatched.',
    timestamp: new Date('2024-01-15T13:45:00Z'),
    intensity: 1.0
  },
  {
    id: 'alert-008',
    name: 'Routine Check Complete',
    coordinates: { lat: 40.8296, lng: -73.9262 },
    alertType: 'info',
    severity: 1,
    status: 'resolved',
    description: 'Routine equipment check at Yankee Stadium completed without issues.',
    timestamp: new Date('2024-01-15T06:30:00Z'),
    intensity: 0.1
  }
];

/**
 * Sample density data with higher concentration points
 */
export const sampleDensityData: Location[] = [
  // Manhattan high-density cluster
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `density-manhattan-${i}`,
    name: `Manhattan Point ${i + 1}`,
    coordinates: {
      lat: 40.7505 + (Math.random() - 0.5) * 0.02,
      lng: -73.9934 + (Math.random() - 0.5) * 0.02
    },
    intensity: Math.random() * 0.8 + 0.2
  })),
  
  // Brooklyn cluster
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `density-brooklyn-${i}`,
    name: `Brooklyn Point ${i + 1}`,
    coordinates: {
      lat: 40.6892 + (Math.random() - 0.5) * 0.015,
      lng: -73.9442 + (Math.random() - 0.5) * 0.015
    },
    intensity: Math.random() * 0.6 + 0.1
  })),
  
  // Queens cluster
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `density-queens-${i}`,
    name: `Queens Point ${i + 1}`,
    coordinates: {
      lat: 40.7282 + (Math.random() - 0.5) * 0.02,
      lng: -73.7949 + (Math.random() - 0.5) * 0.02
    },
    intensity: Math.random() * 0.5 + 0.1
  })),
  
  // Scattered points
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `density-scattered-${i}`,
    name: `Scattered Point ${i + 1}`,
    coordinates: {
      lat: 40.6 + Math.random() * 0.3,
      lng: -74.2 + Math.random() * 0.3
    },
    intensity: Math.random() * 0.4
  }))
];

/**
 * Sample simple points data
 */
export const samplePointsData: Location[] = [
  {
    id: 'point-001',
    name: 'Observation Point Alpha',
    coordinates: { lat: 40.7614, lng: -73.9776 }
  },
  {
    id: 'point-002',
    name: 'Observation Point Beta', 
    coordinates: { lat: 40.7505, lng: -73.9934 }
  },
  {
    id: 'point-003',
    name: 'Observation Point Gamma',
    coordinates: { lat: 40.7282, lng: -73.7949 }
  },
  {
    id: 'point-004',
    name: 'Observation Point Delta',
    coordinates: { lat: 40.6892, lng: -73.9442 }
  },
  {
    id: 'point-005',
    name: 'Observation Point Epsilon',
    coordinates: { lat: 40.8176, lng: -73.9782 }
  }
];

/**
 * Sample GeoJSON data with custom properties (as string for demonstration)
 */
export const sampleGeoJSONString = `{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [30.5234, 50.4501]
      },
      "properties": {
        "address": "М.Харьківська,2, Київ, Україна",
        "alert_type": "2🔵 вийшли з патрульки і спустились в переход",
        "timestamp": "2025-01-15T14:30:00Z",
        "operator": "Patrol Unit Alpha",
        "priority": "medium",
        "status": "active"
      }
    },
    {
      "type": "Feature", 
      "geometry": {
        "type": "Point",
        "coordinates": [30.5326, 50.4547]
      },
      "properties": {
        "address": "пл. Незалежності, Київ, Україна",
        "alert_type": "1🔴 критична ситуація на площі",
        "timestamp": "2025-01-15T15:45:00Z",
        "operator": "Emergency Response Team",
        "priority": "critical",
        "casualties": 0,
        "response_time": "3 minutes"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point", 
        "coordinates": [30.5038, 50.4515]
      },
      "properties": {
        "address": "вул. Хрещатик, 22, Київ, Україна",
        "alert_type": "3🟡 підозріла активність біля торгового центру",
        "timestamp": "2025-01-15T16:20:00Z",
        "operator": "Security Team Beta",
        "priority": "medium",
        "witnesses": 2,
        "camera_footage": true
      }
    }
  ]
}`;

/**
 * Get sample data by visualization type
 */
export function getSampleDataByType(type: 'heatmap' | 'density' | 'markers' | 'points'): Location[] {
  switch (type) {
    case 'heatmap':
      return sampleLocations;
    case 'density':
      return sampleDensityData;
    case 'markers':
      return sampleAlertMarkers;
    case 'points':
      return samplePointsData;
    default:
      return sampleLocations;
  }
}
