import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import styles from './FormField.module.css';

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

function FieldShell({ id, label, error, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export function TextField({ id, label, error, className, ...rest }: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error}>
      <input id={id} className={`${styles.input} ${error ? styles.inputError : ''} ${className ?? ''}`} {...rest} />
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function SelectField({ id, label, error, options, className, ...rest }: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error}>
      <select id={id} className={`${styles.select} ${error ? styles.inputError : ''} ${className ?? ''}`} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  error?: string;
}

export function TextAreaField({ id, label, error, className, ...rest }: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error}>
      <textarea id={id} className={`${styles.textarea} ${error ? styles.inputError : ''} ${className ?? ''}`} {...rest} />
    </FieldShell>
  );
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}
