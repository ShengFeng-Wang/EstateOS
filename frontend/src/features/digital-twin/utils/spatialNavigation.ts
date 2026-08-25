import type { CityLayoutEntry, DigitalTwinProperty } from '../types/digitalTwin';

/** Deterministic spatial order: district (alphabetical), then position within it. */
export function spatialOrder(properties: DigitalTwinProperty[], layout: Map<string, CityLayoutEntry>): DigitalTwinProperty[] {
  return [...properties].sort((a, b) => {
    if (a.district !== b.district) return a.district.localeCompare(b.district);
    const entryA = layout.get(a.id);
    const entryB = layout.get(b.id);
    if (!entryA || !entryB) return a.id.localeCompare(b.id);
    if (entryA.z !== entryB.z) return entryA.z - entryB.z;
    return entryA.x - entryB.x;
  });
}

export function nextIndex(current: number, delta: number, length: number): number {
  if (length === 0) return -1;
  return (current + delta + length) % length;
}
