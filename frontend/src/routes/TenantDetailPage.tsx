import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTenant } from '../api/tenants';
import { listContracts } from '../api/contracts';
import type { Contract, ContractStatus } from '../api/contracts';
import { getProperty } from '../api/properties';
import { DefinitionList } from '../components/DefinitionList';
import { StatusBadge } from '../components/StatusBadge';
import type { StatusTone } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import listStyles from '../styles/listPage.module.css';
import styles from './PropertyDetailPage.module.css';

const CONTRACT_STATUS_TONE: Record<ContractStatus, StatusTone> = {
  Draft: 'neutral',
  Active: 'positive',
  ExpiringSoon: 'warning',
  Expired: 'neutral',
  Terminated: 'critical',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-CA');
}

function currentContract(contracts: Contract[]): Contract | undefined {
  const active = contracts.find((c) => c.status === 'Active');
  if (active) return active;
  return [...contracts].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
}

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();

  const tenantQuery = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => getTenant(id!),
    enabled: !!id,
  });

  const contractsQuery = useQuery({
    queryKey: ['contracts', { tenantId: id }],
    queryFn: () => listContracts({ tenantId: id, pageSize: 50 }),
    enabled: !!id,
  });

  const active = contractsQuery.data ? currentContract(contractsQuery.data.items) : undefined;

  const propertyQuery = useQuery({
    queryKey: ['property', active?.propertyId],
    queryFn: () => getProperty(active!.propertyId),
    enabled: !!active,
  });

  if (tenantQuery.isLoading) return <p>Loading…</p>;
  if (tenantQuery.isError || !tenantQuery.data) return <p role="alert">Failed to load tenant.</p>;

  const tenant = tenantQuery.data;

  return (
    <section>
      <div className={listStyles.header}>
        <div>
          <p className={listStyles.eyebrow}>TENANT</p>
          <h1 className={listStyles.title}>{tenant.name}</h1>
          <p className={listStyles.subtitle}>{tenant.email}</p>
        </div>
      </div>

      <div className={styles.tabContent}>
        <DefinitionList
          items={[
            { label: 'Phone', value: tenant.phone },
            { label: 'Email', value: tenant.email },
            { label: 'Identity Reference', value: tenant.identityReference ?? '—' },
            { label: 'Emergency Contact', value: tenant.emergencyContact ?? '—' },
            { label: 'Notes', value: tenant.notes ?? '—' },
            { label: 'On file since', value: formatDate(tenant.createdAt) },
          ]}
        />

        <h2 className={styles.sectionTitle}>Current Lease</h2>

        {contractsQuery.isLoading ? (
          <p>Loading…</p>
        ) : active ? (
          <DefinitionList
            items={[
              {
                label: 'Property',
                value: propertyQuery.data ? (
                  <Link to={`/properties/${propertyQuery.data.id}`}>{propertyQuery.data.name}</Link>
                ) : (
                  '—'
                ),
              },
              { label: 'Term', value: `${formatDate(active.startDate)} – ${formatDate(active.endDate)}` },
              { label: 'Monthly Rent', value: `NT$ ${active.monthlyRent.toLocaleString('en-US')}` },
              { label: 'Status', value: <StatusBadge label={active.status} tone={CONTRACT_STATUS_TONE[active.status]} /> },
            ]}
          />
        ) : (
          <EmptyState title="No active lease" description="This tenant has no active or recent contract on file." />
        )}
      </div>
    </section>
  );
}
