import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listContracts } from '../api/contracts';
import type { Contract, ContractStatus } from '../api/contracts';
import { DataTableHeader, DataTableRow } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { SearchField } from '../components/SearchField';
import { StatusBadge } from '../components/StatusBadge';
import type { StatusTone } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import listStyles from '../styles/listPage.module.css';

const PAGE_SIZE = 9;

const COLUMNS: DataTableColumn[] = [
  { label: 'PROPERTY', width: 260 },
  { label: 'TENANT', width: 200 },
  { label: 'TERM', width: 220 },
  { label: 'MONTHLY RENT', width: 160 },
  { label: 'STATUS', width: 150 },
];

const STATUS_TONE: Record<ContractStatus, StatusTone> = {
  Draft: 'neutral',
  Active: 'positive',
  ExpiringSoon: 'warning',
  Expired: 'neutral',
  Terminated: 'critical',
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-CA');
}

export function ContractsListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contracts', { search, page }],
    queryFn: () => listContracts({ search: search || undefined, page, pageSize: PAGE_SIZE }),
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <section>
      <div className={listStyles.header}>
        <div>
          <p className={listStyles.eyebrow}>LEASE AGREEMENTS</p>
          <h1 className={listStyles.title}>Contracts</h1>
          <p className={listStyles.subtitle}>{total} contracts on file</p>
        </div>
      </div>

      <div className={listStyles.searchRow}>
        <SearchField
          id="contract-search"
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
      {isError && <p role="alert">Failed to load contracts.</p>}

      {data && (
        <>
          <div className={listStyles.tableWrap}>
            <DataTableHeader columns={COLUMNS} />
            {data.items.map((contract: Contract) => (
              <DataTableRow key={contract.id} to={`/properties/${contract.propertyId}`} columns={COLUMNS}>
                <span className={listStyles.primaryCell}>{contract.propertyName}</span>
                <span className={listStyles.secondaryCell}>{contract.tenantName}</span>
                <span className={listStyles.secondaryCell}>
                  {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
                </span>
                <span className={listStyles.monoCell}>NT$ {contract.monthlyRent.toLocaleString('en-US')}</span>
                <StatusBadge label={contract.status} tone={STATUS_TONE[contract.status]} />
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
