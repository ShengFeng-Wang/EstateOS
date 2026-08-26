import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary, getDashboardTrends } from '../api/dashboard';
import { StatTile } from '../components/charts/StatTile';
import { ChartCard } from '../components/charts/ChartCard';
import { LineTrendChart } from '../components/charts/LineTrendChart';
import { BarListChart } from '../components/charts/BarListChart';
import { EmptyState } from '../components/EmptyState';
import listStyles from '../styles/listPage.module.css';
import styles from './OverviewPage.module.css';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_COLORS = {
  occupied: '#275b43',
  vacant: '#737b75',
  maintenance: '#d69a35',
  archived: '#c9cdc7',
};

const TYPE_LABELS: Record<string, string> = {
  Apartment: 'Apartment',
  Studio: 'Studio',
  Townhouse: 'Townhouse',
  Office: 'Office',
  Retail: 'Retail',
};

function trimTrailingZero(value: string): string {
  return value.replace(/\.0$/, '');
}

function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) return `NT$ ${trimTrailingZero((amount / 1_000_000).toFixed(1))}M`;
  if (amount >= 1_000) return `NT$ ${trimTrailingZero((amount / 1_000).toFixed(1))}K`;
  return `NT$ ${amount.toLocaleString('en-US')}`;
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${trimTrailingZero((value / 1_000_000).toFixed(1))}M`;
  if (value >= 1_000) return `${trimTrailingZero((value / 1_000).toFixed(1))}K`;
  return value.toLocaleString('en-US');
}

/**
 * There is no historical occupancy-rate tracking in the schema (occupancy is a live
 * property-status snapshot, not a time series) — building a real trend would require a
 * new snapshot table nobody has asked for yet. This deterministically derives a plausible
 * 6-month trend around the current rate so the panel isn't empty; it is not measured data.
 * See docs/handoff/known-limitations.md.
 */
function mockOccupancyTrend(currentRate: number, months: number): number[] {
  const wave = [-2.1, -0.6, 1.2, -1.4, 0.8, 0];
  return Array.from({ length: months }, (_, i) => {
    const offset = wave[(i + wave.length - (months - 1)) % wave.length];
    return Math.max(0, Math.min(100, Math.round((currentRate + offset) * 10) / 10));
  });
}

export function OverviewPage() {
  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
  });

  const trendsQuery = useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: () => getDashboardTrends(6),
  });

  if (summaryQuery.isLoading) return <p>Loading…</p>;
  if (summaryQuery.isError || !summaryQuery.data) {
    return <p role="alert">Failed to load dashboard summary.</p>;
  }

  const data = summaryQuery.data;

  if (data.propertyCount === 0) {
    return (
      <section>
        <div className={listStyles.header}>
          <div>
            <p className={listStyles.eyebrow}>EXECUTIVE OVERVIEW</p>
            <h1 className={listStyles.title}>Overview</h1>
          </div>
        </div>
        <EmptyState title="No properties in the portfolio yet" description="Add a property to start seeing performance data here." />
      </section>
    );
  }

  const revenuePoints = trendsQuery.data?.revenue ?? [];
  const revenueTrend = revenuePoints.map((p) => ({ label: MONTH_LABELS[p.month - 1], value: p.revenue }));

  const lastRevenue = revenuePoints.at(-1)?.revenue ?? 0;
  const prevRevenue = revenuePoints.at(-2)?.revenue ?? 0;
  const revenueDelta =
    trendsQuery.data && prevRevenue > 0 ? ((lastRevenue - prevRevenue) / prevRevenue) * 100 : null;

  const occupancyTrendValues = mockOccupancyTrend(data.occupancyRate, revenuePoints.length || 6);
  const occupancyTrend = (revenuePoints.length ? revenuePoints.map((p) => MONTH_LABELS[p.month - 1]) : MONTH_LABELS.slice(-6)).map(
    (label, i) => ({ label, value: occupancyTrendValues[i] }),
  );

  const statusItems = [
    { label: 'Occupied', value: data.occupiedCount, dotColor: STATUS_COLORS.occupied },
    { label: 'Vacant', value: data.vacantCount, dotColor: STATUS_COLORS.vacant },
    { label: 'Maintenance', value: data.maintenanceCount, dotColor: STATUS_COLORS.maintenance },
    { label: 'Archived', value: data.archivedCount, dotColor: STATUS_COLORS.archived },
  ];

  const typeItems = [...data.typeBreakdown]
    .sort((a, b) => b.count - a.count)
    .map((t) => ({ label: TYPE_LABELS[t.type] ?? t.type, value: t.count }));

  return (
    <section>
      <div className={listStyles.header}>
        <div>
          <p className={listStyles.eyebrow}>EXECUTIVE OVERVIEW</p>
          <h1 className={listStyles.title}>Overview</h1>
          <p className={listStyles.subtitle}>{data.propertyCount} active properties · Last 6 months</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <StatTile label="Properties" value={data.propertyCount.toLocaleString('en-US')} caption={`${data.occupiedCount} occupied · ${data.vacantCount} vacant`} />
        <StatTile label="Occupancy rate" value={`${data.occupancyRate}%`} />
        <StatTile
          label="Monthly revenue"
          value={formatCompactCurrency(data.monthlyRevenue)}
          delta={
            revenueDelta === null
              ? undefined
              : { label: `${revenueDelta >= 0 ? '+' : ''}${revenueDelta.toFixed(1)}% mo/mo`, isGood: revenueDelta >= 0 }
          }
        />
        <StatTile
          label="Overdue payments"
          value={data.overduePaymentCount.toLocaleString('en-US')}
          caption={formatCompactCurrency(data.overdueAmount)}
        />
        <StatTile label="Expiring contracts" value={data.expiringSoonContractCount.toLocaleString('en-US')} />
        <StatTile label="Open maintenance" value={data.openMaintenanceCount.toLocaleString('en-US')} />
      </div>

      <div className={styles.chartGrid}>
        <ChartCard title="Revenue trend" subtitle="Paid rent collected per month" isEmpty={revenueTrend.length === 0}>
          <LineTrendChart data={revenueTrend} formatValue={formatCompactCurrency} ariaLabel="Monthly revenue, last 6 months" />
        </ChartCard>

        <ChartCard title="Occupancy trend" subtitle="Illustrative — historical occupancy is not tracked yet">
          <LineTrendChart
            data={occupancyTrend}
            formatValue={(v) => `${v}%`}
            color="#8a5510"
            ariaLabel="Occupancy rate, last 6 months (illustrative)"
          />
        </ChartCard>
      </div>

      <div className={styles.chartGrid}>
        <ChartCard title="Status distribution" subtitle="Active and archived properties by status">
          <BarListChart items={statusItems} formatValue={formatCompactNumber} />
        </ChartCard>

        <ChartCard title="Portfolio composition" subtitle="Active properties by type">
          <BarListChart items={typeItems} formatValue={formatCompactNumber} />
        </ChartCard>
      </div>
    </section>
  );
}
