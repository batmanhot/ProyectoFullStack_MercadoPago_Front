import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, Lock, Building2, User, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useRegister } from '@/hooks';

// ============================================================
// PAGE — Register
// ============================================================

export const RegisterPage = () => {
  const { mutate: register, isPending } = useRegister();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    tenantSlug: '',
    email:      '',
    password:   '',
    name:       '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.tenantSlug) e.tenantSlug = 'El tenant es requerido';
    if (!form.name)       e.name       = 'El nombre es requerido';
    if (!form.email)      e.email      = 'El correo es requerido';
    if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(form.password)) e.password = 'Debe incluir una mayúscula';
    if (!/[0-9]/.test(form.password)) e.password = 'Debe incluir un número';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) register(form);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-black">MP</span>
          </div>
          <h1 className="text-xl font-black text-gray-900">Payment SDK</h1>
          <p className="text-sm text-gray-500">Crear cuenta de operador</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Registrarse</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Tenant"
              leftIcon={<Building2 size={15} />}
              placeholder="demo-store"
              value={form.tenantSlug}
              onChange={(e) => set('tenantSlug', e.target.value)}
              error={errors.tenantSlug}
              hint="Identificador de tu organización"
              required
            />
            <Input
              label="Nombre completo"
              leftIcon={<User size={15} />}
              placeholder="Juan Pérez"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              error={errors.name}
              required
            />
            <Input
              label="Correo electrónico"
              type="email"
              leftIcon={<Mail size={15} />}
              placeholder="juan@empresa.pe"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              error={errors.email}
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
                  placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pl-9 pr-9 text-sm
                             bg-white text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             hover:border-gray-400 transition-colors"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full mt-1" loading={isPending}>
              Crear cuenta
            </Button>
          </form>

          <p className="text-xs text-center text-gray-500 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
