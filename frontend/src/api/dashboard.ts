import { apiRequest } from '../lib/api-client';
import type { PropertyType } from './properties';

export interface PropertyTypeCount {
  type: PropertyType;
  count: number;
}

export interface DashboardSummary {
  propertyCount: number;
  occupiedCount: number;
  vacantCount: number;
  maintenanceCount: number;
  archivedCount: number;
  occupancyRate: number;
  monthlyRevenue: number;
  overduePaymentCount: number;
  overdueAmount: number;
  expiringSoonContractCount: number;
  openMaintenanceCount: number;
  typeBreakdown: PropertyTypeCount[];
}

export function getDashboardSummary() {
  return apiRequest<DashboardSummary>('/dashboard/summary');
}

export interface RevenueTrendPoint {
  year: number;
  month: number;
  revenue: number;
}

export interface DashboardTrends {
  revenue: RevenueTrendPoint[];
}

export function getDashboardTrends(months = 6) {
  return apiRequest<DashboardTrends>('/dashboard/trends', { query: { months } });
}
