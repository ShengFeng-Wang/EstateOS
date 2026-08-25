import { apiRequest } from '../lib/api-client';
import type { PagedResult } from './properties';

export type ContractStatus = 'Draft' | 'Active' | 'ExpiringSoon' | 'Expired' | 'Terminated';

export interface Contract {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: ContractStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function listContracts(params: { propertyId?: string; status?: ContractStatus; page?: number; pageSize?: number } = {}) {
  return apiRequest<PagedResult<Contract>>('/contracts', {
    query: params as Record<string, string | number | boolean | undefined>,
  });
}
