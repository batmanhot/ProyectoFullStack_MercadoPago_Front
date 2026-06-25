// ============================================================
// CONTRATOS DE DATOS — según documento de especificación técnica
// Componente Inyectable de Pagos — Mercado Pago Perú
// ============================================================

export type PaymentMethod = 'card' | 'yape';

export type PaymentStatus =
  | 'idle'
  | 'pending'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'error';

export type IdentificationType = 'DNI' | 'CE' | 'RUC' | 'PASSPORT';

// ── Entrada del componente (Props desde la app cliente) ──────
export interface PaymentConfig {
  publicKey: string;
  apiKey: string;
  transaction: {
    amount: number;
    currency: 'PEN';
    description: string;
    externalReference: string;
  };
  payer: {
    email: string;
    phone?: string;
    identification: {
      type: IdentificationType;
      number: string;
    };
  };
  customization?: {
    theme?:           'default' | 'dark';
    locale?:          'es-PE';
    maxInstallments?: number;
  };
}

// ── Callbacks de salida del componente ───────────────────────
export interface PaymentCallbacks {
  onPaymentSuccess: (data: PaymentSuccessData) => void;
  onPaymentError: (error: PaymentErrorData) => void;
  onComponentReady?: () => void;
}

// ── Respuesta de éxito ───────────────────────────────────────
export interface PaymentSuccessData {
  paymentId: string;
  status: 'approved';
  statusDetail: string;
  amount: number;
  currency: 'PEN';
  paymentMethodId: string;
  externalReference: string;
  dateApproved: string;
}

// ── Respuesta de error ───────────────────────────────────────
export interface PaymentErrorData {
  code: string;
  message: string;
  cause?: string;
  status?: number;
}

// ── Datos crudos de tarjeta (sandbox — tokenización server-side) ─
export interface RawCardData {
  cardNumber:           string;
  cardholderName:       string;
  expirationMonth:      string;
  expirationYear:       number;
  securityCode:         string;
  identificationType:   IdentificationType;
  identificationNumber: string;
}

// ── Request al backend POST /api/v1/payments/card ────────────
// Producción: enviar `token`  |  Sandbox: enviar `rawCard`
export interface CardPaymentRequest {
  token?:            string;
  rawCard?:          RawCardData;
  transactionAmount: number;
  description:       string;
  installments:      number;
  paymentMethodId:   string;
  issuerId?:         string;
  payer: {
    email: string;
    identification: {
      type: IdentificationType;
      number: string;
    };
  };
  externalReference: string;
}

// ── Request al backend POST /api/v1/payments/yape ────────────
export interface YapePaymentRequest {
  transactionAmount: number;
  description: string;
  externalReference: string;
  payer: {
    email: string;
    phone?: string;
    identification: {
      type: IdentificationType;
      number: string;
    };
  };
}

// ── Respuesta del backend (Yape) ─────────────────────────────
export interface YapePaymentResponse {
  paymentId:       string;
  internalId?:     string;
  status:          PaymentStatus;
  qrCode?:         string;
  qrCodeBase64?:   string;
  ticketUrl?:      string;
  expiresAt?:      string;
  sandboxMock?:    boolean;
}

// ── Respuesta del endpoint GET /payments/:id/status (polling) ─
// El status puede ser cualquier valor que devuelve MP:
// 'approved', 'rejected', 'in_process', 'pending', etc.
export interface PaymentStatusData {
  paymentId: string;
  status: string;
  statusDetail?: string | null;
  amount?: number | null;
  currency?: 'PEN';
  paymentMethodId?: string | null;
  externalReference?: string | null;
  dateApproved?: string | null;
}

// ── Respuesta del backend (Card) ─────────────────────────────
export interface CardPaymentResponse {
  paymentId:         string;
  status:            PaymentStatus;
  statusDetail:      string;
  amount:            number;
  paymentMethodId:   string | null;
  externalReference: string;
}

// ── Estado global del store (Zustand) ────────────────────────
export interface PaymentStore {
  config: PaymentConfig | null;
  status: PaymentStatus;
  selectedMethod: PaymentMethod | null;
  successData: PaymentSuccessData | null;
  errorData: PaymentErrorData | null;
  isSdkReady: boolean;

  setConfig: (config: PaymentConfig) => void;
  setStatus: (status: PaymentStatus) => void;
  setSelectedMethod: (method: PaymentMethod | null) => void;
  setSuccessData: (data: PaymentSuccessData) => void;
  setErrorData: (error: PaymentErrorData) => void;
  setSdkReady: (ready: boolean) => void;
  reset: () => void;
}
