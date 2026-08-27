import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { WGS84_ELLIPSOID } from '3d-tiles-renderer/three';
import type { DistrictCoordinate } from './districtCoordinates';

const DEG2RAD = Math.PI / 180;

interface GlobeControlsLike {
  camera: { position: Vector3 };
  addEventListener: (type: 'change', cb: () => void) => void;
  removeEventListener: (type: 'change', cb: () => void) => void;
}

interface GeoLeashProps {
  controlsRef: React.RefObject<GlobeControlsLike | null>;
  center: DistrictCoordinate;
  /** Camera is clamped back if it drifts further than this from the center point, in meters. */
  maxRadiusMeters?: number;
}

/**
 * Keeps the camera within a fixed radius of a single geographic point — used to keep the Real
 * Map focused on one requested zone (Bade) rather than letting GlobeControls' normal
 * whole-earth pan/zoom wander anywhere. 3d-tiles-renderer has no built-in geographic bounds,
 * so this clamps the camera's straight-line distance from the target on every controls change.
 *
 * The controls instance is assigned to controlsRef by <GlobeControls> in its own effect, which
 * may not have run yet on this component's first effect pass — retry on the next frame until
 * it's available rather than assuming ready-by-mount ordering.
 */
export function GeoLeash({ controlsRef, center, maxRadiusMeters = 1400 }: GeoLeashProps) {
  const attachedRef = useRef<GlobeControlsLike | null>(null);

  useEffect(() => {
    const target = new Vector3();
    WGS84_ELLIPSOID.getCartographicToPosition(center.lat * DEG2RAD, center.lon * DEG2RAD, 0, target);

    function clamp() {
      const controls = attachedRef.current;
      if (!controls) return;
      const camera = controls.camera;
      const offset = camera.position.clone().sub(target);
      const distance = offset.length();
      if (distance > maxRadiusMeters) {
        camera.position.copy(target).addScaledVector(offset.normalize(), maxRadiusMeters);
      }
    }

    let frame: number;
    function tryAttach() {
      const controls = controlsRef.current;
      if (controls && attachedRef.current !== controls) {
        attachedRef.current?.removeEventListener('change', clamp);
        attachedRef.current = controls;
        controls.addEventListener('change', clamp);
      }
      frame = requestAnimationFrame(tryAttach);
    }
    tryAttach();

    return () => {
      cancelAnimationFrame(frame);
      attachedRef.current?.removeEventListener('change', clamp);
    };
  }, [controlsRef, center, maxRadiusMeters]);

  return null;
}
