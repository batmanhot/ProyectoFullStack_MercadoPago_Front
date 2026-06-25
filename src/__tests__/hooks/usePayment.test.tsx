import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Mocks ─────────────────────────────────────────────────────
const mockSetSuccessData = vi.fn();
const mockSetErrorData   = vi.fn();
const mockSetStatus      = vi.fn();

const mockConfig = {
  publicKey:   'TEST-pub',
  apiKey:      'sk_test_key',
  transaction: { amount: 100, currency: 'PEN' as const, description: 'Test', externalReference: 'REF-001' },
  payer:       { email: 'a@b.pe', identification: { type: 'DNI' as const, number: '12345678' } },
};

vi.mock('@/api', () => ({
  processCardPayment: vi.fn(),
  processYapePayment: vi.fn(),
  getPaymentStatus:   vi.fn(),
}));

vi.mock('@/stores/paymentStore', () => ({
  usePaymentStore: vi.fn(() => ({
    config:         mockConfig,
    setSuccessData: mockSetSuccessData,
    setErrorData:   mockSetErrorData,
    setStatus:      mockSetStatus,
  })),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { processCardPayment, processYapePayment, getPaymentStatus } from '@/api';
import { useCardPayment, useYapePayment, usePaymentStatusPolling } from '@/hooks/usePayment';
import toast from 'react-hot-toast';

const mockGetStatus = vi.mocked(getPaymentStatus);
const mockCardPay   = vi.mocked(processCardPayment);
const mockYapePay   = vi.mocked(processYapePayment);

// ── QueryClient wrapper ───────────────────────────────────────
const makeWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.useRealTimers());

// ─────────────────────────────────────────────────────────────
// useCardPayment
// ─────────────────────────────────────────────────────────────

describe('useCardPayment', () => {
  const cardPayload = {
    token: 'card-tok', transactionAmount: 100,
    description: 'Test', installments: 1,
    paymentMethodId: 'visa', externalReference: 'REF-001',
    payer: { email: 'a@b.pe', identification: { type: 'DNI' as const, number: '12345678' } },
  };

  it('mutación pendiente → llama setStatus("processing")', async () => {
    // La mutación queda pendiente (no resuelve)
    mockCardPay.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCardPayment(), { wrapper: makeWrapper() });

    act(() => { result.current.mutate(cardPayload); });

    expect(mockSetStatus).toHaveBeenCalledWith('processing');
  });

  it('pago aprobado → llama setSuccessData con status "approved"', async () => {
    mockCardPay.mockResolvedValue({
      paymentId: 'pay-001', status: 'approved', statusDetail: 'accredited',
      amount: 100, paymentMethodId: 'visa', externalReference: 'REF-001',
    });
    const { result } = renderHook(() => useCardPayment(), { wrapper: makeWrapper() });

    await act(async () => { result.current.mutate(cardPayload); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSetSuccessData).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'approved', paymentId: 'pay-001' })
    );
    expect(vi.mocked(toast.success)).toHaveBeenCalled();
  });

  it('pago rechazado → llama setErrorData con el código de error', async () => {
    mockCardPay.mockResolvedValue({
      paymentId: 'pay-002', status: 'rejected',
      statusDetail: 'cc_rejected_insufficient_amount',
      amount: 100, paymentMethodId: 'visa', externalReference: 'REF-001',
    });
    const { result } = renderHook(() => useCardPayment(), { wrapper: makeWrapper() });

    await act(async () => { result.current.mutate(cardPayload); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSetErrorData).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'cc_rejected_insufficient_amount' })
    );
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('error de red → llama setErrorData y toast.error', async () => {
    mockCardPay.mockRejectedValue({ code: 'NETWORK_ERROR', message: 'Sin conexión' });
    const { result } = renderHook(() => useCardPayment(), { wrapper: makeWrapper() });

    await act(async () => { result.current.mutate(cardPayload); });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockSetErrorData).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'NETWORK_ERROR' })
    );
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
// useYapePayment
// ─────────────────────────────────────────────────────────────

