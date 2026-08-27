import { createSeededRandom, hashString } from '../digital-twin/utils/seededRandom';
import { districtCoordinate } from './districtCoordinates';
import type { DistrictCoordinate } from './districtCoordinates';

const JITTER_DEGREES = 0.006; // ~650m — keeps markers inside their district's cluster

/** Deterministic real-world position for a property: its district's centroid plus stable jitter. */
export function propertyGeoPosition(propertyId: string, city: string, district: string): DistrictCoordinate {
  const center = districtCoordinate(city, district);
  const rand = createSeededRandom(hashString(propertyId));
  return {
    lat: center.lat + (rand() * 2 - 1) * JITTER_DEGREES,
    lon: center.lon + (rand() * 2 - 1) * JITTER_DEGREES,
  };
}
