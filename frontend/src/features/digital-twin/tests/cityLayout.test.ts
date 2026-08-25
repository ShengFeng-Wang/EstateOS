import { describe, expect, it } from 'vitest';
import { computeCityLayout } from '../geometry/cityLayout';
import { maxHalfExtent } from '../geometry/buildingArchetypes';
import type { DigitalTwinProperty } from '../types/digitalTwin';

function makeProperty(overrides: Partial<DigitalTwinProperty> & { id: string; district: string }): DigitalTwinProperty {
  return {
    code: overrides.id,
    name: overrides.id,
    city: 'Taipei',
    type: 'Apartment',
    status: 'Occupied',
    size: 30,
    monthlyRent: 40000,
    contractSignal: 'None',
    occupancyPercent: null,
    monthlyRevenue: null,
    maintenanceOpenCount: 0,
    ...overrides,
  };
}

describe('computeCityLayout', () => {
  it('is deterministic across repeated calls', () => {
    const properties = Array.from({ length: 12 }, (_, i) =>
      makeProperty({ id: `p${i}`, district: i % 3 === 0 ? 'Xinyi' : i % 3 === 1 ? "Da'an" : 'Songshan' }),
    );

    const a = computeCityLayout(properties);
    const b = computeCityLayout(properties);

    for (const property of properties) {
      const entryA = a.entries.get(property.id)!;
      const entryB = b.entries.get(property.id)!;
      expect(entryA.x).toBeCloseTo(entryB.x, 10);
      expect(entryA.z).toBeCloseTo(entryB.z, 10);
    }
  });

  it('does not reposition existing properties when filtering/sorting the input order', () => {
    const properties = Array.from({ length: 8 }, (_, i) => makeProperty({ id: `p${i}`, district: 'Xinyi' }));

    const original = computeCityLayout(properties);
    const shuffled = [...properties].reverse();
    const reordered = computeCityLayout(shuffled);

    for (const property of properties) {
      expect(reordered.entries.get(property.id)!.x).toBeCloseTo(original.entries.get(property.id)!.x, 10);
      expect(reordered.entries.get(property.id)!.z).toBeCloseTo(original.entries.get(property.id)!.z, 10);
    }
  });

  it('respects minimum spacing between building footprints', () => {
    const properties = Array.from({ length: 20 }, (_, i) =>
      makeProperty({ id: `p${i}`, district: 'Xinyi', type: i % 2 === 0 ? 'Office' : 'Retail' }),
    );

    const { entries } = computeCityLayout(properties);
    const placed = properties.map((p) => ({ ...entries.get(p.id)!, type: p.type }));

    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i];
        const b = placed[j];
        const extA = maxHalfExtent(a.type);
        const extB = maxHalfExtent(b.type);
        const dx = Math.abs(a.x - b.x);
        const dz = Math.abs(a.z - b.z);
        const minDx = extA.halfX + extB.halfX + 0.9;
        const minDz = extA.halfZ + extB.halfZ + 0.9;
        const overlaps = dx < minDx && dz < minDz;
        expect(overlaps).toBe(false);
      }
    }
  });

  it('assigns different districts to different anchor regions', () => {
    const properties = [
      makeProperty({ id: 'a', district: 'Xinyi' }),
      makeProperty({ id: 'b', district: "Da'an" }),
    ];

    const { districts } = computeCityLayout(properties);
    expect(districts).toHaveLength(2);
    expect(districts[0].district).not.toBe(districts[1].district);
    const dx = districts[0].centerX - districts[1].centerX;
    const dz = districts[0].centerZ - districts[1].centerZ;
    expect(Math.hypot(dx, dz)).toBeGreaterThan(5);
  });
});
