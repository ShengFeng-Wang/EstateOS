import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import styles from './BarListChart.module.css';

export interface BarListItem {
  label: string;
  value: number;
  dotColor?: string;
}

interface BarListChartProps {
  items: BarListItem[];
  barColor?: string;
  formatValue?: (value: number) => string;
}

export function BarListChart({ items, barColor = '#275b43', formatValue = (v) => String(v) }: BarListChartProps) {
  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const reducedMotion = usePrefersReducedMotion();
  const [grown, setGrown] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  return (
    <div className={styles.list}>
      {items.map((item, i) => (
        <div className={styles.row} key={item.label}>
          <span className={styles.labelCell}>
            {item.dotColor && <span className={styles.dot} style={{ background: item.dotColor }} />}
            <span className={styles.label}>{item.label}</span>
          </span>
          <span className={styles.track}>
            <span
              className={styles.fill}
              style={{
                width: grown ? `${(item.value / maxValue) * 100}%` : '0%',
                background: item.dotColor ?? barColor,
                transitionDelay: `${i * 60}ms`,
              }}
            />
          </span>
          <span className={styles.value}>{formatValue(item.value)}</span>
        </div>
      ))}
    </div>
  );
}
