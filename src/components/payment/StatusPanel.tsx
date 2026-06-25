import { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Receipt } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { usePaymentStore } from '@/stores/paymentStore';
import { formatPEN, formatDatePE } from '@/utils/helpers';
import { PaymentReceiptModal } from './PaymentReceiptModal';

// ============================================================
// PAYMENT — Modal / Panel de resultado del pago
// ============================================================

interface StatusPanelProps {
  onRetry?: () => void;
  onClose?: () => void;
}

export const StatusPanel = ({ onRetry, onClose }: StatusPanelProps) => {
  const { status, successData, errorData, reset } = usePaymentStore();
  const [showReceipt, setShowReceipt] = useState(false);

  const handleRetry = () => {
    reset();
    onRetry?.();
  };

  const handleCancel = () => {
    reset();
    onClose?.();
  };

  if (status === 'approved' && successData) {
    return (
      <>
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 size={36} className="text-green-500" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">¡Pago exitoso!</h3>
            <p className="text-sm text-gray-500 mt-1">Tu pago fue procesado correctamente</p>
          </div>

          <Badge variant="success">Aprobado</Badge>

          {/* Detalle del pago */}
          <div className="w-full bg-gray-50 rounded-xl p-4 text-left space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Monto pagado</span>
              <span className="text-sm font-bold text-gray-800">
                {formatPEN(successData.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">N° de pago</span>
              <span className="text-xs font-mono text-gray-700">{successData.paymentId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Referencia</span>
              <span className="text-xs font-mono text-gray-700">{successData.externalReference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Fecha</span>
              <span className="text-xs text-gray-700">{formatDatePE(successData.dateApproved)}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              className="flex-1"
              icon={<Receipt size={15} />}
              onClick={() => setShowReceipt(true)}
            >
              Ver recibo
            </Button>
            <Button className="flex-1" onClick={() => { reset(); onClose?.(); }}>
              Continuar
            </Button>
          </div>
        </div>

        {showReceipt && (
          <PaymentReceiptModal
            data={successData}
            onClose={() => setShowReceipt(false)}
          />
        )}
      </>
    );
  }

  if (status === 'error' && errorData) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <XCircle size={36} className="text-red-500" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">Pago no procesado</h3>
          <p className="text-sm text-gray-500 mt-1">{errorData.message}</p>
        </div>

        <Badge variant="error">Rechazado</Badge>

        <div className="w-full bg-red-50 rounded-xl p-4 text-left">
          <p className="text-xs text-red-600">
            Código: <span className="font-mono">{errorData.code}</span>
          </p>
          {errorData.cause && (
            <p className="text-xs text-red-500 mt-1">{errorData.cause}</p>
          )}
        </div>

        <div className="flex gap-3 w-full">
          <Button variant="secondary" className="flex-1" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button className="flex-1" icon={<RefreshCw size={15} />} onClick={handleRetry}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
