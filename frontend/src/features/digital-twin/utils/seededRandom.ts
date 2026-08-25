// Deterministic hash + PRNG. Never use Math.random() for Digital Twin layout —
// the same property set must always produce the same positions (see
// docs/estateos/claude-threejs-implementation-spec.md, "Stable seed").

/** FNV-1a string hash, 32-bit unsigned. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 seeded PRNG. Returns a function yielding floats in [0, 1). */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic float in [min, max) derived from a string key. */
export function seededFloat(key: string, min: number, max: number): number {
  const rand = createSeededRandom(hashString(key));
  return min + rand() * (max - min);
}
