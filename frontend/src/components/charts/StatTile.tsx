import { useCountUp } from '../../hooks/useCountUp';
import styles from './StatTile.module.css';

interface StatTileProps {
  label: string;
  value: number;
  formatValue?: (value: number) => string;
  caption?: string;
  delta?: {
    label: string;
    isGood: boolean;
  };
  index?: number;
}

export function StatTile({
  label,
  value,
  formatValue = (v) => Math.round(v).toLocaleString('en-US'),
  caption,
  delta,
  index = 0,
}: StatTileProps) {
  const animated = useCountUp(value);

  return (
    <div className={styles.tile} style={{ animationDelay: `${index * 60}ms` }}>
      <p className={styles.label}>{label}</p>
      <div className={styles.valueRow}>
        <p className={styles.value}>{formatValue(animated)}</p>
        {delta && (
          <span className={`${styles.delta} ${delta.isGood ? styles.deltaGood : styles.deltaBad}`}>{delta.label}</span>
        )}
      </div>
      {caption && <p className={styles.caption}>{caption}</p>}
    </div>
  );
}
