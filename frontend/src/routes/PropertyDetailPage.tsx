import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { archiveProperty, getProperty } from '../api/properties';
import type { PropertyStatus } from '../api/properties';
import { listContracts, terminateContract } from '../api/contracts';
import type { Contract, ContractStatus } from '../api/contracts';
import { getTenant } from '../api/tenants';
import { listPayments } from '../api/payments';
import type { PaymentStatus } from '../api/payments';
import { listMaintenance } from '../api/maintenance';
import type { MaintenancePriority, MaintenanceStatus } from '../api/maintenance';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import type { StatusTone } from '../components/StatusBadge';
import { Tabs } from '../components/Tabs';
import type { TabItem } from '../components/Tabs';
import { DefinitionList } from '../components/DefinitionList';
import { DataTableHeader, DataTableRow } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import styles from './PropertyDetailPage.module.css';

const TABS: TabItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'tenant', label: 'Tenant' },
  { key: 'contract', label: 'Contract' },
  { key: 'payments', label: 'Payments' },
  { key: 'maintenance', label: 'Maintenance' },
];

const PROPERTY_STATUS_TONE: Record<PropertyStatus, StatusTone> = {
  Occupied: 'positive',
  Vacant: 'neutral',
  Maintenance: 'warning',
  Archived: 'neutral',
};

const CONTRACT_STATUS_TONE: Record<ContractStatus, StatusTone> = {
  Draft: 'neutral',
  Active: 'positive',
  ExpiringSoon: 'warning',
  Expired: 'neutral',
  Terminated: 'critical',
};

const PAYMENT_STATUS_TONE: Record<PaymentStatus, StatusTone> = {
  Pending: 'neutral',
  Paid: 'positive',
  Overdue: 'critical',
};

const MAINTENANCE_STATUS_TONE: Record<MaintenanceStatus, StatusTone> = {
  Open: 'warning',
  InProgress: 'signal',
  Completed: 'positive',
  Cancelled: 'neutral',
};

const MAINTENANCE_PRIORITY_TONE: Record<MaintenancePriority, StatusTone> = {
  Low: 'neutral',
  Medium: 'warning',
  High: 'warning',
  Urgent: 'critical',
};

function formatCurrency(amount: number): string {
  return `NT$ ${amount.toLocaleString('en-US')}`;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-CA');
}

