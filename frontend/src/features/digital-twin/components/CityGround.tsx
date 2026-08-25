import { Grid } from '@react-three/drei';
import { PALETTE } from '../materials/statusAppearance';

// Ground + primary grid, per the spec's "Ground and grid" section. No infinite bright
// helper grid — bounded to the city plane, low opacity.
export function CityGround() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[64, 48]} />
        <meshStandardMaterial color={PALETTE.ground} roughness={1} metalness={0} />
      </mesh>

      <Grid
        position={[0, 0.01, 0]}
        args={[64, 48]}
        cellSize={4}
        cellThickness={0.5}
        cellColor={PALETTE.gridLine}
        sectionSize={16}
        sectionThickness={0.7}
        sectionColor={PALETTE.gridLine}
        fadeDistance={46}
        fadeStrength={1.2}
        followCamera={false}
        infiniteGrid={false}
        side={2}
      />
    </group>
  );
}
