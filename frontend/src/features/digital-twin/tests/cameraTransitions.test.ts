import { describe, expect, it } from 'vitest';
import { cameraTargetForMode, PORTFOLIO_POSITION, PORTFOLIO_TARGET } from '../motion/cameraTransitions';
import type { BuildingMass } from '../geometry/buildingArchetypes';
import type { CityLayoutEntry, DistrictBounds } from '../types/digitalTwin';

const districts: DistrictBounds[] = [{ district: 'Xinyi', centerX: 10, centerZ: -5, radius: 8, propertyIds: ['p1'] }];
const layout = new Map<string, CityLayoutEntry>([['p1', { propertyId: 'p1', district: 'Xinyi', x: 10, z: -5 }]]);
const mass: BuildingMass = { footprintX: 3, footprintZ: 3, height: 12, scale: 1, sizeT: 0.5, rentT: 0.5 };
const massByProperty = new Map([['p1', mass]]);

describe('cameraTargetForMode', () => {
  it('returns the fixed portfolio position/target', () => {
    const result = cameraTargetForMode({ kind: 'portfolio' }, districts, layout, massByProperty);
    expect(result.position).toEqual(PORTFOLIO_POSITION);
    expect(result.target).toEqual(PORTFOLIO_TARGET);
  });

  it('clamps district camera distance to [18, 34]', () => {
    const tight = cameraTargetForMode({ kind: 'district', district: 'Xinyi' }, [{ ...districts[0], radius: 1 }], layout, massByProperty);
    const wide = cameraTargetForMode({ kind: 'district', district: 'Xinyi' }, [{ ...districts[0], radius: 50 }], layout, massByProperty);

    const tightDistance = Math.hypot(...tight.position.map((v, i) => v - tight.target[i]) as [number, number, number]);
    const wideDistance = Math.hypot(...wide.position.map((v, i) => v - wide.target[i]) as [number, number, number]);

    expect(tightDistance).toBeGreaterThanOrEqual(18 - 0.01);
    expect(wideDistance).toBeLessThanOrEqual(34 + 0.01);
  });

  it('clamps property camera distance to [9.5, 18] based on building height', () => {
    const short = cameraTargetForMode({ kind: 'property', propertyId: 'p1' }, districts, layout, new Map([['p1', { ...mass, height: 1 }]]));
    const tall = cameraTargetForMode({ kind: 'property', propertyId: 'p1' }, districts, layout, new Map([['p1', { ...mass, height: 40 }]]));

    const shortDistance = Math.hypot(...short.position.map((v, i) => v - short.target[i]) as [number, number, number]);
    const tallDistance = Math.hypot(...tall.position.map((v, i) => v - tall.target[i]) as [number, number, number]);

    expect(shortDistance).toBeGreaterThanOrEqual(9.5 - 0.01);
    expect(tallDistance).toBeLessThanOrEqual(18 + 0.01);
  });

  it('targets the property at 42% of building height', () => {
    const result = cameraTargetForMode({ kind: 'property', propertyId: 'p1' }, districts, layout, massByProperty);
    expect(result.target[1]).toBeCloseTo(mass.height * 0.42, 5);
  });
});
