import { CreditCard, Smartphone, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import type { DBPaymentStatus, DBPaymentMethod } from '@/types';

// ============================================================
// DASHBOARD — Helpers visuales: badges, íconos, labels
// ============================================================

// ── Status badge ──────────────────────────────────────────────
const STATUS_CONFIG: Record<DBPaymentStatus, { label: string; className: string }> = {
  APPROVED:     { label: 'Aprobado',    className: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED:     { label: 'Rechazado',   className: 'bg-red-50 text-red-700 border-red-200' },
  PENDING:      { label: 'Pendiente',   className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  PROCESSING:   { label: 'Procesando',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_PROCESS:   { label: 'En proceso',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_MEDIATION: { label: 'Mediación',   className: 'bg-orange-50 text-orange-700 border-orange-200' },
  AUTHORIZED:   { label: 'Autorizado',  className: 'bg-teal-50 text-teal-700 border-teal-200' },
  CANCELLED:    { label: 'Cancelado',   className: 'bg-gray-50 text-gray-600 border-gray-200' },
  REFUNDED:     { label: 'Devuelto',    className: 'bg-purple-50 text-purple-700 border-purple-200' },
  CHARGED_BACK: { label: 'Contracargo', className: 'bg-pink-50 text-pink-700 border-pink-200' },
  ERROR:        { label: 'Error',       className: 'bg-red-50 text-red-800 border-red-300' },
};

export const StatusBadge = ({ status }: { status: DBPaymentStatus }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-50 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

// ── Method icon + label ───────────────────────────────────────
export const MethodBadge = ({ method }: { method: DBPaymentMethod }) => {
  if (method === 'CARD') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
        <CreditCard size={13} className="text-blue-500" />
        Tarjeta
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
      <Smartphone size={13} className="text-purple-500" />
      Yape
    </span>
  );
};

// ── Status icon ───────────────────────────────────────────────
export const StatusIcon = ({ status }: { status: DBPaymentStatus }) => {
  if (status === 'APPROVED')  return <CheckCircle2 size={15} className="text-green-500" />;
  if (status === 'REJECTED' || status === 'ERROR') return <XCircle size={15} className="text-red-500" />;
  if (status === 'REFUNDED')  return <RefreshCw size={15} className="text-purple-500" />;
  return <Clock size={15} className="text-yellow-500" />;
};
