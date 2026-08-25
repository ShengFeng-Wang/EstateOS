import type { BuildingMass } from '../geometry/buildingArchetypes';
import type { CameraMode, CityLayoutEntry, DistrictBounds } from '../types/digitalTwin';

export const PORTFOLIO_POSITION: [number, number, number] = [28, 25, 34];
export const PORTFOLIO_TARGET: [number, number, number] = [0, 2.2, 0];

// Preserve the portfolio view's oblique bearing for district/property transitions
// instead of snapping to a fixed front-on angle (spec: "Property focus").
const OBLIQUE_DIRECTION = normalize([
  PORTFOLIO_POSITION[0] - PORTFOLIO_TARGET[0],
  PORTFOLIO_POSITION[1] - PORTFOLIO_TARGET[1],
  PORTFOLIO_POSITION[2] - PORTFOLIO_TARGET[2],
]);

function normalize(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface CameraTarget {
  position: [number, number, number];
  target: [number, number, number];
}

export function cameraTargetForMode(
  mode: CameraMode,
  districts: DistrictBounds[],
  layout: Map<string, CityLayoutEntry>,
  massByProperty: Map<string, BuildingMass>,
): CameraTarget {
  if (mode.kind === 'portfolio') {
    return { position: PORTFOLIO_POSITION, target: PORTFOLIO_TARGET };
  }

  if (mode.kind === 'district') {
    const district = districts.find((d) => d.district === mode.district);
    if (!district) return { position: PORTFOLIO_POSITION, target: PORTFOLIO_TARGET };

    let maxHeight = 6;
    for (const propertyId of district.propertyIds) {
      const mass = massByProperty.get(propertyId);
      if (mass) maxHeight = Math.max(maxHeight, mass.height);
    }

    const target: [number, number, number] = [district.centerX, maxHeight * 0.3, district.centerZ];
    const distance = clamp(district.radius * 2.7, 18, 34);
    return {
      target,
      position: [target[0] + OBLIQUE_DIRECTION[0] * distance, target[1] + OBLIQUE_DIRECTION[1] * distance, target[2] + OBLIQUE_DIRECTION[2] * distance],
    };
  }

  if (mode.kind === 'property') {
    const entry = layout.get(mode.propertyId);
    const mass = massByProperty.get(mode.propertyId);
    if (!entry || !mass) return { position: PORTFOLIO_POSITION, target: PORTFOLIO_TARGET };

    const target: [number, number, number] = [entry.x, mass.height * 0.42, entry.z];
    const distance = clamp(mass.height * 1.45, 9.5, 18);
    return {
      target,
      position: [target[0] + OBLIQUE_DIRECTION[0] * distance, target[1] + OBLIQUE_DIRECTION[1] * distance, target[2] + OBLIQUE_DIRECTION[2] * distance],
    };
  }

  // manual: no scripted target, camera stays where the user left it.
  return { position: PORTFOLIO_POSITION, target: PORTFOLIO_TARGET };
}
