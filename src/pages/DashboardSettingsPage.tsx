import { useState } from 'react';
import { User, Lock, Shield, Users, Key, CheckCircle2 } from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { RequireRole } from '@/router/guards';
import { useAuthStore } from '@/stores/authStore';
import { useChangePassword, useLogout } from '@/hooks';
import { authApi } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { formatDatePE } from '@/utils/helpers';

// ============================================================
// PAGE — Configuración (Fase 4: funcional)
// ============================================================

export const DashboardSettingsPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-black text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gestión de tu cuenta y tenant</p>
      </div>

      <ProfileSection />
      <ChangePasswordSection />
      <RequireRole roles={['ADMIN', 'SUPER_ADMIN']}>
        <UsersSection tenantName={user?.tenantName ?? ''} />
      </RequireRole>
      <TenantInfoSection />
    </div>
  );
};

// ── Perfil ────────────────────────────────────────────────────
const ProfileSection = () => {
  const { user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN:       'Administrador',
    OPERATOR:    'Operador',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <User size={16} className="text-blue-600" />
        <h2 className="text-sm font-bold text-gray-900">Mi perfil</h2>
      </div>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <span className="text-lg font-black text-blue-600">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="info">{roleLabel[user?.role ?? ''] ?? user?.role}</Badge>
              <Badge variant="neutral">{user?.tenantName}</Badge>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" loading={isPending} onClick={() => logout()}>
          Cerrar sesión
        </Button>
      </div>
      {user?.lastLoginAt && (
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <CheckCircle2 size={11} className="text-green-500" />
          Último acceso: {formatDatePE(user.lastLoginAt)}
        </p>
      )}
    </div>
  );
};

// ── Cambiar contraseña ────────────────────────────────────────
const ChangePasswordSection = () => {
  const { mutate: changePass, isPending, isSuccess } = useChangePassword();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.next.length < 8)          return setError('Mínimo 8 caracteres');
    if (form.next !== form.confirm)    return setError('Las contraseñas no coinciden');
    if (!/[A-Z]/.test(form.next))      return setError('Debe incluir una mayúscula');
    if (!/[0-9]/.test(form.next))      return setError('Debe incluir un número');
    changePass({ current: form.current, next: form.next });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={16} className="text-blue-600" />
        <h2 className="text-sm font-bold text-gray-900">Cambiar contraseña</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input label="Contraseña actual" type="password" required
          value={form.current} onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))} />
        <Input label="Nueva contraseña" type="password" required
          hint="Mínimo 8 caracteres, 1 mayúscula, 1 número"
          value={form.next} onChange={(e) => setForm((p) => ({ ...p, next: e.target.value }))} />
        <Input label="Confirmar nueva contraseña" type="password" required
          error={error}
          value={form.confirm} onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} />
        <Button type="submit" variant="secondary" size="sm" loading={isPending} className="self-start">
          Actualizar contraseña
        </Button>
      </form>
    </div>
  );
};

// ── Usuarios del tenant (solo ADMIN) ──────────────────────────
const UsersSection = ({ tenantName }: { tenantName: string }) => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['auth', 'users'],
    queryFn:  authApi.listUsers,
    staleTime: 60_000,
  });

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
    ADMIN:       'bg-blue-50 text-blue-700 border-blue-200',
    OPERATOR:    'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <Users size={16} className="text-blue-600" />
        <div>
          <h2 className="text-sm font-bold text-gray-900">Usuarios del tenant</h2>
          <p className="text-xs text-gray-500">{tenantName}</p>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['Nombre', 'Email', 'Rol', 'Estado', 'Último acceso'].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading ? (
            <tr><td colSpan={5} className="px-4 py-6 text-center text-xs text-gray-400">Cargando...</td></tr>
          ) : users?.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-xs font-medium text-gray-800">{u.name}</td>
              <td className="px-4 py-3 text-xs text-gray-500">{u.email}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleColors[u.role]}`}>
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  u.isActive
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {u.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-400">
                {u.lastLoginAt ? formatDatePE(u.lastLoginAt) : 'Nunca'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Info del tenant ───────────────────────────────────────────
const TenantInfoSection = () => {
  const { user } = useAuthStore();
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} className="text-blue-600" />
        <h2 className="text-sm font-bold text-gray-900">Información del tenant</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Nombre',   value: user?.tenantName },
          { label: 'Tenant ID', value: user?.tenantId },
          { label: 'Entorno',  value: 'Sandbox' },
          { label: 'Moneda',   value: 'PEN — Soles peruanos' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-lg px-3 py-2.5">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-xs font-mono text-gray-800 mt-0.5 truncate">{value ?? '—'}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
        <Key size={13} className="text-yellow-600 mt-0.5 shrink-0" />
        <p className="text-xs text-yellow-700">
          Para acceder a las credenciales de producción de Mercado Pago, ve a{' '}
          <a href="https://www.mercadopago.com.pe/developers/panel" target="_blank" rel="noreferrer"
            className="underline font-medium">
            mercadopago.com.pe/developers
          </a>
        </p>
      </div>
    </div>
  );
};
