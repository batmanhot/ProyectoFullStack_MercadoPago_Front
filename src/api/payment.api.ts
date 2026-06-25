import { apiClient } from './client';
import type {
  CardPaymentRequest,
  CardPaymentResponse,
  YapePaymentRequest,
  YapePaymentResponse,
  PaymentStatusData,
} from '@/types';

// ============================================================
// PAYMENT API — Funciones de llamada al microservicio backend
// ============================================================

export const processCardPayment = async (
  payload: CardPaymentRequest,
  apiKey: string
): Promise<CardPaymentResponse> => {
  const { data } = await apiClient.post<{ data: CardPaymentResponse }>(
    '/payments/card',
    payload,
    { headers: { 'X-Api-Key': apiKey } }
  );
  return data.data;
};

export const processYapePayment = async (
  payload: YapePaymentRequest,
  apiKey: string
): Promise<YapePaymentResponse> => {
  const { data } = await apiClient.post<{ data: YapePaymentResponse }>(
    '/payments/yape',
    payload,
    { headers: { 'X-Api-Key': apiKey } }
  );
  return data.data;
};

export const getPaymentStatus = async (
  paymentId: string,
  apiKey: string
): Promise<PaymentStatusData> => {
  const { data } = await apiClient.get<{ data: PaymentStatusData }>(
    `/payments/${paymentId}/status`,
    { headers: { 'X-Api-Key': apiKey } }
  );
  return data.data;
};
