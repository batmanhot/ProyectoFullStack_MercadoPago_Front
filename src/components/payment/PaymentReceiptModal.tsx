import { X, Download, CreditCard, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import type { PaymentSuccessData } from '@/types';
import { formatPEN, formatDatePE } from '@/utils/helpers';
import { Button } from '@/components/ui';

// ============================================================
// PAYMENT — Modal de recibo / comprobante de pago
// ============================================================

const METHOD_LABELS: Record<string, string> = {
  visa:   'Visa',
  master: 'Mastercard',
  amex:   'American Express',
  yape:   'Yape',
  diners: 'Diners Club',
  elo:    'Elo',
};

interface PaymentReceiptModalProps {
  data: PaymentSuccessData;
  onClose: () => void;
}

export const PaymentReceiptModal = ({ data, onClose }: PaymentReceiptModalProps) => {
  const generatedAt = new Date().toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const methodLabel = METHOD_LABELS[data.paymentMethodId?.toLowerCase()] ?? data.paymentMethodId ?? '—';

  // Inject print CSS while modal is open so only the receipt prints
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'mp-receipt-print-css';
    style.textContent = `
      @media print {
        body > * { visibility: hidden !important; }
        #mp-receipt-printable,
        #mp-receipt-printable * { visibility: visible !important; }
        #mp-receipt-printable {
          position: fixed !important;
          top: 0 !important; left: 0 !important;
          width: 100% !important;
          background: white !important;
          box-sizing: border-box !important;
          padding: 40px !important;
          font-family: 'Segoe UI', Arial, sans-serif !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.getElementById('mp-receipt-print-css')?.remove();
  }, []);

  const handlePrint = () => window.print();

  const rows = [
    { label: 'N° de Pago',  value: data.paymentId },
    { label: 'Referencia',  value: data.externalReference },
    { label: 'Fecha',       value: formatDatePE(data.dateApproved) },
    { label: 'Método',      value: methodLabel },
    { label: 'Estado',      value: data.statusDetail },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-bold text-gray-700">Vista previa del recibo</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Recibo (también el contenido que se imprime) ── */}
        <div id="mp-receipt-printable" className="px-6 py-5">

          {/* Encabezado */}
          <div className="text-center mb-5 pb-4 border-b-2 border-dashed border-gray-200">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard size={22} className="text-white" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Comprobante de Pago
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5">Payment SDK · MercadoPago Perú</p>
          </div>

          {/* Monto */}
          <div className="text-center mb-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Monto pagado</p>
            <p className="text-4xl font-black text-gray-900 tracking-tight">
              {formatPEN(data.amount)}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 text-green-700
                            text-xs font-black px-4 py-1.5 rounded-full border border-green-200">
              <CheckCircle2 size={12} />
              APROBADO
            </div>
          </div>

          {/* Detalle */}
          <div className="border-t-2 border-b-2 border-dashed border-gray-200 py-4 space-y-2.5 mb-5">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start gap-4">
                <span className="text-[11px] text-gray-400 shrink-0">{label}</span>
                <span className="text-[11px] font-semibold text-gray-800 font-mono text-right break-all">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center space-y-0.5">
            <p className="text-xs font-semibold text-gray-500">Gracias por su pago</p>
            <p className="text-[10px] text-gray-300">Generado el {generatedAt}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 px-5 pb-5">
          <Button variant="secondary" className="flex-1" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          <Button className="flex-1" size="sm" icon={<Download size={13} />} onClick={handlePrint}>
            Descargar PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
