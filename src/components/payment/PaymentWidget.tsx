import { useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { Card, CardHeader, CardBody, Divider, Spinner, Badge } from '@/components/ui';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { CardBrick } from './CardBrick';
import { YapeQR } from './YapeQR';
import { StatusPanel } from './StatusPanel';
import { useMercadoPagoSDK } from '@/hooks';
import { usePaymentStore } from '@/stores/paymentStore';
import { formatPEN } from '@/utils/helpers';
import type { PaymentConfig, PaymentCallbacks } from '@/types';

// ============================================================
// PAYMENT WIDGET — Componente raíz inyectable
// Orquesta el flujo completo: selector → método → resultado
// Props: config (contrato del documento) + callbacks de salida
// ============================================================

interface PaymentWidgetProps extends PaymentCallbacks {
  config: PaymentConfig;
  onClose?: () => void;
}

export const PaymentWidget = ({
  config,
  onPaymentSuccess,
  onPaymentError,
  onComponentReady,
  onClose,
}: PaymentWidgetProps) => {
  const {
    status,
    selectedMethod,
    successData,
    errorData,
    isSdkReady,
    setConfig,
  } = usePaymentStore();

  const { isSdkReady: sdkLoaded } = useMercadoPagoSDK(config.publicKey);

  // Sincronizar config al store
  useEffect(() => {
    setConfig(config);
  }, [config, setConfig]);

  // Disparar callbacks de salida
  useEffect(() => {
    if (sdkLoaded && onComponentReady) {
      onComponentReady();
    }
  }, [sdkLoaded, onComponentReady]);

  useEffect(() => {
    if (status === 'approved' && successData) {
      onPaymentSuccess(successData);
    }
  }, [status, successData, onPaymentSuccess]);

  useEffect(() => {
    if (status === 'error' && errorData) {
      onPaymentError(errorData);
    }
  }, [status, errorData, onPaymentError]);

  const isTerminal = status === 'approved' || status === 'error';

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        {/* ── Header ── */}
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {isTerminal ? 'Resultado del pago' : 'Completa tu pago'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                {config.transaction.description}
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                           text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </CardHeader>

        <CardBody className="flex flex-col gap-5">
          {/* ── Monto ── */}
          {!isTerminal && (
            <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">
                  Total a pagar
                </p>
                <p className="text-2xl font-black text-blue-700 mt-0.5">
                  {formatPEN(config.transaction.amount)}
                </p>
              </div>
              <Badge variant="info">{config.transaction.currency}</Badge>
            </div>
          )}

          {/* ── Cuerpo principal ── */}
          {!isSdkReady ? (
            <div className="flex items-center justify-center gap-3 py-8">
              <Spinner />
              <span className="text-sm text-gray-500">Cargando pasarela…</span>
            </div>
          ) : isTerminal ? (
            <StatusPanel onRetry={() => {}} onClose={onClose} />
          ) : (
            <>
              <PaymentMethodSelector />
              {selectedMethod && (
                <>
                  <Divider label="ingresa tus datos" />
                  {selectedMethod === 'card' ? <CardBrick /> : <YapeQR />}
                </>
              )}
            </>
          )}
        </CardBody>

        {/* ── Footer de seguridad ── */}
        {!isTerminal && (
          <div className="px-5 pb-4">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck size={13} className="text-green-500" />
              Pagos procesados de forma segura por Mercado Pago
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
