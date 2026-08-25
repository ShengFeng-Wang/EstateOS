import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

interface UseBuildingMotionOptions {
  delaySeconds: number;
  skip: boolean;
}

/**
 * Drives the building-emergence animation (scaleY 0.02 -> 1, cubic-out) by mutating a
 * ref directly in useFrame rather than React state, per the performance rules. `skip`
 * covers reduced-motion and repeat-visit resolution.
 */
export function useBuildingMotion({ delaySeconds, skip }: UseBuildingMotionOptions) {
  const ref = useRef<Group>(null);
  const startedAt = useRef<number | null>(null);
  const done = useRef(skip);

  useFrame((state) => {
    const group = ref.current;
    if (!group) return;

    if (skip || done.current) {
      if (group.scale.y !== 1) group.scale.set(1, 1, 1);
      return;
    }

    if (startedAt.current === null) startedAt.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startedAt.current - delaySeconds;

    if (elapsed <= 0) {
      group.scale.set(1, 0.02, 1);
      return;
    }

    const duration = 0.6;
    const t = Math.min(1, elapsed / duration);
    const eased = 1 - (1 - t) ** 3; // cubic-out
    const y = 0.02 + eased * 0.98;
    group.scale.set(1, y, 1);

    if (t >= 1) done.current = true;
  });

  return ref;
}
