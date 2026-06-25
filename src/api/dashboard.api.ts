import { apiClient } from './client';
import type {
  ApiResponse,
  PaginatedPayments,
  TenantKPIs,
  PaymentFilters,
} from '@/types';

// ============================================================
// DASHBOARD API — Endpoints de consulta / analytics
// ============================================================

export const fetchPayments = async (
  filters: Partial<PaymentFilters> = {}
): Promise<PaginatedPayments> => {
  const params = new URLSearchParams();
  if (filters.page)   params.set('page',   String(filters.page));
  if (filters.limit)  params.set('limit',  String(filters.limit));
  if (filters.status) params.set('status', filters.status);
  if (filters.method) params.set('method', filters.method);
  if (filters.from)   params.set('from',   filters.from);
  if (filters.to)     params.set('to',     filters.to);

  const { data } = await apiClient.get<ApiResponse<PaginatedPayments>>(
    `/payments?${params.toString()}`
  );
  if (!data.data) throw new Error('EMPTY_PAYMENTS_RESPONSE');
  return data.data;
};

export const fetchKPIs = async (
  from?: string,
  to?: string
): Promise<TenantKPIs> => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to)   params.set('to',   to);

  const { data } = await apiClient.get<ApiResponse<TenantKPIs>>(
    `/payments/kpis?${params.toString()}`
  );
  if (!data.data) throw new Error('EMPTY_KPIS_RESPONSE');
  return data.data;
};
