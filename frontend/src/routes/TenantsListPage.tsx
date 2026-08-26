import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTenants } from '../api/tenants';
import type { Tenant } from '../api/tenants';
import { DataTableHeader, DataTableRow } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { SearchField } from '../components/SearchField';
import { Pagination } from '../components/Pagination';
import listStyles from '../styles/listPage.module.css';

const PAGE_SIZE = 9;

const COLUMNS: DataTableColumn[] = [
  { label: 'NAME', width: 260 },
  { label: 'PHONE', width: 180 },
  { label: 'EMAIL', width: 280 },
  { label: 'EMERGENCY CONTACT', width: 200 },
];

export function TenantsListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tenants', { search, page }],
    queryFn: () => listTenants({ search: search || undefined, page, pageSize: PAGE_SIZE }),
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <section>
      <div className={listStyles.header}>
        <div>
          <p className={listStyles.eyebrow}>TENANT DIRECTORY</p>
          <h1 className={listStyles.title}>Tenants</h1>
          <p className={listStyles.subtitle}>{total} tenants on file</p>
        </div>
      </div>

      <div className={listStyles.searchRow}>
        <SearchField
          id="tenant-search"
          label="Search"
          placeholder="Search name, phone, email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading && <p>Loading…</p>}
      {isError && <p role="alert">Failed to load tenants.</p>}

      {data && (
        <>
          <div className={listStyles.tableWrap}>
            <DataTableHeader columns={COLUMNS} />
            {data.items.map((tenant: Tenant) => (
              <DataTableRow key={tenant.id} to={`/tenants/${tenant.id}`} columns={COLUMNS}>
                <span className={listStyles.primaryCell}>{tenant.name}</span>
                <span className={listStyles.monoCell}>{tenant.phone}</span>
                <span className={listStyles.secondaryCell}>{tenant.email}</span>
                <span className={listStyles.secondaryCell}>{tenant.emergencyContact ?? '—'}</span>
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
