// ============================================================
// UTILIDADES — Formatos y validadores para el mercado peruano
// ============================================================

/**
 * Formatea un monto a soles peruanos
 * Ej: 150.5 → "S/ 150.50"
 */
export const formatPEN = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Valida DNI peruano (8 dígitos)
 */
export const isValidDNI = (dni: string): boolean => {
  return /^\d{8}$/.test(dni.trim());
};

/**
 * Valida RUC peruano (11 dígitos, empieza en 10 o 20)
 */
export const isValidRUC = (ruc: string): boolean => {
  return /^(10|20)\d{9}$/.test(ruc.trim());
};

/**
 * Valida email básico
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Genera un external reference único
 * Ej: "ORD-1718200000000-ABC1"
 */
export const generateExternalRef = (prefix = 'ORD'): string => {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
};

/**
 * Mapea código de error de MP a mensaje en español (es-PE)
 */
export const mapMPError = (code: string): string => {
  const errors: Record<string, string> = {
    cc_rejected_bad_filled_card_number: 'Número de tarjeta incorrecto',
    cc_rejected_bad_filled_date: 'Fecha de vencimiento incorrecta',
    cc_rejected_bad_filled_other: 'Datos de tarjeta incorrectos',
    cc_rejected_bad_filled_security_code: 'Código de seguridad incorrecto',
    cc_rejected_blacklist: 'No podemos procesar tu pago',
    cc_rejected_call_for_authorize: 'Debes autorizar el pago con tu banco',
    cc_rejected_card_disabled: 'Tu tarjeta no está habilitada',
    cc_rejected_duplicated_payment: 'Ya realizaste un pago con ese monto',
    cc_rejected_high_risk: 'Tu pago fue rechazado',
    cc_rejected_insufficient_amount: 'Fondos insuficientes',
    cc_rejected_invalid_installments: 'Cuotas no disponibles para esta tarjeta',
    cc_rejected_max_attempts: 'Alcanzaste el límite de intentos',
    cc_rejected_other_reason: 'Tu banco rechazó el pago',
    pending_contingency: 'Pago en proceso — te notificaremos pronto',
    pending_review_manual: 'Tu pago está siendo revisado',
  };
  return errors[code] ?? 'Ocurrió un error al procesar el pago';
};

/**
 * Trunca texto con elipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Formatea fecha ISO a formato peruano
 * Ej: "2024-01-15T10:30:00Z" → "15/01/2024 10:30"
 */
export const formatDatePE = (isoDate: string): string => {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
};
