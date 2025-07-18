import type { Location, AlertMarker } from '../types';

/**
 * Sample heatmap locations in Kyiv
 */
export const sampleLocations: Location[] = [
  {
    id: 1,
    name: "Maidan Nezalezhnosti",
    coordinates: { lat: 50.4501, lng: 30.5234 },
    intensity: 0.9
  },
  {
    id: 2,
    name: "Kyiv Pechersk Lavra",
    coordinates: { lat: 50.4342, lng: 30.5580 },
    intensity: 0.8
  },
  {
    id: 3,
    name: "Golden Gate",
    coordinates: { lat: 50.4487, lng: 30.5138 },
    intensity: 0.7
  },
  {
    id: 4,
    name: "St. Sophia Cathedral",
    coordinates: { lat: 50.4525, lng: 30.5155 },
    intensity: 0.85
  },
  {
    id: 5,
    name: "Motherland Monument",
    coordinates: { lat: 50.4265, lng: 30.5631 },
    intensity: 0.6
  },
  {
    id: 6,
    name: "Khreshchatyk Street",
    coordinates: { lat: 50.4474, lng: 30.5254 },
    intensity: 0.75
  },
  {
    id: 7,
    name: "Arsenalna Metro Station",
    coordinates: { lat: 50.4440, lng: 30.5459 },
    intensity: 0.8
  },
  {
    id: 8,
    name: "Podil District",
    coordinates: { lat: 50.4740, lng: 30.5100 },
    intensity: 0.65
  },
  {
    id: 9,
    name: "Olympiyskiy Stadium",
    coordinates: { lat: 50.4336, lng: 30.5211 },
    intensity: 0.7
  },
  {
    id: 10,
    name: "Mariinsky Palace",
    coordinates: { lat: 50.4485, lng: 30.5330 },
    intensity: 0.8
  },
  {
    id: 11,
    name: "Kyiv Zoo",
    coordinates: { lat: 50.4584, lng: 30.5129 },
    intensity: 0.55
  },
  {
    id: 12,
    name: "Besarabsky Market",
    coordinates: { lat: 50.4421, lng: 30.5204 },
    intensity: 0.75
  },
  {
    id: 13,
    name: "Obolon District",
    coordinates: { lat: 50.5100, lng: 30.4982 },
    intensity: 0.6
  },
  {
    id: 14,
    name: "Darnitsa District",
    coordinates: { lat: 50.4000, lng: 30.6000 },
    intensity: 0.7
  },
  {
    id: 15,
    name: "Solomyansky District",
    coordinates: { lat: 50.4200, lng: 30.4000 },
    intensity: 0.65
  },
  {
    id: 16,
    name: "Sviatoshynskyi District",
    coordinates: { lat: 50.4500, lng: 30.3000 },
    intensity: 0.6
  },
  {
    id: 17,
    name: "Desnianskyi District",
    coordinates: { lat: 50.5000, lng: 30.6000 },
    intensity: 0.7
  },
  {
    id: 18,
    name: "Dniprovskyi District",
    coordinates: { lat: 50.4600, lng: 30.5800 },
    intensity: 0.75
  },
  {
    id: 19,
    name: "Holosiivskyi District",
    coordinates: { lat: 50.3959, lng: 30.4982 },
    intensity: 0.65
  },
  {
    id: 20,
    name: "Shevchenkivskyi District",
    coordinates: { lat: 50.4501, lng: 30.5234 },
    intensity: 0.8
  }
];

/**
 * Sample alert markers with different types and severities in Kyiv
 */
export const sampleAlertMarkers: AlertMarker[] = [
  {
    id: 'alert-001',
    name: 'Critical System Failure',
    coordinates: { lat: 50.4501, lng: 30.5234 },
    alertType: 'critical',
    severity: 5,
    status: 'active',
    description: 'Multiple server failures detected in the Maidan Nezalezhnosti data center. Immediate attention required.',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    intensity: 1.0
  },
  {
    id: 'alert-002', 
    name: 'High Traffic Warning',
    coordinates: { lat: 50.4342, lng: 30.5580 },
    alertType: 'warning',
    severity: 3,
    status: 'acknowledged',
    description: 'Unusual traffic patterns detected in Kyiv Pechersk Lavra area. Monitor for potential congestion.',
    timestamp: new Date('2024-01-15T09:15:00Z'),
    intensity: 0.7
  },
  {
    id: 'alert-003',
    name: 'Security Breach Attempt',
    coordinates: { lat: 50.4487, lng: 30.5138 },
    alertType: 'danger',
    severity: 4,
    status: 'active',
    description: 'Suspicious login attempts detected from Golden Gate location.',
    timestamp: new Date('2024-01-15T08:45:00Z'),
    intensity: 0.9
  },
  {
    id: 'alert-004',
    name: 'Maintenance Complete',
    coordinates: { lat: 50.4525, lng: 30.5155 },
    alertType: 'success',
    severity: 1,
    status: 'resolved',
    description: 'Scheduled maintenance on St. Sophia Cathedral sensors completed successfully.',
    timestamp: new Date('2024-01-15T07:00:00Z'),
    intensity: 0.3
  },
  {
    id: 'alert-005',
    name: 'Network Performance Degradation',
    coordinates: { lat: 50.4265, lng: 30.5631 },
    alertType: 'warning',
    severity: 2,
    status: 'active',
    description: 'Slight decrease in network performance observed at Motherland Monument monitoring station.',
    timestamp: new Date('2024-01-15T11:20:00Z'),
    intensity: 0.5
  },
  {
    id: 'alert-006',
    name: 'Information Update',
    coordinates: { lat: 50.4474, lng: 30.5254 },
    alertType: 'info',
    severity: 1,
    status: 'active',
    description: 'Regular status update from Khreshchatyk Street monitoring system.',
    timestamp: new Date('2024-01-15T12:00:00Z'),
    intensity: 0.2
  },
  {
    id: 'alert-007',
    name: 'Emergency Response Required',
    coordinates: { lat: 50.4440, lng: 30.5459 },
    alertType: 'critical',
    severity: 5,
    status: 'active',
    description: 'Fire alarm triggered at Arsenalna Metro Station. Emergency teams dispatched.',
    timestamp: new Date('2024-01-15T13:45:00Z'),
    intensity: 1.0
  },
  {
    id: 'alert-008',
    name: 'Routine Check Complete',
    coordinates: { lat: 50.4336, lng: 30.5211 },
    alertType: 'info',
    severity: 1,
    status: 'resolved',
    description: 'Routine equipment check at Olympiyskiy Stadium completed without issues.',
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
