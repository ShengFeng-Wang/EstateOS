import styles from './StatusBadge.module.css';

export type StatusTone = 'positive' | 'neutral' | 'warning' | 'signal' | 'critical';

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span className={styles.badge}>
      <span className={`${styles.dot} ${styles[tone]}`} />
      {label}
    </span>
  );
}
