import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchPayments, fetchKPIs } from '@/api';
import type { PaymentFilters } from '@/types';

// ============================================================
// DASHBOARD HOOKS — TanStack Query para analytics
// ============================================================

export const dashboardKeys = {
  all:      ['dashboard'] as const,
  kpis:     (from?: string, to?: string) => ['dashboard', 'kpis', from, to] as const,
  payments: (filters: Partial<PaymentFilters>) => ['dashboard', 'payments', filters] as const,
};

/**
 * KPIs del tenant con rango de fechas opcional
 */
export const useKPIs = (from?: string, to?: string) =>
  useQuery({
    queryKey: dashboardKeys.kpis(from, to),
    queryFn:  () => fetchKPIs(from, to),
    staleTime: 60_000,     // 1 min — los KPIs no cambian tan rápido
    refetchInterval: 120_000, // auto-refresh cada 2 min
  });

/**
 * Listado paginado de pagos con filtros
 * keepPreviousData → sin flash de "loading" al cambiar página
 */
export const usePaymentsList = (filters: Partial<PaymentFilters>) =>
  useQuery({
    queryKey: dashboardKeys.payments(filters),
    queryFn:  () => fetchPayments(filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
