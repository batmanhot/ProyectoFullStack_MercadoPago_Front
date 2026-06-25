import { useState } from 'react';
import {
  Copy, CheckCheck, Code2, Webhook, Key, ArrowRight,
  Plug, ShieldCheck, Zap, Globe, BookOpen,
} from 'lucide-react';

// ============================================================
// PAGE — Guía de Integración para apps externas
// ============================================================

const useCopy = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };
  return { copied, copy };
};

const CodeBlock = ({
  id, lang, code, onCopy, copied,
}: {
  id: string; lang: string; code: string;
  onCopy: (id: string, text: string) => void; copied: string | null;
}) => (
  <div className="relative group">
    <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-4 py-2 border border-gray-700 border-b-0">
      <span className="text-[11px] text-gray-400 font-mono">{lang}</span>
      <button
        onClick={() => onCopy(id, code)}
        className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors"
      >
        {copied === id ? <CheckCheck size={12} className="text-green-400" /> : <Copy size={12} />}
        {copied === id ? 'Copiado' : 'Copiar'}
      </button>
    </div>
    <pre className="bg-gray-950 border border-gray-700 rounded-b-lg p-4 text-xs text-green-300
                    overflow-x-auto leading-relaxed whitespace-pre-wrap">{code}</pre>
  </div>
);

