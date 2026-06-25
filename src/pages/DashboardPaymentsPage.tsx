import { PaymentsTable } from '@/components/dashboard/PaymentsTable';

// ============================================================
// PAGE — Transacciones (listado completo con filtros)
// ============================================================

export const DashboardPaymentsPage = () => (
  <div className="flex flex-col gap-5">
    <div>
      <h1 className="text-xl font-black text-gray-900">Transacciones</h1>
      <p className="text-sm text-gray-500 mt-0.5">
        Historial completo de pagos con filtros y paginación
      </p>
    </div>
    <PaymentsTable />
  </div>
);
