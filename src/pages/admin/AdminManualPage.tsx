import {
  ShieldAlert, Building2, Users, CreditCard, Key, Webhook,
  ToggleRight, AlertTriangle, CheckCircle2, ChevronRight,
  Layers, ArrowRight, RefreshCw, Lock, Terminal, Database,
  Monitor, FlaskConical,
} from 'lucide-react';

// ============================================================
// PAGE — Manual del sistema Admin SaaS
// ============================================================

const Section = ({ id, icon: Icon, color, title, children }: {
  id: string; icon: React.ElementType; color: string; title: string; children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-6">
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-800">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={16} />
      </div>
      <h2 className="text-base font-bold text-white">{title}</h2>
    </div>
    <div className="text-sm text-gray-300 space-y-3 leading-relaxed">{children}</div>
  </section>
);

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono ${color}`}>{label}</span>
);

const Step = ({ n, title, desc }: { n: number; title: string; desc?: string }) => (
  <div className="flex gap-4">
    <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-600/40 text-red-400 text-xs
                    font-black flex items-center justify-center shrink-0 mt-0.5">{n}</div>
    <div>
      <p className="font-semibold text-white text-sm">{title}</p>
      {desc && <p className="text-gray-400 text-xs mt-0.5">{desc}</p>}
    </div>
  </div>
);

const InfoBox = ({ type, children }: { type: 'tip' | 'warn' | 'ok' | 'danger'; children: React.ReactNode }) => {
  const styles = {
    tip:    'bg-blue-950/50 border-blue-700/50 text-blue-300',
    warn:   'bg-yellow-950/50 border-yellow-700/50 text-yellow-300',
    ok:     'bg-green-950/50 border-green-700/50 text-green-300',
    danger: 'bg-red-950/50 border-red-700/50 text-red-300',
  };
  const icons = { tip: '💡', warn: '⚠️', ok: '✅', danger: '🚨' };
  return (
    <div className={`rounded-lg border px-4 py-3 text-xs ${styles[type]}`}>
      {icons[type]} {children}
    </div>
  );
};

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="text-red-400 bg-gray-900 px-1.5 py-0.5 rounded text-[11px] font-mono">{children}</code>
);

const CredField = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-2">
    <p className="text-xs text-yellow-400 font-semibold">{label}</p>
    <div className="bg-gray-800 rounded-lg px-3 py-2 font-mono text-xs text-green-300 break-all">{value}</div>
    <p className="text-[11px] text-gray-500">{note}</p>
  </div>
);

const TOC = [
  { id: 'arquitectura', label: 'Arquitectura SaaS' },
  { id: 'roles',        label: 'Roles y permisos' },
  { id: 'tenants',      label: 'Gestión de Tenants' },
  { id: 'modos',        label: 'Sandbox vs Producción' },
  { id: 'config-mp',    label: 'Configurar MP (Perú)' },
  { id: 'credentials',  label: 'Credenciales en el Admin' },
  { id: 'pagos',        label: 'Flujo de pagos' },
  { id: 'yape',         label: 'Yape QR — Sandbox' },
  { id: 'callbacks',    label: 'Callbacks externos' },
  { id: 'apikeys',      label: 'API Keys' },
  { id: 'usuarios',     label: 'Gestión de Usuarios' },
  { id: 'monitor',      label: 'Monitor de Pagos' },
  { id: 'faq',          label: 'FAQ / Problemas comunes' },
];

export const AdminManualPage = () => (
  <div className="flex min-h-screen">

    {/* ── TOC lateral ── */}
    <aside className="hidden xl:flex flex-col w-52 shrink-0 sticky top-0 h-screen overflow-y-auto
                      border-r border-gray-800 py-6 px-4 bg-gray-900/60">
      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-3">Contenido</p>
      <nav className="flex flex-col gap-0.5">
        {TOC.map((t) => (
          <a key={t.id} href={`#${t.id}`}
             className="text-xs text-gray-400 hover:text-white py-1.5 px-2 rounded hover:bg-gray-800 transition-colors flex items-center gap-2">
            <ChevronRight size={10} className="opacity-40" />
            {t.label}
          </a>
        ))}
      </nav>
    </aside>

    {/* ── Contenido ── */}
    <div className="flex-1 max-w-3xl mx-auto px-6 py-8 space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <ShieldAlert size={12} className="text-red-500" />
          <span>Admin SaaS</span>
          <ArrowRight size={10} />
          <span>Manual del sistema</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Manual del Administrador</h1>
        <p className="text-gray-400 text-sm">
          Guía completa para administrar la plataforma de pagos SaaS multitenant basada en Mercado Pago Perú.
          Cubre configuración, credenciales, flujos de pago y resolución de problemas.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* 1. Arquitectura                                     */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="arquitectura" icon={Layers} color="bg-purple-600/20 text-purple-400" title="Arquitectura SaaS Multitenant">
        <p>
          La plataforma es un <strong className="text-white">SaaS multitenant</strong>: una sola instalación del backend
          sirve a múltiples organizaciones (<em>tenants</em>) completamente aisladas. Cada tenant tiene sus propias
          credenciales de Mercado Pago, usuarios, historial de pagos y configuración.
        </p>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 font-mono text-xs space-y-1 overflow-x-auto">
          <p className="text-gray-500">{'// Estructura completa de la plataforma'}</p>
          <p><span className="text-red-400">Admin SaaS</span> <span className="text-gray-500">(SUPER_ADMIN — este panel)</span></p>
          <p className="ml-4 text-gray-400">├── <span className="text-blue-400">Tenant A</span> <span className="text-gray-600">─ Demo Store</span></p>
          <p className="ml-8 text-gray-500">├── API Key:  sk_demo_store_xxx</p>
          <p className="ml-8 text-gray-500">├── MP Creds: TEST-token / APP_USR-pubkey</p>
          <p className="ml-8 text-gray-500">├── Modo:     sandbox</p>
          <p className="ml-8 text-gray-500">├── Users:    ADMIN, OPERATOR</p>
          <p className="ml-8 text-gray-500">└── Pagos:    CARD, YAPE</p>
          <p className="ml-4 text-gray-400">├── <span className="text-green-400">Tenant B</span> <span className="text-gray-600">─ Tienda Lima SAC (producción)</span></p>
          <p className="ml-8 text-gray-500">└── ...</p>
        </div>

        <p>
          El aislamiento se garantiza a nivel de BD: todos los registros llevan un <Code>tenantId</Code> que
          filtra automáticamente cada consulta. Ningún tenant puede ver datos de otro.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🏢', title: 'Tenant', desc: 'Organización o app cliente que usa el SDK de pagos' },
            { icon: '🔑', title: 'API Key', desc: 'Identifica al tenant en cada petición de pago' },
            { icon: '💳', title: 'MP Creds', desc: 'Access Token y Public Key de Mercado Pago por tenant' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
              <p className="text-xl mb-1">{icon}</p>
              <p className="text-xs font-bold text-white">{title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        <InfoBox type="ok">
          El Super Admin ve y opera TODOS los tenants desde este panel. Los usuarios de cada tenant solo ven sus propios datos desde su dashboard.
        </InfoBox>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* 2. Roles                                            */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="roles" icon={Lock} color="bg-yellow-600/20 text-yellow-400" title="Roles y permisos">
        <div className="space-y-3">
          {[
            {
              role: 'SUPER_ADMIN', color: 'bg-red-900/40 text-red-300 border border-red-800/60',
              perms: ['Crear/editar/desactivar tenants', 'Configurar credenciales MP por tenant', 'Ver todos los pagos de todos los tenants', 'Crear usuarios en cualquier tenant', 'Regenerar API keys'],
              nota: 'Accede solo a este panel Admin. No al dashboard de tenant.',
            },
            {
              role: 'ADMIN', color: 'bg-blue-900/40 text-blue-300 border border-blue-800/60',
              perms: ['Ver pagos y analytics de su tenant', 'Gestionar usuarios de su tenant', 'Ver configuración de su tenant'],
              nota: 'Accede al Dashboard del tenant. No puede crear tenants ni ver otros tenants.',
            },
            {
              role: 'OPERATOR', color: 'bg-green-900/40 text-green-300 border border-green-800/60',
              perms: ['Procesar pagos', 'Ver historial de su tenant'],
              nota: 'Solo operaciones básicas. Sin acceso a configuración ni analytics.',
            },
          ].map(({ role, color, perms, nota }) => (
            <div key={role} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <Badge label={role} color={color} />
              <ul className="mt-2 space-y-1">
                {perms.map((p) => (
                  <li key={p} className="text-xs text-gray-300 flex gap-2">
                    <CheckCircle2 size={11} className="text-green-500 mt-0.5 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-gray-500 mt-2 italic">{nota}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* 3. Tenants                                          */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="tenants" icon={Building2} color="bg-blue-600/20 text-blue-400" title="Gestión de Tenants">
        <p>
          Un <strong className="text-white">tenant</strong> es una organización/tienda conectada a la plataforma.
          Puede representar una empresa, una app, o un proyecto de e-commerce.
        </p>

        <div className="space-y-3">
          <p className="font-semibold text-white">Para agregar un nuevo tenant (checklist completo):</p>
          <div className="space-y-3">
            <Step n={1} title='Crear el tenant' desc='Tenants → "Nuevo Tenant" → nombre y slug único (ej: mi-tienda). El slug no se puede cambiar.' />
            <Step n={2} title='Copiar la API Key generada' desc='Se crea automáticamente con formato sk_[slug]_[random]. Esta clave la usa la app externa para autenticar pagos.' />
            <Step n={3} title='Configurar las credenciales de Mercado Pago' desc='En Detalle del tenant → sección "Mercado Pago" → ingresar Access Token y Public Key (ver Sección 5).' />
            <Step n={4} title='Seleccionar el modo' desc='Sandbox para pruebas. Production solo cuando esté todo probado y listo para cobrar dinero real.' />
            <Step n={5} title='Configurar Callback URL' desc='URL del servidor de la app externa que recibirá la confirmación cuando un pago sea aprobado.' />
            <Step n={6} title='Crear al menos un usuario ADMIN' desc='Usuarios → Nuevo usuario → asignar al tenant con rol ADMIN.' />
          </div>
        </div>

        <InfoBox type="tip">
          El <strong>slug</strong> es el identificador URL del tenant (ej: <Code>mi-tienda</Code>). Se usa internamente
          y en los logs. Elige uno descriptivo y sin espacios porque no se puede cambiar después.
        </InfoBox>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* 4. Modos                                            */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="modos" icon={ToggleRight} color="bg-orange-600/20 text-orange-400" title="Sandbox vs Producción">
        <p>
          El <strong className="text-white">modo</strong> determina si el tenant usa las APIs de prueba (sandbox)
          o las APIs reales (producción) de Mercado Pago. Se configura individualmente por tenant.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-yellow-800/40 rounded-xl p-4 space-y-2">
            <p className="text-yellow-400 font-bold text-xs">🧪 Sandbox (pruebas)</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Access Token: formato <Code>TEST-xxxx</Code></li>
              <li>• No se realizan cobros reales</li>
              <li>• Tarjetas de prueba MP</li>
              <li>• Yape usa simulación local</li>
              <li>• Ideal para desarrollo e integración</li>
            </ul>
          </div>
          <div className="bg-gray-900 border border-green-800/40 rounded-xl p-4 space-y-2">
            <p className="text-green-400 font-bold text-xs">🚀 Production (real)</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Access Token: formato <Code>APP_USR-xxxx</Code></li>
              <li>• Cobros reales a tarjetas/Yape</li>
              <li>• Cuenta MP verificada y activa</li>
              <li>• Webhooks públicos de MP</li>
              <li>• Solo activar cuando todo esté probado</li>
            </ul>
          </div>
        </div>

        <InfoBox type="danger">
          Nunca mezcles credenciales de sandbox con modo producción ni viceversa.
          Las API Keys de MP son completamente distintas para cada modo y <strong>no son intercambiables</strong>.
        </InfoBox>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* 5. Configurar MercadoPago Perú                      */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="config-mp" icon={Key} color="bg-red-600/20 text-red-400"
        title="Cómo obtener las credenciales de Mercado Pago Perú">

        <InfoBox type="warn">
          <strong>Particularidad técnica de MP Perú (Sandbox):</strong> El SDK del navegador crea tokens con{' '}
          <Code>live_mode: true</Code> aunque uses la Public Key de prueba. El <Code>TEST-</Code> access token
          rechaza esos tokens (error 2006). Por eso, <strong>en modo sandbox el backend tokeniza la tarjeta
          server-side</strong> usando el Access Token. Esta es la arquitectura correcta para Perú.
        </InfoBox>

        {/* Dónde ir */}
        <p className="font-semibold text-white">Paso 1 — Acceder al panel de desarrolladores de MP</p>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-2 text-xs">
          <p className="text-gray-300">Tienes dos opciones:</p>
          <div className="flex gap-2 items-start">
            <span className="text-red-400 font-mono shrink-0">A)</span>
            <span className="text-gray-300">
              Ingresar a <strong className="text-white">mercadopago.com.pe</strong> → Tu perfil → Integraciones → Ir al devsite
            </span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-red-400 font-mono shrink-0">B)</span>
            <span className="text-gray-300">
              Ir directamente a <strong className="text-white">developers.mercadopago.com</strong> → Iniciar sesión con tu cuenta de MP Perú
            </span>
          </div>
        </div>

        {/* Crear app */}
        <p className="font-semibold text-white mt-2">Paso 2 — Crear o abrir una aplicación</p>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-xs space-y-2">
          <div className="space-y-1.5">
            {[
              'En el devsite: "Tus aplicaciones" → "Crear aplicación"',
              'Asigna un nombre (ej: "SDK Pagos PE")',
              'En "¿Para qué usarás esta aplicación?" → selecciona "Pagos en línea"',
              'En "¿Integrarás con un carrito de compras?" → No',
              'Guarda la aplicación',
            ].map((s, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-red-400 font-mono shrink-0">{i + 1}.</span>
                <span className="text-gray-300">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Obtener credenciales */}
        <p className="font-semibold text-white mt-2">Paso 3 — Obtener las credenciales</p>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-xs space-y-2">
          <p className="text-gray-300">En tu aplicación → pestaña <strong className="text-white">"Credenciales"</strong></p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-yellow-950/30 border border-yellow-800/40 rounded-lg p-3">
              <p className="text-yellow-400 font-semibold mb-1">Para Sandbox (pruebas)</p>
              <p className="text-gray-400">Sección: "Credenciales de prueba"</p>
            </div>
            <div className="bg-green-950/30 border border-green-800/40 rounded-lg p-3">
              <p className="text-green-400 font-semibold mb-1">Para Producción (real)</p>
              <p className="text-gray-400">Sección: "Credenciales de producción"</p>
            </div>
          </div>
        </div>

        {/* Los valores */}
        <p className="font-semibold text-white mt-2">Los valores a copiar:</p>
        <div className="space-y-3">
          <CredField
            label="Access Token — SANDBOX (único con formato TEST-)"
            value="TEST-138407934620526-062303-046fb2e42e5c11635a8b6c2753feb4cc-3480421060"
            note="→ Este es el token más importante. Se usa server-side para tokenizar tarjetas Y procesar pagos. Debe estar en el campo 'Access Token Sandbox' del tenant en este panel."
          />
          <CredField
            label="Public Key — SANDBOX (en Perú tiene formato APP_USR-, no TEST-)"
            value="APP_USR-66240ce1-30bb-4077-ab5c-904038de3084"
            note="→ Se usa en el frontend para inicializar el SDK de MP. Va en el campo 'Public Key Sandbox' del tenant Y en VITE_MP_PUBLIC_KEY del .env del frontend."
          />
          <CredField
            label="Access Token — PRODUCCIÓN"
            value="APP_USR-138407934620526-062303-a671dc30bda209f072a440573fa6b7cb-3480421060"
            note="→ Solo para cobros reales. Va en el campo 'Access Token Producción' del tenant cuando estés listo para producción."
          />
          <CredField
            label="Public Key — PRODUCCIÓN"
            value="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            note="→ Solo para producción. Va en 'Public Key Producción' del tenant."
          />
        </div>

        <InfoBox type="tip">
          <strong>En Perú</strong>, la Public Key de prueba tiene formato <Code>APP_USR-</Code>, no <Code>TEST-</Code>.
          Esto es normal — no existe el prefijo TEST- para Public Key en el devsite peruano.
          El Access Token sí tiene el prefijo <Code>TEST-</Code> y es el único campo con ese formato.
        </InfoBox>

        {/* Usuario de prueba */}
        <p className="font-semibold text-white mt-2">Paso 4 — Obtener el email del usuario de prueba (pagador)</p>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-xs space-y-2">
          <p className="text-gray-400">
            En la sección "Credenciales de prueba" de tu app en el devsite, MP también genera un
            <strong className="text-white"> usuario de prueba</strong> para simular el pagador:
          </p>
          <div className="bg-gray-800 rounded-lg px-3 py-2 font-mono text-green-300">
            test_user_929212575859138583@testuser.com
          </div>
          <p className="text-gray-500">
            → Este email va en <Code>VITE_DEMO_PAYER_EMAIL</Code> del .env del frontend.<br />
            → El pagador en sandbox DEBE ser un test user (MP rechaza emails reales en sandbox con error 2198).<br />
            → Vendedor y pagador deben ser usuarios de prueba DIFERENTES (error si son el mismo).
          </p>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* 6. Registrar credenciales en Admin                  */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="credentials" icon={Database} color="bg-cyan-600/20 text-cyan-400"
        title="Registrar las credenciales en este panel (Admin UI)">

        <p>
          Una vez obtenidas las credenciales de MP, se registran directamente en el panel Admin.
          <strong className="text-white"> No se usan archivos .env para las credenciales por tenant</strong> — todo
          queda almacenado en la base de datos, de forma segura y por tenant.
        </p>

        <div className="space-y-4">
          <Step n={1} title='Ir al detalle del tenant' desc='Admin → Tenants → clic en "Detalle" del tenant a configurar.' />
          <Step n={2} title='Localizar la sección "Mercado Pago"' desc='Está debajo de la sección "Integración con app externa".' />

          <div className="ml-11 bg-gray-900 rounded-xl border border-gray-800 p-4 text-xs space-y-3">
            <p className="text-gray-400 font-semibold">En esa sección encontrarás:</p>
            <div className="space-y-2">
              {[
                { campo: 'Modo activo', valor: 'Toggle Sandbox / Producción — seleccionar el modo a usar' },
                { campo: 'Access Token Sandbox', valor: 'Pegar el valor TEST-xxxxx copiado del devsite MP' },
                { campo: 'Public Key Sandbox', valor: 'Pegar el valor APP_USR-xxxx copiado del devsite MP' },
                { campo: 'Access Token Producción', valor: 'Solo si vas a activar producción (APP_USR-xxxx)' },
                { campo: 'Public Key Producción', valor: 'Solo si vas a activar producción (APP_USR-xxxx)' },
              ].map(({ campo, valor }) => (
                <div key={campo} className="flex gap-3">
                  <span className="text-cyan-400 font-mono text-[11px] shrink-0 w-44">{campo}:</span>
                  <span className="text-gray-300">{valor}</span>
                </div>
              ))}
            </div>
          </div>

          <Step n={3} title='Pegar cada valor y guardar' desc='Los campos de token tienen ícono de ojo — puedes verlos mientras escribes. Haz clic en "Guardar cambios" cuando termines.' />

          <InfoBox type="tip">
            <strong>Dejar en blanco = no modificar.</strong> Si ya hay un token guardado y quieres conservarlo,
            simplemente deja el campo vacío al guardar. Solo escribe en el campo cuando quieras cambiarlo.
            Un badge verde <strong>"Configurado ✓"</strong> indica que ya hay un token guardado en BD.
          </InfoBox>

          <Step n={4} title='Verificar el indicador de estado' desc='Cada bloque (Sandbox / Producción) muestra "Configurado ✓" en verde o "Sin configurar ⚠" en amarillo según si los tokens están guardados.' />
        </div>

        {/* Frontend .env */}
        <p className="font-semibold text-white mt-3">¿Qué va en el .env del frontend?</p>
        <p className="text-xs text-gray-400 mb-2">
          El frontend solo necesita la <strong className="text-white">Public Key</strong> para inicializar el SDK de MP.
          El Access Token nunca va al frontend (es sensible y solo lo usa el backend).
        </p>
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 text-[10px] text-gray-400 font-mono flex items-center gap-2">
            <Terminal size={11} /> front/mp/.env
          </div>
          <pre className="p-4 text-xs text-green-300 overflow-x-auto">{`VITE_SANDBOX_MODE=true
VITE_MP_PUBLIC_KEY=APP_USR-66240ce1-30bb-4077-ab5c-904038de3084
VITE_API_BASE_URL=http://localhost:3000
VITE_TENANT_API_KEY=sk_demo_store_001
VITE_DEMO_PAYER_EMAIL=test_user_929212575859138583@testuser.com
VITE_DEMO_AMOUNT=150
VITE_DEMO_DESCRIPTION=Pago de demostración`}</pre>
        </div>

        <InfoBox type="warn">
          Después de cambiar el <Code>.env</Code> del frontend, reinicia el servidor de desarrollo
          (<Code>npm run dev</Code>) para que los cambios surtan efecto.
        </InfoBox>

        {/* Tabla resumen */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mt-2">
          <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 font-semibold">
            Resumen: ¿Dónde va cada credencial?
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-[11px] text-gray-500 uppercase">
                <th className="px-4 py-2 text-left">Credencial</th>
                <th className="px-4 py-2 text-left">Dónde registrar</th>
                <th className="px-4 py-2 text-left">Quién la usa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                ['Access Token Sandbox (TEST-)', 'Admin → Tenant → campo "Access Token Sandbox"', 'Backend: tokenizar tarjetas + crear pagos en MP'],
                ['Public Key Sandbox (APP_USR-)', 'Admin → Tenant → campo "Public Key Sandbox" + VITE_MP_PUBLIC_KEY', 'Frontend: inicializar MP SDK'],
                ['Access Token Producción (APP_USR-)', 'Admin → Tenant → campo "Access Token Producción"', 'Backend: pagos reales'],
                ['Public Key Producción (APP_USR-)', 'Admin → Tenant → campo "Public Key Producción" + VITE_MP_PUBLIC_KEY', 'Frontend: inicializar MP SDK (producción)'],
                ['Email pagador de prueba', 'VITE_DEMO_PAYER_EMAIL en front/.env', 'Demo page: email del pagador en sandbox'],
              ].map(([cred, donde, quien]) => (
                <tr key={cred}>
                  <td className="px-4 py-2.5 text-green-300 font-mono text-[11px]">{cred}</td>
                  <td className="px-4 py-2.5 text-gray-300">{donde}</td>
                  <td className="px-4 py-2.5 text-gray-400">{quien}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* 7. Flujo de pagos                                   */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="pagos" icon={CreditCard} color="bg-green-600/20 text-green-400" title="Flujo de pagos — Tarjeta y Yape">
        <div className="space-y-5">

          {/* Tarjeta */}
          <div>
            <p className="font-semibold text-white mb-3">Pago con Tarjeta (Crédito / Débito):</p>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 font-mono text-xs space-y-1">
              <p className="text-gray-500 mb-1">{'// Flujo sandbox (tokenización server-side)'}</p>
              <p><span className="text-blue-400">Frontend</span> <span className="text-gray-500">→ usuario ingresa datos de tarjeta</span></p>
              <p><span className="text-blue-400">Frontend</span> <span className="text-gray-500">→ POST /payments/card con rawCard + X-Api-Key</span></p>
              <p><span className="text-red-400">Backend </span> <span className="text-gray-500">→ identifica tenant → obtiene Access Token de BD</span></p>
              <p><span className="text-red-400">Backend </span> <span className="text-gray-500">→ POST /v1/card_tokens a MP (tokeniza server-side)</span></p>
              <p><span className="text-red-400">Backend </span> <span className="text-gray-500">→ POST /v1/payments a MP con token live_mode:false</span></p>
              <p><span className="text-yellow-400">MP     </span> <span className="text-gray-500">→ procesa y devuelve estado</span></p>
              <p><span className="text-red-400">Backend </span> <span className="text-gray-500">→ guarda en BD → POST callback al tenant</span></p>
              <p><span className="text-green-400">Widget </span> <span className="text-gray-500">→ muestra resultado al usuario</span></p>
            </div>
          </div>

          {/* Tarjeta de prueba */}
          <div>
            <p className="font-semibold text-white mb-2">Tarjeta de prueba para Sandbox (MP Perú):</p>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Número', value: '4009 1753 3280 6176' },
                { label: 'Nombre en tarjeta', value: 'APRO  (solo esa palabra)' },
                { label: 'Vencimiento', value: '11 / 2027  (cualquier fecha futura)' },
                { label: 'CVV', value: '123  (cualquier 3 dígitos)' },
                { label: 'DNI', value: '12345678  (cualquier número)' },
                { label: 'Resultado esperado', value: '✅ APPROVED — accredited' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="text-xs font-mono text-green-300 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              El nombre <strong>APRO</strong> es la instrucción para que MP sandbox apruebe el pago.
              Usar <strong>CONT</strong> para simular pago pendiente, <strong>CALL</strong> para rechazado.
            </p>
          </div>

        </div>

        <InfoBox type="tip">
          Los estados posibles de un pago: {' '}
          <Badge label="PENDING" color="bg-yellow-900/50 text-yellow-300" />{' '}
          <Badge label="APPROVED" color="bg-green-900/50 text-green-300" />{' '}
          <Badge label="REJECTED" color="bg-red-900/50 text-red-300" />{' '}
          <Badge label="IN_PROCESS" color="bg-blue-900/50 text-blue-300" />{' '}
          <Badge label="CANCELLED" color="bg-gray-700 text-gray-300" />{' '}
          <Badge label="CHARGED_BACK" color="bg-purple-900/50 text-purple-300" />
        </InfoBox>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* 8. Yape QR Sandbox                                  */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="yape" icon={FlaskConical} color="bg-amber-600/20 text-amber-400" title="Yape QR — Limitaciones del Sandbox">

        <InfoBox type="warn">
          <strong>Limitación de MP Perú Sandbox:</strong> El endpoint <Code>POST /v1/payments</Code> con
          <Code>payment_method_id: "yape"</Code> siempre falla en sandbox (error 19 o 41) porque los test users
          de MP no tienen cuentas BCP/Yape vinculadas. Esto es una limitación de la plataforma de MP, no del SDK.
        </InfoBox>

        <p>
          Para poder probar el flujo completo de Yape en sandbox, el sistema implementa un
          <strong className="text-white"> modo de simulación local</strong>:
        </p>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 font-mono text-xs space-y-1">
          <p className="text-gray-500 mb-1">{'// Flujo Yape en Sandbox (simulación local)'}</p>
          <p><span className="text-blue-400">Frontend</span> <span className="text-gray-500">→ POST /payments/yape + X-Api-Key</span></p>
          <p><span className="text-red-400">Backend </span> <span className="text-gray-500">→ intenta crear pago en MP → MP devuelve error</span></p>
          <p><span className="text-amber-400">Backend </span> <span className="text-gray-500">→ detecta error en NODE_ENV!="production"</span></p>
          <p><span className="text-amber-400">Backend </span> <span className="text-gray-500">→ guarda pago con ID: SANDBOX-[id] y estado PENDING</span></p>
          <p><span className="text-blue-400">Widget </span> <span className="text-gray-500">→ muestra panel naranja "Modo Sandbox — Simulación Yape"</span></p>
          <p><span className="text-blue-400">Usuario</span> <span className="text-gray-500">→ hace clic en "Simular pago aprobado"</span></p>
          <p><span className="text-red-400">Backend </span> <span className="text-gray-500">→ POST /debug/approve-yape/:id → actualiza BD a APPROVED</span></p>
          <p><span className="text-blue-400">Widget </span> <span className="text-gray-500">→ polling detecta APPROVED → muestra resultado exitoso</span></p>
        </div>

        <p>
          En <strong className="text-white">producción</strong> (con cuenta MP verificada y usuarios Yape reales),
          el flujo es diferente: MP genera un QR real que el usuario escanea con su app Yape.
          El modo sandbox solo existe para poder probar el flujo de UI completo.
        </p>

        <InfoBox type="ok">
          El flujo de UI (mostrar QR, esperar, mostrar éxito, disparar callbacks, guardar recibo) es
          idéntico en sandbox y producción. Solo cambia si el QR es real o simulado.
        </InfoBox>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* 9. Callbacks                                        */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="callbacks" icon={Webhook} color="bg-pink-600/20 text-pink-400" title="Callbacks a apps externas">
        <p>
          Cuando un pago es <strong className="text-white">aprobado</strong>, el backend hace un
          <Code>POST</Code> automático al <strong className="text-white">Callback URL</strong> del tenant.
          La app externa recibe la confirmación sin necesidad de polling.
        </p>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-2 font-mono">{'// Payload enviado al Callback URL'}</p>
          <pre className="text-xs text-green-300 overflow-x-auto">{`{
  "event":             "payment.approved",
  "paymentId":         "12345678",          // ID de MP (o SANDBOX-xxx en sandbox)
  "externalReference": "ORD-2024-001",      // tu referencia de orden
  "amount":            150.00,
  "currency":          "PEN",
  "method":            "CARD",              // "CARD" | "YAPE"
  "status":            "APPROVED",
  "statusDetail":      "accredited"
}`}</pre>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-green-950/40 border border-green-800/40 rounded-xl p-3 space-y-1">
            <p className="text-green-400 font-bold">✅ El callback llega cuando:</p>
            <ul className="text-green-300 space-y-0.5">
              <li>• Pago con tarjeta aprobado</li>
              <li>• Yape simulado aprobado (sandbox)</li>
              <li>• Yape real aprobado (producción)</li>
            </ul>
          </div>
          <div className="bg-yellow-950/40 border border-yellow-800/40 rounded-xl p-3 space-y-1">
            <p className="text-yellow-400 font-bold">⚠️ El callback NO llega cuando:</p>
            <ul className="text-yellow-300 space-y-0.5">
              <li>• Pago rechazado o pendiente</li>
              <li>• Tu URL no está configurada</li>
              <li>• Tu servidor responde error (no 200)</li>
            </ul>
          </div>
        </div>

        <InfoBox type="tip">
          Si el callback falla (timeout de 8s, servidor caído), el pago igual queda registrado en BD como aprobado.
          El sistema no reintenta. La app externa debe implementar su propio mecanismo de reconciliación o polling.
          En desarrollo local, usa <strong>ngrok</strong> para exponer tu servidor con HTTPS público.
        </InfoBox>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* 10. API Keys                                        */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="apikeys" icon={Key} color="bg-cyan-600/20 text-cyan-400" title="API Keys de Tenant">
        <p>
          La <strong className="text-white">API Key</strong> es la clave que las apps externas usan para
          autenticar sus peticiones de pago. Se genera automáticamente al crear el tenant con formato
          <Code>sk_[slug]_[random]</Code>.
        </p>
        <ul className="space-y-2">
          {[
            'Se envía en el header HTTP X-Api-Key en cada petición de pago',
            'Si la key es inválida o el tenant está inactivo → error 401',
            'Se puede regenerar en cualquier momento desde el detalle del tenant',
            'Al regenerar, la key anterior queda invalidada INMEDIATAMENTE',
            'Tratar como secreto: no exponerla en el código del frontend ni en repos públicos',
            'Guardarla como variable de entorno en el servidor de la app externa',
          ].map((t, i) => (
            <li key={i} className="flex gap-2 text-xs">
              <CheckCircle2 size={13} className="text-cyan-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>

        <InfoBox type="danger">
          Si sospechas que una API Key fue comprometida, regénérala inmediatamente desde el detalle del tenant.
          Notifica a la app externa para que actualice su <Code>.env</Code> con la nueva clave.
        </InfoBox>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* 11. Usuarios                                        */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="usuarios" icon={Users} color="bg-indigo-600/20 text-indigo-400" title="Gestión de Usuarios">
        <p>
          Los usuarios son específicos de un tenant — no pueden acceder a datos de otros.
          El SUPER_ADMIN puede crear, ver y activar/desactivar usuarios de cualquier tenant.
        </p>
        <div className="space-y-2">
          <Step n={1} title="Crear usuario" desc="Usuarios → Nuevo usuario → tenant, email, nombre, contraseña y rol." />
          <Step n={2} title="Asignar rol" desc="ADMIN para gestión del tenant. OPERATOR para operaciones de pago del día a día." />
          <Step n={3} title="Activar/desactivar" desc="El toggle bloquea el acceso sin eliminar el usuario ni su historial." />
        </div>
        <InfoBox type="tip">
          Un usuario desactivado no puede hacer login pero sus datos históricos se conservan para auditoría.
          Los refresh tokens activos de ese usuario quedan invalidados automáticamente.
        </InfoBox>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* 12. Monitor                                         */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="monitor" icon={Monitor} color="bg-teal-600/20 text-teal-400" title="Monitor de Pagos">
        <p>
          La sección <strong className="text-white">Pagos</strong> en este panel muestra todos los pagos de
          TODOS los tenants. Puedes filtrar por tenant, estado, método y rango de fechas.
        </p>
        <ul className="space-y-2">
          {[
            'Vista global — sin restricción de tenant (solo SUPER_ADMIN)',
            'Filtros: por tenant, estado (APPROVED, REJECTED, PENDING…) y método (CARD, YAPE)',
            'Cada fila: tenant, monto, método, estado, fecha y referencia externa',
            'IDs con prefijo SANDBOX-: pagos de prueba en modo simulación Yape',
            'Útil para detectar tasas de rechazo altas o problemas de integración',
          ].map((t, i) => (
            <li key={i} className="flex gap-2 text-xs">
              <CheckCircle2 size={13} className="text-teal-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* 13. FAQ                                             */}
      {/* ════════════════════════════════════════════════════ */}
      <Section id="faq" icon={AlertTriangle} color="bg-red-600/20 text-red-400" title="FAQ / Problemas comunes">
        <div className="space-y-4">
          {[
            {
              q: '¿Por qué los pagos con tarjeta se rechazan con error 2006?',
              a: 'El SDK del navegador creó un token live_mode:true, pero el TEST- access token solo acepta live_mode:false. Asegúrate de que VITE_SANDBOX_MODE=true en el .env del frontend para que el backend tokenice server-side.',
            },
            {
              q: '¿Por qué Yape falla con error 19 o 41 en sandbox?',
              a: 'Es una limitación de MP Perú: los test users no tienen cuentas Yape/BCP vinculadas. El sistema lo detecta automáticamente y activa el modo simulación sandbox. Esto es el comportamiento correcto — no un error del SDK.',
            },
            {
              q: '¿Por qué los pagos se rechazan con "invalid access token"?',
              a: 'El Access Token del tenant no está configurado o es incorrecto. Ve a Admin → Tenants → Detalle del tenant. Si el badge dice "Sin configurar ⚠", ingresa el Access Token correcto y guarda.',
            },
            {
              q: '¿Por qué no llegan los callbacks?',
              a: 'Verifica que el Callback URL sea accesible públicamente desde internet (no localhost). Si estás en desarrollo, usa ngrok: "npx ngrok http 3001". El servidor de la app externa debe responder HTTP 200 al recibir el callback.',
            },
            {
              q: '¿Qué pasa si regenero la API Key?',
              a: 'La clave anterior queda invalidada inmediatamente. Todas las apps externas que la usen recibirán errores 401. Actualiza la nueva clave en el .env de la app externa lo antes posible.',
            },
            {
              q: '¿Puedo tener un tenant en sandbox y otro en producción al mismo tiempo?',
              a: 'Sí. El modo es por tenant, no global. Puedes tener tenants de prueba en sandbox mientras otros cobran en producción simultáneamente.',
            },
            {
              q: '¿Dónde veo el motivo exacto de un rechazo de tarjeta?',
              a: 'En el monitor de pagos, el campo "statusDetail" de MP indica el motivo (ej: cc_rejected_insufficient_amount, cc_rejected_bad_filled_cvv, cc_rejected_card_disabled).',
            },
            {
              q: '¿Cómo paso a producción?',
              a: 'En Admin → Detalle del tenant: (1) ingresa las credenciales de producción (Access Token y Public Key de "Credenciales de producción" en el devsite MP), (2) cambia el modo a "Producción". En el frontend: cambia VITE_SANDBOX_MODE=false y actualiza VITE_MP_PUBLIC_KEY con la public key de producción.',
            },
            {
              q: '¿Los IDs con prefijo SANDBOX- son pagos reales?',
              a: 'No. Son pagos simulados localmente (solo existen en la BD) creados cuando Yape falla en sandbox de MP. En producción todos los IDs son numéricos y provienen de MP directamente.',
            },
          ].map(({ q, a }, i) => (
            <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <p className="font-semibold text-white text-sm mb-1.5 flex gap-2">
                <span className="text-red-400 shrink-0">Q:</span>{q}
              </p>
              <p className="text-gray-400 text-xs flex gap-2">
                <span className="text-green-400 shrink-0">A:</span>{a}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <div className="border-t border-gray-800 pt-6 text-center">
        <p className="text-xs text-gray-600">
          <RefreshCw size={10} className="inline mr-1" />
          SDK de Pagos — Mercado Pago Perú · Plataforma SaaS Multitenant
        </p>
      </div>

    </div>
  </div>
);
