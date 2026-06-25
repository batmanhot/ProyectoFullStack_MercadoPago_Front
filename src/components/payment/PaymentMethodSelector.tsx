import { CreditCard, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui';
import { usePaymentStore } from '@/stores/paymentStore';
import type { PaymentMethod } from '@/types';

// ============================================================
// PAYMENT — Selector de método de pago
// ============================================================

const methods: Array<{ id: PaymentMethod; label: string; sub: string; icon: typeof CreditCard }> = [
  {
    id: 'card',
    label: 'Tarjeta de crédito o débito',
    sub: 'Visa, Mastercard, Amex, Diners',
    icon: CreditCard,
  },
  {
    id: 'yape',
    label: 'Yape',
    sub: 'Paga con QR desde tu celular',
    icon: Smartphone,
  },
];

export const PaymentMethodSelector = () => {
  const { selectedMethod, setSelectedMethod } = usePaymentStore();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-gray-700">Elige cómo pagar</p>
      {methods.map(({ id, label, sub, icon: Icon }) => (
        <Card
          key={id}
          selected={selectedMethod === id}
          hoverable
          onClick={() => setSelectedMethod(id)}
        >
          <div className="px-4 py-3.5 flex items-center gap-4">
            <div
              className={[
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                selectedMethod === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500',
              ].join(' ')}
            >
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            </div>
            {/* Radio visual */}
            <div
              className={[
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                selectedMethod === id
                  ? 'border-blue-600'
                  : 'border-gray-300',
              ].join(' ')}
            >
              {selectedMethod === id && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
