import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { SpatialBars } from './SpatialBars';

const LoginSpatialCity = lazy(() =>
  import('./LoginSpatialCity').then((m) => ({ default: m.LoginSpatialCity })),
);

function detectWebglSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// The decorative graphic only ever showed above 1200px (see .bars in LoginPage.module.css) —
// preserved here so the 3D scene isn't mounted (and its chunk isn't fetched) for nothing on
// viewports that would never render it.
function useMinViewportWidth(px: number): boolean {
  const query = `(min-width: ${px}px)`;
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function LoginSpatialScene() {
  const wideEnough = useMinViewportWidth(1200);
  const webglSupported = useMemo(() => detectWebglSupport(), []);

  if (!wideEnough) return null;
  if (!webglSupported) return <SpatialBars />;

  return (
    <Suspense fallback={<SpatialBars />}>
      <LoginSpatialCity />
    </Suspense>
  );
}
