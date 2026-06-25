import { useEffect, useState } from 'react';
import { RefreshCw, Clock, CheckCircle2, FlaskConical } from 'lucide-react';
import { Button, Spinner, Badge } from '@/components/ui';
import { useYapePayment, usePaymentStatusPolling } from '@/hooks';
import { usePaymentStore } from '@/stores/paymentStore';
import { formatPEN } from '@/utils/helpers';
import { apiClient } from '@/api/client';

// ============================================================
// PAYMENT — Componente Yape QR
// Flujo: backend genera la orden → retorna QR → polling de estado
// ============================================================

export const YapeQR = () => {
  const { config, status } = usePaymentStore();
  const { mutate: initYape, isPending, data: yapeData } = useYapePayment();
  const [hasStarted, setHasStarted]       = useState(false);
  const [secondsLeft, setSecondsLeft]     = useState(0);
  const [simulating, setSimulating]       = useState(false);

  // Polling del estado del pago una vez que tenemos el paymentId
  usePaymentStatusPolling(yapeData?.paymentId, !!yapeData && status === 'pending');

  // Inicializar countdown cuando llega yapeData con expiresAt del backend
  useEffect(() => {
    if (!yapeData?.expiresAt) return;
    const secs = Math.max(0, Math.floor((new Date(yapeData.expiresAt).getTime() - Date.now()) / 1000));
    setSecondsLeft(secs);
  }, [yapeData?.expiresAt]);

  // Tick del countdown
  useEffect(() => {
    if (!hasStarted || status !== 'pending' || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, status, secondsLeft]);

  const handleGenerateQR = () => {
    if (!config) return;
    setHasStarted(true);
    setSecondsLeft(0); // se actualiza en el useEffect cuando llegue expiresAt
    initYape({
      transactionAmount: config.transaction.amount,
      description: config.transaction.description,
      externalReference: config.transaction.externalReference,
      payer: {
        email: config.payer.email,
        phone: config.payer.phone,
        identification: config.payer.identification,
      },
    });
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center gap-5 py-6">
        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
          {/* Ícono Yape */}
          <span className="text-3xl font-black text-purple-600">Y</span>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-800">Paga con Yape</p>
          <p className="text-sm text-gray-500 mt-1">
            Escanea el QR con tu app Yape y completa el pago de{' '}
            <strong>{formatPEN(config?.transaction.amount ?? 0)}</strong>
          </p>
        </div>
        <Button size="lg" className="w-full" loading={isPending} onClick={handleGenerateQR}>
          Generar código QR
        </Button>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Spinner size="lg" />
        <p className="text-sm text-gray-600">Generando tu código QR…</p>
      </div>
    );
  }

  if (yapeData && status === 'pending') {
    // ── Modo simulación sandbox ──────────────────────────────────
    if (yapeData.sandboxMock) {
      const handleSimulate = async () => {
        if (!yapeData.internalId) return;
        setSimulating(true);
        try {
          await apiClient.post(
            `/payments/debug/approve-yape/${yapeData.internalId}`,
            {},
            { headers: { 'X-Api-Key': config?.apiKey ?? '' } }
          );
        } finally {
          setSimulating(false);
        }
      };

      return (
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
            <FlaskConical size={14} className="text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Modo Sandbox — Simulación Yape</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Badge variant="info">Esperando pago simulado</Badge>
            <p className="text-sm text-gray-600 text-center">
              En producción se mostraría el QR real de Yape.<br />
              Haz clic en el botón para simular el pago.
            </p>
          </div>

          {/* QR placeholder sandbox */}
          <div className="border-2 border-dashed border-amber-300 rounded-2xl p-6 bg-amber-50 w-52 h-52 flex flex-col items-center justify-center gap-2">
            <FlaskConical size={32} className="text-amber-400" />
            <span className="text-xs text-amber-600 font-medium text-center">QR Sandbox</span>
            <span className="text-xs text-amber-500 text-center font-mono break-all">
              {yapeData.internalId?.slice(0, 12)}…
            </span>
          </div>

          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            loading={simulating}
            onClick={handleSimulate}
          >
            Simular pago aprobado
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner size="sm" />
            <span>Verificando automáticamente…</span>
          </div>
        </div>
      );
    }

    // ── QR real (producción) ─────────────────────────────────────
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-2">
          <Badge variant="info">Esperando pago</Badge>
          <p className="text-sm text-gray-600 text-center">
            Escanea este código con tu app <strong>Yape</strong>
          </p>
        </div>

        {/* QR Image */}
        <div className="border-2 border-dashed border-purple-200 rounded-2xl p-3 bg-white">
          {yapeData.qrCodeBase64 ? (
            <img
              src={`data:image/png;base64,${yapeData.qrCodeBase64}`}
              alt="Código QR Yape"
              className="w-52 h-52"
            />
          ) : (
            <div className="w-52 h-52 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-xs text-gray-400">QR se mostrará aquí</span>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={14} />
          {secondsLeft > 0 ? (
            <span>Expira en {minutes}:{String(seconds).padStart(2, '0')}</span>
          ) : (
            <span className="text-red-500">El código expiró</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Spinner size="sm" />
          <span>Verificando pago automáticamente…</span>
        </div>

        {secondsLeft === 0 && (
          <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={handleGenerateQR}>
            Generar nuevo QR
          </Button>
        )}
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <CheckCircle2 size={48} className="text-green-500" />
        <p className="font-semibold text-gray-800">¡Pago con Yape confirmado!</p>
      </div>
    );
  }

  return null;
};
