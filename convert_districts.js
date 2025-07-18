const fs = require('fs');

// Read the clean districts data
const districts = JSON.parse(fs.readFileSync('kyiv_districts_clean.json', 'utf8'));

// Define English names mapping
const nameMapping = {
  'Дарницький район': 'Darnytskyi',
  'Деснянський район': 'Desnianskyi', 
  'Дніпровський район': 'Dniprovskyi',
  'Голосіївський район': 'Holosiivskyi',
  'Оболонський район': 'Obolonskyi',
  'Подільський район': 'Podilskyi',
  'Шевченківський район': 'Shevchenkivskyi',
  'Солом\'янський район': 'Solomianskyi',
  'Святошинський район': 'Sviatoshynskyi'
};

// Convert GeoJSON to TypeScript format
let output = `// Real Kyiv district boundaries from OpenStreetMap
// Generated automatically from OSM data

export interface District {
  name: string;
  coordinates: [number, number][];
  population: number;
  area: number;
}

export const kyivDistricts: District[] = [
`;

districts.forEach((district, index) => {
  const ukrainianName = district.name;
  const englishName = nameMapping[ukrainianName] || ukrainianName;
  
  // Convert coordinates from [lng, lat] to [lat, lng]
  const coordinates = district.geojson.coordinates[0].map(coord => [coord[1], coord[0]]);
  
  // Sample population data (you might want to update these with real data)
  const populations = {
    'Darnytskyi': 350000,
    'Desnianskyi': 360000,
    'Dniprovskyi': 350000,
    'Holosiivskyi': 250000,
    'Obolonskyi': 320000,
    'Podilskyi': 200000,
    'Shevchenkivskyi': 230000,
    'Solomianskyi': 400000,
    'Sviatoshynskyi': 330000
  };
  
  const areas = {
    'Darnytskyi': 134.5,
    'Desnianskyi': 148.9,
    'Dniprovskyi': 67.8,
    'Holosiivskyi': 156.3,
    'Obolonskyi': 110.5,
    'Podilskyi': 34.1,
    'Shevchenkivskyi': 27.0,
    'Solomianskyi': 40.2,
    'Sviatoshynskyi': 101.2
  };
  
  output += `  {
    name: "${englishName}",
    coordinates: [
`;
  
  // Add coordinates in chunks to avoid very long lines
  const coordChunks = [];
  for (let i = 0; i < coordinates.length; i += 5) {
    const chunk = coordinates.slice(i, i + 5)
      .map(coord => `[${coord[0]}, ${coord[1]}]`)
      .join(', ');
    coordChunks.push(`      ${chunk}`);
  }
  
  output += coordChunks.join(',\n');
  output += `
    ],
    population: ${populations[englishName] || 300000},
    area: ${areas[englishName] || 100}
  }`;
  
  if (index < districts.length - 1) {
    output += ',';
  }
  output += '\n';
});

output += `];

// Calculate district density based on alert markers
export function calculateDistrictDensities(markers: any[]): Map<string, number> {
  const densities = new Map<string, number>();
  
  // Initialize all districts with 0 density
  kyivDistricts.forEach(district => {
    densities.set(district.name, 0);
  });
  
  // Count markers in each district
  markers.forEach(marker => {
    const point = [marker.lat, marker.lng];
    
    for (const district of kyivDistricts) {
      if (isPointInPolygon(point, district.coordinates)) {
        const currentCount = densities.get(district.name) || 0;
        densities.set(district.name, currentCount + 1);
        break; // Point can only be in one district
      }
    }
  });
  
  return densities;
}

// Point-in-polygon algorithm (ray casting)
function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [lat, lng] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lat1, lng1] = polygon[i];
    const [lat2, lng2] = polygon[j];
    
    if ((lng1 > lng) !== (lng2 > lng) && 
        lat < (lat2 - lat1) * (lng - lng1) / (lng2 - lng1) + lat1) {
      inside = !inside;
    }
  }
  
  return inside;
}
`;

// Write the TypeScript file
fs.writeFileSync('src/data/kyivDistricts.ts', output);
console.log('✅ Successfully converted OSM district data to TypeScript format!');
console.log(`📊 Generated data for ${districts.length} districts`);
