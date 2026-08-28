import { useMemo, useState } from 'react';
import { Html } from '@react-three/drei';
import { EastNorthUpFrame } from '3d-tiles-renderer/r3f';
import type { Property } from '../../api/properties';
import { propertyGeoPosition } from './propertyGeoPosition';
import { STATUS_COLOR, SIGNAL_COLOR } from './statusColors';
import styles from './PropertyMarker.module.css';

const DEG2RAD = Math.PI / 180;
const MARKER_HEIGHT_M = 20;
const BEACON_HEIGHT_M = 160;

/** Footprint radius derived from the property's floor size — a proxy hit target for the real
 * building at this location (Google's tiles have no per-building pick metadata), not a literal
 * outline. Clamped to a sensible range so tiny/huge properties don't produce absurd hit areas. */
function footprintRadius(sizeSqm: number): number {
  return Math.min(28, Math.max(10, Math.sqrt(sizeSqm) * 1.6));
}

interface PropertyMarkerProps {
  property: Property;
  selected: boolean;
  onSelect: (property: Property) => void;
}

export function PropertyMarker({ property, selected, onSelect }: PropertyMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const { lat, lon } = propertyGeoPosition(property.code, property.id, property.city, property.district);
  const color = STATUS_COLOR[property.status];
  const radius = useMemo(() => footprintRadius(property.size), [property.size]);
  const active = hovered || selected;
  const highlightColor = selected ? SIGNAL_COLOR : color;

  return (
    <EastNorthUpFrame lat={lat * DEG2RAD} lon={lon * DEG2RAD} height={0}>
      {/* Building-sized hit target — clicking anywhere near the real structure at this
          position selects it, since the real tile mesh isn't per-building pickable. */}
      <mesh
        position={[0, MARKER_HEIGHT_M, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(property);
        }}
      >
        <cylinderGeometry args={[radius, radius, MARKER_HEIGHT_M * 2, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Tall beacon — visible from far away (a flat ground disc shrinks to nothing at
          distance; a vertical column stays legible) and drawn through occluding real
          geometry (depthTest disabled) so a nearby taller real building can never fully
          hide it, marking this as a managed asset before any hover/click. */}
      <mesh position={[0, BEACON_HEIGHT_M / 2, 0]} renderOrder={998}>
        <cylinderGeometry args={[6, 6, BEACON_HEIGHT_M, 16]} />
        <meshBasicMaterial
          color={highlightColor}
          transparent
          opacity={active ? 0.85 : 0.6}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      <mesh position={[0, BEACON_HEIGHT_M, 0]} renderOrder={999}>
        <sphereGeometry args={[9, 16, 16]} />
        <meshBasicMaterial color={highlightColor} transparent opacity={active ? 1 : 0.9} depthWrite={false} depthTest={false} />
      </mesh>

      {/* Ground highlight — the actual clickable footprint. */}
      <mesh position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial color={highlightColor} transparent opacity={active ? 0.55 : 0.38} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <ringGeometry args={[radius - 2, radius, 40]} />
        <meshBasicMaterial color={highlightColor} transparent opacity={1} depthWrite={false} />
      </mesh>

      {/* Locator pin with a white halo ring so it reads against any real rooftop color. */}
      <mesh position={[0, MARKER_HEIGHT_M, 0]} scale={active ? 1.3 : 1}>
        <sphereGeometry args={[7.8, 16, 16]} />
        <meshBasicMaterial color="#f1f0e9" />
      </mesh>
      <mesh position={[0, MARKER_HEIGHT_M, 0]} scale={active ? 1.3 : 1}>
        <sphereGeometry args={[6.4, 16, 16]} />
        <meshStandardMaterial
          color={highlightColor}
          emissive={highlightColor}
          emissiveIntensity={selected ? 0.9 : hovered ? 0.75 : 0.55}
        />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0, 4, MARKER_HEIGHT_M, 12]} />
        <meshStandardMaterial color={highlightColor} transparent opacity={0.6} />
      </mesh>

      {hovered && !selected && (
        <Html position={[0, MARKER_HEIGHT_M + 14, 0]} center distanceFactor={400} occlude={false}>
          <div className={styles.label}>
            <span className={styles.name}>{property.name}</span>
            <span className={styles.meta}>
              {property.city} · {property.district}
            </span>
          </div>
        </Html>
      )}
    </EastNorthUpFrame>
  );
}
