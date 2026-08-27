import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html } from '@react-three/drei';
import { EastNorthUpFrame } from '3d-tiles-renderer/r3f';
import type { Property } from '../../api/properties';
import { propertyGeoPosition } from './propertyGeoPosition';
import styles from './PropertyMarker.module.css';

const DEG2RAD = Math.PI / 180;
const MARKER_HEIGHT_M = 40;

const STATUS_COLOR: Record<Property['status'], string> = {
  Occupied: '#275b43',
  Vacant: '#737b75',
  Maintenance: '#d69a35',
  Archived: '#c9cdc7',
};

interface PropertyMarkerProps {
  property: Property;
}

export function PropertyMarker({ property }: PropertyMarkerProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const { lat, lon } = propertyGeoPosition(property.id, property.city, property.district);
  const color = STATUS_COLOR[property.status];

  return (
    <EastNorthUpFrame lat={lat * DEG2RAD} lon={lon * DEG2RAD} height={0}>
      <mesh
        position={[0, MARKER_HEIGHT_M, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/properties/${property.id}`);
        }}
        scale={hovered ? 1.4 : 1}
      >
        <sphereGeometry args={[20, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.8 : 0.45} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0, 12, MARKER_HEIGHT_M, 12]} />
        <meshStandardMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {hovered && (
        <Html position={[0, MARKER_HEIGHT_M + 10, 0]} center distanceFactor={400} occlude={false}>
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
