import { useState } from 'react';
import { useAdminPayments, useAdminTenants } from '@/hooks/useAdmin';
import { formatPEN } from '@/utils/helpers';

// ============================================================
// ADMIN — Monitor global de pagos (todos los tenants)
// ============================================================

const STATUS_BADGE: Record<string, string> = {
  APPROVED:     'bg-green-900/50  text-green-400',
  REJECTED:     'bg-red-900/50    text-red-400',
  PENDING:      'bg-yellow-900/50 text-yellow-400',
  PROCESSING:   'bg-blue-900/50   text-blue-400',
  ERROR:        'bg-red-900/50    text-red-400',
  CANCELLED:    'bg-gray-800      text-gray-400',
  REFUNDED:     'bg-purple-900/50 text-purple-400',
};

export const AdminPaymentsPage = () => {
  const [tenantId, setTenantId] = useState('');
  const [status,   setStatus]   = useState('');
  const [page,     setPage]     = useState(1);

  const { data, isLoading } = useAdminPayments({ tenantId, status, page });
  const { data: tenantsData } = useAdminTenants();

  const payments = (data?.payments ?? []) as Record<string, unknown>[];
  const total    = (data?.total    ?? 0)  as number;
  const pages    = (data?.pages    ?? 1)  as number;
  const tenants  = (tenantsData    ?? []) as Record<string, unknown>[];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Monitor de Pagos</h1>
        <p className="text-gray-400 text-sm mt-1">{total} pagos totales en el sistema</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <select value={tenantId} onChange={(e) => { setTenantId(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm">
          <option value="">Todos los tenants</option>
          {tenants.map((t) => (
            <option key={t.id as string} value={t.id as string}>{t.name as string}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          {['APPROVED','REJECTED','PENDING','PROCESSING','ERROR','CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Referencia</th>
              <th className="px-5 py-3 text-left">Tenant</th>
              <th className="px-5 py-3 text-center">Método</th>
              <th className="px-5 py-3 text-right">Monto</th>
              <th className="px-5 py-3 text-center">Estado</th>
              <th className="px-5 py-3 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">Cargando…</td></tr>
            )}
            {payments.map((p) => {
              const tenant = p.tenant as { name: string };
              const order  = p.order  as { externalReference: string };
              return (
                <tr key={p.id as string} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-xs font-mono text-gray-300">{order.externalReference}</p>
                    {p.mpPaymentId && <p className="text-[10px] text-gray-600 font-mono">MP: {p.mpPaymentId as string}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{tenant.name}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs text-gray-400">{p.method as string}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-white">
                    {formatPEN(Number(p.amount))}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[p.status as string] ?? 'bg-gray-800 text-gray-400'}`}>
                      {p.status as string}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {new Date(p.createdAt as string).toLocaleString('es-PE')}
                  </td>
                </tr>
              );
            })}
            {!isLoading && payments.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">Sin pagos</td></tr>
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-500">Página {page} de {pages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="text-xs px-3 py-1 rounded bg-gray-800 text-gray-400 disabled:opacity-40 hover:bg-gray-700">
                Anterior
              </button>
              <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}
                className="text-xs px-3 py-1 rounded bg-gray-800 text-gray-400 disabled:opacity-40 hover:bg-gray-700">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
