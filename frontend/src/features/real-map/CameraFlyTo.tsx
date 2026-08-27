import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { PerspectiveCamera } from 'three';
import { WGS84_ELLIPSOID } from '3d-tiles-renderer/three';
import type { GlobeControls as GlobeControlsImpl } from '3d-tiles-renderer/three';
import type { DistrictCoordinate } from './districtCoordinates';

const DEG2RAD = Math.PI / 180;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

interface CameraFlyToProps {
  controlsRef: React.RefObject<GlobeControlsImpl | null>;
  target: DistrictCoordinate | null;
  /** Bump this (e.g. a counter) to re-trigger a fly-to for the same target. */
  triggerKey: number;
  distanceMeters?: number;
  tilt?: number;
  durationMs?: number;
}

/** Smoothly moves the camera to sit above/beside a lat/lon point, looking at it — used to jump
 * to a property picked from a list rather than requiring the user to manually pan/zoom there. */
export function CameraFlyTo({
  controlsRef,
  target,
  triggerKey,
  distanceMeters = 420,
  tilt = 0.85,
  durationMs = 1100,
}: CameraFlyToProps) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!target) return;
    const controls = controlsRef.current;

    const latRad = target.lat * DEG2RAD;
    const lonRad = target.lon * DEG2RAD;
    const surfacePoint = new Vector3();
    const east = new Vector3();
    const north = new Vector3();
    const up = new Vector3();
    WGS84_ELLIPSOID.getCartographicToPosition(latRad, lonRad, 0, surfacePoint);
    WGS84_ELLIPSOID.getEastNorthUpAxes(latRad, lonRad, east, north, up, surfacePoint);

    const endPosition = surfacePoint
      .clone()
      .addScaledVector(up, distanceMeters * Math.cos(tilt))
      .addScaledVector(north, -distanceMeters * Math.sin(tilt));

    const startPosition = camera.position.clone();
    const startUp = camera.up.clone();
    const startTime = performance.now();

    if (controls) controls.enabled = false;

    function tick(now: number) {
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = easeInOutCubic(t);
      camera.position.lerpVectors(startPosition, endPosition, eased);
      camera.up.copy(startUp).lerp(up, eased).normalize();
      camera.lookAt(surfacePoint);
      camera.updateProjectionMatrix();

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else if (controls) {
        controls.enabled = true;
      }
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
      if (controls) controls.enabled = true;
    };
    // target's lat/lon (not the object identity) and triggerKey are the real dependencies —
    // camera/controlsRef/distanceMeters/tilt/durationMs are stable across a fly-to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.lat, target?.lon, triggerKey]);

  return null;
}
