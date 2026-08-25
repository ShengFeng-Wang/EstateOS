import styles from './LoginPage.module.css';

// Exact node data from Figma frame "Spatial Identity" (#28:25), 860x1024 design space.
// Rectangles "Asset Block 1..15": x/y/width/height/opacity, fill Asset Green (#275B43) except
// Asset Block 10, which is the single Spatial Signal (#B7F34A) highlight at full opacity.
const DESIGN_WIDTH = 860;
const DESIGN_HEIGHT = 1024;

interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  signal?: boolean;
}

const BLOCKS: Block[] = [
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

export function SpatialBars() {
  return (
    <div className={styles.bars} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
      {BLOCKS.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${(b.x / DESIGN_WIDTH) * 100}%`,
            top: `${(b.y / DESIGN_HEIGHT) * 100}%`,
            width: `${(b.w / DESIGN_WIDTH) * 100}%`,
            height: `${(b.h / DESIGN_HEIGHT) * 100}%`,
            borderRadius: 2,
            background: b.signal ? 'var(--color-spatial-signal)' : 'var(--color-asset-green)',
            opacity: b.signal ? 1 : b.opacity,
          }}
        />
      ))}
    </div>
  );
}
