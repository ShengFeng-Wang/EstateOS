import type { DigitalTwinProperty, PropertyType } from '../types/digitalTwin';

export interface ArchetypeSpec {
  footprintX: number;
  footprintZ: number;
  heightBase: number;
  heightRange: number;
}

// docs/estateos/claude-threejs-implementation-spec.md, "Building mass and archetypes".
export const ARCHETYPES: Record<PropertyType, ArchetypeSpec> = {
  Apartment: { footprintX: 2.8, footprintZ: 2.5, heightBase: 5.5, heightRange: 8.5 },
  Studio: { footprintX: 2.2, footprintZ: 2.0, heightBase: 3.8, heightRange: 5.0 },
  Townhouse: { footprintX: 3.2, footprintZ: 2.4, heightBase: 2.8, heightRange: 2.4 },
  Office: { footprintX: 3.6, footprintZ: 3.2, heightBase: 6.5, heightRange: 10.5 },
  Retail: { footprintX: 4.2, footprintZ: 3.0, heightBase: 2.4, heightRange: 2.8 },
};

// Conservative footprint scale ceiling used for collision spacing (see cityLayout.ts).
export const MAX_FOOTPRINT_SCALE = 1.18;
export const MIN_FOOTPRINT_SCALE = 0.88;

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Winsorized 10th/90th percentile normalization, per spec. */
export function computePercentileNormalizer(values: number[]): (value: number) => number {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return () => 0.5;

  const percentile = (p: number) => {
    const idx = clamp01(p) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
  };

  const p10 = percentile(0.1);
  const p90 = percentile(0.9);
  const span = Math.max(p90 - p10, 1);

  return (value: number) => clamp01((value - p10) / span);
}

export interface BuildingMass {
  footprintX: number;
  footprintZ: number;
  height: number;
  scale: number;
  sizeT: number;
  rentT: number;
}

export function computeBuildingMass(
  property: DigitalTwinProperty,
  sizeNormalizer: (value: number) => number,
  rentNormalizer: (value: number) => number,
): BuildingMass {
  const archetype = ARCHETYPES[property.type];
  const sizeT = property.size != null ? sizeNormalizer(property.size) : 0.5;
  const rentT = property.monthlyRent != null ? rentNormalizer(property.monthlyRent) : 0.5;

  const scale = MIN_FOOTPRINT_SCALE + sizeT * (MAX_FOOTPRINT_SCALE - MIN_FOOTPRINT_SCALE);
  const height = archetype.heightBase + sizeT * archetype.heightRange;

  return {
    footprintX: archetype.footprintX * scale,
    footprintZ: archetype.footprintZ * scale,
    height,
    scale,
    sizeT,
    rentT,
  };
}

/** Conservative max half-extent for a type, used for deterministic collision spacing. */
export function maxHalfExtent(type: PropertyType): { halfX: number; halfZ: number } {
  const archetype = ARCHETYPES[type];
  return {
    halfX: (archetype.footprintX * MAX_FOOTPRINT_SCALE) / 2,
    halfZ: (archetype.footprintZ * MAX_FOOTPRINT_SCALE) / 2,
  };
}
