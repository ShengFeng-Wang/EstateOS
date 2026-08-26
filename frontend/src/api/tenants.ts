import { apiRequest } from '../lib/api-client';
import type { PagedResult } from './properties';

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  identityReference: string | null;
  emergencyContact: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function listTenants(params: { search?: string; page?: number; pageSize?: number } = {}) {
  return apiRequest<PagedResult<Tenant>>('/tenants', {
    query: params as Record<string, string | number | boolean | undefined>,
  });
}

export function getTenant(id: string) {
  return apiRequest<Tenant>(`/tenants/${id}`);
}

export interface TenantInput {
  name: string;
  phone: string;
  email: string;
  identityReference: string | null;
  emergencyContact: string | null;
  notes: string | null;
}

export function createTenant(input: TenantInput) {
  return apiRequest<Tenant>('/tenants', { method: 'POST', body: input });
}

export function updateTenant(id: string, input: TenantInput) {
  return apiRequest<Tenant>(`/tenants/${id}`, { method: 'PUT', body: input });
}
