import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePaymentsList } from '@/hooks';
import { StatusBadge, MethodBadge, StatusIcon } from './Badges';
import { Spinner } from '@/components/ui';
import { formatPEN, formatDatePE } from '@/utils/helpers';
import type { PaymentFilters, DBPaymentStatus, DBPaymentMethod } from '@/types';

// ============================================================
// DASHBOARD — Tabla de transacciones con filtros y paginación
// ============================================================

const LIMIT = 15;

export const PaymentsTable = () => {
  const [filters, setFilters] = useState<Partial<PaymentFilters>>({
    page: 1,
    limit: LIMIT,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isFetching } = usePaymentsList(filters);

  const setFilter = (key: keyof PaymentFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const goPage = (page: number) => setFilters((prev) => ({ ...prev, page }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* ── Header + filtros ────────────────────────────── */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Transacciones</h3>
            {data && (
              <p className="text-xs text-gray-500 mt-0.5">
                {data.total} registros · Página {data.page} de {data.pages}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={[
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium',
              'border transition-colors',
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50',
            ].join(' ')}
          >
            <SlidersHorizontal size={13} />
            Filtros
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            {/* Estado */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Estado</label>
              <select
                className="text-xs rounded-lg border border-gray-200 px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status ?? ''}
                onChange={(e) => setFilter('status', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="APPROVED">Aprobado</option>
                <option value="REJECTED">Rechazado</option>
                <option value="PENDING">Pendiente</option>
                <option value="IN_PROCESS">En proceso</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="REFUNDED">Devuelto</option>
              </select>
            </div>
            {/* Método */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Método</label>
              <select
                className="text-xs rounded-lg border border-gray-200 px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.method ?? ''}
                onChange={(e) => setFilter('method', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="CARD">Tarjeta</option>
                <option value="YAPE">Yape</option>
              </select>
            </div>
            {/* Desde */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Desde</label>
              <input
                type="date"
                className="text-xs rounded-lg border border-gray-200 px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.from ?? ''}
                onChange={(e) => setFilter('from', e.target.value)}
              />
            </div>
            {/* Hasta */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Hasta</label>
              <input
                type="date"
                className="text-xs rounded-lg border border-gray-200 px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.to ?? ''}
                onChange={(e) => setFilter('to', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Tabla ───────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Estado', 'Referencia', 'Descripción', 'Método', 'Monto', 'Cuotas', 'Fecha', 'MP ID'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-xs text-gray-400">Cargando transacciones...</span>
                  </div>
                </td>
              </tr>
            ) : !data?.payments.length ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center">
                  <Search size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No se encontraron transacciones</p>
                </td>
              </tr>
            ) : (
              data.payments.map((p) => (
                <tr
                  key={p.id}
                  className={`hover:bg-gray-50 transition-colors ${isFetching ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={p.status as DBPaymentStatus} />
                      <StatusBadge status={p.status as DBPaymentStatus} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-600">
                      {p.order?.externalReference ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-700 max-w-[180px] truncate" title={p.order?.description}>
                      {p.order?.description ?? '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <MethodBadge method={p.method as DBPaymentMethod} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900 text-xs">
                      {formatPEN(Number(p.amount))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 text-center">
                    {p.installments}x
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {p.createdAt ? formatDatePE(p.createdAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-400">
                      {p.mpPaymentId ? `#${p.mpPaymentId}` : '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ──────────────────────────────────── */}
      {data && data.pages > 1 && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Mostrando {((data.page - 1) * data.limit) + 1}–{Math.min(data.page * data.limit, data.total)} de {data.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={data.page <= 1}
              onClick={() => goPage(data.page - 1)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(data.pages, 7) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => goPage(page)}
                  className={[
                    'w-7 h-7 rounded-lg text-xs font-medium transition-colors',
                    data.page === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {page}
                </button>
              );
            })}
            <button
              disabled={data.page >= data.pages}
              onClick={() => goPage(data.page + 1)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
