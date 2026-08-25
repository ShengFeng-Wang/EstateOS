import { useEffect, useMemo, useRef } from 'react';
import { CameraControls } from '@react-three/drei';
import { computeBuildingMass, computePercentileNormalizer } from '../geometry/buildingArchetypes';
import type { BuildingMass } from '../geometry/buildingArchetypes';
import { computeCityLayout } from '../geometry/cityLayout';
import { PALETTE } from '../materials/statusAppearance';
import { cameraTargetForMode } from '../motion/cameraTransitions';
import { useDigitalTwinStore } from '../state/digitalTwinStore';
import type { DigitalTwinProperty } from '../types/digitalTwin';
import { CityGround } from './CityGround';
import { DistrictGroup } from './DistrictGroup';

interface DigitalTwinSceneProps {
  properties: DigitalTwinProperty[];
  interactive: boolean;
  shadows: boolean;
}

export function DigitalTwinScene({ properties, interactive, shadows }: DigitalTwinSceneProps) {
  const controlsRef = useRef<CameraControls | null>(null);
  const isManual = useRef(false);

  const hoveredPropertyId = useDigitalTwinStore((s) => s.hoveredPropertyId);
  const selectedPropertyId = useDigitalTwinStore((s) => s.selectedPropertyId);
  const focusedDistrict = useDigitalTwinStore((s) => s.focusedDistrict);
  const visualizationMode = useDigitalTwinStore((s) => s.visualizationMode);
  const statusFilter = useDigitalTwinStore((s) => s.statusFilter);
  const typeFilter = useDigitalTwinStore((s) => s.typeFilter);
  const cameraMode = useDigitalTwinStore((s) => s.cameraMode);
  const reducedMotion = useDigitalTwinStore((s) => s.reducedMotion);
  const assemblySeen = useDigitalTwinStore((s) => s.assemblySeen);
  const setHovered = useDigitalTwinStore((s) => s.setHovered);
  const selectProperty = useDigitalTwinStore((s) => s.selectProperty);
  const setCameraMode = useDigitalTwinStore((s) => s.setCameraMode);
  const markAssemblySeen = useDigitalTwinStore((s) => s.markAssemblySeen);

  const { entries: layout, districts } = useMemo(() => computeCityLayout(properties), [properties]);

  const sizeNormalizer = useMemo(
    () => computePercentileNormalizer(properties.map((p) => p.size).filter((v): v is number => v != null)),
    [properties],
  );
  const rentNormalizer = useMemo(
    () => computePercentileNormalizer(properties.map((p) => p.monthlyRent).filter((v): v is number => v != null)),
    [properties],
  );
  const revenueNormalizer = useMemo(
    () => computePercentileNormalizer(properties.map((p) => p.monthlyRevenue).filter((v): v is number => v != null)),
    [properties],
  );

  const massByProperty = useMemo(() => {
    const map = new Map<string, BuildingMass>();
    for (const property of properties) {
      map.set(property.id, computeBuildingMass(property, sizeNormalizer, rentNormalizer));
    }
    return map;
  }, [properties, sizeNormalizer, rentNormalizer]);

  const propertiesByDistrict = useMemo(() => {
    const map = new Map<string, DigitalTwinProperty[]>();
    for (const property of properties) {
      if (!map.has(property.district)) map.set(property.district, []);
      map.get(property.district)!.push(property);
    }
    return map;
  }, [properties]);

  // Drive camera transitions from the store's camera-mode state machine.
  useEffect(() => {
    if (cameraMode.kind === 'manual') return;
    const controls = controlsRef.current;
    if (!controls) return;

    const { position, target } = cameraTargetForMode(cameraMode, districts, layout, massByProperty);
    controls.setLookAt(position[0], position[1], position[2], target[0], target[1], target[2], !reducedMotion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraMode, districts, layout, massByProperty]);

  // Manual interruption: any user-initiated control start cancels the scripted transition.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    function handleControlStart() {
      if (isManual.current) return;
      isManual.current = true;
      setCameraMode({ kind: 'manual', returnTo: useDigitalTwinStore.getState().cameraMode as never });
    }

    controls.addEventListener('controlstart', handleControlStart);
    return () => controls.removeEventListener('controlstart', handleControlStart);
  }, [setCameraMode]);

  useEffect(() => {
    if (cameraMode.kind !== 'manual') isManual.current = false;
  }, [cameraMode]);

  // Keyboard: Escape steps up one level, R resets (only outside inputs).
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditable = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (event.key === 'Escape') {
        useDigitalTwinStore.getState().escapeOneLevel();
      } else if ((event.key === 'r' || event.key === 'R') && !isEditable) {
        useDigitalTwinStore.getState().resetToPortfolio();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (assemblySeen) return;
    const timeout = setTimeout(() => markAssemblySeen(), 2600);
    return () => clearTimeout(timeout);
  }, [assemblySeen, markAssemblySeen]);

  return (
    <>
      <color attach="background" args={[PALETTE.worldBackground]} />
      <fogExp2 attach="fog" args={[PALETTE.worldBackground, 0.018]} />

      <hemisphereLight args={[PALETTE.warmPanel, PALETTE.worldBackground, 0.65]} />
      <directionalLight
        position={[-18, 26, 12]}
        intensity={2.2}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[18, 12, -16]} color={PALETTE.gridLine} intensity={0.55} />

      <CityGround />

      {[...propertiesByDistrict.entries()].map(([district, districtProperties]) => (
        <DistrictGroup
          key={district}
          properties={districtProperties}
          layout={layout}
          massByProperty={massByProperty}
          mode={visualizationMode}
          revenueNormalizer={revenueNormalizer}
          hoveredPropertyId={hoveredPropertyId}
          selectedPropertyId={selectedPropertyId}
          focusedDistrict={focusedDistrict}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          interactive={interactive}
          skipMotion={reducedMotion || assemblySeen}
          reducedMotion={reducedMotion}
          onHoverStart={setHovered}
          onHoverEnd={(id) => useDigitalTwinStore.getState().hoveredPropertyId === id && setHovered(null)}
          onSelect={selectProperty}
        />
      ))}

      <CameraControls
        ref={controlsRef}
        minPolarAngle={0.52}
        maxPolarAngle={1.2}
        minDistance={12}
        maxDistance={62}
        smoothTime={0.35}
        makeDefault
      />
    </>
  );
}
