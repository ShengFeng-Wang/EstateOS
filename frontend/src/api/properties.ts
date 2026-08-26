import { apiRequest } from '../lib/api-client';

export type PropertyType = 'Apartment' | 'Studio' | 'Townhouse' | 'Office' | 'Retail';
export type PropertyStatus = 'Occupied' | 'Vacant' | 'Maintenance' | 'Archived';

export interface Property {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  district: string;
  type: PropertyType;
  status: PropertyStatus;
  monthlyRent: number;
  size: number;
  rooms: number;
  floor: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PropertyListQuery {
  search?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  city?: string;
  page?: number;
  pageSize?: number;
}

export function listProperties(query: PropertyListQuery = {}) {
  return apiRequest<PagedResult<Property>>('/properties', {
    query: query as Record<string, string | number | boolean | undefined>,
  });
}

export function getProperty(id: string) {
  return apiRequest<Property>(`/properties/${id}`);
}

export interface PropertyInput {
  code: string;
  name: string;
  address: string;
  city: string;
  district: string;
  type: PropertyType;
  status: PropertyStatus;
  monthlyRent: number;
  size: number;
  rooms: number;
  floor: number;
  description: string | null;
}

export function createProperty(input: PropertyInput) {
  return apiRequest<Property>('/properties', { method: 'POST', body: input });
}

export function updateProperty(id: string, input: Omit<PropertyInput, 'code'>) {
  return apiRequest<Property>(`/properties/${id}`, { method: 'PUT', body: input });
}

export function archiveProperty(id: string) {
  return apiRequest<void>(`/properties/${id}`, { method: 'DELETE' });
}
