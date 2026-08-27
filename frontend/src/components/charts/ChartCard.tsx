import type { ReactNode } from 'react';
import styles from './ChartCard.module.css';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  isEmpty?: boolean;
  emptyLabel?: string;
  index?: number;
}

export function ChartCard({ title, subtitle, children, isEmpty, emptyLabel = 'No data yet', index = 0 }: ChartCardProps) {
  return (
    <div className={styles.card} style={{ animationDelay: `${index * 80}ms` }}>
      <p className={styles.title}>{title}</p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.body}>{isEmpty ? <p className={styles.noData}>{emptyLabel}</p> : children}</div>
    </div>
  );
}
