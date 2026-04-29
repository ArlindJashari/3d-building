/* Building scale used by every 3D primitive in this folder. */
export const FLOOR_W = 16        // X (width) in world units
export const FLOOR_D = 11        // Z (depth) in world units
export const FLOOR_H = 1.7       // Y distance between floor slabs
export const SLAB_T = 0.06       // slab thickness

/** Map mock pipe x (0..100) → world X centered on the building. */
export function mapX(v: number) {
  return ((v - 50) / 100) * (FLOOR_W - 1.2)
}

/** Map mock pipe y (0..100) → world Z centered on the building. */
export function mapZ(v: number) {
  return ((v - 50) / 100) * (FLOOR_D - 1.2)
}