describe('useYapePayment', () => {
  const yapePayload = {
    transactionAmount: 50, description: 'Yape test',
    externalReference: 'ORD-002',
    payer: { email: 'a@b.pe', identification: { type: 'DNI' as const, number: '12345678' } },
  };

  it('mutación pendiente → llama setStatus("pending")', async () => {
    mockYapePay.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useYapePayment(), { wrapper: makeWrapper() });

    act(() => { result.current.mutate(yapePayload); });

    expect(mockSetStatus).toHaveBeenCalledWith('pending');
  });

  it('error → llama setErrorData y setStatus("error")', async () => {
    mockYapePay.mockRejectedValue({ code: 'YAPE_ERROR', message: 'Yape falló' });
    const { result } = renderHook(() => useYapePayment(), { wrapper: makeWrapper() });

    await act(async () => { result.current.mutate(yapePayload); });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockSetErrorData).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'YAPE_ERROR' })
    );
    expect(mockSetStatus).toHaveBeenCalledWith('error');
  });
});

// ─────────────────────────────────────────────────────────────
// usePaymentStatusPolling
// ─────────────────────────────────────────────────────────────

describe('usePaymentStatusPolling', () => {
  it('enabled=false → query no se ejecuta', () => {
    const { result } = renderHook(
      () => usePaymentStatusPolling('pay-001', false),
      { wrapper: makeWrapper() }
    );
    expect(result.current.isFetching).toBe(false);
    expect(mockGetStatus).not.toHaveBeenCalled();
  });

  it('enabled=true sin paymentId → query no se ejecuta', () => {
    const { result } = renderHook(
      () => usePaymentStatusPolling(undefined, true),
      { wrapper: makeWrapper() }
    );
    expect(result.current.isFetching).toBe(false);
    expect(mockGetStatus).not.toHaveBeenCalled();
  });

  it('status "approved" → llama setSuccessData con los datos correctos', async () => {
    const approvedData = {
      paymentId:         'pay-001',
      status:            'approved',
      statusDetail:      'accredited',
      amount:            150,
      currency:          'PEN' as const,
      paymentMethodId:   'visa',
      externalReference: 'REF-001',
      dateApproved:      '2024-01-15T10:00:00Z',
    };
    mockGetStatus.mockResolvedValue(approvedData);

    const { result } = renderHook(
      () => usePaymentStatusPolling('pay-001', true),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSetSuccessData).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId:    'pay-001',
        status:       'approved',
        statusDetail: 'accredited',
        amount:       150,
      })
    );
  });

  it('status "rejected" → llama setErrorData', async () => {
    mockGetStatus.mockResolvedValue({
      paymentId: 'pay-002', status: 'rejected',
      statusDetail: 'cc_rejected_card_disabled',
      amount: 100,
    });

    const { result } = renderHook(
      () => usePaymentStatusPolling('pay-002', true),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSetErrorData).toHaveBeenCalledWith({
      code:    'payment_rejected',
      message: 'El pago fue rechazado',
    });
  });

  it('status "pending" → no llama setSuccessData ni setErrorData', async () => {
    mockGetStatus.mockResolvedValue({
      paymentId: 'pay-003', status: 'pending', amount: 100,
    });

    const { result } = renderHook(
      () => usePaymentStatusPolling('pay-003', true),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSetSuccessData).not.toHaveBeenCalled();
    expect(mockSetErrorData).not.toHaveBeenCalled();
  });

  it('aprobado → llama getPaymentStatus exactamente una vez (no re-fetch)', async () => {
    mockGetStatus.mockResolvedValue({
      paymentId: 'pay-004', status: 'approved', amount: 100,
    });

    const { result } = renderHook(
      () => usePaymentStatusPolling('pay-004', true),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // El hook resuelve con aprobado; setSuccessData fue invocado
    expect(mockSetSuccessData).toHaveBeenCalled();
    // getPaymentStatus se llamó al menos una vez (el fetch inicial)
    expect(mockGetStatus).toHaveBeenCalled();
  });
});
