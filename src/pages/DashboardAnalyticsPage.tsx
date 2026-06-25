import { useState } from 'react';
import { useKPIs } from '@/hooks';
import { MethodDonut, StatusBars, RevenueByMethod } from '@/components/dashboard/Charts';
import { formatPEN } from '@/utils/helpers';
import { RefreshCw } from 'lucide-react';

// ============================================================
// PAGE — Analítica avanzada
// ============================================================

export const DashboardAnalyticsPage = () => {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const to   = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const { data, isLoading, refetch, isFetching } = useKPIs(from, to);

  // Calculamos el revenue total de pagos aprobados
  const approvedRevenue = data?.methodBreakdown
    .filter((d) => d.status === 'APPROVED')
    .reduce((sum, d) => sum + Number(d._sum?.amount ?? 0), 0) ?? 0;

  const rejectedCount = data?.methodBreakdown
    .filter((d) => d.status === 'REJECTED')
    .reduce((sum, d) => sum + (d._count?.id ?? 0), 0) ?? 0;

  const totalCount = data?.methodBreakdown
    .reduce((sum, d) => sum + (d._count?.id ?? 0), 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Analítica</h1>
          <p className="text-sm text-gray-500 mt-0.5">Métricas detalladas por período</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={[
                  'px-3 py-1 rounded-md text-xs font-medium transition-all',
                  range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500',
                ].join(' ')}
              >
                {r}
              </button>
            ))}
          </div>
          <button onClick={() => refetch()} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Métricas de resumen del período */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Revenue del período', value: formatPEN(approvedRevenue), color: 'text-green-600' },
          { label: 'Tasa de aprobación', value: `${data?.kpis?.conversionRate ?? '0'}%`, color: 'text-blue-600' },
          { label: 'Transacciones totales', value: String(totalCount), color: 'text-gray-800' },
          { label: 'Rechazados', value: String(rejectedCount), color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={`text-xl font-black mt-1 ${color}`}>{isLoading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Gráficas 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Distribución por método</h3>
          <p className="text-xs text-gray-400 mb-4">Número de transacciones por canal</p>
          <MethodDonut data={data?.methodBreakdown ?? []} loading={isLoading} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Revenue aprobado por método</h3>
          <p className="text-xs text-gray-400 mb-4">Soles peruanos (PEN)</p>
          <RevenueByMethod data={data?.methodBreakdown ?? []} loading={isLoading} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Resultados de pago</h3>
          <p className="text-xs text-gray-400 mb-4">Conteo por estado de transacción</p>
          <StatusBars data={data?.methodBreakdown ?? []} loading={isLoading} />
        </div>
      </div>

      {/* Tabla detallada de breakdown */}
      {data && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Detalle por método y estado</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Método', 'Estado', 'Transacciones', 'Monto total'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.methodBreakdown
                .sort((a, b) => (b._count?.id ?? 0) - (a._count?.id ?? 0))
                .map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-700">
                      {row.method === 'CARD' ? '💳 Tarjeta' : '📱 Yape'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{row.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">
                      {row._count?.id ?? 0}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">
                      {formatPEN(Number(row._sum?.amount ?? 0))}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
