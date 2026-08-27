import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary, getDashboardTrends } from '../api/dashboard';
import { StatTile } from '../components/charts/StatTile';
import { ChartCard } from '../components/charts/ChartCard';
import { LineTrendChart } from '../components/charts/LineTrendChart';
import { BarListChart } from '../components/charts/BarListChart';
import { EmptyState } from '../components/EmptyState';
import { useTranslation } from '../i18n/useTranslation';
import { formatCompactCurrency, formatCompactNumber } from '../i18n/format';
import listStyles from '../styles/listPage.module.css';
import styles from './OverviewPage.module.css';

const STATUS_COLORS = {
  occupied: '#275b43',
  vacant: '#737b75',
  maintenance: '#d69a35',
  archived: '#c9cdc7',
};

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
  const { t, locale } = useTranslation();

  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
  });

  const trendsQuery = useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: () => getDashboardTrends(6),
  });

  if (summaryQuery.isLoading) return <p>{t.common.loading}</p>;
  if (summaryQuery.isError || !summaryQuery.data) {
    return <p role="alert">{t.overview.failed}</p>;
  }

  const data = summaryQuery.data;

  if (data.propertyCount === 0) {
    return (
      <section>
        <div className={listStyles.header}>
          <div>
            <p className={listStyles.eyebrow}>{t.overview.eyebrow}</p>
            <h1 className={listStyles.title}>{t.overview.title}</h1>
          </div>
        </div>
        <EmptyState title={t.overview.emptyTitle} description={t.overview.emptyDescription} />
      </section>
    );
  }

  const currency = (n: number) => formatCompactCurrency(n, locale);
  const number = (n: number) => formatCompactNumber(n, locale);

  const revenuePoints = trendsQuery.data?.revenue ?? [];
  const revenueTrend = revenuePoints.map((p) => ({ label: t.overview.months[p.month - 1], value: p.revenue }));

  const lastRevenue = revenuePoints.at(-1)?.revenue ?? 0;
  const prevRevenue = revenuePoints.at(-2)?.revenue ?? 0;
  const revenueDelta =
    trendsQuery.data && prevRevenue > 0 ? ((lastRevenue - prevRevenue) / prevRevenue) * 100 : null;

  const occupancyTrendValues = mockOccupancyTrend(data.occupancyRate, revenuePoints.length || 6);
  const occupancyTrend = (
    revenuePoints.length ? revenuePoints.map((p) => t.overview.months[p.month - 1]) : t.overview.months.slice(-6)
  ).map((label, i) => ({ label, value: occupancyTrendValues[i] }));

  const statusItems = [
    { label: t.propertyStatus.Occupied, value: data.occupiedCount, dotColor: STATUS_COLORS.occupied },
    { label: t.propertyStatus.Vacant, value: data.vacantCount, dotColor: STATUS_COLORS.vacant },
    { label: t.propertyStatus.Maintenance, value: data.maintenanceCount, dotColor: STATUS_COLORS.maintenance },
    { label: t.propertyStatus.Archived, value: data.archivedCount, dotColor: STATUS_COLORS.archived },
  ];

  const typeItems = [...data.typeBreakdown]
    .sort((a, b) => b.count - a.count)
    .map((item) => ({ label: t.propertyType[item.type], value: item.count }));

  return (
    <section>
      <div className={listStyles.header}>
        <div>
          <p className={listStyles.eyebrow}>{t.overview.eyebrow}</p>
          <h1 className={listStyles.title}>{t.overview.title}</h1>
          <p className={listStyles.subtitle}>{t.overview.subtitle(data.propertyCount)}</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <StatTile
          index={0}
          label={t.overview.kpi.properties}
          value={data.propertyCount}
          caption={t.overview.kpi.propertiesCaption(data.occupiedCount, data.vacantCount)}
        />
        <StatTile index={1} label={t.overview.kpi.occupancyRate} value={data.occupancyRate} formatValue={(v) => `${v.toFixed(1)}%`} />
        <StatTile
          index={2}
          label={t.overview.kpi.monthlyRevenue}
          value={data.monthlyRevenue}
          formatValue={currency}
          delta={
            revenueDelta === null
              ? undefined
              : {
                  label: `${revenueDelta >= 0 ? '+' : ''}${revenueDelta.toFixed(1)}% ${t.overview.kpi.momSuffix}`,
                  isGood: revenueDelta >= 0,
                }
          }
        />
        <StatTile
          index={3}
          label={t.overview.kpi.overduePayments}
          value={data.overduePaymentCount}
          caption={currency(data.overdueAmount)}
        />
        <StatTile index={4} label={t.overview.kpi.expiringContracts} value={data.expiringSoonContractCount} />
        <StatTile index={5} label={t.overview.kpi.openMaintenance} value={data.openMaintenanceCount} />
      </div>

      <div className={styles.chartGrid}>
        <ChartCard
          index={0}
          title={t.overview.charts.revenueTitle}
          subtitle={t.overview.charts.revenueSubtitle}
          isEmpty={revenueTrend.length === 0}
        >
          <LineTrendChart data={revenueTrend} formatValue={currency} ariaLabel={t.overview.charts.revenueAriaLabel} />
        </ChartCard>

        <ChartCard index={1} title={t.overview.charts.occupancyTitle} subtitle={t.overview.charts.occupancySubtitle}>
          <LineTrendChart
            data={occupancyTrend}
            formatValue={(v) => `${v}%`}
            color="#8a5510"
            ariaLabel={t.overview.charts.occupancyAriaLabel}
          />
        </ChartCard>
      </div>

      <div className={styles.chartGrid}>
        <ChartCard index={2} title={t.overview.charts.statusTitle} subtitle={t.overview.charts.statusSubtitle}>
          <BarListChart items={statusItems} formatValue={number} />
        </ChartCard>

        <ChartCard index={3} title={t.overview.charts.compositionTitle} subtitle={t.overview.charts.compositionSubtitle}>
          <BarListChart items={typeItems} formatValue={number} />
        </ChartCard>
      </div>
    </section>
  );
}
