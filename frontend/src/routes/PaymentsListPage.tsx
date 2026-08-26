import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listPayments } from '../api/payments';
import type { Payment, PaymentStatus } from '../api/payments';
import { DataTableHeader, DataTableRow } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { SearchField } from '../components/SearchField';
import { StatusBadge } from '../components/StatusBadge';
import type { StatusTone } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import listStyles from '../styles/listPage.module.css';

const PAGE_SIZE = 9;

const COLUMNS: DataTableColumn[] = [
  { label: 'PROPERTY', width: 240 },
  { label: 'TENANT', width: 180 },
  { label: 'DUE DATE', width: 140 },
  { label: 'AMOUNT', width: 150 },
  { label: 'PAID AT', width: 140 },
  { label: 'STATUS', width: 130 },
];

const STATUS_TONE: Record<PaymentStatus, StatusTone> = {
  Pending: 'neutral',
  Paid: 'positive',
  Overdue: 'critical',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-CA');
}

export function PaymentsListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments', { search, page }],
    queryFn: () => listPayments({ search: search || undefined, page, pageSize: PAGE_SIZE }),
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <section>
      <div className={listStyles.header}>
        <div>
          <p className={listStyles.eyebrow}>RENT COLLECTION</p>
          <h1 className={listStyles.title}>Payments</h1>
          <p className={listStyles.subtitle}>{total} payment records</p>
        </div>
      </div>

      <div className={listStyles.searchRow}>
        <SearchField
          id="payment-search"
          label="Search"
          placeholder="Search property or tenant…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading && <p>Loading…</p>}
      {isError && <p role="alert">Failed to load payments.</p>}

      {data && (
        <>
          <div className={listStyles.tableWrap}>
            <DataTableHeader columns={COLUMNS} />
            {data.items.map((payment: Payment) => (
              <DataTableRow key={payment.id} to={`/properties/${payment.propertyId}`} columns={COLUMNS}>
                <span className={listStyles.primaryCell}>{payment.propertyName}</span>
                <span className={listStyles.secondaryCell}>{payment.tenantName}</span>
                <span className={listStyles.secondaryCell}>{formatDate(payment.dueDate)}</span>
                <span className={listStyles.monoCell}>NT$ {payment.amount.toLocaleString('en-US')}</span>
                <span className={listStyles.secondaryCell}>{formatDate(payment.paidAt)}</span>
                <StatusBadge label={payment.status} tone={STATUS_TONE[payment.status]} />
              </DataTableRow>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
