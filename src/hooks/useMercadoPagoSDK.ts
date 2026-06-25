import { useEffect, useRef } from 'react';
import { usePaymentStore } from '@/stores/paymentStore';

// ============================================================
// HOOK — Carga dinámica del SDK oficial de Mercado Pago JS v2
// Instancia MercadoPago una sola vez por sesión y expone
// getMPInstance() para que CardBrick pueda tokenizar.
// ============================================================

export interface MPCardTokenData {
  cardNumber: string;
  cardholderName: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
}

export interface MPCardTokenResult {
  id:               string;
  first_six_digits?: string;
  last_four_digits?: string;
  security_code_length?: number;
}

export interface MPPaymentMethod {
  id:              string;   // 'visa', 'master', 'amex', 'diners', etc.
  name:            string;
  payment_type_id: string;
  status:          string;
}

export interface MercadoPagoInstance {
  createCardToken:   (data: MPCardTokenData) => Promise<MPCardTokenResult>;
  getPaymentMethods: (params: { bin: string }) => Promise<{ results: MPPaymentMethod[] }>;
}

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale?: string }) => MercadoPagoInstance;
  }
}

const MP_SDK_URL = 'https://sdk.mercadopago.com/js/v2';

// Singleton — sobrevive a re-renders y re-montajes del componente
let mpInstance: MercadoPagoInstance | null = null;

export const getMPInstance = (): MercadoPagoInstance | null => mpInstance;

export const useMercadoPagoSDK = (publicKey: string | undefined) => {
  const { isSdkReady, setSdkReady } = usePaymentStore();
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!publicKey || isSdkReady) return;

    // Si el script ya existe en el DOM (p.ej. hot-reload), sólo instancia
    const existing = document.querySelector(`script[src="${MP_SDK_URL}"]`);
    if (existing) {
      if (!mpInstance) {
        mpInstance = new window.MercadoPago(publicKey, { locale: 'es-PE' });
      }
      setSdkReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src   = MP_SDK_URL;
    script.async = true;

    script.onload = () => {
      if (!mpInstance) {
        mpInstance = new window.MercadoPago(publicKey, { locale: 'es-PE' });
      }
      setSdkReady(true);
    };

    script.onerror = () => console.error('[MP SDK] Error al cargar el script');

    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Solo elimina el script si aún no terminó de cargar
      if (scriptRef.current && !isSdkReady) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, [publicKey, isSdkReady, setSdkReady]);

  return { isSdkReady };
};
