import { useAdminStats } from '@/hooks/useAdmin';
import { Building2, Users, CreditCard, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { formatPEN } from '@/utils/helpers';

// ============================================================
// ADMIN — Dashboard global SaaS
// ============================================================

const StatCard = ({ icon: Icon, label, value, sub, color = 'blue' }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
  color?: 'blue' | 'green' | 'red' | 'purple';
}) => {
  const colors = {
    blue:   'bg-blue-600/20   text-blue-400   border-blue-600/30',
    green:  'bg-green-600/20  text-green-400  border-green-600/30',
    red:    'bg-red-600/20    text-red-400    border-red-600/30',
    purple: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-3 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
};

export const AdminOverviewPage = () => {
  const { data, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Cargando estadísticas…</div>
      </div>
    );
  }

  const stats = data;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Dashboard SaaS</h1>
        <p className="text-gray-400 text-sm mt-1">Visión global del sistema multitenant</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Building2}  label="Tenants activos"    value={stats?.tenants.active ?? 0}    sub={`${stats?.tenants.total ?? 0} total`} color="blue" />
        <StatCard icon={CreditCard} label="Órdenes totales"    value={stats?.orders.total   ?? 0}    color="purple" />
        <StatCard icon={TrendingUp} label="Ingresos totales"   value={formatPEN(stats?.revenue ?? 0)} color="green" />
        <StatCard icon={CheckCircle2} label="Conversión"       value={`${stats?.conversionRate ?? '0.0'}%`} color="green" />
      </div>

      {/* Órdenes breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <CheckCircle2 size={20} className="text-green-400 shrink-0" />
          <div>
            <p className="text-xl font-bold text-white">{stats?.orders.paid ?? 0}</p>
            <p className="text-xs text-gray-400">Pagos aprobados</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <XCircle size={20} className="text-red-400 shrink-0" />
          <div>
            <p className="text-xl font-bold text-white">{stats?.orders.failed ?? 0}</p>
            <p className="text-xs text-gray-400">Pagos fallidos</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <Users size={20} className="text-blue-400 shrink-0" />
          <div>
            <p className="text-xl font-bold text-white">{stats?.tenants.total ?? 0}</p>
            <p className="text-xs text-gray-400">Tenants registrados</p>
          </div>
        </div>
      </div>

      {/* Pagos recientes */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <h2 className="text-sm font-bold text-white">Pagos recientes (todos los tenants)</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {(stats?.recentPayments ?? []).map((p: Record<string, unknown>) => {
            const tenant = p.tenant as { slug: string; name: string };
            const order  = p.order  as { externalReference: string; description: string };
            return (
              <div key={p.id as string} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">{order.description}</p>
                  <p className="text-xs text-gray-500 font-mono">{order.externalReference}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                    {tenant.name}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">{p.method as string} · {p.status as string}</p>
                </div>
              </div>
            );
          })}
          {(stats?.recentPayments?.length ?? 0) === 0 && (
            <p className="px-5 py-6 text-sm text-gray-500 text-center">No hay pagos registrados</p>
          )}
        </div>
      </div>
    </div>
  );
};
