import { useState } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useCardPayment } from '@/hooks';
import { getMPInstance } from '@/hooks/useMercadoPagoSDK';
import { usePaymentStore } from '@/stores/paymentStore';
import type { CardPaymentRequest } from '@/types';

const IS_SANDBOX = import.meta.env.VITE_SANDBOX_MODE === 'true';

// ============================================================
// PAYMENT — Formulario de pago con tarjeta
// Usa mp.createCardToken() del SDK oficial de Mercado Pago
// para tokenizar los datos antes de enviarlos al backend.
// ============================================================

// Identificación del método de pago por BIN cuando getPaymentMethods falla.
// Cubre los rangos más comunes emitidos en Perú.
function binFallback(bin: string): string {
  if (/^4/.test(bin))        return 'visa';
  if (/^5[1-5]/.test(bin))  return 'master';
  if (/^2[2-7]/.test(bin))  return 'master'; // Mastercard serie 2
  if (/^3[47]/.test(bin))   return 'amex';
  if (/^3[068]/.test(bin))  return 'diners';
  return 'visa';
}

const validate = (form: {
  cardNumber: string; cardholderName: string;
  expiryMonth: string; expiryYear: string; cvv: string;
}): string | null => {
  const num = form.cardNumber.replace(/\s/g, '');
  if (!/^\d{16}$/.test(num))           return 'El número de tarjeta debe tener 16 dígitos';
  if (!form.cardholderName.trim())      return 'Ingresa el nombre del titular';
  const month = parseInt(form.expiryMonth, 10);
  if (isNaN(month) || month < 1 || month > 12) return 'Mes de vencimiento inválido (01-12)';
  if (!/^\d{2}$/.test(form.expiryYear)) return 'Año de vencimiento inválido (2 dígitos)';
  if (!/^\d{3,4}$/.test(form.cvv))     return 'CVV inválido (3 o 4 dígitos)';
  return null;
};

export const CardBrick = () => {
  const { config } = usePaymentStore();
  const { mutate: payWithCard, isPending } = useCardPayment();

  const [form, setForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    installments: '1',
  });

  const [tokenizing, setTokenizing]   = useState(false);
  const [formError,  setFormError]    = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!config) return;

    const error = validate(form);
    if (error) { setFormError(error); return; }

    const mp = getMPInstance();
    if (!mp) { setFormError('El SDK de Mercado Pago no está listo. Recarga la página.'); return; }

    setTokenizing(true);
    setFormError(null);

    try {
      const expiryYear4 = form.expiryYear.length === 2
        ? `20${form.expiryYear}`
        : form.expiryYear;

      const bin = form.cardNumber.replace(/\s/g, '').substring(0, 6);

      if (IS_SANDBOX) {
        // Sandbox: el backend tokeniza con TEST- access token (live_mode:false).
        // El JS SDK del browser solo puede crear tokens live_mode:true, que el
        // TEST- access token rechaza con error 2006 ("Card Token not found").
        const payload: CardPaymentRequest = {
          rawCard: {
            cardNumber:           form.cardNumber.replace(/\s/g, ''),
            cardholderName:       form.cardholderName.trim(),
            expirationMonth:      form.expiryMonth.padStart(2, '0'),
            expirationYear:       parseInt(expiryYear4, 10),
            securityCode:         form.cvv,
            identificationType:   config.payer.identification.type,
            identificationNumber: config.payer.identification.number,
          },
          transactionAmount: config.transaction.amount,
          description:       config.transaction.description,
          installments:      parseInt(form.installments, 10),
          paymentMethodId:   binFallback(bin),
          payer: {
            email:          config.payer.email,
            identification: config.payer.identification,
          },
          externalReference: config.transaction.externalReference,
        };
        payWithCard(payload);
      } else {
        // Producción: el browser tokeniza con el JS SDK y la public key.
        const mp = getMPInstance();
        if (!mp) { setFormError('El SDK de Mercado Pago no está listo. Recarga la página.'); return; }

        const [tokenResult, methodsResult] = await Promise.all([
          mp.createCardToken({
            cardNumber:           form.cardNumber.replace(/\s/g, ''),
            cardholderName:       form.cardholderName.trim(),
            cardExpirationMonth:  form.expiryMonth.padStart(2, '0'),
            cardExpirationYear:   expiryYear4,
            securityCode:         form.cvv,
            identificationType:   config.payer.identification.type,
            identificationNumber: config.payer.identification.number,
          }),
          bin.length >= 6
            ? mp.getPaymentMethods({ bin })
            : Promise.resolve({ results: [] }),
        ]);

        const paymentMethodId = methodsResult.results[0]?.id ?? binFallback(bin);

        const payload: CardPaymentRequest = {
          token:             tokenResult.id,
          transactionAmount: config.transaction.amount,
          description:       config.transaction.description,
          installments:      parseInt(form.installments, 10),
          paymentMethodId,
          payer: {
            email:          config.payer.email,
            identification: config.payer.identification,
          },
          externalReference: config.transaction.externalReference,
        };
        payWithCard(payload);
      }
    } catch (err: unknown) {
      console.error('[CardBrick] error:', JSON.stringify(err, null, 2), err);
      const mpErr = err as { message?: string; cause?: Array<{ description?: string }> };
      const detail = mpErr.cause?.[0]?.description ?? mpErr.message ?? '';
      setFormError(detail
        ? `Error al tokenizar la tarjeta: ${detail}`
        : 'Error al procesar la tarjeta. Verifica los datos e intenta de nuevo.'
      );
    } finally {
      setTokenizing(false);
    }
  };

  const isSubmitting = isPending || tokenizing;

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Número de tarjeta"
        name="cardNumber"
        placeholder="0000 0000 0000 0000"
        maxLength={19}
        value={form.cardNumber}
        onChange={handleChange}
        leftIcon={<CreditCard size={16} />}
        required
      />

      <Input
        label="Nombre en la tarjeta"
        name="cardholderName"
        placeholder="Como aparece en tu tarjeta"
        value={form.cardholderName}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Mes"
          name="expiryMonth"
          placeholder="MM"
          maxLength={2}
          value={form.expiryMonth}
          onChange={handleChange}
          required
        />
        <Input
          label="Año"
          name="expiryYear"
          placeholder="25"
          maxLength={2}
          value={form.expiryYear}
          onChange={handleChange}
          required
        />
        <Input
          label="CVV"
          name="cvv"
          type="password"
          placeholder="•••"
          maxLength={4}
          value={form.cvv}
          onChange={handleChange}
          leftIcon={<Lock size={14} />}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Cuotas</label>
        <select
          name="installments"
          value={form.installments}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     hover:border-gray-400 transition-colors"
        >
          {Array.from(
            { length: config?.customization?.maxInstallments ?? 1 },
            (_, i) => i + 1
          ).filter((n) => [1, 2, 3, 6, 9, 12, 18, 24].includes(n)).map((n) => (
            <option key={n} value={n}>
              {n === 1 ? '1 cuota (sin intereses)' : `${n} cuotas`}
            </option>
          ))}
        </select>
      </div>

      {formError && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          {formError}
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        <Lock size={12} className="text-gray-400 shrink-0" />
        Tus datos están cifrados y protegidos. Nunca almacenamos tu tarjeta.
      </div>

      <Button
        size="lg"
        className="w-full mt-1"
        loading={isSubmitting}
        onClick={handleSubmit}
      >
        {tokenizing ? 'Procesando tarjeta…' : 'Pagar ahora'}
      </Button>
    </div>
  );
};
