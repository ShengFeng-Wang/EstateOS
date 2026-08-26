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

export function listContracts(params: { propertyId?: string; tenantId?: string; status?: ContractStatus; page?: number; pageSize?: number } = {}) {
  return apiRequest<PagedResult<Contract>>('/contracts', {
    query: params as Record<string, string | number | boolean | undefined>,
  });
}

export function getContract(id: string) {
  return apiRequest<Contract>(`/contracts/${id}`);
}

export interface CreateContractInput {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: ContractStatus;
  notes: string | null;
}

export function createContract(input: CreateContractInput) {
  return apiRequest<Contract>('/contracts', { method: 'POST', body: input });
}

export interface UpdateContractInput {
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: ContractStatus;
  notes: string | null;
}

export function updateContract(id: string, input: UpdateContractInput) {
  return apiRequest<Contract>(`/contracts/${id}`, { method: 'PUT', body: input });
}

export function terminateContract(id: string) {
  return apiRequest<Contract>(`/contracts/${id}/terminate`, { method: 'POST' });
}
