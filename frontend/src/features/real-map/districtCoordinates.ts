/**
 * Approximate real-world centroid (degrees) for each city/district pair used in the seed
 * data (backend/src/EstateOS.Infrastructure/Persistence/DbSeeder.cs `Locations`). Property
 * addresses are fictional per the localization spec's demo-content rules, so these are not
 * geocoded from those addresses — each property is placed at its district's real centroid
 * plus a small deterministic jitter (see propertyGeoPosition.ts), giving a genuinely real
 * geographic location at district granularity without implying address-level precision.
 */
export interface DistrictCoordinate {
  lat: number;
  lon: number;
}

const DISTRICT_COORDINATES: Record<string, DistrictCoordinate> = {
  'Taipei|Xinyi': { lat: 25.033, lon: 121.5654 },
  "Taipei|Da'an": { lat: 25.0265, lon: 121.5436 },
  'Taipei|Songshan': { lat: 25.0498, lon: 121.5578 },
  'Taipei|Neihu': { lat: 25.0692, lon: 121.5885 },
  'Taipei|Nangang': { lat: 25.0546, lon: 121.6066 },
  'New Taipei|Banqiao': { lat: 25.0137, lon: 121.4625 },
  'New Taipei|Linkou': { lat: 25.0776, lon: 121.3919 },
  // District-level approximation (not surveyed to the readjustment-zone boundary specifically —
  // see known-limitations.md). Used as the Real Map's sole focus area per direct request.
  'Taoyuan|Bade': { lat: 24.9364, lon: 121.2969 },
  'Taoyuan|Zhongli': { lat: 24.9535, lon: 121.2245 },
};

// Fallback centroid (roughly central Taipei) for any city/district pair not in the table above.
export const PORTFOLIO_CENTER: DistrictCoordinate = { lat: 25.0375, lon: 121.545 };

export function districtCoordinate(city: string, district: string): DistrictCoordinate {
  return DISTRICT_COORDINATES[`${city}|${district}`] ?? PORTFOLIO_CENTER;
}
