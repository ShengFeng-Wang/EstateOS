import type { CityLayoutEntry, DigitalTwinProperty, DistrictBounds } from '../types/digitalTwin';
import { maxHalfExtent } from './buildingArchetypes';
import { seededFloat } from '../utils/seededRandom';

// docs/estateos/claude-threejs-implementation-spec.md, "District placement".
const DISTRICT_ANCHORS: Array<[number, number]> = [
  [0, 0],
  [-15, -9],
  [15, -9],
  [-16, 10],
  [16, 10],
  [0, 17],
  [-29, 0],
  [29, 0],
  [0, -20],
];

const LOCAL_GRID_STEP = 4;
const JITTER_MAX = 0.35;
const MIN_GAP = 0.9;

function districtAnchor(index: number): [number, number] {
  if (index < DISTRICT_ANCHORS.length) return DISTRICT_ANCHORS[index];

  // Deterministic rectangular spiral continuation at 14-unit spacing beyond the fixed anchors.
  let ring = 1;
  let count = DISTRICT_ANCHORS.length;
  let side = 8; // ring 1 has 8 outer slots relative to the 3x3 covered by the fixed anchors
  while (count + side <= index) {
    count += side;
    ring += 1;
    side = ring * 8;
  }
  const offset = index - count;
  const span = ring * 2 + 1;
  const perSide = span - 1;
  const x0 = -ring;
  const z0 = -ring;

  let x = x0;
  let z = z0;
  if (offset < perSide) {
    x = x0 + offset;
    z = z0;
  } else if (offset < perSide * 2) {
    x = x0 + perSide;
    z = z0 + (offset - perSide);
  } else if (offset < perSide * 3) {
    x = x0 + perSide - (offset - perSide * 2);
    z = z0 + perSide;
  } else {
    x = x0;
    z = z0 + perSide - (offset - perSide * 3);
  }

  return [x * 14, z * 14];
}

/** Row-major spiral-ish slot sequence around a district's local origin. */
function localSlot(index: number): [number, number] {
  const ring = Math.max(0, Math.ceil((Math.sqrt(index + 1) - 1) / 2));
  const gridWidth = ring * 2 + 1;
  const ringStart = ring === 0 ? 0 : (2 * ring - 1) ** 2;
  const offset = index - ringStart;
  const col = offset % gridWidth;
  const row = Math.floor(offset / gridWidth);
  return [col - ring, row - ring];
}

interface PlacedBuilding {
  propertyId: string;
  type: DigitalTwinProperty['type'];
  x: number;
  z: number;
}

function collides(a: PlacedBuilding, b: PlacedBuilding): boolean {
  const extA = maxHalfExtent(a.type);
  const extB = maxHalfExtent(b.type);
  const dx = Math.abs(a.x - b.x);
  const dz = Math.abs(a.z - b.z);
  const minDx = extA.halfX + extB.halfX + MIN_GAP;
  const minDz = extA.halfZ + extB.halfZ + MIN_GAP;
  return dx < minDx && dz < minDz;
}

/**
 * Pure, deterministic layout: same property set -> same positions, regardless of
 * filter/sort/mode state. Always call with the FULL unfiltered portfolio.
 */
export function computeCityLayout(properties: DigitalTwinProperty[]): {
  entries: Map<string, CityLayoutEntry>;
  districts: DistrictBounds[];
} {
  const byDistrict = new Map<string, DigitalTwinProperty[]>();
  for (const property of properties) {
    const key = property.district;
    if (!byDistrict.has(key)) byDistrict.set(key, []);
    byDistrict.get(key)!.push(property);
  }

  const sortedDistrictKeys = [...byDistrict.keys()].sort((a, b) => a.localeCompare(b));

  const entries = new Map<string, CityLayoutEntry>();
  const districts: DistrictBounds[] = [];

  sortedDistrictKeys.forEach((districtKey, districtIndex) => {
    const [anchorX, anchorZ] = districtAnchor(districtIndex);
    const members = [...byDistrict.get(districtKey)!].sort((a, b) => a.id.localeCompare(b.id));

    const placed: PlacedBuilding[] = [];
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (const property of members) {
      let slotIndex = placed.length;
      let x = 0;
      let z = 0;

      // Deterministically advance to the next local grid slot on collision.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const [col, row] = localSlot(slotIndex);
        const jitterX = seededFloat(`${property.id}:x`, -JITTER_MAX, JITTER_MAX);
        const jitterZ = seededFloat(`${property.id}:z`, -JITTER_MAX, JITTER_MAX);
        x = anchorX + col * LOCAL_GRID_STEP + jitterX;
        z = anchorZ + row * LOCAL_GRID_STEP + jitterZ;

        const candidate: PlacedBuilding = { propertyId: property.id, type: property.type, x, z };
        const hasCollision = placed.some((other) => collides(candidate, other));
        if (!hasCollision) break;
        slotIndex += 1;
      }

      placed.push({ propertyId: property.id, type: property.type, x, z });
      entries.set(property.id, { propertyId: property.id, district: districtKey, x, z });

      const ext = maxHalfExtent(property.type);
      minX = Math.min(minX, x - ext.halfX);
      maxX = Math.max(maxX, x + ext.halfX);
      minZ = Math.min(minZ, z - ext.halfZ);
      maxZ = Math.max(maxZ, z + ext.halfZ);
    }

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const radius = Math.max((maxX - minX) / 2, (maxZ - minZ) / 2, 4);

    districts.push({
      district: districtKey,
      centerX: Number.isFinite(centerX) ? centerX : anchorX,
      centerZ: Number.isFinite(centerZ) ? centerZ : anchorZ,
      radius,
      propertyIds: members.map((m) => m.id),
    });
  });

  return { entries, districts };
}
