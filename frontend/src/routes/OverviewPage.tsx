import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/dashboard';

export function OverviewPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <p>Loading…</p>;
  if (isError || !data) return <p role="alert">Failed to load dashboard summary.</p>;

  return (
    <section>
      <h1>Executive Overview</h1>
      <dl>
        <dt>Properties</dt>
        <dd>{data.propertyCount}</dd>
        <dt>Occupancy rate</dt>
        <dd>{data.occupancyRate}%</dd>
        <dt>Monthly revenue</dt>
        <dd>{data.monthlyRevenue}</dd>
        <dt>Overdue payments</dt>
        <dd>
          {data.overduePaymentCount} ({data.overdueAmount})
        </dd>
        <dt>Contracts expiring soon</dt>
        <dd>{data.expiringSoonContractCount}</dd>
        <dt>Open maintenance</dt>
        <dd>{data.openMaintenanceCount}</dd>
      </dl>
    </section>
  );
}
