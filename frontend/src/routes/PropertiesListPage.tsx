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
import { useTranslation } from '../i18n/useTranslation';
import { formatCompactCurrency } from '../i18n/format';
import listStyles from '../styles/listPage.module.css';
import styles from './PropertiesListPage.module.css';

const PAGE_SIZE = 9;

const STATUS_TONE: Record<PropertyStatus, StatusTone> = {
  Occupied: 'positive',
  Vacant: 'neutral',
  Maintenance: 'warning',
  Archived: 'neutral',
};

export function PropertiesListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { t, locale } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['properties', { search, page }],
    queryFn: () => listProperties({ search: search || undefined, page, pageSize: PAGE_SIZE }),
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const columns: DataTableColumn[] = [
    { label: t.properties.list.columns.property, width: 300 },
    { label: t.properties.list.columns.location, width: 250 },
    { label: t.properties.list.columns.status, width: 170 },
    { label: t.properties.list.columns.revenue, width: 180 },
    { label: '', width: 80 },
  ];

  return (
    <section>
      <div className={listStyles.header}>
        <div>
          <p className={listStyles.eyebrow}>{t.properties.list.eyebrow}</p>
          <h1 className={listStyles.title}>{t.properties.list.title}</h1>
          <p className={listStyles.subtitle}>{t.properties.list.subtitle(total)}</p>
        </div>
        <Link to="/properties/new">
          <Button variant="primary" size="medium">
            {t.properties.list.newProperty}
          </Button>
        </Link>
      </div>

      <div className={listStyles.searchRow}>
        <SearchField
          id="property-search"
          label={t.common.search}
          placeholder={t.properties.list.searchPlaceholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className={listStyles.toolbar}>
        <span className={listStyles.filterLine}>{t.properties.list.filterLine}</span>
      </div>

      {isLoading && <p>{t.common.loading}</p>}
      {isError && <p role="alert">{t.properties.list.failed}</p>}

      {data && (
        <>
          <div className={listStyles.tableWrap}>
            <DataTableHeader columns={columns} />
            {data.items.map((property: Property) => (
              <DataTableRow key={property.id} to={`/properties/${property.id}`} columns={columns}>
                <span className={listStyles.primaryCell}>{property.name}</span>
                <span className={listStyles.secondaryCell}>
                  {property.city} · {property.district}
                </span>
                <StatusBadge label={t.propertyStatus[property.status]} tone={STATUS_TONE[property.status]} />
                <span className={listStyles.monoCell}>{formatCompactCurrency(property.monthlyRent, locale)}</span>
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
