import type { ReactNode } from 'react';

// ============================================================
// LAYOUT — Shell principal de la aplicación
// ============================================================

export const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex flex-col">
    {/* Topbar */}
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-black">MP</span>
        </div>
        <span className="text-sm font-semibold text-gray-800">Payment SDK</span>
        <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 
                         px-2 py-0.5 rounded-full font-medium ml-1">
          SANDBOX
        </span>
      </div>
    </header>

    {/* Contenido */}
    <main className="flex-1 flex items-start justify-center p-6 pt-10">
      <div className="w-full max-w-xl">{children}</div>
    </main>

    {/* Footer */}
    <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
      Componente Inyectable de Pagos — Mercado Pago Perú (PEN) — Modo Sandbox
    </footer>
  </div>
);
