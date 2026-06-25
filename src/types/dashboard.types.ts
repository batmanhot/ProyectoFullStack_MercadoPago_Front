// ============================================================
// TYPES — Dashboard / Analytics
// Contratos de los endpoints GET /payments y GET /payments/kpis
// ============================================================

export type DBPaymentStatus =
  | 'PENDING' | 'PROCESSING' | 'APPROVED' | 'AUTHORIZED'
  | 'IN_PROCESS' | 'IN_MEDIATION' | 'REJECTED' | 'CANCELLED'
  | 'REFUNDED' | 'CHARGED_BACK' | 'ERROR';

export type DBOrderStatus =
  | 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export type DBPaymentMethod = 'CARD' | 'YAPE';

// ── Pago en el listado ────────────────────────────────────────
export interface DashboardPayment {
  id: string;
  mpPaymentId: string | null;
  method: DBPaymentMethod;
  status: DBPaymentStatus;
  statusDetail: string | null;
  amount: number;
  currency: string;
  installments: number;
  paymentMethodId: string | null;
  dateApproved: string | null;
  createdAt: string;
  order: {
    externalReference: string;
    description: string;
  };
}

// ── Respuesta paginada ────────────────────────────────────────
export interface PaginatedPayments {
  payments: DashboardPayment[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ── KPIs del tenant ───────────────────────────────────────────
export interface TenantKPIs {
  kpis: {
    total: number;
    paid: number;
    failed: number;
    pending: number;
    conversionRate: number;   // 85.50 — dos decimales, mismo formato que revenue
    revenue: number;          // PEN
    avgTicket: number;        // PEN
  };
  methodBreakdown: Array<{
    method: DBPaymentMethod;
    status: DBPaymentStatus;
    _count: { id: number };
    _sum: { amount: number | null };
  }>;
}

// ── Filtros del listado ───────────────────────────────────────
export interface PaymentFilters {
  page: number;
  limit: number;
  status?: DBPaymentStatus | '';
  method?: DBPaymentMethod | '';
  from?: string;
  to?: string;
}

// ── Respuesta genérica del backend ────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
