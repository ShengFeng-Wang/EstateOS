import { apiRequest } from '../lib/api-client';

export interface DashboardSummary {
  propertyCount: number;
  occupiedCount: number;
  vacantCount: number;
  occupancyRate: number;
  monthlyRevenue: number;
  overduePaymentCount: number;
  overdueAmount: number;
  expiringSoonContractCount: number;
  openMaintenanceCount: number;
}

export function getDashboardSummary() {
  return apiRequest<DashboardSummary>('/dashboard/summary');
}
