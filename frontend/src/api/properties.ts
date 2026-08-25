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
