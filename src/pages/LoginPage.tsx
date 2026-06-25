import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, Lock, Building2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { DevLoginPanel } from '@/components/auth/DevLoginPanel';
import { useLogin } from '@/hooks';

// ============================================================
// PAGE — Login
// ============================================================

export const LoginPage = () => {
  const { mutate: login, isPending } = useLogin();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    tenantSlug: 'demo-store',
    email:      '',
    password:   '',
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(form);
  };

  const handleDevSelect = (tenant: string, email: string, password: string) => {
    setForm({ tenantSlug: tenant, email, password });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-black">MP</span>
          </div>
          <h1 className="text-xl font-black text-gray-900">Payment SDK</h1>
          <p className="text-sm text-gray-500">Mercado Pago Perú · Panel de Control</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Tenant"
              leftIcon={<Building2 size={15} />}
              placeholder="demo-store"
              value={form.tenantSlug}
              onChange={(e) => set('tenantSlug', e.target.value)}
              hint="Identificador de tu organización"
              required
            />
            <Input
              label="Correo electrónico"
              type="email"
              leftIcon={<Mail size={15} />}
              placeholder="admin@demo-store.pe"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pl-9 pr-9 text-sm
                             bg-white text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             hover:border-gray-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mt-1" loading={isPending}>
              Ingresar
            </Button>
          </form>

          <p className="text-xs text-center text-gray-500 mt-4">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Regístrate
            </Link>
          </p>
        </div>

        {/* Panel de usuarios — solo visible en desarrollo */}
        {import.meta.env.DEV && (
          <DevLoginPanel onSelect={handleDevSelect} />
        )}

        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
          <ShieldCheck size={13} className="text-green-500" />
          Sesión protegida con JWT + Refresh Token
        </div>
      </div>
    </div>
  );
};
