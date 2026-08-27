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
import { useTranslation } from '../i18n/useTranslation';
import { formatCurrency, formatDate } from '../i18n/format';
import listStyles from '../styles/listPage.module.css';

const PAGE_SIZE = 9;

const STATUS_TONE: Record<PaymentStatus, StatusTone> = {
  Pending: 'neutral',
  Paid: 'positive',
  Overdue: 'critical',
};

export function PaymentsListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { t, locale } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments', { search, page }],
    queryFn: () => listPayments({ search: search || undefined, page, pageSize: PAGE_SIZE }),
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const columns: DataTableColumn[] = [
    { label: t.payments.list.columns.property, width: 240 },
    { label: t.payments.list.columns.tenant, width: 180 },
    { label: t.payments.list.columns.dueDate, width: 140 },
    { label: t.payments.list.columns.amount, width: 150 },
    { label: t.payments.list.columns.paidAt, width: 140 },
    { label: t.payments.list.columns.status, width: 130 },
  ];

  return (
    <section>
      <div className={listStyles.header}>
        <div>
          <p className={listStyles.eyebrow}>{t.payments.list.eyebrow}</p>
          <h1 className={listStyles.title}>{t.payments.list.title}</h1>
          <p className={listStyles.subtitle}>{t.payments.list.subtitle(total)}</p>
        </div>
      </div>

      <div className={listStyles.searchRow}>
        <SearchField
          id="payment-search"
          label={t.common.search}
          placeholder={t.payments.list.searchPlaceholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading && <p>{t.common.loading}</p>}
      {isError && <p role="alert">{t.payments.list.failed}</p>}

      {data && (
        <>
          <div className={listStyles.tableWrap}>
            <DataTableHeader columns={columns} />
            {data.items.map((payment: Payment) => (
              <DataTableRow key={payment.id} to={`/properties/${payment.propertyId}`} columns={columns}>
                <span className={listStyles.primaryCell}>{payment.propertyName}</span>
                <span className={listStyles.secondaryCell}>{payment.tenantName}</span>
                <span className={listStyles.secondaryCell}>{formatDate(payment.dueDate, locale)}</span>
                <span className={listStyles.monoCell}>{formatCurrency(payment.amount, locale)}</span>
                <span className={listStyles.secondaryCell}>{formatDate(payment.paidAt, locale)}</span>
                <StatusBadge label={t.paymentStatus[payment.status]} tone={STATUS_TONE[payment.status]} />
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
