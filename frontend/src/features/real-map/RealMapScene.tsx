import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { TilesRenderer, TilesPlugin, GlobeControls, TilesAttributionOverlay } from '3d-tiles-renderer/r3f';
import { GoogleCloudAuthPlugin } from '3d-tiles-renderer/plugins';
import type { Property } from '../../api/properties';
import { CameraInitializer } from './CameraInitializer';
import { PropertyMarker } from './PropertyMarker';
import { districtCoordinate } from './districtCoordinates';
import styles from './RealMapScene.module.css';

// Default view centers on Xinyi — the first district in the seed data's location list —
// rather than a computed portfolio midpoint, so the initial view actually shows properties.
const DEFAULT_VIEW = districtCoordinate('Taipei', 'Xinyi');

const TILES_ROOT_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

interface RealMapSceneProps {
  apiKey: string;
  properties: Property[];
}

export function RealMapScene({ apiKey, properties }: RealMapSceneProps) {
  return (
    <div className={styles.wrap}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, logarithmicDepthBuffer: true }}
        camera={{ fov: 55, near: 1, far: 1e7 }}
      >
        <CameraInitializer target={DEFAULT_VIEW} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[1, 1, 1]} intensity={1.2} />

        <Suspense fallback={null}>
          <TilesRenderer url={TILES_ROOT_URL}>
            <TilesPlugin plugin={GoogleCloudAuthPlugin} args={[{ apiToken: apiKey }]} />
            <GlobeControls enableDamping maxAltitude={Math.PI / 2 - 0.02} />
            <TilesAttributionOverlay className={styles.attribution} />

            {properties.map((property) => (
              <PropertyMarker key={property.id} property={property} />
            ))}
          </TilesRenderer>
        </Suspense>
      </Canvas>
    </div>
  );
}