const SectionTitle = ({ icon: Icon, color, title, subtitle }: {
  icon: React.ElementType; color: string; title: string; subtitle?: string;
}) => (
  <div className={`flex items-start gap-3 mb-5 pb-3 border-b border-gray-800`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
      <Icon size={16} />
    </div>
    <div>
      <h2 className="text-base font-bold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const Step = ({ n, color, title, children }: {
  n: number; color: string; title: string; children: React.ReactNode;
}) => (
  <div className="flex gap-4">
    <div className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-1 ${color}`}>
      {n}
    </div>
    <div className="flex-1">
      <p className="font-semibold text-white text-sm mb-2">{title}</p>
      <div className="text-xs text-gray-400 space-y-2">{children}</div>
    </div>
  </div>
);

const TAB_LANGS = ['JavaScript / Axios', 'cURL', 'Python / requests', 'PHP / cURL'];

export const AdminIntegrationPage = () => {
  const { copied, copy } = useCopy();
  const [activeTab, setActiveTab] = useState(0);

  const BASE_URL = 'http://localhost:3000/api/v1';

  // ── Ejemplos de código por lenguaje ──────────────────────
  const cardExamples = [
    // JS / Axios
    `import axios from 'axios';
import { loadMercadoPago } from '@mercadopago/sdk-js';

const API_URL   = '${BASE_URL}';
const API_KEY   = 'sk_demo_store_001';  // ← tu API Key
const MP_PK     = 'APP_USR-xxxxxxxx';  // ← tu Public Key de MP

await loadMercadoPago();
const mp     = new MercadoPago(MP_PK, { locale: 'es-PE' });
const cardForm = mp.cardForm({ ... }); // ver docs de MP
const token    = await cardForm.getCardFormData();

const response = await axios.post(\`\${API_URL}/payments/card\`, {
  transactionAmount: 150.00,
  token:             token.token,
  description:       'Mi producto',
  installments:      1,
  paymentMethodId:   token.paymentMethodId,
  issuerId:          token.issuerId,
  externalReference: 'ORD-2024-001',
  payer: {
    email:          'cliente@correo.com',
    identification: { type: 'DNI', number: '12345678' },
  },
}, {
  headers: { 'X-Api-Key': API_KEY },
});

console.log(response.data);
// { success: true, status: "APPROVED", paymentId: "12345678" }`,

    // cURL
    `curl -X POST ${BASE_URL}/payments/card \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: sk_demo_store_001" \\
  -d '{
    "transactionAmount": 150.00,
    "token": "TOKEN_GENERADO_POR_MP_SDK",
    "description": "Mi producto",
    "installments": 1,
    "paymentMethodId": "visa",
    "issuerId": "1234",
    "externalReference": "ORD-2024-001",
    "payer": {
      "email": "cliente@correo.com",
      "identification": { "type": "DNI", "number": "12345678" }
    }
  }'`,

    // Python
    `import requests

API_URL = '${BASE_URL}'
API_KEY = 'sk_demo_store_001'  # tu API Key

payload = {
    'transactionAmount': 150.00,
    'token': 'TOKEN_GENERADO_POR_MP_SDK',
    'description': 'Mi producto',
    'installments': 1,
    'paymentMethodId': 'visa',
    'issuerId': '1234',
    'externalReference': 'ORD-2024-001',
    'payer': {
        'email': 'cliente@correo.com',
        'identification': {'type': 'DNI', 'number': '12345678'},
    },
}

resp = requests.post(
    f'{API_URL}/payments/card',
    json=payload,
    headers={'X-Api-Key': API_KEY},
)
print(resp.json())`,

    // PHP
    `<?php
$apiUrl = '${BASE_URL}';
$apiKey = 'sk_demo_store_001';

$payload = json_encode([
    'transactionAmount' => 150.00,
    'token'             => 'TOKEN_GENERADO_POR_MP_SDK',
    'description'       => 'Mi producto',
    'installments'      => 1,
    'paymentMethodId'   => 'visa',
    'issuerId'          => '1234',
    'externalReference' => 'ORD-2024-001',
    'payer' => [
        'email'          => 'cliente@correo.com',
        'identification' => ['type' => 'DNI', 'number' => '12345678'],
    ],
]);

$ch = curl_init("$apiUrl/payments/card");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        "X-Api-Key: $apiKey",
    ],
]);
$response = curl_exec($ch);
print_r(json_decode($response, true));`,
  ];

  const yapeExample = `// Pago con YAPE QR — JavaScript / Axios
const response = await axios.post(\`\${API_URL}/payments/yape\`, {
  transactionAmount: 50.00,
  description:       'Compra por Yape',
  externalReference: 'ORD-2024-002',
  payer: {
    email: 'cliente@correo.com',
    phone: '999888777',              // ← número Yape del pagador
    identification: { type: 'DNI', number: '12345678' },
  },
}, {
  headers: { 'X-Api-Key': API_KEY },
});

// La respuesta incluye el QR para mostrar al usuario:
const { qrCode, qrCodeBase64, ticketUrl } = response.data.data;
// qrCodeBase64 → mostrar como <img src={\`data:image/png;base64,\${qrCodeBase64}\`} />
// ticketUrl    → link alternativo para pagar`;

  const callbackExample = `// Tu servidor debe exponer un endpoint POST en la Callback URL configurada
// Ejemplo en Express:

app.post('/webhooks/mp', express.json(), (req, res) => {
  const {
    event,             // "payment.approved"
    paymentId,         // ID del pago en MP
    externalReference, // tu referencia de orden
    amount,            // monto cobrado
    currency,          // "PEN"
    method,            // "CARD" | "YAPE"
    status,            // "APPROVED"
    statusDetail,      // "accredited"
  } = req.body;

  if (event === 'payment.approved') {
    // Marcar la orden como pagada en tu sistema
    await markOrderAsPaid(externalReference, paymentId);
  }

  res.status(200).json({ received: true });
});`;

  const aiPrompt = `Necesito integrar un módulo de pagos SaaS llamado "Payment SDK" en mi aplicación.

=== INFORMACIÓN DEL MÓDULO ===
- API Base URL: ${BASE_URL}
- Autenticación: Header "X-Api-Key: sk_XXXX" (clave provista por el administrador)
- Documentación: sin Swagger, se describe abajo

=== ENDPOINTS DISPONIBLES ===

1. POST /api/v1/payments/card
   Procesa un pago con tarjeta de crédito/débito.
   Requiere header X-Api-Key.
   El campo "token" es generado por el SDK de MercadoPago (frontend).
   Body:
   {
     transactionAmount: number,
     token: string,           // token MP del card form
     description: string,
     installments: number,    // cuotas
     paymentMethodId: string, // "visa", "master", etc.
     issuerId: string,
     externalReference: string, // tu ID de orden
     payer: {
       email: string,
       identification: { type: "DNI"|"CE", number: string }
     }
   }
   Respuesta exitosa: { success: true, status: "APPROVED"|"REJECTED"|"PENDING", paymentId: string }

2. POST /api/v1/payments/yape
   Genera un QR de pago Yape (Perú).
   Requiere header X-Api-Key.
   Body:
   {
     transactionAmount: number,
     description: string,
     externalReference: string,
     payer: {
       email: string,
       phone: string,         // número Yape del pagador
       identification: { type: "DNI", number: string }
     }
   }
   Respuesta exitosa: {
     success: true,
     data: {
       qrCode: string,        // string QR
       qrCodeBase64: string,  // imagen base64 para mostrar
       ticketUrl: string,     // link alternativo
       expiresAt: string      // ISO8601, expira en 5 minutos
     }
   }

=== CALLBACK DE PAGO APROBADO ===
Cuando un pago es aprobado, el módulo hace POST a mi Callback URL configurada con:
{
  event: "payment.approved",
  paymentId: string,
  externalReference: string, // mi referencia de orden
  amount: number,
  currency: "PEN",
  method: "CARD"|"YAPE",
  status: "APPROVED",
  statusDetail: string
}
Mi servidor debe responder con HTTP 200. Si falla, no se reintenta.

=== MI STACK ===
[REEMPLAZA CON TU STACK: ej. "React + Node.js", "Vue + Laravel", "Next.js", "Django + React"]

=== LO QUE NECESITO ===
[REEMPLAZA CON TU NECESIDAD: ej.
- "Integrar el pago con tarjeta en mi checkout de React"
- "Crear el endpoint callback en mi servidor Express para actualizar órdenes"
- "Mostrar el QR de Yape en un modal de mi app Vue"
- "Manejar errores de pago y mostrar mensajes al usuario"]

Por favor ayúdame a implementar esto de manera limpia y segura.`;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-12">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Plug size={12} className="text-red-500" />
          <span>Admin SaaS</span>
          <ArrowRight size={10} />
          <span>Guía de Integración</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Guía de Integración para Apps Externas</h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Todo lo que necesitas para conectar cualquier aplicación al módulo de pagos.
          Ejemplos en múltiples lenguajes, flujo completo y prompt listo para IA.
        </p>
      </div>

      {/* ── Visión general ── */}
      <section>
        <SectionTitle icon={Globe} color="bg-blue-600/20 text-blue-400"
          title="¿Cómo funciona la integración?" subtitle="Flujo completo de una transacción" />

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 font-mono text-xs space-y-1 overflow-x-auto mb-4">
          <p className="text-gray-500 mb-2">{'// Flujo completo de pago con tarjeta'}</p>
          <p><span className="text-blue-400">App externa</span><span className="text-gray-500">  →  tokeniza tarjeta con MP SDK (frontend)</span></p>
          <p><span className="text-blue-400">App externa</span><span className="text-gray-500">  →  POST /payments/card  + X-Api-Key</span></p>
          <p><span className="text-red-400">Payment SDK</span><span className="text-gray-500"> →  valida API Key → identifica tenant</span></p>
          <p><span className="text-red-400">Payment SDK</span><span className="text-gray-500"> →  envía a Mercado Pago con credenciales del tenant</span></p>
          <p><span className="text-yellow-400">Mercado Pago</span><span className="text-gray-500"> → procesa y devuelve resultado</span></p>
          <p><span className="text-red-400">Payment SDK</span><span className="text-gray-500"> →  guarda en BD → POST al callbackUrl del tenant</span></p>
          <p><span className="text-blue-400">App externa</span><span className="text-gray-500">  →  recibe callback → marca orden como pagada</span></p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Key,        color: 'text-yellow-400', title: '1. Obtén tu API Key',    desc: 'El Admin SaaS te provee la API Key de tu tenant.' },
            { icon: Code2,      color: 'text-blue-400',   title: '2. Llama a los endpoints', desc: 'POST a /payments/card o /payments/yape con tu key.' },
            { icon: Webhook,    color: 'text-green-400',  title: '3. Recibe el callback',  desc: 'Configura tu URL para recibir la confirmación de pago.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center space-y-2">
              <Icon size={20} className={`${color} mx-auto`} />
              <p className="text-white text-xs font-bold">{title}</p>
              <p className="text-gray-400 text-[11px]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Paso a paso ── */}
      <section>
        <SectionTitle icon={Zap} color="bg-yellow-600/20 text-yellow-400"
          title="Paso a paso" subtitle="Setup inicial para conectar tu app" />

        <div className="space-y-6">
          <Step n={1} color="bg-red-600/20 text-red-400 border border-red-800/40"
            title="Obtén tu API Key del administrador">
            <p>El administrador de la plataforma te entregará una API Key con formato:</p>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 font-mono text-green-300">
              sk_demo_store_001
            </div>
            <p>Guárdala como variable de entorno en tu servidor. <strong className="text-yellow-400">No la expongas en el frontend.</strong></p>
          </Step>

          <Step n={2} color="bg-blue-600/20 text-blue-400 border border-blue-800/40"
            title="Configura la URL base de la API">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 font-mono text-green-300">
              {BASE_URL}
            </div>
            <p>Reemplaza con la URL real de tu instalación en producción.</p>
          </Step>

          <Step n={3} color="bg-purple-600/20 text-purple-400 border border-purple-800/40"
            title="Instala el SDK de Mercado Pago en tu frontend">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 font-mono text-green-300">
              {'npm install @mercadopago/sdk-js'}
            </div>
            <p>
              El SDK de MP se usa <strong className="text-white">solo en el frontend</strong> para tokenizar la tarjeta.
              El token resultante (válido por 7 días, un solo uso) es lo que envías al endpoint de pago.
              Los datos de tarjeta nunca llegan a tu servidor.
            </p>
          </Step>

          <Step n={4} color="bg-green-600/20 text-green-400 border border-green-800/40"
            title="Registra tu Callback URL en el Admin SaaS">
            <p>
              Ve al panel Admin → Tenants → tu tenant → campo <strong className="text-white">Callback URL</strong>.
              Ingresa la URL de tu servidor que recibirá las notificaciones:
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 font-mono text-green-300">
              https://tu-app.com/webhooks/pagos
            </div>
            <p className="text-yellow-300">Debe ser una URL pública (no localhost). En desarrollo usa ngrok o similar.</p>
          </Step>
        </div>
      </section>

      {/* ── Pago con tarjeta ── */}
      <section>
        <SectionTitle icon={Code2} color="bg-green-600/20 text-green-400"
          title="Pago con tarjeta" subtitle="Ejemplos en múltiples lenguajes" />

        {/* Tabs */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {TAB_LANGS.map((l, i) => (
            <button key={l} onClick={() => setActiveTab(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                          ${activeTab === i
                            ? 'bg-green-600/20 text-green-400 border border-green-600/40'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              {l}
            </button>
          ))}
        </div>

        <CodeBlock id="card" lang={TAB_LANGS[activeTab]}
          code={cardExamples[activeTab]} onCopy={copy} copied={copied} />

        <div className="mt-3 bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs">
          <p className="font-semibold text-white mb-2">Respuesta del endpoint:</p>
          <pre className="text-green-300 overflow-x-auto">{`{
  "success": true,
  "data": {
    "status":      "APPROVED",       // APPROVED | REJECTED | IN_PROCESS | PENDING
    "statusDetail": "accredited",
    "mpPaymentId": "12345678",
    "paymentRecordId": "uuid-interno"
  }
}`}</pre>
        </div>
      </section>

      {/* ── Pago Yape ── */}
      <section>
        <SectionTitle icon={Code2} color="bg-purple-600/20 text-purple-400"
          title="Pago con Yape QR" subtitle="Solo disponible en Perú" />

        <CodeBlock id="yape" lang="JavaScript / Axios"
          code={yapeExample} onCopy={copy} copied={copied} />

        <div className="mt-3 bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs">
          <p className="font-semibold text-white mb-2">Muestra el QR al usuario:</p>
          <pre className="text-green-300 overflow-x-auto">{`// En React:
<img
  src={\`data:image/png;base64,\${qrCodeBase64}\`}
  alt="Escanea con Yape"
  className="w-48 h-48"
/>
<p>Expira en 5 minutos</p>

// O redirigir al link de pago:
window.open(ticketUrl, '_blank');`}</pre>
        </div>
      </section>

      {/* ── Callback ── */}
      <section>
        <SectionTitle icon={Webhook} color="bg-pink-600/20 text-pink-400"
          title="Recibir el callback de pago aprobado"
          subtitle="Tu servidor debe exponer un endpoint POST accesible públicamente" />

        <CodeBlock id="callback" lang="JavaScript / Express"
          code={callbackExample} onCopy={copy} copied={copied} />

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-green-950/40 border border-green-800/40 rounded-xl p-3 space-y-1">
            <p className="text-green-400 font-bold">✅ El callback llega cuando:</p>
            <ul className="text-green-300 space-y-1">
              <li>• Pago con tarjeta aprobado por MP</li>
              <li>• Estado = APPROVED</li>
            </ul>
          </div>
          <div className="bg-yellow-950/40 border border-yellow-800/40 rounded-xl p-3 space-y-1">
            <p className="text-yellow-400 font-bold">⚠️ El callback NO llega cuando:</p>
            <ul className="text-yellow-300 space-y-1">
              <li>• Pago rechazado o pendiente</li>
              <li>• Yape (solo genera QR)</li>
              <li>• Tu URL no responde con 200</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Prompt IA ── */}
      <section>
        <SectionTitle icon={BookOpen} color="bg-red-600/20 text-red-400"
          title="Prompt para IA (Claude / ChatGPT / Copilot)"
          subtitle="Copia este prompt, personaliza las secciones marcadas y pégalo en tu IA favorita" />

        <div className="bg-gray-900 border border-dashed border-red-700/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between bg-red-950/40 px-4 py-2 border-b border-red-800/40">
            <div className="flex items-center gap-2">
              <ShieldCheck size={13} className="text-red-400" />
              <span className="text-xs text-red-300 font-semibold">Prompt listo para usar con IA</span>
            </div>
            <button
              onClick={() => copy('ai-prompt', aiPrompt)}
              className="flex items-center gap-1.5 text-[11px] text-red-300 hover:text-white transition-colors"
            >
              {copied === 'ai-prompt'
                ? <><CheckCheck size={12} className="text-green-400" /> Copiado</>
                : <><Copy size={12} /> Copiar prompt</>}
            </button>
          </div>
          <pre className="p-4 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {aiPrompt}
          </pre>
        </div>

        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs space-y-2">
          <p className="font-semibold text-white">¿Cómo usar el prompt?</p>
          <ol className="text-gray-300 space-y-1.5 list-decimal list-inside">
            <li>Copia el prompt completo con el botón de arriba</li>
            <li>Reemplaza <span className="text-yellow-400 font-mono">[REEMPLAZA CON TU STACK]</span> con tu tecnología (React, Vue, Laravel, Django, etc.)</li>
            <li>Reemplaza <span className="text-yellow-400 font-mono">[REEMPLAZA CON TU NECESIDAD]</span> con lo que quieres implementar exactamente</li>
            <li>Pega el prompt en Claude, ChatGPT, Copilot o cualquier IA de tu preferencia</li>
            <li>La IA generará código específico para tu stack con la integración completa</li>
          </ol>
        </div>
      </section>

      {/* ── Errores comunes ── */}
      <section>
        <SectionTitle icon={ShieldCheck} color="bg-orange-600/20 text-orange-400"
          title="Errores comunes y soluciones" />

        <div className="space-y-3">
          {[
            {
              code: '401 MISSING_API_KEY',
              desc: 'No enviaste el header X-Api-Key en la petición.',
              fix: 'Agrega el header: headers: { "X-Api-Key": "sk_..." }',
            },
            {
              code: '401 INVALID_API_KEY',
              desc: 'La API Key no existe o el tenant está inactivo.',
              fix: 'Verifica la key con el Admin SaaS. Si fue regenerada, actualiza tu config.',
            },
            {
              code: '422 Validation Error',
              desc: 'Falta algún campo requerido o tiene formato incorrecto.',
              fix: 'Revisa que todos los campos estén presentes: transactionAmount, token, payer.email, etc.',
            },
            {
              code: 'status: REJECTED',
              desc: 'El pago fue rechazado por MP (fondos insuficientes, CVV incorrecto, etc.).',
              fix: 'Lee el campo statusDetail para ver el motivo exacto y mostrárselo al usuario.',
            },
            {
              code: 'Callback no llega',
              desc: 'Tu URL no es accesible públicamente o responde con error HTTP.',
              fix: 'En desarrollo: usa ngrok (ngrok http 3001). En producción: verifica el firewall y que responda 200.',
            },
          ].map(({ code, desc, fix }) => (
            <div key={code} className="bg-gray-900 border border-gray-800 rounded-xl p-4 grid grid-cols-[auto_1fr] gap-4">
              <code className="text-red-400 text-xs font-mono bg-red-950/30 px-2 py-1 rounded self-start">{code}</code>
              <div className="text-xs space-y-1">
                <p className="text-gray-300">{desc}</p>
                <p className="text-green-400">→ {fix}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
