import { useState } from 'react';
import { Search, UserCheck, UserX, Plus } from 'lucide-react';
import { useAdminUsers, useToggleUser, useAdminTenants, useCreateAdminUser } from '@/hooks/useAdmin';
import { Button, Input } from '@/components/ui';

// ============================================================
// ADMIN — Gestión global de usuarios (cross-tenant)
// ============================================================

export const AdminUsersPage = () => {
  const { data, isLoading } = useAdminUsers();
  const { data: tenantsData } = useAdminTenants();
  const { mutate: toggle } = useToggleUser();
  const { mutate: create, isPending: creating } = useCreateAdminUser();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tenantId: '', email: '', name: '', password: '', role: 'ADMIN' });

  const users   = (data?.users   ?? []) as Record<string, unknown>[];
  const tenants = (tenantsData   ?? []) as Record<string, unknown>[];

  const filtered = users.filter((u) =>
    (u.email as string).toLowerCase().includes(search.toLowerCase()) ||
    (u.name  as string).toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create(form, {
      // refetch() omitido: useCreateAdminUser ya invalida ['admin','users'] en onSuccess
      onSuccess: () => { setShowForm(false); setForm({ tenantId: '', email: '', name: '', password: '', role: 'ADMIN' }); },
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Usuarios</h1>
          <p className="text-gray-400 text-sm mt-1">Todos los usuarios del sistema</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<Plus size={15} />}>Nuevo usuario</Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate}
          className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white">Crear usuario</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Tenant</label>
              <select value={form.tenantId}
                onChange={(e) => setForm((p) => ({ ...p, tenantId: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2.5 text-sm">
                <option value="">Seleccionar tenant…</option>
                {tenants.map((t) => (
                  <option key={t.id as string} value={t.id as string}>{t.name as string}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Rol</label>
              <select value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2.5 text-sm">
                <option value="ADMIN">ADMIN</option>
                <option value="OPERATOR">OPERATOR</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            <Input label="Email" type="email" value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
          <Input label="Contraseña inicial" type="password" value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
          <div className="flex gap-3">
            <Button type="submit" loading={creating}>Crear</Button>
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <Input leftIcon={<Search size={14} />} placeholder="Buscar por nombre o email…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Usuario</th>
              <th className="px-5 py-3 text-left">Tenant</th>
              <th className="px-5 py-3 text-center">Rol</th>
              <th className="px-5 py-3 text-center">Estado</th>
              <th className="px-5 py-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500">Cargando…</td></tr>
            )}
            {filtered.map((u) => {
              const tenant = u.tenant as { slug: string; name: string };
              return (
                <tr key={u.id as string} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-white">{u.name as string}</p>
                    <p className="text-xs text-gray-500">{u.email as string}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                      {tenant.name}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${u.role === 'SUPER_ADMIN' ? 'bg-red-900/50 text-red-400'
                      : u.role === 'ADMIN'       ? 'bg-blue-900/50 text-blue-400'
                                                  : 'bg-green-900/50 text-green-400'}`}>
                      {u.role as string}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {u.isActive
                      ? <UserCheck size={16} className="text-green-400 mx-auto" />
                      : <UserX    size={16} className="text-red-400 mx-auto"   />}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => toggle(u.id as string)}
                      className={`text-xs font-medium transition-colors
                        ${u.isActive
                          ? 'text-red-400 hover:text-red-300'
                          : 'text-green-400 hover:text-green-300'}`}>
                      {u.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
