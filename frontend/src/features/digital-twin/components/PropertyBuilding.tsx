import { RoundedBox } from '@react-three/drei';
import type { BuildingMass } from '../geometry/buildingArchetypes';
import { useBuildingMaterial } from '../materials/buildingMaterials';
import { PALETTE } from '../materials/statusAppearance';
import { useBuildingMotion } from '../motion/useBuildingMotion';
import type { DigitalTwinProperty, VisualizationMode } from '../types/digitalTwin';
import { PropertyHitTarget } from './PropertyHitTarget';
import { PropertyLabel } from './PropertyLabel';
import { SelectionRing } from './SelectionRing';

interface PropertyBuildingProps {
  property: DigitalTwinProperty;
  position: { x: number; z: number };
  mass: BuildingMass;
  mode: VisualizationMode;
  revenueNormalizer: (value: number) => number;
  isHovered: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  interactive: boolean;
  delaySeconds: number;
  skipMotion: boolean;
  reducedMotion: boolean;
  onHoverStart: (id: string) => void;
  onHoverEnd: (id: string) => void;
  onSelect: (id: string) => void;
}

const BEVEL = 0.06;

export function PropertyBuilding({
  property,
  position,
  mass,
  mode,
  revenueNormalizer,
  isHovered,
  isSelected,
  isDimmed,
  interactive,
  delaySeconds,
  skipMotion,
  reducedMotion,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: PropertyBuildingProps) {
  const material = useBuildingMaterial(property, mode, revenueNormalizer, { isDimmed, isHovered });
  const motionRef = useBuildingMotion({ delaySeconds, skip: skipMotion });

  return (
    <group position={[position.x, 0, position.z]}>
      <group ref={motionRef}>
        <PropertyHitTarget
          propertyId={property.id}
          footprintX={mass.footprintX}
          footprintZ={mass.footprintZ}
          height={mass.height}
          interactive={interactive && !isDimmed}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
          onSelect={onSelect}
        >
          <ArchetypeMass property={property} mass={mass} material={material} />
        </PropertyHitTarget>
      </group>

      {isSelected && <SelectionRing footprintX={mass.footprintX} footprintZ={mass.footprintZ} reducedMotion={reducedMotion} />}
      {(isHovered || isSelected) && !isDimmed && <PropertyLabel property={property} height={mass.height} />}
    </group>
  );
}

interface ArchetypeMassProps {
  property: DigitalTwinProperty;
  mass: BuildingMass;
  material: ReturnType<typeof useBuildingMaterial>;
}

// Minimal per-archetype architectural cue, per the spec's archetype table. Facade
// grid/instanced window detail is deferred — see docs/handoff/known-limitations.md.
function ArchetypeMass({ property, mass, material }: ArchetypeMassProps) {
  const { footprintX, footprintZ, height } = mass;

  switch (property.type) {
    case 'Apartment': {
      const roofHeight = height * 0.16;
      const bodyHeight = height - roofHeight;
      return (
        <group>
          <RoundedBox args={[footprintX, bodyHeight, footprintZ]} radius={BEVEL} position={[0, bodyHeight / 2, 0]} material={material} />
          <RoundedBox
            args={[footprintX * 0.7, roofHeight, footprintZ * 0.7]}
            radius={BEVEL * 0.6}
            position={[0, bodyHeight + roofHeight / 2, 0]}
            material={material}
          />
        </group>
      );
    }
    case 'Townhouse': {
      const halfX = footprintX / 2.05;
      return (
        <group>
          <RoundedBox
            args={[halfX, height, footprintZ]}
            radius={BEVEL}
            position={[-footprintX * 0.24, height / 2, 0]}
            material={material}
          />
          <RoundedBox
            args={[halfX, height * 0.85, footprintZ]}
            radius={BEVEL}
            position={[footprintX * 0.24, (height * 0.85) / 2, footprintZ * 0.08]}
            material={material}
          />
        </group>
      );
    }
    case 'Office': {
      const crownHeight = height * 0.08;
      const bodyHeight = height - crownHeight;
      return (
        <group>
          <RoundedBox args={[footprintX, bodyHeight, footprintZ]} radius={BEVEL} position={[0, bodyHeight / 2, 0]} material={material} />
          <mesh position={[0, bodyHeight + crownHeight / 2, 0]}>
            <boxGeometry args={[footprintX * 1.02, crownHeight, footprintZ * 1.02]} />
            <meshStandardMaterial color={PALETTE.spatialSignal} emissive={PALETTE.spatialSignal} emissiveIntensity={0.06} roughness={0.4} />
          </mesh>
        </group>
      );
    }
    case 'Retail': {
      const entryHeight = height * 0.35;
      return (
        <group>
          <RoundedBox args={[footprintX, height, footprintZ]} radius={BEVEL} position={[0, height / 2, 0]} material={material} />
          <mesh position={[0, entryHeight / 2, footprintZ / 2 - 0.06]}>
            <boxGeometry args={[footprintX * 0.4, entryHeight, 0.1]} />
            <meshStandardMaterial color={PALETTE.worldBackground} roughness={0.9} />
          </mesh>
        </group>
      );
    }
    case 'Studio':
    default:
      return <RoundedBox args={[footprintX, height, footprintZ]} radius={BEVEL} position={[0, height / 2, 0]} material={material} />;
  }
}
