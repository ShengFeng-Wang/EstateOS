import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { PerspectiveCamera } from 'three';
import { WGS84_ELLIPSOID } from '3d-tiles-renderer/three';
import type { DistrictCoordinate } from './districtCoordinates';

const DEG2RAD = Math.PI / 180;

interface CameraInitializerProps {
  target: DistrictCoordinate;
  /** Distance from the target point, in meters. */
  distanceMeters?: number;
  /** Tilt from straight-down (0 = directly overhead, PI/2 = eye-level) in radians. */
  tilt?: number;
}

/**
 * Places the R3F default camera near a lat/lon point on the WGS84 ellipsoid, tilted so the
 * Photorealistic 3D Tiles' building relief actually reads as 3D rather than a flat satellite
 * photo. GlobeControls (mounted separately) takes over orbit/pan/zoom from here.
 */
export function CameraInitializer({ target, distanceMeters = 900, tilt = 0.95 }: CameraInitializerProps) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const latRad = target.lat * DEG2RAD;
    const lonRad = target.lon * DEG2RAD;

    const surfacePoint = new Vector3();
    const east = new Vector3();
    const north = new Vector3();
    const up = new Vector3();
    WGS84_ELLIPSOID.getCartographicToPosition(latRad, lonRad, 0, surfacePoint);
    WGS84_ELLIPSOID.getEastNorthUpAxes(latRad, lonRad, east, north, up, surfacePoint);

    // Orbit-style placement: offset south and up from the target, then look back at it —
    // reads as an oblique aerial angle instead of a straight-down satellite view.
    const eyePosition = surfacePoint
      .clone()
      .addScaledVector(up, distanceMeters * Math.cos(tilt))
      .addScaledVector(north, -distanceMeters * Math.sin(tilt));

    camera.position.copy(eyePosition);
    camera.up.copy(up);
    camera.near = 1;
    camera.far = 1e7;
    camera.lookAt(surfacePoint);
    camera.updateProjectionMatrix();
  }, [camera, target, distanceMeters, tilt]);

  return null;
}
