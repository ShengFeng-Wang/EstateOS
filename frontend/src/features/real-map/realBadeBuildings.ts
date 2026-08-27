import type { DistrictCoordinate } from './districtCoordinates';

/**
 * The 5 real, named buildings seeded for Bade (see backend/.../DbSeeder.cs
 * `SeedRealBadeProperties` for names/roads/rent sourcing). Their real road is known
 * (verified via web search), but no geocoding tool was available to survey each
 * building's exact plot — these coordinates are small, distinct offsets around the
 * real Bade Redevelopment Zone centroid, placing them within the correct real zone
 * and street grid, not pinpoint-accurate to the literal building footprint. See
 * docs/handoff/known-limitations.md.
 */
export const REAL_BADE_BUILDINGS: Record<string, DistrictCoordinate> = {
  'PPT-004': { lat: 24.9371, lon: 121.298 }, // Chengzhong Dazi — Zhongzheng 1st Rd
  'PPT-005': { lat: 24.9358, lon: 121.2957 }, // Heyuan Shouzhan — Zhongzheng Rd
  'PPT-006': { lat: 24.938, lon: 121.2991 }, // Guanyi Shengeng 13 — Guangxing Rd
  'PPT-007': { lat: 24.935, lon: 121.294 }, // Lihpao Youth Era — Fengde Rd
  'PPT-008': { lat: 24.9366, lon: 121.3002 }, // Deyi Yudi — Qietong Rd
};
