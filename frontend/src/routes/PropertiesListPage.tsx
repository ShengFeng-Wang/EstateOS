import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listProperties } from '../api/properties';
import type { Property, PropertyStatus } from '../api/properties';
import { DataTableHeader, DataTableRow } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { SearchField } from '../components/SearchField';
import { StatusBadge } from '../components/StatusBadge';
import type { StatusTone } from '../components/StatusBadge';
import styles from './PropertiesListPage.module.css';

const PAGE_SIZE = 9;

const COLUMNS: DataTableColumn[] = [
  { label: 'PROPERTY', width: 300 },
  { label: 'LOCATION', width: 250 },
  { label: 'STATUS', width: 170 },
  { label: 'MONTHLY REVENUE', width: 180 },
  { label: '', width: 80 },
];

const STATUS_TONE: Record<PropertyStatus, StatusTone> = {
  Occupied: 'positive',
  Vacant: 'neutral',
  Maintenance: 'warning',
  Archived: 'neutral',
};

function formatRevenue(amount: number): string {
  if (amount >= 1000) return `NT$ ${Math.round(amount / 1000)}K`;
  return `NT$ ${amount}`;
}

export function PropertiesListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['properties', { search, page }],
    queryFn: () => listProperties({ search: search || undefined, page, pageSize: PAGE_SIZE }),
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <section>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>PROPERTY PORTFOLIO</p>
          <h1 className={styles.title}>Properties</h1>
          <p className={styles.subtitle}>{total} assets · Residential and commercial</p>
        </div>
      </div>

      <div className={styles.searchRow}>
        <SearchField
          id="property-search"
          label="Search"
          placeholder="Search name, address, tenant…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className={styles.toolbar}>
        <span className={styles.filterLine}>FILTER&nbsp;&nbsp;ALL STATUS&nbsp;&nbsp;&nbsp;&nbsp;TYPE&nbsp;&nbsp;ALL&nbsp;&nbsp;&nbsp;&nbsp;DISTRICT&nbsp;&nbsp;ALL</span>
      </div>

      {isLoading && <p>Loading…</p>}
      {isError && <p role="alert">Failed to load properties.</p>}

      {data && (
        <>
          <div className={styles.tableWrap}>
            <DataTableHeader columns={COLUMNS} />
            {data.items.map((property: Property) => (
              <DataTableRow key={property.id} to={`/properties/${property.id}`} columns={COLUMNS}>
                <span className={styles.propertyName}>{property.name}</span>
                <span className={styles.location}>
                  {property.city} · {property.district}
                </span>
                <StatusBadge label={property.status} tone={STATUS_TONE[property.status]} />
                <span className={styles.revenue}>{formatRevenue(property.monthlyRent)}</span>
                <span className={styles.rowAction}>•••</span>
              </DataTableRow>
            ))}
          </div>

          <div className={styles.pagination}>
            <span>
              SHOWING {rangeStart}–{rangeEnd} OF {total}
            </span>
            <div className={styles.pageControls}>
              <button
                type="button"
                className={styles.pageButton}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                PREV
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                className={styles.pageButton}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                NEXT
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
