import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import toast from 'react-hot-toast';

// ============================================================
// HOOKS — Módulo Admin SaaS
// ============================================================

// staleTime/gcTime coherentes con la naturaleza de cada recurso:
// - Stats y pagos: datos que cambian frecuentemente → staleTime corto
// - Tenants/usuarios: cambian poco → staleTime más largo

const STATS_STALE   = 30 * 1_000;          // 30 s
const LIST_STALE    = 2  * 60 * 1_000;     // 2 min
const DETAIL_STALE  = 5  * 60 * 1_000;     // 5 min
const GC_TIME       = 10 * 60 * 1_000;     // 10 min

// ── Stats globales ────────────────────────────────────────────
export const useAdminStats = () =>
  useQuery({
    queryKey: ['admin', 'stats'],
    queryFn:  adminApi.getStats,
    staleTime: STATS_STALE,
    gcTime:    GC_TIME,
    retry:     2,
  });

// ── Tenants ───────────────────────────────────────────────────
export const useAdminTenants = () =>
  useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn:  adminApi.getTenants,
    staleTime: LIST_STALE,
    gcTime:    GC_TIME,
    retry:     2,
  });

export const useAdminTenantDetail = (id: string) =>
  useQuery({
    queryKey: ['admin', 'tenants', id],
    queryFn:  () => adminApi.getTenantById(id),
    enabled:  !!id,
    staleTime: DETAIL_STALE,
    gcTime:    GC_TIME,
    retry:     2,
  });

export const useCreateTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createTenant,
    onSuccess:  () => {
      toast.success('Tenant creado');
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (e: { message?: string }) => toast.error(e.message ?? 'Error al crear tenant'),
  });
};

export const useUpdateTenant = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => adminApi.updateTenant(id, body),
    onSuccess:  () => {
      toast.success('Tenant actualizado');
      qc.invalidateQueries({ queryKey: ['admin', 'tenants', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
    onError: (e: { message?: string }) => toast.error(e.message ?? 'Error al actualizar'),
  });
};

export const useRegenerateKey = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.regenerateKey(id),
    onSuccess:  () => {
      toast.success('API key regenerada');
      // Invalidar detalle para mostrar la nueva key
      qc.invalidateQueries({ queryKey: ['admin', 'tenants', id] });
    },
    onError: (e: { message?: string }) => toast.error(e.message ?? 'Error al regenerar'),
  });
};

// ── Users ─────────────────────────────────────────────────────
export const useAdminUsers = (params?: { page?: number; limit?: number }) =>
  useQuery({
    queryKey: ['admin', 'users', params],
    queryFn:  () => adminApi.getUsers(params),
    staleTime: LIST_STALE,
    gcTime:    GC_TIME,
    retry:     2,
  });

export const useCreateAdminUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createUser,
    onSuccess:  () => {
      toast.success('Usuario creado');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e: { message?: string }) => toast.error(e.message ?? 'Error al crear usuario'),
  });
};

export const useToggleUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.toggleUser(id),
    onSuccess:  () => {
      toast.success('Estado actualizado');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e: { message?: string }) => toast.error(e.message ?? 'Error'),
  });
};

// ── Payments ──────────────────────────────────────────────────
export const useAdminPayments = (params?: {
  page?: number; limit?: number; tenantId?: string; status?: string;
}) =>
  useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn:  () => adminApi.getPayments(params),
    staleTime: STATS_STALE,   // pagos se actualizan frecuentemente
    gcTime:    GC_TIME,
    retry:     2,
  });
