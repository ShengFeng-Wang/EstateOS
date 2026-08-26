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
  return (
    <div className={styles.pagination}>
      <span>
        SHOWING {rangeStart}–{rangeEnd} OF {total}
      </span>
      <div className={styles.pageControls}>
        <button type="button" className={styles.pageButton} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          PREV
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
          NEXT
        </button>
      </div>
    </div>
  );
}
