import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PORTFOLIO_POSITION } from '../motion/cameraTransitions';
import { QUALITY_CONFIG, resolveQualityTier } from '../utils/qualityTier';
import type { DigitalTwinProperty, QualityTier } from '../types/digitalTwin';
import { DigitalTwinScene } from './DigitalTwinScene';

interface DigitalTwinCanvasProps {
  properties: DigitalTwinProperty[];
  quality: QualityTier;
  interactive: boolean;
  onPointerMissed?: () => void;
}

export function DigitalTwinCanvas({ properties, quality, interactive, onPointerMissed }: DigitalTwinCanvasProps) {
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth));

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio;
  const resolved = resolveQualityTier(quality, viewportWidth, dpr);
  const config = QUALITY_CONFIG[resolved];

  return (
    <Canvas
      shadows={config.shadows}
      dpr={[1, config.dprMax]}
      gl={{ antialias: config.antialias, powerPreference: 'high-performance' }}
      camera={{ fov: 36, near: 0.1, far: 180, position: PORTFOLIO_POSITION }}
      onPointerMissed={onPointerMissed}
      style={{ background: '#0A0F0D' }}
    >
      <Suspense fallback={null}>
        <DigitalTwinScene properties={properties} interactive={interactive} shadows={config.shadows} />
      </Suspense>
    </Canvas>
  );
}
