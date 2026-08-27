import { createSeededRandom, hashString } from '../digital-twin/utils/seededRandom';
import { districtCoordinate } from './districtCoordinates';
import { REAL_BADE_BUILDINGS } from './realBadeBuildings';
import type { DistrictCoordinate } from './districtCoordinates';

const JITTER_DEGREES = 0.006; // ~650m — keeps markers inside their district's cluster

/**
 * Real-world position for a property. The 5 real Bade buildings use their own known
 * coordinate (see realBadeBuildings.ts); everything else falls back to its district's
 * centroid plus stable per-property jitter.
 */
export function propertyGeoPosition(propertyCode: string, propertyId: string, city: string, district: string): DistrictCoordinate {
  const real = REAL_BADE_BUILDINGS[propertyCode];
  if (real) return real;

  const center = districtCoordinate(city, district);
  const rand = createSeededRandom(hashString(propertyId));
  return {
    lat: center.lat + (rand() * 2 - 1) * JITTER_DEGREES,
    lon: center.lon + (rand() * 2 - 1) * JITTER_DEGREES,
  };
}
