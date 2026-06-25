import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { DEV_USERS, type DevUser } from '@/data/devUsers';

// ────────────────────────────────────────────────────────────
// Panel de acceso rápido SOLO en desarrollo (import.meta.env.DEV)
// En producción este componente devuelve null directamente.
// ────────────────────────────────────────────────────────────

interface DevLoginPanelProps {
  onSelect: (tenant: string, email: string, password: string) => void;
}

const ROLE_BADGE: Record<DevUser['role'], string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700',
  ADMIN:       'bg-blue-100 text-blue-700',
  OPERATOR:    'bg-green-100 text-green-700',
};

export const DevLoginPanel = ({ onSelect }: DevLoginPanelProps) => {
  const [open, setOpen] = useState(true);

  // import.meta.env.DEV es una constante de build — nunca cambia en runtime
  if (!import.meta.env.DEV) return null;

  return (
    <div className="mt-3 rounded-xl border border-dashed border-amber-400 bg-amber-50 overflow-hidden">
      {/* Header colapsable */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5
                   text-left hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-amber-500" />
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
            Modo Desarrollo — Usuarios disponibles
          </span>
        </div>
        {open
          ? <ChevronUp size={14} className="text-amber-500" />
          : <ChevronDown size={14} className="text-amber-500" />}
      </button>

      {/* Lista de usuarios */}
      {open && (
        <div className="px-3 pb-3 flex flex-col gap-1.5">
          {DEV_USERS.map((u) => (
            <button
              key={u.email}
              type="button"
              onClick={() => onSelect(u.tenant, u.email, u.password)}
              className="flex items-center justify-between w-full rounded-lg px-3 py-2
                         bg-white border border-amber-200 hover:border-amber-400
                         hover:bg-amber-50 transition-all text-left group"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-gray-800 group-hover:text-amber-800">
                  {u.label}
                </span>
                <span className="text-[11px] font-mono text-gray-500">{u.email}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role]}`}>
                {u.role}
              </span>
            </button>
          ))}
          <p className="text-[10px] text-amber-600 text-center pt-1">
            Clic en un usuario para autocompletar el formulario
          </p>
        </div>
      )}
    </div>
  );
};
