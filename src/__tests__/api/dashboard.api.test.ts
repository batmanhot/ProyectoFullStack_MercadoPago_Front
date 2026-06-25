import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  apiClient: { get: vi.fn() },
}));

import { apiClient }             from '@/api/client';
import { fetchPayments, fetchKPIs } from '@/api/dashboard.api';

const mockGet = vi.mocked(apiClient.get);

beforeEach(() => vi.clearAllMocks());

const paymentsStub = {
  payments: [], total: 0, page: 1, limit: 20, pages: 0,
};
const kpisStub = {
  total: 10, paid: 8, failed: 1, pending: 1,
  revenue: 1000, avgTicket: 125, conversionRate: 80,
};

// ─────────────────────────────────────────────────────────────
// fetchPayments
// ─────────────────────────────────────────────────────────────

describe('fetchPayments', () => {
  it('sin filtros → llama GET /payments? con params vacíos', async () => {
    mockGet.mockResolvedValue({ data: { data: paymentsStub } });

    const result = await fetchPayments();
    expect(mockGet).toHaveBeenCalledWith('/payments?');
    expect(result.total).toBe(0);
  });

  it('con filtros de page y status → incluye params en la URL', async () => {
    mockGet.mockResolvedValue({ data: { data: paymentsStub } });

    await fetchPayments({ page: 2, limit: 10, status: 'APPROVED' });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain('page=2');
    expect(url).toContain('limit=10');
    expect(url).toContain('status=APPROVED');
  });

  it('con from y to → los incluye en la URL', async () => {
    mockGet.mockResolvedValue({ data: { data: paymentsStub } });

    await fetchPayments({ from: '2024-01-01', to: '2024-01-31' });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain('from=2024-01-01');
    expect(url).toContain('to=2024-01-31');
  });

  it('con method → lo incluye en la URL', async () => {
    mockGet.mockResolvedValue({ data: { data: paymentsStub } });

    await fetchPayments({ method: 'yape' });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain('method=yape');
  });

  it('data undefined → lanza EMPTY_PAYMENTS_RESPONSE', async () => {
    mockGet.mockResolvedValue({ data: { data: undefined } });
    await expect(fetchPayments()).rejects.toThrow('EMPTY_PAYMENTS_RESPONSE');
  });
});

// ─────────────────────────────────────────────────────────────
// fetchKPIs
// ─────────────────────────────────────────────────────────────

describe('fetchKPIs', () => {
  it('sin fechas → llama GET /payments/kpis? sin params', async () => {
    mockGet.mockResolvedValue({ data: { data: kpisStub } });

    const result = await fetchKPIs();
    expect(mockGet).toHaveBeenCalledWith('/payments/kpis?');
    expect(result.conversionRate).toBe(80);
  });

  it('con from y to → los incluye en la URL', async () => {
    mockGet.mockResolvedValue({ data: { data: kpisStub } });

    await fetchKPIs('2024-01-01', '2024-01-31');
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain('from=2024-01-01');
    expect(url).toContain('to=2024-01-31');
  });

  it('solo from (sin to) → incluye solo from', async () => {
    mockGet.mockResolvedValue({ data: { data: kpisStub } });

    await fetchKPIs('2024-01-01');
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain('from=2024-01-01');
    expect(url).not.toContain('to=');
  });

  it('data undefined → lanza EMPTY_KPIS_RESPONSE', async () => {
    mockGet.mockResolvedValue({ data: { data: undefined } });
    await expect(fetchKPIs()).rejects.toThrow('EMPTY_KPIS_RESPONSE');
  });
});
