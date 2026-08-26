// Exact node data from Figma frame "Spatial Identity" (#28:25), 860x1024 design space.
// Rectangles "Asset Block 1..15": x/y/width/height/opacity, fill Asset Green (#275B43) except
// Asset Block 10, which is the single Spatial Signal (#B7F34A) highlight at full opacity.
// Shared by the flat CSS fallback (SpatialBars) and the 3D ambient scene (LoginSpatialScene) —
// both render the same approved composition, just in 2D vs. extruded 3D.
export const DESIGN_WIDTH = 860;
export const DESIGN_HEIGHT = 1024;

export interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  signal?: boolean;
}

export const BLOCKS: Block[] = [
  { x: 480, y: 150, w: 46, h: 90, opacity: 0.3 },
  { x: 568, y: 170, w: 64, h: 118, opacity: 0.42 },
  { x: 656, y: 150, w: 82, h: 146, opacity: 0.54 },
  { x: 744, y: 170, w: 100, h: 174, opacity: 0.3 },
  { x: 480, y: 320, w: 46, h: 202, opacity: 0.42 },
  { x: 568, y: 340, w: 64, h: 90, opacity: 0.54 },
  { x: 656, y: 320, w: 82, h: 118, opacity: 0.3 },
  { x: 744, y: 340, w: 100, h: 146, opacity: 0.42 },
  { x: 480, y: 490, w: 46, h: 174, opacity: 0.54 },
  { x: 568, y: 510, w: 64, h: 202, opacity: 1, signal: true },
  { x: 656, y: 490, w: 82, h: 90, opacity: 0.42 },
  { x: 744, y: 510, w: 100, h: 118, opacity: 0.54 },
  { x: 480, y: 660, w: 46, h: 146, opacity: 0.3 },
  { x: 568, y: 680, w: 64, h: 174, opacity: 0.42 },
  { x: 656, y: 660, w: 82, h: 202, opacity: 0.54 },
];
