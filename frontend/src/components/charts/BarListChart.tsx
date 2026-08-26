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

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <div className={styles.row} key={item.label}>
          <span className={styles.labelCell}>
            {item.dotColor && <span className={styles.dot} style={{ background: item.dotColor }} />}
            <span className={styles.label}>{item.label}</span>
          </span>
          <span className={styles.track}>
            <span
              className={styles.fill}
              style={{ width: `${(item.value / maxValue) * 100}%`, background: item.dotColor ?? barColor }}
            />
          </span>
          <span className={styles.value}>{formatValue(item.value)}</span>
        </div>
      ))}
    </div>
  );
}
