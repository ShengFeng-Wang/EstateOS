import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { TilesRenderer, TilesPlugin, GlobeControls, TilesAttributionOverlay } from '3d-tiles-renderer/r3f';
import { GoogleCloudAuthPlugin } from '3d-tiles-renderer/plugins';
import type { GlobeControls as GlobeControlsImpl } from '3d-tiles-renderer/three';
import type { Property } from '../../api/properties';
import { CameraInitializer } from './CameraInitializer';
import { CameraFlyTo } from './CameraFlyTo';
import { GeoLeash } from './GeoLeash';
import { PropertyMarker } from './PropertyMarker';
import { districtCoordinate } from './districtCoordinates';
import type { DistrictCoordinate } from './districtCoordinates';
import styles from './RealMapScene.module.css';

// The map is scoped to a single requested zone — Bade — rather than the whole portfolio.
const FOCUS_ZONE = districtCoordinate('Taoyuan', 'Bade');
const LEASH_RADIUS_METERS = 1400;

const TILES_ROOT_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

interface RealMapSceneProps {
  apiKey: string;
  properties: Property[];
  selectedPropertyId: string | null;
  onSelectProperty: (property: Property) => void;
  flyToTarget: DistrictCoordinate | null;
  flyToKey: number;
}

export function RealMapScene({
  apiKey,
  properties,
  selectedPropertyId,
  onSelectProperty,
  flyToTarget,
  flyToKey,
}: RealMapSceneProps) {
  const controlsRef = useRef<GlobeControlsImpl | null>(null);

  return (
    <div className={styles.wrap}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, logarithmicDepthBuffer: true }}
        camera={{ fov: 55, near: 1, far: 1e7 }}
      >
        <CameraInitializer target={FOCUS_ZONE} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[1, 1, 1]} intensity={1.2} />

        <Suspense fallback={null}>
          <TilesRenderer url={TILES_ROOT_URL}>
            <TilesPlugin plugin={GoogleCloudAuthPlugin} args={[{ apiToken: apiKey, autoRefreshToken: true }]} />
            <GlobeControls ref={controlsRef} enableDamping maxAltitude={Math.PI / 2 - 0.02} minDistance={40} maxDistance={LEASH_RADIUS_METERS} />
            <GeoLeash controlsRef={controlsRef} center={FOCUS_ZONE} maxRadiusMeters={LEASH_RADIUS_METERS} />
            <CameraFlyTo controlsRef={controlsRef} target={flyToTarget} triggerKey={flyToKey} />
            <TilesAttributionOverlay className={styles.attribution} />

            {properties.map((property) => (
              <PropertyMarker
                key={property.id}
                property={property}
                selected={property.id === selectedPropertyId}
                onSelect={onSelectProperty}
              />
            ))}
          </TilesRenderer>
        </Suspense>
      </Canvas>
    </div>
  );
}
