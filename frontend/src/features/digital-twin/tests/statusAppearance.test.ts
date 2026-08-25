import { describe, expect, it } from 'vitest';
import { baseAppearance, modeAppearance, PALETTE } from '../materials/statusAppearance';
import type { DigitalTwinProperty } from '../types/digitalTwin';

function makeProperty(overrides: Partial<DigitalTwinProperty> = {}): DigitalTwinProperty {
  return {
    id: 'p1',
    code: 'PPT-001',
    name: 'Test',
    city: 'Taipei',
    district: 'Xinyi',
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

const identity = (v: number) => v;

describe('statusAppearance', () => {
  it('uses only approved palette colors for each status', () => {
    expect(baseAppearance(makeProperty({ status: 'Occupied' })).color).toBe(PALETTE.occupied);
    expect(baseAppearance(makeProperty({ status: 'Vacant' })).color).toBe(PALETTE.vacant);
    expect(baseAppearance(makeProperty({ status: 'Maintenance' })).color).toBe(PALETTE.maintenance);
  });

  it('occupancy mode does not alter the base status appearance', () => {
    const property = makeProperty({ status: 'Vacant' });
    expect(modeAppearance(property, 'occupancy', identity)).toEqual(baseAppearance(property));
  });

  it('revenue mode uses neutral styling when revenue is unavailable', () => {
    const property = makeProperty({ monthlyRevenue: null });
    const result = modeAppearance(property, 'revenue', identity);
    expect(result.color).toBe(PALETTE.gridLine);
  });

  it('revenue mode scales emissive intensity within the documented bounds', () => {
    const property = makeProperty({ monthlyRevenue: 1 });
    const result = modeAppearance(property, 'revenue', () => 1);
    expect(result.emissiveIntensity).toBeCloseTo(0.22, 5);

    const low = modeAppearance(property, 'revenue', () => 0);
    expect(low.emissiveIntensity).toBeCloseTo(0.05, 5);
  });

  it('contract mode flags expiring contracts with the maintenance/warning color', () => {
    const property = makeProperty({ contractSignal: 'ExpiringSoon' });
    expect(modeAppearance(property, 'contract', identity).color).toBe(PALETTE.maintenance);
  });

  it('maintenance mode buckets open counts into three labeled intensities', () => {
    const none = modeAppearance(makeProperty({ maintenanceOpenCount: 0 }), 'maintenance', identity);
    const one = modeAppearance(makeProperty({ maintenanceOpenCount: 1 }), 'maintenance', identity);
    const few = modeAppearance(makeProperty({ maintenanceOpenCount: 3 }), 'maintenance', identity);
    const many = modeAppearance(makeProperty({ maintenanceOpenCount: 4 }), 'maintenance', identity);

    expect(none.color).not.toBe(PALETTE.maintenance);
    expect(one.emissiveIntensity).toBeLessThan(few.emissiveIntensity);
    expect(few.emissiveIntensity).toBeLessThan(many.emissiveIntensity);
  });
});
