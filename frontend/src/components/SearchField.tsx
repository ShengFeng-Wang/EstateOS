import type { InputHTMLAttributes } from 'react';
import styles from './SearchField.module.css';

interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function SearchField({ label, id, ...rest }: SearchFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.control}>
        <span className={styles.icon} aria-hidden="true" />
        <input id={id} type="search" className={styles.input} {...rest} />
      </div>
    </div>
  );
}
