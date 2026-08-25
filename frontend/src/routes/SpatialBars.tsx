import styles from './LoginPage.module.css';

// Decorative column heights (px) approximating the Figma Login frame's spatial graphic.
// Column 1 index 2 is the highlighted Spatial Signal bar (bright + muted sub-segment).
const COLUMNS: number[][] = [
  [70, 130, 96],
  [56, 70, 150, 40],
  [96, 150, 40, 30],
];

const SIGNAL_COLUMN = 2;
const SIGNAL_INDEX = 1;

export function SpatialBars() {
  return (
    <div className={styles.bars} aria-hidden="true">
      {COLUMNS.map((column, columnIndex) => (
        <div className={styles.barColumn} key={columnIndex}>
          {column.map((height, barIndex) => {
            if (columnIndex === SIGNAL_COLUMN && barIndex === SIGNAL_INDEX) {
              return (
                <div key={barIndex} style={{ display: 'flex', flexDirection: 'column', gap: 4, height }}>
                  <div className={`${styles.bar} ${styles.barSignal}`} style={{ flex: 2 }} />
                  <div className={`${styles.bar} ${styles.barSignalMuted}`} style={{ flex: 1 }} />
                </div>
              );
            }
            return <div key={barIndex} className={styles.bar} style={{ height }} />;
          })}
        </div>
      ))}
    </div>
  );
}
