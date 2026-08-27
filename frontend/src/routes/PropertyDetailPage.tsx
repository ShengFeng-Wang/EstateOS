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
import { useTranslation } from '../i18n/useTranslation';
import { formatCurrency, formatDate } from '../i18n/format';
import styles from './PropertyDetailPage.module.css';

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
  const { t, locale } = useTranslation();
  const date = (v: string | null) => formatDate(v, locale);
  const currency = (n: number) => formatCurrency(n, locale);

  const TABS: TabItem[] = [
    { key: 'overview', label: t.properties.detail.tabs.overview },
    { key: 'tenant', label: t.properties.detail.tabs.tenant },
    { key: 'contract', label: t.properties.detail.tabs.contract },
    { key: 'payments', label: t.properties.detail.tabs.payments },
    { key: 'maintenance', label: t.properties.detail.tabs.maintenance },
  ];

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

  if (propertyQuery.isLoading) return <p>{t.common.loading}</p>;
  if (propertyQuery.isError || !propertyQuery.data) {
    return <p role="alert">{t.properties.detail.failed}</p>;
  }

  const property = propertyQuery.data;
  const f = t.properties.detail;

  const contractColumns: DataTableColumn[] = [
    { label: f.contract.term, width: 220 },
    { label: f.contract.monthlyRent, width: 160 },
    { label: f.contract.deposit, width: 140 },
    { label: f.contract.status, width: 160 },
    { label: '', width: 120 },
  ];

  const paymentColumns: DataTableColumn[] = [
    { label: f.paymentsTab.dueDate, width: 160 },
    { label: f.paymentsTab.amount, width: 160 },
    { label: f.paymentsTab.paidAt, width: 160 },
    { label: f.paymentsTab.status, width: 160 },
  ];

  const maintenanceColumns: DataTableColumn[] = [
    { label: f.maintenanceTab.title, width: 280 },
    { label: f.maintenanceTab.priority, width: 140 },
    { label: f.maintenanceTab.status, width: 160 },
    { label: f.maintenanceTab.created, width: 140 },
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
          <StatusBadge label={t.propertyStatus[property.status]} tone={PROPERTY_STATUS_TONE[property.status]} />
          <Link to={`/properties/${property.id}/edit`}>
            <Button variant="secondary" size="medium">
              {t.common.edit}
            </Button>
          </Link>
          {property.status !== 'Archived' && (
            <Button variant="secondary" size="medium" onClick={() => setConfirmArchive(true)}>
              {t.common.archive}
            </Button>
          )}
        </div>
      </div>

      <Tabs items={TABS} active={tab} onChange={setTab} />

      <div className={styles.tabContent}>
        {tab === 'overview' && (
          <DefinitionList
            items={[
              { label: f.overviewFields.type, value: t.propertyType[property.type] },
              { label: f.overviewFields.status, value: t.propertyStatus[property.status] },
              { label: f.overviewFields.monthlyRent, value: currency(property.monthlyRent) },
              { label: f.overviewFields.size, value: `${property.size} m²` },
              { label: f.overviewFields.rooms, value: property.rooms },
              { label: f.overviewFields.floor, value: property.floor },
              { label: f.overviewFields.cityDistrict, value: `${property.city} · ${property.district}` },
              { label: f.overviewFields.address, value: property.address },
              { label: f.overviewFields.created, value: date(property.createdAt) },
              { label: f.overviewFields.updated, value: date(property.updatedAt) },
              { label: f.overviewFields.description, value: property.description ?? '—' },
              { label: f.overviewFields.archived, value: date(property.archivedAt) },
            ]}
          />
        )}

        {tab === 'tenant' &&
          (active ? (
            tenantQuery.isLoading ? (
              <p>{t.common.loading}</p>
            ) : tenantQuery.data ? (
              <DefinitionList
                items={[
                  { label: f.tenantFields.name, value: tenantQuery.data.name },
                  { label: f.tenantFields.phone, value: tenantQuery.data.phone },
                  { label: f.tenantFields.email, value: tenantQuery.data.email },
                  { label: f.tenantFields.identityReference, value: tenantQuery.data.identityReference ?? '—' },
                  { label: f.tenantFields.emergencyContact, value: tenantQuery.data.emergencyContact ?? '—' },
                  { label: f.tenantFields.notes, value: tenantQuery.data.notes ?? '—' },
                  {
                    label: f.tenantFields.currentLease,
                    value: `${date(active.startDate)} – ${date(active.endDate)} · ${t.contractStatus[active.status]}`,
                  },
                ]}
              />
            ) : (
              <p role="alert">{f.tenantFields.failed}</p>
            )
          ) : (
            <EmptyState title={f.tenantFields.noActiveLease} description={f.tenantFields.noActiveLeaseDescription} />
          ))}

        {tab === 'contract' &&
          (contractsQuery.isLoading ? (
            <p>{t.common.loading}</p>
          ) : contractsQuery.data && contractsQuery.data.items.length > 0 ? (
            <div className={styles.tableWrap}>
              <DataTableHeader columns={contractColumns} />
              {contractsQuery.data.items.map((contract) => (
                <DataTableRow key={contract.id} columns={contractColumns}>
                  <span>
                    {date(contract.startDate)} – {date(contract.endDate)}
                  </span>
                  <span className={styles.mono}>{currency(contract.monthlyRent)}</span>
                  <span className={styles.mono}>{currency(contract.deposit)}</span>
                  <StatusBadge label={t.contractStatus[contract.status]} tone={CONTRACT_STATUS_TONE[contract.status]} />
                  {contract.status === 'Active' ? (
                    <button
                      type="button"
                      className={styles.linkAction}
                      disabled={terminateMutation.isPending}
                      onClick={() => terminateMutation.mutate(contract.id)}
                    >
                      {f.contract.terminate}
                    </button>
                  ) : (
                    <span />
                  )}
                </DataTableRow>
              ))}
            </div>
          ) : (
            <EmptyState title={f.contract.empty} description={f.contract.emptyDescription} />
          ))}

        {tab === 'payments' &&
          (paymentsQuery.isLoading ? (
            <p>{t.common.loading}</p>
          ) : paymentsQuery.data && paymentsQuery.data.items.length > 0 ? (
            <div className={styles.tableWrap}>
              <DataTableHeader columns={paymentColumns} />
              {paymentsQuery.data.items.map((payment) => (
                <DataTableRow key={payment.id} columns={paymentColumns}>
                  <span>{date(payment.dueDate)}</span>
                  <span className={styles.mono}>{currency(payment.amount)}</span>
                  <span>{date(payment.paidAt)}</span>
                  <StatusBadge label={t.paymentStatus[payment.status]} tone={PAYMENT_STATUS_TONE[payment.status]} />
                </DataTableRow>
              ))}
            </div>
          ) : (
            <EmptyState title={f.paymentsTab.empty} description={f.paymentsTab.emptyDescription} />
          ))}

        {tab === 'maintenance' &&
          (maintenanceQuery.isLoading ? (
            <p>{t.common.loading}</p>
          ) : maintenanceQuery.data && maintenanceQuery.data.items.length > 0 ? (
            <div className={styles.tableWrap}>
              <DataTableHeader columns={maintenanceColumns} />
              {maintenanceQuery.data.items.map((request) => (
                <DataTableRow key={request.id} columns={maintenanceColumns}>
                  <span>{request.title}</span>
                  <StatusBadge label={t.maintenancePriority[request.priority]} tone={MAINTENANCE_PRIORITY_TONE[request.priority]} />
                  <StatusBadge label={t.maintenanceStatus[request.status]} tone={MAINTENANCE_STATUS_TONE[request.status]} />
                  <span>{date(request.createdAt)}</span>
                </DataTableRow>
              ))}
            </div>
          ) : (
            <EmptyState title={f.maintenanceTab.empty} description={f.maintenanceTab.emptyDescription} />
          ))}
      </div>

      {confirmArchive && (
        <Modal title={f.archiveModal.title} onClose={() => setConfirmArchive(false)}>
          <p className={styles.modalBody}>{f.archiveModal.body(property.name)}</p>
          <div className={styles.modalActions}>
            <Button variant="secondary" size="medium" onClick={() => setConfirmArchive(false)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="primary"
              size="medium"
              disabled={archiveMutation.isPending}
              onClick={() => archiveMutation.mutate()}
            >
              {f.archiveModal.confirm}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
