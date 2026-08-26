import type { ReactNode } from 'react';
import styles from './DefinitionList.module.css';

export interface DefinitionItem {
  label: string;
  value: ReactNode;
}

interface DefinitionListProps {
  items: DefinitionItem[];
}

export function DefinitionList({ items }: DefinitionListProps) {
  return (
    <dl className={styles.list}>
      {items.map((item) => (
        <div key={item.label} className={styles.row}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
