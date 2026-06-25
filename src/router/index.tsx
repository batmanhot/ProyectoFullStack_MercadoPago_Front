import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { DashboardLayout }        from '@/components/layout/DashboardLayout';
import { AdminLayout }            from '@/components/layout/AdminLayout';
import { ProtectedRoute, PublicRoute, SuperAdminRoute } from './guards';
import { useAuthStore } from '@/stores/authStore';
import {
  PaymentPage,
  LoginPage,
  RegisterPage,
  DashboardOverviewPage,
  DashboardPaymentsPage,
  DashboardAnalyticsPage,
  DashboardSettingsPage,
} from '@/pages';
import {
  AdminOverviewPage,
  AdminTenantsPage,
  AdminTenantDetailPage,
  AdminUsersPage,
  AdminPaymentsPage,
  AdminManualPage,
  AdminIntegrationPage,
} from '@/pages/admin';
import { useInitAuth } from '@/hooks';

// ============================================================
// ROUTER — Rutas protegidas por JWT + roles
// ============================================================

const RootRedirect = () => {
  const { user } = useAuthStore();
  return <Navigate to={user?.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'} replace />;
};

const AuthInit = ({ children }: { children: React.ReactNode }) => {
  useInitAuth();
  return <>{children}</>;
};

export const AppRouter = () => (
  <BrowserRouter>
    <AuthInit>
      <Routes>

        {/* ── Rutas públicas ─────────────────────────────── */}
        <Route element={<PublicRoute />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ── Widget de pago (público) ────────────────────── */}
        <Route path="/pay" element={<PaymentPage />} />

        {/* ── Dashboard tenant (ADMIN / OPERATOR) ─────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index            element={<DashboardOverviewPage />} />
            <Route path="payments"  element={<DashboardPaymentsPage />} />
            <Route path="analytics" element={<DashboardAnalyticsPage />} />
            <Route path="settings"  element={<DashboardSettingsPage />} />
          </Route>
        </Route>

        {/* ── Panel Admin SaaS (solo SUPER_ADMIN) ─────────── */}
        <Route element={<SuperAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index             element={<AdminOverviewPage />} />
            <Route path="tenants"    element={<AdminTenantsPage />} />
            <Route path="tenants/:id"  element={<AdminTenantDetailPage />} />
            <Route path="users"       element={<AdminUsersPage />} />
            <Route path="payments"    element={<AdminPaymentsPage />} />
            <Route path="manual"      element={<AdminManualPage />} />
            <Route path="integration" element={<AdminIntegrationPage />} />
          </Route>
        </Route>

        {/* ── Redirects (rol-aware) ───────────────────────── */}
        <Route path="/"  element={<RootRedirect />} />
        <Route path="*"  element={<RootRedirect />} />

      </Routes>
    </AuthInit>
  </BrowserRouter>
);
