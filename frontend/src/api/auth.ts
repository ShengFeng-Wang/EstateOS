import { apiRequest } from '../lib/api-client';
import type { AuthUser } from '../store/auth-store';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export function login(request: LoginRequest) {
  return apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: request });
}

export function getCurrentUser() {
  return apiRequest<AuthUser>('/auth/me');
}
