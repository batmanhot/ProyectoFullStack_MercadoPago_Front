import { useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { processCardPayment, processYapePayment, getPaymentStatus } from '@/api';
import { usePaymentStore } from '@/stores/paymentStore';
import type { CardPaymentRequest, YapePaymentRequest } from '@/types';
import toast from 'react-hot-toast';
import { mapMPError } from '@/utils/helpers';

// ============================================================
// TANSTACK QUERY HOOKS — Mutaciones y queries de pago
// ============================================================

export const paymentKeys = {
  all:    ['payments'] as const,
  status: (id: string) => [...paymentKeys.all, 'status', id] as const,
};

export const useCardPayment = () => {
  const { setStatus, setSuccessData, setErrorData, config } = usePaymentStore();

  return useMutation({
    mutationFn: (payload: CardPaymentRequest) => processCardPayment(payload, config!.apiKey),
    onMutate:   () => { setStatus('processing'); },
    onSuccess:  (data) => {
      if (data.status === 'approved') {
        setSuccessData({
          paymentId:         data.paymentId,
          status:            'approved',
          statusDetail:      data.statusDetail,
          amount:            data.amount,
          currency:          'PEN',
          paymentMethodId:   data.paymentMethodId ?? '',
          externalReference: data.externalReference,
          dateApproved:      new Date().toISOString(),
        });
        toast.success('¡Pago aprobado!');
      } else {
        const errorMsg = mapMPError(data.statusDetail);
        setErrorData({ code: data.statusDetail, message: errorMsg });
        toast.error(errorMsg);
      }
    },
    onError: (error: { code: string; message: string }) => {
      setErrorData(error);
      toast.error(error.message ?? 'Error al procesar el pago');
    },
  });
};

export const useYapePayment = () => {
  const { setStatus, setErrorData, config } = usePaymentStore();

  return useMutation({
    mutationFn: (payload: YapePaymentRequest) => processYapePayment(payload, config!.apiKey),
    onMutate:   () => { setStatus('pending'); },
    onError:    (error: { code: string; message: string; cause?: string }) => {
      setErrorData(error);
      setStatus('error');
      toast.error(error.message ?? 'Error al generar el pago Yape');
    },
  });
};

// Polling del estado de un pago Yape (se detiene al aprobar/rechazar)
export const usePaymentStatusPolling = (
  paymentId: string | undefined,
  enabled: boolean
) => {
  const queryClient = useQueryClient();
  const { config, setSuccessData, setErrorData } = usePaymentStore();

  // Estabilizar callbacks con useCallback para poder incluirlos en el array de deps
  const handleApproved = useCallback((data: NonNullable<typeof query['data']>) => {
    setSuccessData({
      paymentId:         data.paymentId,
      status:            'approved',
      statusDetail:      data.statusDetail ?? '',
      amount:            data.amount ?? 0,
      currency:          'PEN',
      paymentMethodId:   data.paymentMethodId ?? '',
      externalReference: data.externalReference ?? '',
      dateApproved:      data.dateApproved ?? new Date().toISOString(),
    });
    if (paymentId) queryClient.cancelQueries({ queryKey: paymentKeys.status(paymentId) });
  // setSuccessData y queryClient son estables (Zustand setter / instancia de TanStack)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  const handleRejected = useCallback(() => {
    setErrorData({ code: 'payment_rejected', message: 'El pago fue rechazado' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const query = useQuery({
    queryKey: paymentKeys.status(paymentId ?? ''),
    queryFn:  () => getPaymentStatus(paymentId!, config!.apiKey),
    enabled:  enabled && !!paymentId && !!config,
    staleTime: 1_000,
    gcTime:    2 * 60 * 1_000,
    retry:     3,
    retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 10_000),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'approved' || status === 'rejected') return false;
      return 5_000;
    },
  });

  // Efecto separado para los side effects — select debe ser una transformación pura
  useEffect(() => {
    const data = query.data;
    if (!data || !paymentId) return;
    if (data.status === 'approved') handleApproved(data);
    else if (data.status === 'rejected') handleRejected();
  }, [query.data, paymentId, handleApproved, handleRejected]);

  return query;
};
