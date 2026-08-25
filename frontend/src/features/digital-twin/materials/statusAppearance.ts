import type { DigitalTwinProperty, VisualizationMode } from '../types/digitalTwin';
import { clamp01 } from '../geometry/buildingArchetypes';

// docs/estateos/claude-threejs-implementation-spec.md, "Scene appearance" / "Materials".
export const PALETTE = {
  worldBackground: '#0A0F0D',
  occupied: '#275B43',
  spatialSignal: '#B7F34A',
  vacant: '#4B514D',
  maintenance: '#D69A35',
  critical: '#BE5A4E',
  gridLine: '#737B75',
  warmPanel: '#F1F0E9',
  ground: '#0D1511',
} as const;

export interface MaterialAppearance {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
  opacity: number;
  transparent: boolean;
}

const BASE_BY_STATUS: Record<string, MaterialAppearance> = {
  Occupied: {
    color: PALETTE.occupied,
    emissive: PALETTE.occupied,
    emissiveIntensity: 0.1,
    roughness: 0.78,
    metalness: 0.08,
    opacity: 1,
    transparent: false,
  },
  Vacant: {
    color: PALETTE.vacant,
    emissive: PALETTE.worldBackground,
    emissiveIntensity: 0.04,
    roughness: 0.88,
    metalness: 0.02,
    opacity: 0.72,
    transparent: true,
  },
  Maintenance: {
    color: PALETTE.maintenance,
    emissive: PALETTE.maintenance,
    emissiveIntensity: 0.22,
    roughness: 0.76,
    metalness: 0.06,
    opacity: 1,
    transparent: false,
  },
  Archived: {
    color: PALETTE.vacant,
    emissive: PALETTE.worldBackground,
    emissiveIntensity: 0.02,
    roughness: 0.9,
    metalness: 0.02,
    opacity: 0.4,
    transparent: true,
  },
};

/** Maintenance emissive pulse bounds; animated by useBuildingMotion, not here. */
export const MAINTENANCE_EMISSIVE_RANGE: [number, number] = [0.14, 0.3];

export function baseAppearance(property: DigitalTwinProperty): MaterialAppearance {
  return BASE_BY_STATUS[property.status] ?? BASE_BY_STATUS.Vacant;
}

/**
 * Applies the active visualization mode on top of the base status appearance.
 * Building positions/geometry never change; only material response does.
 */
export function modeAppearance(
  property: DigitalTwinProperty,
  mode: VisualizationMode,
  revenueNormalizer: (value: number) => number,
): MaterialAppearance {
  const base = { ...baseAppearance(property) };

  switch (mode) {
    case 'occupancy': {
      return base;
    }
    case 'revenue': {
      if (property.monthlyRevenue == null) {
        return { ...base, emissiveIntensity: 0.05, color: PALETTE.gridLine };
      }
      const t = clamp01(revenueNormalizer(property.monthlyRevenue));
      return { ...base, emissiveIntensity: 0.05 + t * (0.22 - 0.05) };
    }
    case 'contract': {
      if (property.contractSignal === 'ExpiringSoon') {
        return { ...base, color: PALETTE.maintenance, emissive: PALETTE.maintenance };
      }
      if (property.contractSignal === 'Active') {
        return base;
      }
      return { ...base, color: PALETTE.gridLine, emissive: PALETTE.worldBackground, emissiveIntensity: 0.03 };
    }
    case 'maintenance': {
      const bucket = property.maintenanceOpenCount === 0 ? 0 : property.maintenanceOpenCount <= 1 ? 1 : property.maintenanceOpenCount <= 3 ? 2 : 3;
      const intensityByBucket = [0.04, 0.14, 0.22, 0.3];
      if (bucket === 0) return { ...base, color: PALETTE.gridLine, emissive: PALETTE.worldBackground, emissiveIntensity: 0.04 };
      return { ...base, color: PALETTE.maintenance, emissive: PALETTE.maintenance, emissiveIntensity: intensityByBucket[bucket] };
    }
    default:
      return base;
  }
}
