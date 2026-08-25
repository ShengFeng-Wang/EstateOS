import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { PALETTE } from '../materials/statusAppearance';

interface SelectionRingProps {
  footprintX: number;
  footprintZ: number;
  reducedMotion: boolean;
}

// Two concentric rings on the ground locate the selected property (spec: "Ground and
// grid" / "Selection"). Selection is communicated by this ring, not by recoloring the
// whole building lime.
export function SelectionRing({ footprintX, footprintZ, reducedMotion }: SelectionRingProps) {
  const groupRef = useRef<Mesh>(null);
  const startTime = useRef<number | null>(null);
  const diagonal = Math.hypot(footprintX, footprintZ);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (reducedMotion) {
      groupRef.current.scale.setScalar(1);
      return;
    }
    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startTime.current;
    const t = Math.min(1, elapsed / 0.26);
    const eased = 1 - (1 - t) * (1 - t);
    groupRef.current.scale.setScalar(0.82 + eased * 0.18);
  });

  return (
    <group ref={groupRef as never} position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[diagonal * 0.7, diagonal * 0.72, 48]} />
        <meshBasicMaterial color={PALETTE.spatialSignal} toneMapped={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[diagonal * 0.88, diagonal * 0.9, 48]} />
        <meshBasicMaterial color={PALETTE.spatialSignal} toneMapped={false} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
