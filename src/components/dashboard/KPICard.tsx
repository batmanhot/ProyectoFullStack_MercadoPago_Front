import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Spinner } from '@/components/ui';

// ============================================================
// DASHBOARD — KPI Card
// ============================================================

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: number;        // porcentaje, positivo o negativo
  loading?: boolean;
  children?: ReactNode;
}

export const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
  trend,
  loading = false,
  children,
}: KPICardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm">
    <div className="flex items-start justify-between">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>

    {loading ? (
      <div className="flex items-center gap-2 h-9">
        <Spinner size="sm" />
        <span className="text-xs text-gray-400">Cargando...</span>
      </div>
    ) : (
      <div>
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    )}

    {trend !== undefined && !loading && (
      <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        {trend >= 0
          ? <TrendingUp size={13} />
          : <TrendingDown size={13} />
        }
        <span>{Math.abs(trend)}% vs periodo anterior</span>
      </div>
    )}

    {children}
  </div>
);
