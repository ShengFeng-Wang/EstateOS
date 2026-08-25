import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { DigitalTwinProperty, VisualizationMode } from '../types/digitalTwin';
import { modeAppearance } from './statusAppearance';

interface UseBuildingMaterialOptions {
  isDimmed: boolean;
  isHovered: boolean;
}

/**
 * Builds (and memoizes) a MeshStandardMaterial for one building from its current
 * status/mode appearance, then applies hover/dim adjustments via an internal effect —
 * mutation stays inside the hook that owns the material, not the caller. Reused per
 * property; not reallocated in the render loop.
 */
export function useBuildingMaterial(
  property: DigitalTwinProperty,
  mode: VisualizationMode,
  revenueNormalizer: (value: number) => number,
  { isDimmed, isHovered }: UseBuildingMaterialOptions,
): THREE.MeshStandardMaterial {
  const base = useMemo(
    () => modeAppearance(property, mode, revenueNormalizer),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [property.status, property.contractSignal, property.maintenanceOpenCount, property.monthlyRevenue, mode],
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: base.color,
        emissive: base.emissive,
        emissiveIntensity: base.emissiveIntensity,
        roughness: base.roughness,
        metalness: base.metalness,
        opacity: base.opacity,
        transparent: true,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base],
  );

  useEffect(() => {
    material.opacity = isDimmed ? 0.12 : base.opacity;
    material.emissiveIntensity = base.emissiveIntensity * (isHovered ? 1.18 : 1);
    material.needsUpdate = true;
  }, [material, base, isDimmed, isHovered]);

  useEffect(() => () => material.dispose(), [material]);

  return material;
}
