import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listProperties } from '../api/properties';
import type { Property, PropertyStatus } from '../api/properties';
import { DataTableHeader, DataTableRow } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { SearchField } from '../components/SearchField';
import { StatusBadge } from '../components/StatusBadge';
import type { StatusTone } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { Button } from '../components/Button';
import listStyles from '../styles/listPage.module.css';
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
      <div className={listStyles.header}>
        <div>
          <p className={listStyles.eyebrow}>PROPERTY PORTFOLIO</p>
          <h1 className={listStyles.title}>Properties</h1>
          <p className={listStyles.subtitle}>{total} assets · Residential and commercial</p>
        </div>
        <Link to="/properties/new">
          <Button variant="primary" size="medium">
            New property
          </Button>
        </Link>
      </div>

      <div className={listStyles.searchRow}>
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

      <div className={listStyles.toolbar}>
        <span className={listStyles.filterLine}>FILTER&nbsp;&nbsp;ALL STATUS&nbsp;&nbsp;&nbsp;&nbsp;TYPE&nbsp;&nbsp;ALL&nbsp;&nbsp;&nbsp;&nbsp;DISTRICT&nbsp;&nbsp;ALL</span>
      </div>

      {isLoading && <p>Loading…</p>}
      {isError && <p role="alert">Failed to load properties.</p>}

      {data && (
        <>
          <div className={listStyles.tableWrap}>
            <DataTableHeader columns={COLUMNS} />
            {data.items.map((property: Property) => (
              <DataTableRow key={property.id} to={`/properties/${property.id}`} columns={COLUMNS}>
                <span className={listStyles.primaryCell}>{property.name}</span>
                <span className={listStyles.secondaryCell}>
                  {property.city} · {property.district}
                </span>
                <StatusBadge label={property.status} tone={STATUS_TONE[property.status]} />
                <span className={listStyles.monoCell}>{formatRevenue(property.monthlyRent)}</span>
                <span className={styles.rowAction}>•••</span>
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
