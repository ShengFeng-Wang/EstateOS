import styles from './LoginPage.module.css';
import { BLOCKS, DESIGN_WIDTH, DESIGN_HEIGHT } from './spatialBlocks';

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
