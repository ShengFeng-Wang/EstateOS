import { apiRequest } from '../lib/api-client';
import type { PagedResult } from './properties';

export type PaymentStatus = 'Pending' | 'Paid' | 'Overdue';

export interface Payment {
  id: string;
  contractId: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  paymentMethod: string | null;
  status: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  propertyCode: string;
  propertyName: string;
  tenantName: string;
}

export function listPayments(params: { search?: string; propertyId?: string; tenantId?: string; contractId?: string; status?: PaymentStatus; page?: number; pageSize?: number } = {}) {
  return apiRequest<PagedResult<Payment>>('/payments', {
    query: params as Record<string, string | number | boolean | undefined>,
  });
}

export function getPayment(id: string) {
  return apiRequest<Payment>(`/payments/${id}`);
}

export interface CreatePaymentInput {
  contractId: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidAt: string | null;
  paymentMethod: string | null;
  notes: string | null;
}

export function createPayment(input: CreatePaymentInput) {
  return apiRequest<Payment>('/payments', { method: 'POST', body: input });
}

export interface UpdatePaymentInput {
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidAt: string | null;
  paymentMethod: string | null;
  notes: string | null;
}

export function updatePayment(id: string, input: UpdatePaymentInput) {
  return apiRequest<Payment>(`/payments/${id}`, { method: 'PUT', body: input });
}
