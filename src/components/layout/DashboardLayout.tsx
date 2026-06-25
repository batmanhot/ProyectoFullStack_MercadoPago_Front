import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import {
  LayoutDashboard, CreditCard, BarChart3,
  Settings, Menu, X, Wallet, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks';

// ============================================================
// LAYOUT — Dashboard con sidebar + info de usuario
// ============================================================

const NAV_ITEMS = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Resumen' },
  { to: '/dashboard/payments',  icon: CreditCard,      label: 'Transacciones' },
  { to: '/dashboard/analytics', icon: BarChart3,       label: 'Analítica' },
  { to: '/pay',                 icon: Wallet,          label: 'Demo Pago' },
  { to: '/dashboard/settings',  icon: Settings,        label: 'Configuración' },
];

export const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user }                  = useAuthStore();
  const { mutate: logout, isPending } = useLogout();

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={[
        'flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-200 shrink-0',
        collapsed ? 'w-16' : 'w-56',
      ].join(' ')}>

        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-gray-100 gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black">MP</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 leading-none">PaySDK</p>
              <p className="text-xs text-gray-400 mt-0.5">Mercado Pago PE</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) => [
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-100',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              ].join(' ')}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        {!collapsed && user && (
          <div className="mx-3 mb-2 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <button
              onClick={() => logout()}
              disabled={isPending}
              className="flex items-center gap-1.5 mt-2 text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              <LogOut size={11} />
              {isPending ? 'Cerrando…' : 'Cerrar sesión'}
            </button>
          </div>
        )}

        {/* Collapse + sandbox badge */}
        <div className="flex flex-col gap-2 p-3">
          {!collapsed && (
            <div className="px-2 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-medium text-yellow-700 text-center">SANDBOX</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors self-start"
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Panel de Control</p>
            <p className="text-xs text-gray-400">{user?.tenantName ?? 'Demo'} · Sandbox</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
