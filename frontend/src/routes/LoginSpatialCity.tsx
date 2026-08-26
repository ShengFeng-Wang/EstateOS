import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import type { Mesh } from 'three';
import { BLOCKS, DESIGN_WIDTH, DESIGN_HEIGHT } from './spatialBlocks';

// Extrudes the same approved "Spatial Identity" block composition (spatialBlocks.ts) into
// a non-interactive 3D skyline, in place of the flat CSS bars — same layout, same single
// Spatial Signal accent, just given real depth. Ambient only: no camera control, no raycast,
// no data binding (this is decorative, unlike the Digital Twin, which is real property data).
const SCALE = 60;
const HEIGHT_BOOST = 1.5;
const ROTATION_SPEED = 0.045; // rad/s — a full turn every ~140s, deliberately slow

const PALETTE = {
  background: '#0a0f0d',
  occupied: '#275b43',
  signal: '#b7f34a',
  ground: '#0d1511',
};

interface Building {
  x: number;
  z: number;
  footprint: number;
  height: number;
  opacity: number;
  signal: boolean;
  delay: number;
}

function buildLayout(): Building[] {
  return BLOCKS.map((b, i) => ({
    x: (b.x + b.w / 2 - DESIGN_WIDTH / 2) / SCALE,
    z: (b.y + b.w / 2 - DESIGN_HEIGHT / 2) / SCALE,
    footprint: b.w / SCALE,
    height: (b.h / SCALE) * HEIGHT_BOOST,
    opacity: b.signal ? 1 : b.opacity,
    signal: Boolean(b.signal),
    delay: i * 0.07,
  }));
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  return reduced;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function BuildingMesh({ building, reducedMotion }: { building: Building; reducedMotion: boolean }) {
  const ref = useRef<Mesh>(null);
  const startedAt = useRef<number | null>(null);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;

    if (reducedMotion) {
      mesh.scale.y = 1;
      return;
    }

    if (startedAt.current === null) startedAt.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startedAt.current - building.delay;
    const t = Math.min(1, Math.max(0, elapsed / 0.9));
    mesh.scale.y = easeOutCubic(t);
  });

  return (
    <RoundedBox
      ref={ref}
      args={[building.footprint, building.height, building.footprint]}
      radius={0.04}
      smoothness={2}
      position={[building.x, building.height / 2, building.z]}
      scale={[1, reducedMotion ? 1 : 0, 1]}
    >
      <meshStandardMaterial
        color={building.signal ? PALETTE.signal : PALETTE.occupied}
        emissive={building.signal ? PALETTE.signal : PALETTE.occupied}
        emissiveIntensity={building.signal ? 0.55 : 0.08}
        roughness={0.8}
        metalness={0.06}
        transparent
        opacity={building.opacity}
      />
    </RoundedBox>
  );
}

function RotatingCity({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<import('three').Group>(null);
  const buildings = useMemo(() => buildLayout(), []);

  useFrame((_, delta) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y += delta * ROTATION_SPEED;
  });

  return (
    <group ref={groupRef} rotation={[0, reducedMotion ? 0.5 : 0, 0]}>
      {buildings.map((b, i) => (
        <BuildingMesh key={i} building={b} reducedMotion={reducedMotion} />
      ))}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color={PALETTE.ground} roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

export function LoginSpatialCity() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [0, 8.5, 12.5], fov: 38, near: 0.1, far: 60 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={[PALETTE.background]} />
      <fogExp2 attach="fog" args={[PALETTE.background, 0.028]} />
      <hemisphereLight args={['#f1f0e9', PALETTE.background, 0.55]} />
      <directionalLight position={[-6, 9, 4]} intensity={1.8} />
      <directionalLight position={[6, 4, -6]} color="#737b75" intensity={0.5} />
      <RotatingCity reducedMotion={reducedMotion} />
    </Canvas>
  );
}
