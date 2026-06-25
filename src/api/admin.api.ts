import { apiClient } from './client';
import type { ApiResponse } from '@/types/dashboard.types';

// ============================================================
// ADMIN API — Llamadas al módulo /api/v1/admin
// Requiere SUPER_ADMIN
// ============================================================

// Tipos de response por endpoint
export interface AdminTenantSummary {
  id: string; name: string; slug: string; isActive: boolean;
  mpMode: string; apiKey: string; callbackUrl: string | null;
  createdAt: string;
  _count: { users: number; paymentOrders: number };
}

export interface AdminTenantDetail extends AdminTenantSummary {
  // Tokens enmascarados (ej: "TEST-138•••••••• 1060") — nunca el valor real
  mpAccessTokenSandbox:  string | null;
  mpPublicKeySandbox:    string | null;
  mpAccessTokenProd:     string | null;
  mpPublicKeyProd:       string | null;
  // Flags de configuración (true = el token está guardado en BD)
  mpSandboxConfigured:   boolean;
  mpProdConfigured:      boolean;
  users: Array<{
    id: string; email: string; name: string;
    role: string; isActive: boolean; lastLoginAt: string | null; createdAt: string;
  }>;
  _count: { users: number; paymentOrders: number; payments: number };
}

export interface AdminUserItem {
  id: string; email: string; name: string; role: string;
  isActive: boolean; lastLoginAt: string | null; createdAt: string;
  tenant: { id: string; slug: string; name: string };
}

export interface AdminPaymentItem {
  id: string; method: string; status: string; amount: number;
  currency: string; createdAt: string;
  tenant: { slug: string; name: string };
  order: { externalReference: string; description: string };
}

export interface PaginatedResult<T> {
  items: T[]; total: number; page: number; limit: number; pages: number;
}

// Extrae `data` del envelope `{ success, data }` y lanza si la respuesta no fue exitosa
function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success || !response.data)
    throw new Error(response.error?.message ?? 'Error en respuesta de admin');
  return response.data;
}

export const adminApi = {
  // ── Stats ─────────────────────────────────────────────────
  getStats: () =>
    apiClient.get<ApiResponse<object>>('/admin/stats')
      .then((r) => unwrap(r.data)),

  // ── Tenants ───────────────────────────────────────────────
  getTenants: () =>
    apiClient.get<ApiResponse<AdminTenantSummary[]>>('/admin/tenants')
      .then((r) => unwrap(r.data)),

  getTenantById: (id: string) =>
    apiClient.get<ApiResponse<AdminTenantDetail>>(`/admin/tenants/${id}`)
      .then((r) => unwrap(r.data)),

  createTenant: (body: { name: string; slug: string; callbackUrl?: string; mpMode?: string }) =>
    apiClient.post<ApiResponse<AdminTenantDetail>>('/admin/tenants', body)
      .then((r) => unwrap(r.data)),

  updateTenant: (id: string, body: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<AdminTenantDetail>>(`/admin/tenants/${id}`, body)
      .then((r) => unwrap(r.data)),

  regenerateKey: (id: string) =>
    apiClient.post<ApiResponse<{ apiKey: string }>>(`/admin/tenants/${id}/regenerate-key`)
      .then((r) => unwrap(r.data)),

  // ── Users ─────────────────────────────────────────────────
  getUsers: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<{ users: AdminUserItem[]; total: number; page: number; limit: number; pages: number }>>(
      '/admin/users', { params }
    ).then((r) => unwrap(r.data)),

  createUser: (body: {
    tenantId: string; email: string; name: string;
    password: string; role?: string;
  }) => apiClient.post<ApiResponse<AdminUserItem>>('/admin/users', body)
         .then((r) => unwrap(r.data)),

  toggleUser: (id: string) =>
    apiClient.patch<ApiResponse<{ isActive: boolean }>>(`/admin/users/${id}/toggle`)
      .then((r) => unwrap(r.data)),

  // ── Payments ──────────────────────────────────────────────
  getPayments: (params?: { page?: number; limit?: number; tenantId?: string; status?: string }) =>
    apiClient.get<ApiResponse<{ payments: AdminPaymentItem[]; total: number; page: number; limit: number; pages: number }>>(
      '/admin/payments', { params }
    ).then((r) => unwrap(r.data)),
};
