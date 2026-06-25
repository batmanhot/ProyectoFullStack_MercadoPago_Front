import { create } from 'zustand';
import type {
  PaymentStore,
  PaymentConfig,
  PaymentStatus,
  PaymentMethod,
  PaymentSuccessData,
  PaymentErrorData,
} from '@/types';

// ============================================================
// ZUSTAND STORE — Estado global del flujo de pago
// ============================================================

const initialState = {
  config: null as PaymentConfig | null,
  status: 'idle' as PaymentStatus,
  selectedMethod: null as PaymentMethod | null,
  successData: null as PaymentSuccessData | null,
  errorData: null as PaymentErrorData | null,
  isSdkReady: false,
};

export const usePaymentStore = create<PaymentStore>((set) => ({
  ...initialState,

  setConfig: (config) => set({ config }),

  setStatus: (status) => set({ status }),

  setSelectedMethod: (method) => set({ selectedMethod: method }),

  setSuccessData: (data) =>
    set({ successData: data, status: 'approved', errorData: null }),

  setErrorData: (error) =>
    set({ errorData: error, status: 'error', successData: null }),

  setSdkReady: (ready) => set({ isSdkReady: ready }),

  // Preserva config e isSdkReady al resetear: ambos pertenecen al ciclo de vida
  // del widget (llegan por props / SDK), no al flujo de un pago individual.
  reset: () => set((state) => ({
    ...initialState,
    config:     state.config,
    isSdkReady: state.isSdkReady,
  })),
}));
