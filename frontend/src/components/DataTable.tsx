import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './DataTable.module.css';

export interface DataTableColumn {
  label: string;
  width: number;
}

interface DataTableHeaderProps {
  columns: DataTableColumn[];
}

export function DataTableHeader({ columns }: DataTableHeaderProps) {
  return (
    <div className={styles.header}>
      {columns.map((col) => (
        <span key={col.label} className={styles.headerCell} style={{ width: col.width }}>
          {col.label}
        </span>
      ))}
    </div>
  );
}

interface DataTableRowProps {
  to?: string;
  columns: DataTableColumn[];
  children: ReactNode[];
}

export function DataTableRow({ to, columns, children }: DataTableRowProps) {
  const content = columns.map((col, i) => (
    <span key={col.label} className={styles.cell} style={{ width: col.width }}>
      {children[i]}
    </span>
  ));

  if (to) {
    return (
      <Link to={to} className={styles.row}>
        {content}
      </Link>
    );
  }

  return <div className={styles.row}>{content}</div>;
}
