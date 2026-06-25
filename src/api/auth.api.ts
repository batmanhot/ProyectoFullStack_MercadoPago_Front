import { apiClient } from './client';
import type { AuthUser, LoginCredentials, RegisterCredentials } from '@/types';

// ============================================================
// AUTH API — Endpoints de autenticación
// ============================================================

interface AuthResponse {
  user:        AuthUser;
  accessToken: string;
  expiresIn:   number;
}

export const authApi = {
  login: async (creds: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/login', creds);
    return data.data;
  },

  register: async (creds: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/register', creds);
    return data.data;
  },

  refresh: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/refresh');
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  me: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get('/auth/me');
    return data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/auth/change-password', { currentPassword, newPassword });
  },

  listUsers: async (): Promise<AuthUser[]> => {
    const { data } = await apiClient.get('/auth/users');
    return data.data.users;
  },
};
