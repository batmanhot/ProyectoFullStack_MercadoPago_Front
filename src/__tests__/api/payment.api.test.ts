import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
}));

import { apiClient }              from '@/api/client';
import { processCardPayment, processYapePayment, getPaymentStatus } from '@/api/payment.api';

const mockPost = vi.mocked(apiClient.post);
const mockGet  = vi.mocked(apiClient.get);

beforeEach(() => vi.clearAllMocks());

const cardResponse = {
  paymentId: 'pay-001', status: 'approved', statusDetail: 'accredited',
  amount: 100, paymentMethodId: 'visa', externalReference: 'REF-001',
};

const yapeResponse = {
  paymentId: 'pay-002', status: 'pending', qrData: 'qr-code-string',
  externalReference: 'REF-002',
};

const statusResponse = {
  paymentId: 'pay-001', status: 'approved', amount: 100,
};

describe('processCardPayment', () => {
  it('llama POST /payments/card con X-Api-Key y retorna data.data', async () => {
    mockPost.mockResolvedValue({ data: { data: cardResponse } });

    const payload = {
      token: 'tok', transactionAmount: 100, description: 'Test',
      installments: 1, paymentMethodId: 'visa', externalReference: 'REF-001',
      payer: { email: 'a@t.pe', identification: { type: 'DNI' as const, number: '12345678' } },
    };
    const result = await processCardPayment(payload, 'sk_test_key');

    expect(mockPost).toHaveBeenCalledWith(
      '/payments/card',
      payload,
      expect.objectContaining({ headers: { 'X-Api-Key': 'sk_test_key' } })
    );
    expect(result.paymentId).toBe('pay-001');
    expect(result.status).toBe('approved');
  });
});

describe('processYapePayment', () => {
  it('llama POST /payments/yape con X-Api-Key y retorna data.data', async () => {
    mockPost.mockResolvedValue({ data: { data: yapeResponse } });

    const payload = {
      transactionAmount: 50, description: 'Yape',
      externalReference: 'REF-002',
      payer: { email: 'a@t.pe', identification: { type: 'DNI' as const, number: '12345678' } },
    };
    const result = await processYapePayment(payload, 'sk_test_key');

    expect(mockPost).toHaveBeenCalledWith(
      '/payments/yape',
      payload,
      expect.objectContaining({ headers: { 'X-Api-Key': 'sk_test_key' } })
    );
    expect(result.status).toBe('pending');
  });
});

describe('getPaymentStatus', () => {
  it('llama GET /payments/:id/status con X-Api-Key y retorna data.data', async () => {
    mockGet.mockResolvedValue({ data: { data: statusResponse } });

    const result = await getPaymentStatus('pay-001', 'sk_test_key');

    expect(mockGet).toHaveBeenCalledWith(
      '/payments/pay-001/status',
      expect.objectContaining({ headers: { 'X-Api-Key': 'sk_test_key' } })
    );
    expect(result.status).toBe('approved');
  });
});
