import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Animates a number from 0 to `target` on mount/change. Skips straight to `target` under reduced motion. */
export function useCountUp(target: number, durationMs = 700): number {
  const reducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (reducedMotion) return;

    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(target * easeOutCubic(t));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs, reducedMotion]);

  return reducedMotion ? target : value;
}
