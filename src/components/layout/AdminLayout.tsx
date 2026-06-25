import { NavLink, Outlet, useNavigate } from 'react-router';
import {
  LayoutDashboard, Building2, Users, CreditCard,
  LogOut, ShieldAlert, ChevronRight, BookOpen, Plug,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks';

// ============================================================
// LAYOUT — Panel de Administración SaaS (solo SUPER_ADMIN)
// ============================================================

const NAV = [
  { to: '/admin',             icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/admin/tenants',     icon: Building2,       label: 'Tenants'                },
  { to: '/admin/users',       icon: Users,           label: 'Usuarios'               },
  { to: '/admin/payments',    icon: CreditCard,      label: 'Pagos'                  },
];

const NAV_DOCS = [
  { to: '/admin/manual',      icon: BookOpen,        label: 'Manual'                 },
  { to: '/admin/integration', icon: Plug,            label: 'Integración'            },
];

export const AdminLayout = () => {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => { logout(undefined, { onSuccess: () => navigate('/login') }); };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex flex-col border-r border-gray-800 bg-gray-900 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <ShieldAlert size={16} />
          </div>
          <div>
            <p className="text-sm font-black leading-none">Admin SaaS</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Payment SDK</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest px-3 mb-1">Gestión</p>
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                   : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
              }
            >
              <Icon size={16} />
              {label}
              <ChevronRight size={12} className="ml-auto opacity-40" />
            </NavLink>
          ))}

          <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest px-3 mt-4 mb-1">Documentación</p>
          {NAV_DOCS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                   : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
              }
            >
              <Icon size={16} />
              {label}
              <ChevronRight size={12} className="ml-auto opacity-40" />
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 mb-2">
            <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user?.name ?? 'Super Admin'}</p>
              <p className="text-[10px] text-red-400 font-mono">SUPER_ADMIN</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm
                       text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido ── */}
      <main className="flex-1 overflow-y-auto bg-gray-950">
        <Outlet />
      </main>
    </div>
  );
};
