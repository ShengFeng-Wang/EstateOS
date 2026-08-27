import { useTranslation } from '../i18n/useTranslation';
import styles from '../styles/listPage.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, rangeStart, rangeEnd, total, onPageChange }: PaginationProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.pagination}>
      <span>{t.common.showingOf(rangeStart, rangeEnd, total)}</span>
      <div className={styles.pageControls}>
        <button type="button" className={styles.pageButton} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          {t.common.prev}
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className={styles.pageButton}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t.common.next}
        </button>
      </div>
    </div>
  );
}
