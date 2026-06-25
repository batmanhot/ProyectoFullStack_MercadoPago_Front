import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, CheckCircle2, XCircle, Key, ExternalLink } from 'lucide-react';
import { useAdminTenants, useCreateTenant } from '@/hooks/useAdmin';
import { Button, Input } from '@/components/ui';

// ============================================================
// ADMIN — Gestión de Tenants
// ============================================================

export const AdminTenantsPage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useAdminTenants();
  const { mutate: create, isPending: creating } = useCreateTenant();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', callbackUrl: '' });

  const tenants = (data ?? []) as Record<string, unknown>[];
  const filtered = tenants.filter((t) =>
    (t.name as string).toLowerCase().includes(search.toLowerCase()) ||
    (t.slug as string).toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create(form, {
      // refetch() omitido: useCreateTenant ya invalida ['admin','tenants'] en onSuccess
      onSuccess: () => { setShowForm(false); setForm({ name: '', slug: '', callbackUrl: '' }); },
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Tenants</h1>
          <p className="text-gray-400 text-sm mt-1">Empresas/apps conectadas al SDK</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<Plus size={15} />}>
          Nuevo Tenant
        </Button>
      </div>

      {/* Formulario nuevo tenant */}
      {showForm && (
        <form onSubmit={handleCreate}
          className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white">Crear nuevo tenant</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" placeholder="Mi Empresa SA" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            <Input label="Slug (identificador)" placeholder="mi-empresa"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} required />
          </div>
          <Input label="Callback URL (opcional)" placeholder="https://mi-app.com/webhooks/mp"
            value={form.callbackUrl}
            onChange={(e) => setForm((p) => ({ ...p, callbackUrl: e.target.value }))} />
          <div className="flex gap-3">
            <Button type="submit" loading={creating}>Crear</Button>
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {/* Buscador */}
      <div className="mb-4">
        <Input leftIcon={<Search size={14} />} placeholder="Buscar tenant…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Tenant</th>
              <th className="px-5 py-3 text-left">API Key</th>
              <th className="px-5 py-3 text-center">Modo MP</th>
              <th className="px-5 py-3 text-center">Usuarios</th>
              <th className="px-5 py-3 text-center">Órdenes</th>
              <th className="px-5 py-3 text-center">Estado</th>
              <th className="px-5 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-500">Cargando…</td></tr>
            )}
            {filtered.map((t) => {
              const count = t._count as { users: number; paymentOrders: number };
              return (
                <tr key={t.id as string} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-white">{t.name as string}</p>
                    <p className="text-xs text-gray-500 font-mono">{t.slug as string}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      {(t.apiKey as string).slice(0, 20)}…
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${t.mpMode === 'production'
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-yellow-900/50 text-yellow-400'}`}>
                      {t.mpMode as string}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-gray-300">{count.users}</td>
                  <td className="px-5 py-3 text-center text-gray-300">{count.paymentOrders}</td>
                  <td className="px-5 py-3 text-center">
                    {t.isActive
                      ? <CheckCircle2 size={16} className="text-green-400 mx-auto" />
                      : <XCircle     size={16} className="text-red-400 mx-auto" />}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => navigate(`/admin/tenants/${t.id}`)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mx-auto"
                    >
                      <ExternalLink size={12} /> Detalle
                    </button>
                  </td>
                </tr>
              );
            })}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-500">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
