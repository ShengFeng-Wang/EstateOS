import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listMaintenance } from '../api/maintenance';
import type { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from '../api/maintenance';
import { DataTableHeader, DataTableRow } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { SearchField } from '../components/SearchField';
import { StatusBadge } from '../components/StatusBadge';
import type { StatusTone } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import listStyles from '../styles/listPage.module.css';

const PAGE_SIZE = 9;

const COLUMNS: DataTableColumn[] = [
  { label: 'TITLE', width: 280 },
  { label: 'PROPERTY', width: 220 },
  { label: 'PRIORITY', width: 140 },
  { label: 'STATUS', width: 150 },
  { label: 'CREATED', width: 140 },
];

const STATUS_TONE: Record<MaintenanceStatus, StatusTone> = {
  Open: 'warning',
  InProgress: 'signal',
  Completed: 'positive',
  Cancelled: 'neutral',
};

const PRIORITY_TONE: Record<MaintenancePriority, StatusTone> = {
  Low: 'neutral',
  Medium: 'warning',
  High: 'warning',
  Urgent: 'critical',
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-CA');
}

export function MaintenanceListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['maintenance', { search, page }],
    queryFn: () => listMaintenance({ search: search || undefined, page, pageSize: PAGE_SIZE }),
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <section>
      <div className={listStyles.header}>
        <div>
          <p className={listStyles.eyebrow}>MAINTENANCE QUEUE</p>
          <h1 className={listStyles.title}>Maintenance</h1>
          <p className={listStyles.subtitle}>{total} requests on file</p>
        </div>
      </div>

      <div className={listStyles.searchRow}>
        <SearchField
          id="maintenance-search"
          label="Search"
          placeholder="Search title or property…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading && <p>Loading…</p>}
      {isError && <p role="alert">Failed to load maintenance requests.</p>}

      {data && (
        <>
          <div className={listStyles.tableWrap}>
            <DataTableHeader columns={COLUMNS} />
            {data.items.map((request: MaintenanceRequest) => (
              <DataTableRow key={request.id} to={`/properties/${request.propertyId}`} columns={COLUMNS}>
                <span className={listStyles.primaryCell}>{request.title}</span>
                <span className={listStyles.secondaryCell}>{request.propertyName}</span>
                <StatusBadge label={request.priority} tone={PRIORITY_TONE[request.priority]} />
                <StatusBadge label={request.status} tone={STATUS_TONE[request.status]} />
                <span className={listStyles.secondaryCell}>{formatDate(request.createdAt)}</span>
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
