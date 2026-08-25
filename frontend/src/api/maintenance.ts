import { apiRequest } from '../lib/api-client';
import type { PagedResult } from './properties';

export type MaintenanceStatus = 'Open' | 'InProgress' | 'Completed' | 'Cancelled';
export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export function listMaintenance(params: { propertyId?: string; status?: MaintenanceStatus; page?: number; pageSize?: number } = {}) {
  return apiRequest<PagedResult<MaintenanceRequest>>('/maintenance', {
    query: params as Record<string, string | number | boolean | undefined>,
  });
}
