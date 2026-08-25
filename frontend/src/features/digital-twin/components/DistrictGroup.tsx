import type { BuildingMass } from '../geometry/buildingArchetypes';
import type { CityLayoutEntry, DigitalTwinProperty, PropertyStatus, PropertyType, VisualizationMode } from '../types/digitalTwin';
import { PropertyBuilding } from './PropertyBuilding';

interface DistrictGroupProps {
  properties: DigitalTwinProperty[];
  layout: Map<string, CityLayoutEntry>;
  massByProperty: Map<string, BuildingMass>;
  mode: VisualizationMode;
  revenueNormalizer: (value: number) => number;
  hoveredPropertyId: string | null;
  selectedPropertyId: string | null;
  focusedDistrict: string | null;
  statusFilter: PropertyStatus[];
  typeFilter: PropertyType[];
  interactive: boolean;
  skipMotion: boolean;
  reducedMotion: boolean;
  onHoverStart: (id: string) => void;
  onHoverEnd: (id: string) => void;
  onSelect: (id: string) => void;
}

export function DistrictGroup({
  properties,
  layout,
  massByProperty,
  mode,
  revenueNormalizer,
  hoveredPropertyId,
  selectedPropertyId,
  focusedDistrict,
  statusFilter,
  typeFilter,
  interactive,
  skipMotion,
  reducedMotion,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: DistrictGroupProps) {
  return (
    <>
      {properties.map((property, index) => {
        const entry = layout.get(property.id);
        const mass = massByProperty.get(property.id);
        if (!entry || !mass) return null;

        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(property.status);
        const matchesType = typeFilter.length === 0 || typeFilter.includes(property.type);
        const districtDimmed = focusedDistrict != null && focusedDistrict !== property.district;
        const isDimmed = !matchesStatus || !matchesType || districtDimmed;

        return (
          <PropertyBuilding
            key={property.id}
            property={property}
            position={{ x: entry.x, z: entry.z }}
            mass={mass}
            mode={mode}
            revenueNormalizer={revenueNormalizer}
            isHovered={hoveredPropertyId === property.id}
            isSelected={selectedPropertyId === property.id}
            isDimmed={isDimmed}
            interactive={interactive}
            delaySeconds={Math.min(0.55, index * 0.03)}
            skipMotion={skipMotion}
            reducedMotion={reducedMotion}
            onHoverStart={onHoverStart}
            onHoverEnd={onHoverEnd}
            onSelect={onSelect}
          />
        );
      })}
    </>
  );
}
