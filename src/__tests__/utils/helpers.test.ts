import { describe, it, expect } from 'vitest';
import {
  formatPEN,
  isValidDNI,
  isValidRUC,
  isValidEmail,
  generateExternalRef,
  mapMPError,
  truncate,
  formatDatePE,
} from '@/utils/helpers';

// ── formatPEN ─────────────────────────────────────────────────

describe('formatPEN', () => {
  it('incluye "S/" en el resultado', () => {
    expect(formatPEN(100)).toContain('S/');
  });

  it('formatea con dos decimales', () => {
    expect(formatPEN(100)).toMatch(/100[.,]00/);
  });

  it('cero muestra 0.00', () => {
    expect(formatPEN(0)).toMatch(/0[.,]00/);
  });

  it('9.9 muestra dos decimales', () => {
    expect(formatPEN(9.9)).toMatch(/9[.,]90/);
  });
});

// ── isValidDNI ────────────────────────────────────────────────

describe('isValidDNI', () => {
  it('acepta exactamente 8 dígitos', () => {
    expect(isValidDNI('12345678')).toBe(true);
  });

  it('rechaza 7 dígitos', () => {
    expect(isValidDNI('1234567')).toBe(false);
  });

  it('rechaza 9 dígitos', () => {
    expect(isValidDNI('123456789')).toBe(false);
  });

  it('rechaza letras', () => {
    expect(isValidDNI('1234567A')).toBe(false);
  });

  it('rechaza vacío', () => {
    expect(isValidDNI('')).toBe(false);
  });
});

// ── isValidRUC ────────────────────────────────────────────────

describe('isValidRUC', () => {
  it('acepta RUC empresa (empieza con 20)', () => {
    expect(isValidRUC('20123456789')).toBe(true);
  });

  it('acepta RUC persona natural (empieza con 10)', () => {
    expect(isValidRUC('10123456789')).toBe(true);
  });

  it('rechaza RUC que empieza con 30', () => {
    expect(isValidRUC('30123456789')).toBe(false);
  });

  it('rechaza RUC con menos de 11 dígitos', () => {
    expect(isValidRUC('2012345678')).toBe(false);
  });

  it('rechaza RUC con letras', () => {
    expect(isValidRUC('2012345678A')).toBe(false);
  });
});

// ── isValidEmail ──────────────────────────────────────────────

describe('isValidEmail', () => {
  it('acepta email estándar', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('acepta email con subdominio', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true);
  });

  it('rechaza sin @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rechaza sin dominio', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rechaza vacío', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

// ── generateExternalRef ───────────────────────────────────────

describe('generateExternalRef', () => {
  it('genera un string no vacío', () => {
    expect(generateExternalRef().length).toBeGreaterThan(0);
  });

  it('genera valores únicos en llamadas sucesivas', () => {
    const refs = new Set(Array.from({ length: 10 }, () => generateExternalRef()));
    expect(refs.size).toBe(10);
  });
});

// ── mapMPError ────────────────────────────────────────────────

describe('mapMPError', () => {
  it('traduce cc_rejected_insufficient_amount', () => {
    const msg = mapMPError('cc_rejected_insufficient_amount');
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('traduce cc_rejected_bad_filled_card_number', () => {
    const msg = mapMPError('cc_rejected_bad_filled_card_number');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('devuelve mensaje genérico para código desconocido', () => {
    const msg = mapMPError('completely_unknown_code_xyz');
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('devuelve mensaje genérico para string vacío', () => {
    const msg = mapMPError('');
    expect(typeof msg).toBe('string');
  });
});

// ── truncate ──────────────────────────────────────────────────

describe('truncate', () => {
  it('no corta si el texto es más corto que maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('corta y agrega puntos suspensivos si supera maxLength', () => {
    const result = truncate('hello world', 5);
    expect(result).toBe('hello...');
  });

  it('no modifica texto exactamente igual a maxLength', () => {
    expect(truncate('12345', 5)).toBe('12345');
  });
});

// ── formatDatePE ──────────────────────────────────────────────

describe('formatDatePE', () => {
  it('formatea una fecha ISO al formato peruano DD/MM/YYYY', () => {
    const result = formatDatePE('2024-01-15T10:30:00Z');
    expect(result).toMatch(/15\/01\/2024/);
  });

  it('incluye hora en el resultado', () => {
    const result = formatDatePE('2024-06-20T14:00:00Z');
    expect(result.length).toBeGreaterThan(10);
  });
});
