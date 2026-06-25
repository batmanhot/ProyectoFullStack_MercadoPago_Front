import { describe, it, expect, beforeEach } from 'vitest';
import { usePaymentStore } from '@/stores/paymentStore';
import type { PaymentConfig, PaymentSuccessData } from '@/types';

const mockConfig: PaymentConfig = {
  publicKey: 'TEST-public-key',
  apiKey:    'sk_test_xxx',
  transaction: {
    amount:            150,
    currency:          'PEN',
    description:       'Producto de prueba',
    externalReference: 'ORD-001',
  },
  payer: {
    email: 'buyer@test.pe',
    identification: { type: 'DNI', number: '12345678' },
  },
};

const mockSuccess: PaymentSuccessData = {
  paymentId:         'pay-001',
  status:            'approved',
  statusDetail:      'accredited',
  amount:            150,
  currency:          'PEN',
  paymentMethodId:   'visa',
  externalReference: 'ORD-001',
  dateApproved:      '2024-01-15T10:30:00Z',
};

beforeEach(() => {
  usePaymentStore.getState().reset();
});

describe('paymentStore', () => {
  it('estado inicial: todo en null/idle', () => {
    const s = usePaymentStore.getState();
    expect(s.config).toBeNull();
    expect(s.status).toBe('idle');
    expect(s.selectedMethod).toBeNull();
    expect(s.successData).toBeNull();
    expect(s.errorData).toBeNull();
    expect(s.isSdkReady).toBe(false);
  });

  it('setConfig: almacena la configuración', () => {
    usePaymentStore.getState().setConfig(mockConfig);
    expect(usePaymentStore.getState().config).toEqual(mockConfig);
  });

  it('setSuccessData: guarda los datos y cambia status a "approved"', () => {
    usePaymentStore.getState().setSuccessData(mockSuccess);
    const s = usePaymentStore.getState();
    expect(s.successData).toEqual(mockSuccess);
    expect(s.status).toBe('approved');
    expect(s.errorData).toBeNull(); // limpia el error previo
  });

  it('setErrorData: guarda el error, cambia status a "error" y limpia successData', () => {
    usePaymentStore.getState().setSuccessData(mockSuccess); // primero éxito
    usePaymentStore.getState().setErrorData({ code: 'ERR', message: 'Fallo' });
    const s = usePaymentStore.getState();
    expect(s.status).toBe('error');
    expect(s.errorData).toEqual({ code: 'ERR', message: 'Fallo' });
    expect(s.successData).toBeNull();
  });

  it('reset: limpia el flujo de pago pero PRESERVA config e isSdkReady', () => {
    // config e isSdkReady pertenecen al ciclo de vida del widget (llegan por props/SDK),
    // no al flujo de un pago individual — deben sobrevivir al reset para evitar S/ 0.00
    usePaymentStore.getState().setConfig(mockConfig);
    usePaymentStore.getState().setSuccessData(mockSuccess);
    usePaymentStore.getState().setSdkReady(true);
    usePaymentStore.getState().reset();

    const s = usePaymentStore.getState();
    expect(s.config).toEqual(mockConfig);   // preservado
    expect(s.isSdkReady).toBe(true);        // preservado
    expect(s.status).toBe('idle');          // reiniciado
    expect(s.successData).toBeNull();       // reiniciado
    expect(s.errorData).toBeNull();         // reiniciado
    expect(s.selectedMethod).toBeNull();    // reiniciado
  });

  it('setSdkReady: actualiza solo isSdkReady', () => {
    usePaymentStore.getState().setConfig(mockConfig);
    usePaymentStore.getState().setSdkReady(true);
    const s = usePaymentStore.getState();
    expect(s.isSdkReady).toBe(true);
    expect(s.config).toEqual(mockConfig); // no toca config
  });

  it('setStatus: cambia solo el status', () => {
    usePaymentStore.getState().setStatus('processing');
    expect(usePaymentStore.getState().status).toBe('processing');
  });

  it('setSelectedMethod: almacena el método seleccionado', () => {
    usePaymentStore.getState().setSelectedMethod('card');
    expect(usePaymentStore.getState().selectedMethod).toBe('card');
    usePaymentStore.getState().setSelectedMethod(null);
    expect(usePaymentStore.getState().selectedMethod).toBeNull();
  });
});
