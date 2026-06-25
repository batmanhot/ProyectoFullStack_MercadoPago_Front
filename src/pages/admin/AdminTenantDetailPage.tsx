import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Key, Save, RefreshCw, Globe, Shield, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAdminTenantDetail, useUpdateTenant, useRegenerateKey } from '@/hooks/useAdmin';
import { Button, Input } from '@/components/ui';
import type { AdminTenantDetail } from '@/api/admin.api';

// ============================================================
// ADMIN — Detalle y configuración de un tenant
// ============================================================

// Campo de credencial con show/hide — no pre-rellena el valor real del backend
const TokenField = ({
  label, placeholder, value, show, onChange, onToggleShow,
}: {
  label: string; placeholder: string; value: string; show: boolean;
  onChange: (v: string) => void; onToggleShow: () => void;
}) => (
  <div>
    <label className="text-xs font-medium text-gray-400 mb-1.5 block">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs px-3 py-2 rounded-lg
          placeholder:text-gray-600 focus:outline-none focus:border-blue-500 font-mono"
      />
      <button type="button" onClick={onToggleShow}
        className="p-2 text-gray-500 hover:text-gray-300 transition-colors">
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  </div>
);

export const AdminTenantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useAdminTenantDetail(id!);
  const { mutate: update, isPending: saving } = useUpdateTenant(id!);
  const { mutate: regen, isPending: regenPending } = useRegenerateKey(id!);

  const tenant = data as AdminTenantDetail | undefined;

  // Campos no sensibles (nombre, modo, callbackUrl)
  const [cfg, setCfg]     = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Campos de tokens — siempre vacíos al cargar (vacío = "no modificar")
  const [tokens, setTokens] = useState({
    mpAccessTokenSandbox: '', mpPublicKeySandbox:   '',
    mpAccessTokenProd:    '', mpPublicKeyProd:       '',
  });
  const [showTokens, setShowTokens] = useState({
    mpAccessTokenSandbox: false, mpPublicKeySandbox:   false,
    mpAccessTokenProd:    false, mpPublicKeyProd:       false,
  });

  const set = (k: string, v: string) => { setCfg((p) => ({ ...p, [k]: v })); setDirty(true); };
  const setToken = (k: keyof typeof tokens, v: string) => { setTokens((p) => ({ ...p, [k]: v })); setDirty(true); };
  const toggleShowToken = (k: keyof typeof showTokens) => setShowTokens((p) => ({ ...p, [k]: !p[k] }));

  const val = (key: string) =>
    key in cfg ? cfg[key] : ((tenant?.[key as keyof AdminTenantDetail] as string) ?? '');

  const handleSave = () => {
    // Solo enviar tokens que el usuario haya escrito (vacío = mantener el actual)
    const tokenUpdates = Object.fromEntries(
      Object.entries(tokens).filter(([, v]) => v.trim() !== '')
    );
    update({ ...cfg, ...tokenUpdates }, { onSuccess: () => { setDirty(false); refetch(); } });
  };

  const handleRegen = () => {
    if (confirm('¿Regenerar la API key? Las integraciones existentes dejarán de funcionar.')) {
      regen(undefined, { onSuccess: () => refetch() });
    }
  };

  if (isLoading || !tenant) {
    return <div className="p-8 text-gray-400 text-sm">Cargando…</div>;
  }

  return (
    <div className="p-8 max-w-3xl">
      <button onClick={() => navigate('/admin/tenants')}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Volver a tenants
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">{tenant.name as string}</h1>
          <p className="text-gray-400 text-sm font-mono mt-1">/{tenant.slug as string}</p>
        </div>
        {dirty && (
          <Button onClick={handleSave} loading={saving} icon={<Save size={14} />}>
            Guardar cambios
          </Button>
        )}
      </div>

      {/* API Key */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Key size={16} className="text-yellow-400" />
          <h2 className="text-sm font-bold text-white">API Key</h2>
        </div>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-gray-800 text-green-400 text-xs px-3 py-2 rounded-lg font-mono break-all">
            {showKey
              ? (tenant.apiKey as string)
              : `${(tenant.apiKey as string).slice(0, 8)}${'•'.repeat(24)}`}
          </code>
          <Button variant="secondary" size="sm" onClick={() => setShowKey((v) => !v)}
            icon={showKey ? <EyeOff size={13} /> : <Eye size={13} />}>
            {showKey ? 'Ocultar' : 'Mostrar'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleRegen} loading={regenPending}
            icon={<RefreshCw size={13} />}>
            Regenerar
          </Button>
        </div>
      </section>

      {/* Integración externa */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-blue-400" />
          <h2 className="text-sm font-bold text-white">Integración con app externa</h2>
        </div>
        <Input label="Callback URL"
          placeholder="https://tu-app.com/webhooks/mp"
          value={val('callbackUrl')}
          onChange={(e) => set('callbackUrl', e.target.value)}
          hint="El backend notificará esta URL cuando un pago sea confirmado" />
      </section>

      {/* Credenciales Mercado Pago */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-green-400" />
          <h2 className="text-sm font-bold text-white">Mercado Pago</h2>
        </div>

        {/* Modo */}
        <div className="mb-5">
          <label className="text-xs font-medium text-gray-400 mb-2 block">Modo activo</label>
          <div className="flex gap-3">
            {(['sandbox', 'production'] as const).map((mode) => (
              <button key={mode} type="button"
                onClick={() => set('mpMode', mode)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all
                  ${val('mpMode') === mode
                    ? mode === 'production'
                      ? 'bg-green-600/20 border-green-600 text-green-400'
                      : 'bg-yellow-600/20 border-yellow-600 text-yellow-400'
                    : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'}`}>
                {mode === 'sandbox' ? '🧪 Sandbox' : '🚀 Producción'}
              </button>
            ))}
          </div>
        </div>

        {/* Helper */}
        <p className="text-xs text-gray-500 mb-4">
          Deja en blanco los campos que no quieras modificar — el valor actual se conserva.
        </p>

        {/* Sandbox */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Sandbox</p>
            {tenant?.mpSandboxConfigured
              ? <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle2 size={11} /> Configurado</span>
              : <span className="flex items-center gap-1 text-xs text-yellow-500"><AlertTriangle size={11} /> Sin configurar</span>}
          </div>
          <div className="grid grid-cols-1 gap-3">
            <TokenField
              label="Access Token Sandbox"
              placeholder={tenant?.mpAccessTokenSandbox ?? 'TEST-xxxx...'}
              value={tokens.mpAccessTokenSandbox}
              show={showTokens.mpAccessTokenSandbox}
              onChange={(v) => setToken('mpAccessTokenSandbox', v)}
              onToggleShow={() => toggleShowToken('mpAccessTokenSandbox')}
            />
            <TokenField
              label="Public Key Sandbox"
              placeholder={tenant?.mpPublicKeySandbox ?? 'APP_USR-xxxx...'}
              value={tokens.mpPublicKeySandbox}
              show={showTokens.mpPublicKeySandbox}
              onChange={(v) => setToken('mpPublicKeySandbox', v)}
              onToggleShow={() => toggleShowToken('mpPublicKeySandbox')}
            />
          </div>
        </div>

        {/* Producción */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Producción</p>
            {tenant?.mpProdConfigured
              ? <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle2 size={11} /> Configurado</span>
              : <span className="flex items-center gap-1 text-xs text-yellow-500"><AlertTriangle size={11} /> Sin configurar</span>}
          </div>
          <div className="grid grid-cols-1 gap-3">
            <TokenField
              label="Access Token Producción"
              placeholder={tenant?.mpAccessTokenProd ?? 'APP_USR-xxxx...'}
              value={tokens.mpAccessTokenProd}
              show={showTokens.mpAccessTokenProd}
              onChange={(v) => setToken('mpAccessTokenProd', v)}
              onToggleShow={() => toggleShowToken('mpAccessTokenProd')}
            />
            <TokenField
              label="Public Key Producción"
              placeholder={tenant?.mpPublicKeyProd ?? 'APP_USR-xxxx...'}
              value={tokens.mpPublicKeyProd}
              show={showTokens.mpPublicKeyProd}
              onChange={(v) => setToken('mpPublicKeyProd', v)}
              onToggleShow={() => toggleShowToken('mpPublicKeyProd')}
            />
          </div>
        </div>
      </section>

      {/* Usuarios del tenant */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-bold text-white">Usuarios ({(tenant.users as unknown[]).length})</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {(tenant.users as Record<string, unknown>[]).map((u) => (
            <div key={u.id as string} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-white">{u.name as string}</p>
                <p className="text-xs text-gray-500">{u.email as string}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                ${u.role === 'ADMIN'    ? 'bg-blue-900/50 text-blue-400'
                : u.role === 'OPERATOR' ? 'bg-green-900/50 text-green-400'
                                        : 'bg-gray-800 text-gray-400'}`}>
                {u.role as string}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
