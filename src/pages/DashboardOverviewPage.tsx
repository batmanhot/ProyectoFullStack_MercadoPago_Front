import { useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, CheckCircle2, XCircle,
  Clock, CreditCard, BarChart3, RefreshCw,
} from 'lucide-react';
import { useKPIs } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { KPICard } from '@/components/dashboard/KPICard';
import { MethodDonut, StatusBars, RevenueByMethod } from '@/components/dashboard/Charts';
import { PaymentsTable } from '@/components/dashboard/PaymentsTable';
import { formatPEN } from '@/utils/helpers';

// ============================================================
// PAGE — Dashboard principal (Resumen)
// ============================================================

export const DashboardOverviewPage = () => {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const { user } = useAuthStore();

  // Memoizado para evitar nuevos objetos en cada render (estabiliza la query key)
  const { from, to } = useMemo(() => {
    const to = new Date().toISOString().split('T')[0];
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : null;
    if (!days) return { from: undefined, to: undefined };
    const from = new Date(Date.now() - days * 86_400_000).toISOString().split('T')[0];
    return { from, to };
  }, [range]);

  const { data, isLoading, refetch, isFetching } = useKPIs(from, to);

  const kpis = data?.kpis;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Resumen General</h1>
          <p className="text-sm text-gray-500 mt-0.5">Métricas del tenant {user?.tenantName ?? '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Selector de rango */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={[
                  'px-3 py-1 rounded-md text-xs font-medium transition-all',
                  range === r
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {r === 'all' ? 'Todo' : r}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Revenue Total"
          value={formatPEN(kpis?.revenue ?? 0)}
          subtitle="Pagos aprobados"
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          loading={isLoading}
        />
        <KPICard
          title="Conversión"
          value={`${kpis?.conversionRate ?? '0.00'}%`}
          subtitle={`${kpis?.paid ?? 0} de ${kpis?.total ?? 0} pagos`}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          loading={isLoading}
        />
        <KPICard
          title="Ticket Promedio"
          value={formatPEN(kpis?.avgTicket ?? 0)}
          subtitle="Por pago aprobado"
          icon={CreditCard}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          loading={isLoading}
        />
        <KPICard
          title="Total Órdenes"
          value={kpis?.total ?? 0}
          subtitle="En el período"
          icon={BarChart3}
          iconColor="text-gray-600"
          iconBg="bg-gray-100"
          loading={isLoading}
        />
      </div>

      {/* ── Fila 2: stats secundarias ────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard
          title="Aprobados"
          value={kpis?.paid ?? 0}
          icon={CheckCircle2}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          loading={isLoading}
        />
        <KPICard
          title="Rechazados"
          value={kpis?.failed ?? 0}
          icon={XCircle}
          iconColor="text-red-500"
          iconBg="bg-red-50"
          loading={isLoading}
        />
        <KPICard
          title="Pendientes"
          value={kpis?.pending ?? 0}
          icon={Clock}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-50"
          loading={isLoading}
        />
      </div>

      {/* ── Gráficas ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Donut: métodos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Métodos de pago</h3>
          <p className="text-xs text-gray-500 mb-4">Distribución de transacciones</p>
          <MethodDonut data={data?.methodBreakdown ?? []} loading={isLoading} />
        </div>

        {/* Barras: estados */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Estados</h3>
          <p className="text-xs text-gray-500 mb-4">Transacciones por resultado</p>
          <StatusBars data={data?.methodBreakdown ?? []} loading={isLoading} />
        </div>

        {/* Barras: revenue por método */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Revenue por método</h3>
          <p className="text-xs text-gray-500 mb-4">Solo pagos aprobados (PEN)</p>
          <RevenueByMethod data={data?.methodBreakdown ?? []} loading={isLoading} />
        </div>
      </div>

      {/* ── Últimas transacciones ─────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">Últimas transacciones</h2>
        <PaymentsTable />
      </div>

    </div>
  );
};
