import type { ReactNode } from 'react';
import type { ThreeEvent } from '@react-three/fiber';

interface PropertyHitTargetProps {
  propertyId: string;
  footprintX: number;
  footprintZ: number;
  height: number;
  interactive: boolean;
  onHoverStart: (id: string) => void;
  onHoverEnd: (id: string) => void;
  onSelect: (id: string) => void;
  children: ReactNode;
}

// One invisible bounding mesh per building resolves the raycast target to exactly one
// propertyId, rather than raycasting against every facade sub-mesh (see the spec's
// "Raycast and pointer" contract).
export function PropertyHitTarget({
  propertyId,
  footprintX,
  footprintZ,
  height,
  interactive,
  onHoverStart,
  onHoverEnd,
  onSelect,
  children,
}: PropertyHitTargetProps) {
  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    if (!interactive) return;
    event.stopPropagation();
    onHoverStart(propertyId);
    document.body.style.cursor = 'pointer';
  }

  function handlePointerOut(event: ThreeEvent<PointerEvent>) {
    if (!interactive) return;
    event.stopPropagation();
    onHoverEnd(propertyId);
    document.body.style.cursor = 'auto';
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    if (!interactive) return;
    event.stopPropagation();
    onSelect(propertyId);
  }

  return (
    <group
      userData={{ propertyId }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {children}
      <mesh position={[0, height / 2, 0]} visible={false}>
        <boxGeometry args={[footprintX * 1.15, height * 1.05, footprintZ * 1.15]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}
