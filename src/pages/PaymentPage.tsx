import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PaymentWidget } from '@/components/payment';
import { generateExternalRef } from '@/utils/helpers';
import type { PaymentConfig, PaymentSuccessData, PaymentErrorData } from '@/types';

// ============================================================
// PAGE — Demo de la pasarela de pagos
// Todos los valores provienen de variables de entorno.
// En integración real, el config llega desde la app cliente.
// ============================================================

const buildDemoConfig = (): PaymentConfig => ({
  publicKey: import.meta.env.VITE_MP_PUBLIC_KEY   ?? '',
  apiKey:    import.meta.env.VITE_TENANT_API_KEY  ?? '',
  transaction: {
    amount:            parseFloat(import.meta.env.VITE_DEMO_AMOUNT       ?? '150'),
    currency:          'PEN',
    description:       import.meta.env.VITE_DEMO_DESCRIPTION ?? 'Pago de demostración',
    externalReference: generateExternalRef('ORD'),
  },
  payer: {
    email:             import.meta.env.VITE_DEMO_PAYER_EMAIL ?? 'cliente@correo.com',
    phone:             import.meta.env.VITE_DEMO_PAYER_PHONE ?? '999999999',
    identification: {
      type:   'DNI',
      number: import.meta.env.VITE_DEMO_PAYER_DOC ?? '12345678',
    },
  },
  customization: { theme: 'default', locale: 'es-PE' },
});

export const PaymentPage = () => {
  const [config, setConfig] = useState<PaymentConfig>(buildDemoConfig);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  if (!config.publicKey || !config.apiKey) {
    return (
      <AppLayout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">
          <p className="font-bold mb-1">Configuración incompleta</p>
          <p>
            Define <code className="bg-yellow-100 px-1 rounded">VITE_MP_PUBLIC_KEY</code> y{' '}
            <code className="bg-yellow-100 px-1 rounded">VITE_TENANT_API_KEY</code> en{' '}
            <code className="bg-yellow-100 px-1 rounded">.env.local</code> para usar la demo.
          </p>
        </div>
      </AppLayout>
    );
  }

  const handleSuccess = (data: PaymentSuccessData) => {
    setLastEvent(`✅ onPaymentSuccess → ID: ${data.paymentId}`);
    console.log('[PaymentWidget] onPaymentSuccess', data);
  };

  const handleError = (error: PaymentErrorData) => {
    setLastEvent(`❌ onPaymentError → ${error.message}`);
    console.error('[PaymentWidget] onPaymentError', error);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <h1 className="text-lg font-bold text-gray-900">Demo — Pasarela de Pagos</h1>
          <p className="text-sm text-gray-500 mt-1">
            SDK desacoplado de Mercado Pago Perú. En producción, el{' '}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">PaymentWidget</code>{' '}
            se inyecta en cualquier app pasándole un <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">config</code> y callbacks.
          </p>
          {lastEvent && (
            <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 border border-gray-200">
              {lastEvent}
            </div>
          )}
        </div>

        <PaymentWidget
          config={config}
          onPaymentSuccess={handleSuccess}
          onPaymentError={handleError}
          onComponentReady={() => console.log('[PaymentWidget] onComponentReady')}
          onClose={() => setConfig(buildDemoConfig())}
        />
      </div>
    </AppLayout>
  );
};
