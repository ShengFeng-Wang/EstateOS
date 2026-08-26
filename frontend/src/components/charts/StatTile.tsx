import styles from './StatTile.module.css';

interface StatTileProps {
  label: string;
  value: string;
  caption?: string;
  delta?: {
    label: string;
    isGood: boolean;
  };
}

export function StatTile({ label, value, caption, delta }: StatTileProps) {
  return (
    <div className={styles.tile}>
      <p className={styles.label}>{label}</p>
      <div className={styles.valueRow}>
        <p className={styles.value}>{value}</p>
        {delta && (
          <span className={`${styles.delta} ${delta.isGood ? styles.deltaGood : styles.deltaBad}`}>{delta.label}</span>
        )}
      </div>
      {caption && <p className={styles.caption}>{caption}</p>}
    </div>
  );
}