function currentContract(contracts: Contract[]): Contract | undefined {
  const active = contracts.find((c) => c.status === 'Active');
  if (active) return active;
  return [...contracts].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
}

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [confirmArchive, setConfirmArchive] = useState(false);

  const propertyQuery = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id!),
    enabled: !!id,
  });

  const contractsQuery = useQuery({
    queryKey: ['contracts', { propertyId: id }],
    queryFn: () => listContracts({ propertyId: id, pageSize: 50 }),
    enabled: !!id,
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments', { propertyId: id }],
    queryFn: () => listPayments({ propertyId: id, pageSize: 50 }),
    enabled: !!id && tab === 'payments',
  });

  const maintenanceQuery = useQuery({
    queryKey: ['maintenance', { propertyId: id }],
    queryFn: () => listMaintenance({ propertyId: id, pageSize: 50 }),
    enabled: !!id && tab === 'maintenance',
  });

  const active = contractsQuery.data ? currentContract(contractsQuery.data.items) : undefined;

  const tenantQuery = useQuery({
    queryKey: ['tenant', active?.tenantId],
    queryFn: () => getTenant(active!.tenantId),
    enabled: !!active && tab === 'tenant',
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveProperty(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate('/properties');
    },
  });

  const terminateMutation = useMutation({
    mutationFn: (contractId: string) => terminateContract(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts', { propertyId: id }] });
    },
  });

  if (propertyQuery.isLoading) return <p>Loading…</p>;
  if (propertyQuery.isError || !propertyQuery.data) {
    return <p role="alert">Failed to load property.</p>;
  }

  const property = propertyQuery.data;

  const contractColumns: DataTableColumn[] = [
    { label: 'TERM', width: 220 },
    { label: 'MONTHLY RENT', width: 160 },
    { label: 'DEPOSIT', width: 140 },
    { label: 'STATUS', width: 160 },
    { label: '', width: 120 },
  ];

  const paymentColumns: DataTableColumn[] = [
    { label: 'DUE DATE', width: 160 },
    { label: 'AMOUNT', width: 160 },
    { label: 'PAID AT', width: 160 },
    { label: 'STATUS', width: 160 },
  ];

  const maintenanceColumns: DataTableColumn[] = [
    { label: 'TITLE', width: 280 },
    { label: 'PRIORITY', width: 140 },
    { label: 'STATUS', width: 160 },
    { label: 'CREATED', width: 140 },
  ];

  return (
    <section>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{property.code}</p>
          <h1 className={styles.title}>{property.name}</h1>
          <p className={styles.subtitle}>
            {property.address}, {property.district}, {property.city}
          </p>
        </div>
        <div className={styles.headerRight}>
          <StatusBadge label={property.status} tone={PROPERTY_STATUS_TONE[property.status]} />
          <Link to={`/properties/${property.id}/edit`}>
            <Button variant="secondary" size="medium">
              Edit
            </Button>
          </Link>
          {property.status !== 'Archived' && (
            <Button variant="secondary" size="medium" onClick={() => setConfirmArchive(true)}>
              Archive
            </Button>
          )}
        </div>
      </div>

      <Tabs items={TABS} active={tab} onChange={setTab} />

      <div className={styles.tabContent}>
        {tab === 'overview' && (
          <DefinitionList
            items={[
              { label: 'Type', value: property.type },
              { label: 'Status', value: property.status },
              { label: 'Monthly Rent', value: formatCurrency(property.monthlyRent) },
              { label: 'Size', value: `${property.size} m²` },
              { label: 'Rooms', value: property.rooms },
              { label: 'Floor', value: property.floor },
              { label: 'City / District', value: `${property.city} · ${property.district}` },
              { label: 'Address', value: property.address },
              { label: 'Created', value: formatDate(property.createdAt) },
              { label: 'Updated', value: formatDate(property.updatedAt) },
              { label: 'Description', value: property.description ?? '—' },
              { label: 'Archived', value: formatDate(property.archivedAt) },
            ]}
          />
        )}

        {tab === 'tenant' &&
          (active ? (
            tenantQuery.isLoading ? (
              <p>Loading…</p>
            ) : tenantQuery.data ? (
              <DefinitionList
                items={[
                  { label: 'Name', value: tenantQuery.data.name },
                  { label: 'Phone', value: tenantQuery.data.phone },
                  { label: 'Email', value: tenantQuery.data.email },
                  { label: 'Identity Reference', value: tenantQuery.data.identityReference ?? '—' },
                  { label: 'Emergency Contact', value: tenantQuery.data.emergencyContact ?? '—' },
                  { label: 'Notes', value: tenantQuery.data.notes ?? '—' },
                  {
                    label: 'Current Lease',
                    value: `${formatDate(active.startDate)} – ${formatDate(active.endDate)} · ${active.status}`,
                  },
                ]}
              />
            ) : (
              <p role="alert">Failed to load tenant.</p>
            )
          ) : (
            <EmptyState title="No active lease" description="This property has no active or recent contract on file." />
          ))}

        {tab === 'contract' &&
          (contractsQuery.isLoading ? (
            <p>Loading…</p>
          ) : contractsQuery.data && contractsQuery.data.items.length > 0 ? (
            <div className={styles.tableWrap}>
              <DataTableHeader columns={contractColumns} />
              {contractsQuery.data.items.map((contract) => (
                <DataTableRow key={contract.id} columns={contractColumns}>
                  <span>
                    {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
                  </span>
                  <span className={styles.mono}>{formatCurrency(contract.monthlyRent)}</span>
                  <span className={styles.mono}>{formatCurrency(contract.deposit)}</span>
                  <StatusBadge label={contract.status} tone={CONTRACT_STATUS_TONE[contract.status]} />
                  {contract.status === 'Active' ? (
                    <button
                      type="button"
                      className={styles.linkAction}
                      disabled={terminateMutation.isPending}
                      onClick={() => terminateMutation.mutate(contract.id)}
                    >
                      Terminate
                    </button>
                  ) : (
                    <span />
                  )}
                </DataTableRow>
              ))}
            </div>
          ) : (
            <EmptyState title="No contracts" description="No lease contracts have been recorded for this property." />
          ))}

        {tab === 'payments' &&
          (paymentsQuery.isLoading ? (
            <p>Loading…</p>
          ) : paymentsQuery.data && paymentsQuery.data.items.length > 0 ? (
            <div className={styles.tableWrap}>
              <DataTableHeader columns={paymentColumns} />
              {paymentsQuery.data.items.map((payment) => (
                <DataTableRow key={payment.id} columns={paymentColumns}>
                  <span>{formatDate(payment.dueDate)}</span>
                  <span className={styles.mono}>{formatCurrency(payment.amount)}</span>
                  <span>{formatDate(payment.paidAt)}</span>
                  <StatusBadge label={payment.status} tone={PAYMENT_STATUS_TONE[payment.status]} />
                </DataTableRow>
              ))}
            </div>
          ) : (
            <EmptyState title="No payments" description="No payment records exist for this property yet." />
          ))}

        {tab === 'maintenance' &&
          (maintenanceQuery.isLoading ? (
            <p>Loading…</p>
          ) : maintenanceQuery.data && maintenanceQuery.data.items.length > 0 ? (
            <div className={styles.tableWrap}>
              <DataTableHeader columns={maintenanceColumns} />
              {maintenanceQuery.data.items.map((request) => (
                <DataTableRow key={request.id} columns={maintenanceColumns}>
                  <span>{request.title}</span>
                  <StatusBadge label={request.priority} tone={MAINTENANCE_PRIORITY_TONE[request.priority]} />
                  <StatusBadge label={request.status} tone={MAINTENANCE_STATUS_TONE[request.status]} />
                  <span>{formatDate(request.createdAt)}</span>
                </DataTableRow>
              ))}
            </div>
          ) : (
            <EmptyState title="No maintenance requests" description="This property has no open or historical maintenance requests." />
          ))}
      </div>

      {confirmArchive && (
        <Modal title="Archive this property?" onClose={() => setConfirmArchive(false)}>
          <p className={styles.modalBody}>
            {property.name} will be marked Archived and hidden from the active portfolio. This does not delete any
            historical records and can be reviewed later.
          </p>
          <div className={styles.modalActions}>
            <Button variant="secondary" size="medium" onClick={() => setConfirmArchive(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="medium"
              disabled={archiveMutation.isPending}
              onClick={() => archiveMutation.mutate()}
            >
              Archive property
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
