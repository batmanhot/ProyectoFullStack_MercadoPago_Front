import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import type { TenantKPIs, DBPaymentMethod } from '@/types';
import { Spinner } from '@/components/ui';
import { formatPEN } from '@/utils/helpers';

// ============================================================
// DASHBOARD — Gráficas con Recharts
// ============================================================

// ── Paleta de colores ─────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  APPROVED:     '#22c55e',
  REJECTED:     '#ef4444',
  PENDING:      '#f59e0b',
  IN_PROCESS:   '#3b82f6',
  CANCELLED:    '#6b7280',
  REFUNDED:     '#8b5cf6',
  ERROR:        '#dc2626',
  IN_MEDIATION: '#f97316',
  CHARGED_BACK: '#ec4899',
};

const METHOD_COLORS: Record<DBPaymentMethod, string> = {
  CARD: '#3b82f6',
  YAPE: '#8b5cf6',
};

// ── Donut: distribución de métodos de pago ─────────────────
interface MethodDonutProps {
  data: TenantKPIs['methodBreakdown'];
  loading: boolean;
}

export const MethodDonut = ({ data, loading }: MethodDonutProps) => {
  if (loading) return <ChartSkeleton height={220} />;

  // Agrupar por método (suma de todos los estados)
  const grouped = data.reduce<Record<string, number>>((acc, item) => {
    acc[item.method] = (acc[item.method] ?? 0) + (item._count?.id ?? 0);
    return acc;
  }, {});

  const chartData = Object.entries(grouped).map(([method, count]) => ({
    name: method === 'CARD' ? 'Tarjeta' : 'Yape',
    value: count,
    method: method as DBPaymentMethod,
  }));

  if (chartData.length === 0) return <EmptyChart label="Sin datos de métodos" />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.method} fill={METHOD_COLORS[entry.method]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value} transacciones`, '']}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ── Barras: estados de pago ────────────────────────────────
interface StatusBarsProps {
  data: TenantKPIs['methodBreakdown'];
  loading: boolean;
}

export const StatusBars = ({ data, loading }: StatusBarsProps) => {
  if (loading) return <ChartSkeleton height={220} />;

  // Agrupar por status
  const grouped = data.reduce<Record<string, { count: number; amount: number }>>((acc, item) => {
    if (!acc[item.status]) acc[item.status] = { count: 0, amount: 0 };
    acc[item.status].count  += item._count?.id ?? 0;
    acc[item.status].amount += Number(item._sum?.amount ?? 0);
    return acc;
  }, {});

  const chartData = Object.entries(grouped)
    .map(([status, vals]) => ({
      status,
      label: STATUS_LABEL[status] ?? status,
      transacciones: vals.count,
      monto: vals.amount,
      fill: STATUS_COLORS[status] ?? '#6b7280',
    }))
    .sort((a, b) => b.transacciones - a.transacciones);

  if (chartData.length === 0) return <EmptyChart label="Sin datos de estados" />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value: number, name: string) =>
            name === 'transacciones' ? [value, 'Transacciones'] : [formatPEN(value), 'Monto']
          }
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="transacciones" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ── Barras: revenue por método ────────────────────────────
interface RevenueByMethodProps {
  data: TenantKPIs['methodBreakdown'];
  loading: boolean;
}

export const RevenueByMethod = ({ data, loading }: RevenueByMethodProps) => {
  if (loading) return <ChartSkeleton height={180} />;

  const grouped = data
    .filter((d) => d.status === 'APPROVED')
    .reduce<Record<string, number>>((acc, item) => {
      acc[item.method] = (acc[item.method] ?? 0) + Number(item._sum?.amount ?? 0);
      return acc;
    }, {});

  const chartData = Object.entries(grouped).map(([method, amount]) => ({
    method: method === 'CARD' ? 'Tarjeta' : 'Yape',
    monto: amount,
    fill: METHOD_COLORS[method as DBPaymentMethod],
  }));

  if (chartData.length === 0) return <EmptyChart label="Sin ingresos registrados" />;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="method" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `S/${v}`} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(v: number) => [formatPEN(v), 'Revenue']}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="monto" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ── Helpers internos ─────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  APPROVED:     'Aprobados',
  REJECTED:     'Rechazados',
  PENDING:      'Pendientes',
  IN_PROCESS:   'En proceso',
  CANCELLED:    'Cancelados',
  REFUNDED:     'Devueltos',
  ERROR:        'Error',
  IN_MEDIATION: 'Mediación',
  CHARGED_BACK: 'Contracargo',
};

const ChartSkeleton = ({ height }: { height: number }) => (
  <div
    className="w-full rounded-lg bg-gray-100 animate-pulse"
    style={{ height }}
  />
);

const EmptyChart = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center text-sm text-gray-400 py-10">
    {label}
  </div>
);
