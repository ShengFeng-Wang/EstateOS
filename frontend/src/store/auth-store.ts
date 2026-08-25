import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole =
  | 'Admin'
  | 'AssetManager'
  | 'PropertyManager'
  | 'Accountant'
  | 'MaintenanceCoordinator'
  | 'ExecutiveViewer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    { name: 'estateos-auth' },
  ),
);
