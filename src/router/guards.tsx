import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { Spinner } from '@/components/ui';
import type { AuthUser } from '@/types';

// ============================================================
// GUARDS — Protección de rutas por auth y rol
// ============================================================

// ── Ruta que requiere autenticación (solo tenant users) ──────
export const ProtectedRoute = () => {
  const { isAuth, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;
  // SUPER_ADMIN no usa el dashboard de tenant — va a su panel
  if (user?.role === 'SUPER_ADMIN') return <Navigate to="/admin" replace />;
  return <Outlet />;
};

// ── Ruta que requiere rol mínimo ──────────────────────────────
export const RequireRole = ({
  roles,
  children,
}: {
  roles: AuthUser['role'][];
  children: React.ReactNode;
}) => {
  const { user } = useAuthStore();
  if (!user || !roles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-lg font-bold text-gray-700">Acceso restringido</p>
        <p className="text-sm text-gray-400">No tienes permisos para ver esta sección</p>
      </div>
    );
  }
  return <>{children}</>;
};

// ── Ruta exclusiva para SUPER_ADMIN ──────────────────────────
export const SuperAdminRoute = () => {
  const { isAuth, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white gap-3">
        <p className="text-2xl font-black">403</p>
        <p className="text-gray-400">Solo accesible para Super Admin</p>
        <a href="/dashboard" className="text-blue-400 text-sm hover:underline">Ir al dashboard</a>
      </div>
    );
  }

  return <Outlet />;
};

// ── Ruta pública (redirige según rol si ya está autenticado) ──
export const PublicRoute = () => {
  const { isAuth, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuth) return <Outlet />;
  return <Navigate to={user?.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'} replace />;
};
