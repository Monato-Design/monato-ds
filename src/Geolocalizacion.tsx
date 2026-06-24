import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './components/core/badge';
import OtpInput from './components/core/otp-input';
import { InfoCircle, Eye, EyeDisabled } from '@tailgrids/icons';

// ─── Types ──────────────────────────────────────────────────────────────────────
// User-facing surface of "Geolocalización en Sesión" (Finco Pay IFPE · Manual de
// Medios Electrónicos §2.3.4). Deliverables E1–E4.
//
// NOTE: this is the monato-ds PROTOTYPE. There is no HTTP client, session token,
// HMAC or Valkey here — those backend layers are mocked. What is real: the geo
// capture uses navigator.geolocation (D2). The single demo control is the in-app
// Flow Guide (top bar), which configures and walks each deliverable step by step.

type Screen =
  | 'login-email'
  | 'login-password'
  | 'geo-prompt'
  | 'login-2fa'
  | 'loading'
  | 'dashboard';

type BrowserKey = 'chrome' | 'firefox' | 'safari' | 'edge';

// E2 / D4 — two distinct error states, same layout, different copy.
type GeoErrorKind = 'denied' | 'unavailable';

// E1 geo gate sub-phase while screen === 'geo-prompt'.
type GeoPhase = 'priming' | 'locating' | 'blocked';

// How the geo capture resolves. 'real' uses navigator.geolocation; the rest are
// deterministic overrides set by the Flow Guide so each state is demoable.
type GeoScenario = 'real' | 'force-granted' | 'force-denied' | 'force-unavailable';

type TerminationReason =
  | 'inactivity_timeout'
  | 'context_ip_change'
  | 'context_device_change'
  | 'context_geo_change'
  | 'new_session_started';

// In-prototype flow guide — the deliverables from the spec (E1–E4).
type Deliverable = 'E1' | 'E2' | 'E3' | 'E4';

const SESSION_TTL = 300; // SESSION_TIMEOUT_MINUTES = 5
const WARNING_THRESHOLD = 60; // SESSION_WARNING_THRESHOLD_MINUTES = 1
const DEMO_EMAIL = 'staging.devs@fincopay.mx'; // pre-filled demo credentials

// Differentiated termination copy — verbatim from spec §4 (E4 / E6).
const TERMINATION: Record<TerminationReason, { http: string; title: string; message: string; cta?: string }> = {
  inactivity_timeout: {
    http: '401 SESSION_EXPIRED',
    title: 'Tu sesión ha expirado',
    message:
      'Tu sesión ha expirado por inactividad. Por seguridad, las sesiones se cierran automáticamente tras 5 minutos sin actividad. Vuelve a iniciar sesión para continuar.',
  },
  // Context-change closures (IP / device / geo) all share one GENERIC message —
  // never reveal what was detected (security-info leak · D6).
  context_ip_change: {
    http: '401 SESSION_INVALID',
    title: 'Sesión cerrada por seguridad',
    message: 'Por tu seguridad, cerramos tu sesión. Vuelve a iniciar sesión para continuar.',
  },
  context_device_change: {
    http: '401 SESSION_INVALID',
    title: 'Sesión cerrada por seguridad',
    message: 'Por tu seguridad, cerramos tu sesión. Vuelve a iniciar sesión para continuar.',
  },
  context_geo_change: {
    http: '401 SESSION_INVALID',
    title: 'Sesión cerrada por seguridad',
    message: 'Por tu seguridad, cerramos tu sesión. Vuelve a iniciar sesión para continuar.',
  },
  new_session_started: {
    http: '401 SESSION_INVALID',
    title: 'Sesión activa en otro dispositivo',
    message:
      'No puedes ingresar porque ya hay una sesión activa en otro dispositivo. Cierra esa sesión e intenta de nuevo.',
    cta: 'Intentar de nuevo',
  },
};

// E2 / D4 — blocked-state copy (verbatim from spec §4).
const GEO_BLOCKED_COPY: Record<GeoErrorKind, { title: string; message: string }> = {
  denied: {
    title: 'Ubicación requerida',
    message:
      'Para acceder a la plataforma necesitamos acceso a tu ubicación. Habilita la geolocalización en tu navegador e intenta de nuevo.',
  },
  unavailable: {
    title: 'No pudimos obtener tu ubicación',
    message:
      'No pudimos obtener tu ubicación. Revisa que los servicios de ubicación de tu equipo estén activos y que tengas conexión, e intenta de nuevo.',
  },
};

// ─── Browser detection + per-browser enable steps (E2) ───────────────────────────

function detectBrowser(): BrowserKey {
  if (typeof navigator === 'undefined') return 'chrome';
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'edge';
  if (/Firefox\//.test(ua)) return 'firefox';
  if (/Chrome\//.test(ua)) return 'chrome';
  if (/Safari\//.test(ua)) return 'safari';
  return 'chrome';
}

const BROWSER_STEPS: Record<BrowserKey, { label: string; steps: string[] }> = {
  chrome: {
    label: 'Chrome',
    steps: [
      'Haz clic en el ícono de candado o ubicación, a la izquierda de la barra de direcciones.',
      'Abre «Configuración del sitio» y localiza «Ubicación».',
      'Cámbiala a «Permitir» y recarga la página.',
    ],
  },
  firefox: {
    label: 'Firefox',
    steps: [
      'Haz clic en el ícono de permisos en la barra de direcciones.',
      'Elimina el bloqueo de «Acceder a tu ubicación».',
      'Recarga la página e intenta de nuevo.',
    ],
  },
  safari: {
    label: 'Safari',
    steps: [
      'Abre Safari → Ajustes → Sitios web → Ubicación.',
      'Selecciona customer.fincopay.mx en la lista.',
      'Elige «Permitir» y vuelve a la página.',
    ],
  },
  edge: {
    label: 'Edge',
    steps: [
      'Haz clic en el candado a la izquierda de la barra de direcciones.',
      'Abre «Permisos del sitio» y localiza «Ubicación».',
      'Cámbiala a «Permitir» y recarga la página.',
    ],
  },
};

// ─── Inline iconography ───────────────────────────────────────────────────────────

// FINCOPAY wordmark (dark version, for use on light backgrounds).
function FincopayLogo({ className = 'h-5 w-auto' }: { className?: string }) {
  return <img src="/cp-assets/logo-fincopay-dark.png" alt="FINCOPAY" className={className} />;
}

function GeoPinIcon({ size = 24, color = '#2563eb' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}

function Spinner({ size = 28, color = '#2563eb' }: { size?: number; color?: string }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  );
}

// ─── Login photo panel ────────────────────────────────────────────────────────────

function PhotoPanel() {
  return (
    <div className="w-1/2 h-full bg-gradient-to-br from-slate-200 via-blue-100 to-slate-300 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-80 h-72">
          <div className="absolute bottom-0 left-4 right-4 h-48 bg-white/60 rounded-2xl shadow-xl border border-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="w-48 h-32 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl shadow-lg flex items-end p-3">
              <div className="flex gap-1">
                <div className="w-8 h-2 bg-white/30 rounded" />
                <div className="w-12 h-2 bg-white/20 rounded" />
              </div>
            </div>
          </div>
          <div
            className="absolute top-0 right-0 w-20 h-28 rounded-xl shadow-lg rotate-12 border-2 border-white"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1d4ed8 100%)' }}
          >
            <div className="absolute bottom-3 right-3 flex gap-0.5">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <div className="w-4 h-4 rounded-full bg-yellow-400 -ml-1.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: login-email ──────────────────────────────────────────────────────────

function LoginEmailScreen({ onNext }: { onNext: (email: string) => void }) {
  const [email, setEmail] = useState(DEMO_EMAIL);
  const filled = email.trim().length > 3;

  return (
    <div className="w-1/2 h-full flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-16 max-w-lg">
        <h1 className="text-3xl font-semibold text-[#111827] mb-2">Inicio de sesión</h1>
        <p className="text-[#6b7280] text-base mb-16">Ingrese los datos para acceder a su cuenta</p>

        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-[#374151]">Correo Electrónico</label>
              <button className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
                Olvidé mi usuario <InfoCircle size={14} />
              </button>
            </div>
            <input
              type="email"
              placeholder="Ingrese su correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && filled && onNext(email)}
              className="w-full px-3 py-2.5 border border-[#d1d5db] rounded text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => filled && onNext(email)}
            className={`w-full py-3 rounded text-sm font-semibold transition-colors ${
              filled ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
            }`}
          >
            Continuar
          </button>
        </div>
      </div>

      <div className="pb-8 flex justify-center">
        <FincopayLogo />
      </div>
    </div>
  );
}

// ─── Screen: login-password ─────────────────────────────────────────────────────────

function LoginPasswordScreen({
  email,
  onNext,
  onBack,
}: {
  email: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const [password, setPassword] = useState('Fincopay2026');
  const [showPass, setShowPass] = useState(false);
  const filled = password.length > 0;

  return (
    <div className="w-1/2 h-full flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-16 max-w-lg">
        <h1 className="text-3xl font-semibold text-[#111827] mb-2">Hola de nuevo</h1>
        <p className="text-[#6b7280] text-base mb-2">Ingrese su contraseña para continuar</p>
        <p className="text-[#111827] text-sm font-medium mb-12 truncate">{email}</p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-[#374151] mb-1.5 block">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && filled && onNext()}
                className="w-full px-3 py-2.5 pr-10 border border-[#d1d5db] rounded text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
              >
                {showPass ? <EyeDisabled size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={() => filled && onNext()}
            className={`w-full py-3 rounded text-sm font-semibold transition-colors ${
              filled ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
            }`}
          >
            Continuar
          </button>

          <button onClick={onBack} className="text-sm text-[#6b7280] hover:text-[#111827] hover:underline self-center mt-1">
            ← Usar otra cuenta
          </button>
        </div>
      </div>

      <div className="pb-8 flex justify-center">
        <FincopayLogo />
      </div>
    </div>
  );
}

// ─── E1 — Priming modal (dismissable) ────────────────────────────────────────────
// Own modal that explains WHY; its CTA fires the native browser prompt (D2). The
// native prompt itself is not styled — it is the browser's own UI.

function GeoPrimingModal({ onAllow, onClose }: { onAllow: () => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 bg-black/40 flex items-center justify-center backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="bg-white rounded-2xl shadow-2xl w-[440px] p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 size-7 rounded-full border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] hover:bg-[#f9fafb] transition text-sm"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="size-14 rounded-2xl bg-[#eff6ff] flex items-center justify-center mx-auto mb-5">
          <GeoPinIcon size={28} />
        </div>

        <h2 className="text-xl font-semibold text-[#111827] text-center mb-3">Permiso de ubicación</h2>
        <p className="text-[#6b7280] text-sm leading-relaxed text-center mb-6">
          Necesitamos tu ubicación. Por regulación, Finco Pay registra la ubicación del dispositivo al
          iniciar sesión y cierra la sesión si cambia durante el uso. Tu ubicación no se comparte ni se
          muestra a terceros.
        </p>

        <button
          onClick={onAllow}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          Permitir ubicación
        </button>
      </motion.div>
    </div>
  );
}

// ─── E1 / E3 — "obteniendo ubicación" loading overlay ─────────────────────────────

function GeoLocatingOverlay() {
  return (
    <div className="absolute inset-0 z-40 bg-black/30 flex items-center justify-center backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-7 flex flex-col items-center gap-3">
        <Spinner size={30} />
        <p className="text-[#374151] text-sm font-medium">Obteniendo ubicación…</p>
      </div>
    </div>
  );
}

// ─── E2 — Blocked modal (NON-dismissable) ─────────────────────────────────────────
// No ✕, no click-outside, no Esc. Differentiated copy by kind (D4). Browser
// instructions auto-detect the current browser, with manual tabs as fallback.

function GeoBlockedModal({ kind, onRetry }: { kind: GeoErrorKind; onRetry: () => void }) {
  const [browser, setBrowser] = useState<BrowserKey>(() => detectBrowser());
  const copy = GEO_BLOCKED_COPY[kind];

  return (
    <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-full overflow-y-auto p-8"
      >
        <div className="size-16 rounded-2xl bg-[#fef2f2] flex items-center justify-center mx-auto mb-5">
          <GeoPinIcon size={30} color="#dc2626" />
        </div>

        <h2 className="text-xl font-semibold text-[#111827] text-center mb-2">{copy.title}</h2>
        <p className="text-[#6b7280] text-sm leading-relaxed text-center mb-6">{copy.message}</p>

        {/* Browser selector — relevant browser pre-selected via detection */}
        <div className="flex gap-1 p-1 bg-[#f3f4f6] rounded-lg mb-3">
          {(Object.keys(BROWSER_STEPS) as BrowserKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setBrowser(key)}
              className={`flex-1 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                browser === key ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'
              }`}
            >
              {BROWSER_STEPS[key].label}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="bg-[#f9fafb] border border-[#eef1f4] rounded-lg p-4 mb-6">
          <ol className="space-y-2.5">
            {BROWSER_STEPS[browser].steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-[13px] text-[#374151] leading-relaxed">
                <span className="size-5 shrink-0 rounded-full bg-[#0f172a] text-white text-[11px] font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={onRetry}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] transition"
        >
          Reintentar
        </button>
      </motion.div>
    </div>
  );
}

// ─── Modal: 2FA / TOTP ──────────────────────────────────────────────────────────────

function TwoFAModal({ onVerify, onClose }: { onVerify: () => void; onClose: () => void }) {
  const [code, setCode] = useState('123456');

  const handleVerify = () => {
    if (code === '123456') onVerify();
  };

  return (
    <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-[420px] p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 size-7 rounded-full border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] hover:bg-[#f9fafb] transition text-sm"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-bold text-[#111827]">Verificación requerida</h2>

          <div className="size-14 rounded-xl bg-[#f3f4f6] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <path d="M9 7h6M9 11h6M9 15h4" />
              <circle cx="17" cy="17" r="3" fill="white" stroke="#6b7280" />
              <path d="M16 17.5l.8.8 1.7-1.7" strokeWidth="1.2" />
            </svg>
          </div>

          <p className="text-sm text-[#6b7280] text-center">
            Inserta el código que aparece en tu aplicación de autenticación
          </p>

          {/* Ignore the empty value OtpInput emits on mount — otherwise the
              prefilled code ping-pongs between '' and '123456' (flicker loop). */}
          <OtpInput digitLength={6} value={code} onChange={(e) => { if (e.target.value) setCode(e.target.value); }} />

          <p className="text-xs text-[#9ca3af]">Usa 123456 para continuar</p>

          <button
            onClick={handleVerify}
            className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors ${
              code.length === 6 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-200 text-white cursor-not-allowed'
            }`}
          >
            Verificar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Screen: loading ──────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <motion.img
        src="/cp-assets/logo-fincopay-dark.png"
        alt="FINCOPAY"
        className="h-8 w-auto"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// ─── Dashboard sidebar ──────────────────────────────────────────────────────────────

function SidebarOps({ onLogout }: { onLogout: () => void }) {
  const items = [
    { id: 'dashboard-ops', icon: '/cp-assets/icon-dashboard.svg', label: 'Dashboard', active: true },
    { id: 'contactos', icon: '/cp-assets/icon-contactos.svg', label: 'Contactos' },
    { id: 'cuentas', icon: '/cp-assets/icon-cuentas.svg', label: 'Cuentas' },
    { id: 'movimientos', icon: '/cp-assets/icon-movimientos.svg', label: 'Movimientos' },
    { id: 'estados', icon: '/cp-assets/icon-estados.svg', label: 'Estados de Cuenta' },
  ];

  return (
    <div className="w-[275px] h-full bg-[#1a1a1a] flex flex-col shrink-0 overflow-auto">
      <div className="px-6 pt-4 pb-3">
        <img src="/cp-assets/logo-fincopay.png" alt="FINCOPAY" className="h-[30px] w-auto" />
      </div>

      <div className="flex-1 px-6 flex flex-col gap-5">
        <div>
          <p className="text-[#99a1af] text-[12px] font-medium uppercase pl-3 pb-3">Operaciones</p>
          <div className="flex flex-col gap-1">
            {items.map((it) => (
              <button
                key={it.id}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
                  it.active ? 'bg-white text-black' : 'text-white hover:bg-white/10'
                }`}
              >
                <img src={it.icon} alt="" className="size-5 shrink-0" />
                {it.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[#99a1af] text-[12px] font-medium uppercase pl-3 pb-3">Ayuda</p>
          <button className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors">
            <img src="/cp-assets/icon-soporte.svg" alt="" className="size-5 shrink-0" />
            Soporte
          </button>
        </div>
      </div>

      <div className="px-6 pb-4 flex flex-col gap-2 mt-auto pt-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 p-2 rounded-lg text-white text-sm hover:bg-white/10 transition-colors"
        >
          <img src="/cp-assets/icon-logout.svg" alt="" className="size-6 shrink-0" />
          <span className="font-semibold">Cerrar Sesión</span>
        </button>
        <div className="flex items-center bg-[#2a2a2a] rounded-lg py-2">
          <img src="/cp-assets/user-icon.png" alt="" className="h-[41px] w-[41px] shrink-0" />
          <div className="pl-2">
            <p className="text-white text-base leading-6">Karola Amador</p>
            <p className="text-white text-sm leading-5">Ultima sesión: 2/6/2026,</p>
            <p className="text-white text-sm leading-5">10:15:05</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function QuickCard({ label, imgSrc }: { label: string; imgSrc: string }) {
  return (
    <div className="bg-[#f7f9fb] rounded-[10px] border border-[#eef1f4] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.04)] flex flex-col items-center gap-3 px-4 py-6 hover:border-[#d9e2ec] transition-colors cursor-default">
      <img src={imgSrc} alt="" className="h-12 w-12 object-contain" />
      <span className="text-[#333] text-[15px]">{label}</span>
    </div>
  );
}

// ─── Screen: dashboard (D6 — no IP / UA / coords / token in product UI) ────────────

function DashboardScreen({ secondsRemaining, onLogout }: { secondsRemaining: number; onLogout: () => void }) {
  const warning = secondsRemaining <= WARNING_THRESHOLD;

  return (
    <div className="w-full h-full flex overflow-hidden">
      <SidebarOps onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top nav */}
        <div className="h-[64px] border-b border-[#e5e7eb] flex items-center justify-between px-8 shrink-0 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] sticky top-0 bg-white z-10">
          <span className="text-black text-[16px] leading-[24px] pl-4">Dashboard</span>
          <div className="flex items-center gap-3">
            {/* Live session TTL chip */}
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium ${
                warning ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#ecfdf5] text-[#047857]'
              }`}
            >
              <span className={`size-1.5 rounded-full ${warning ? 'bg-[#f59e0b]' : 'bg-[#10b981]'}`} />
              Sesión {fmt(secondsRemaining)}
            </span>
            <img src="/cp-assets/logo-nav.png" alt="" className="h-[25px] w-[25px]" />
            <span className="text-black text-[16px] leading-[24px]">Staging Devs, S.A. de C.V.</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="bg-[#f7f9fb] rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.05)] flex flex-col items-center px-6 py-8 mb-5">
            <p className="text-black text-[25.6px] leading-[38.4px]">Staging Devs</p>
            <p className="text-black text-[19.2px] leading-[28.8px] font-thin">Staging Developers, S.A. de C.V.</p>
          </div>

          {/* Neutral product content — no monitored context shown to the user (D6) */}
          <div className="grid grid-cols-4 gap-4">
            <QuickCard label="Cuentas" imgSrc="/cp-assets/img-cuentas.png" />
            <QuickCard label="Transacciones" imgSrc="/cp-assets/img-transacciones.png" />
            <QuickCard label="Reportes" imgSrc="/cp-assets/img-reportes.png" />
            <QuickCard label="Instrumentos" imgSrc="/cp-assets/img-instrumentos.png" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── E5 — Session expiry banner ───────────────────────────────────────────────────

function SessionExpiryBanner({
  secondsRemaining,
  onContinue,
  onLogout,
}: {
  secondsRemaining: number;
  onContinue: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {/* Dim + blur the background to draw attention. pointer-events-none keeps
          the banner non-blocking (clicks still reach the dashboard). */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 z-30 bg-black/25 backdrop-blur-sm pointer-events-none"
      />

      <motion.div
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -70, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-[600px] max-w-[92%]"
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#f59e0b] ring-4 ring-[#f59e0b]/20 overflow-hidden">
          <div className="bg-[#f59e0b] px-5 py-2 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l9.5 16.5H2.5L12 3z" />
              <path d="M12 10v4M12 17h.01" />
            </svg>
            <span className="text-white text-[12px] font-semibold uppercase tracking-wide">Aviso de seguridad</span>
          </div>
          <div className="px-5 py-4 flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="size-11 rounded-xl bg-[#fef3c7] flex items-center justify-center shrink-0"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l9.5 16.5H2.5L12 3z" />
                <path d="M12 10v4M12 17h.01" />
              </svg>
            </motion.div>
            <div className="flex-1">
              <p className="text-[#111827] text-[15px] font-semibold leading-snug">
                Tu sesión expirará en menos de 1 minuto. ¿Deseas continuar?
              </p>
              <p className="text-[#92400e] text-[13px] mt-0.5 font-medium">Tiempo restante: {fmt(secondsRemaining)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={onLogout}
                className="px-3.5 py-2 rounded-lg text-[13px] font-medium text-[#374151] border border-[#d1d5db] hover:bg-[#f9fafb] transition"
              >
                Cerrar sesión
              </button>
              <button
                onClick={onContinue}
                className="px-3.5 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] transition"
              >
                Continuar sesión
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── E4 / E6 — Session ended modal (NON-dismissable) ──────────────────────────────

function SessionEndedModal({ reason, onRestart }: { reason: TerminationReason; onRestart: () => void }) {
  const t = TERMINATION[reason];
  const isSecurity = reason !== 'inactivity_timeout';

  return (
    <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="bg-white rounded-2xl shadow-2xl w-[440px] p-8 text-center"
      >
        <div className={`size-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isSecurity ? 'bg-[#fef2f2]' : 'bg-[#f3f4f6]'}`}>
          {isSecurity ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l7 3v5c0 4.5-3 8.3-7 9.5C8 22.3 5 18.5 5 14V6l7-3z" />
              <path d="M12 9v4M12 16h.01" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          )}
        </div>

        <h2 className="text-xl font-semibold text-[#111827] mb-2">{t.title}</h2>
        <p className="text-[#6b7280] text-sm leading-relaxed mb-6">{t.message}</p>

        <button
          onClick={onRestart}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] transition"
        >
          {t.cta ?? 'Iniciar sesión nuevamente'}
        </button>
      </motion.div>
    </div>
  );
}

// ─── Flow guide — the single in-prototype control (top bar dropdown) ──────────────

const DELIVERABLES: Record<Deliverable, { color: string; short: string; label: string; steps: string[] }> = {
  E1: {
    color: '#16a34a',
    short: 'Permiso otorgado',
    label: 'E1 · Login primera vez · otorgado',
    steps: ['Credenciales', 'Modal priming', 'Prompt nativo', 'Coordenadas capturadas', 'MFA / TOTP', 'Dashboard'],
  },
  E2: {
    color: '#dc2626',
    short: 'Permiso denegado',
    label: 'E2 · Login primera vez · denegado',
    steps: ['Credenciales', 'Modal priming', 'Prompt nativo', 'Deniega / no disponible', 'Modal bloqueado', 'Reintentar'],
  },
  E3: {
    color: '#2563eb',
    short: 'Login recurrente',
    label: 'E3 · Login recurrente · silencioso',
    steps: ['Credenciales', 'Captura silenciosa', 'MFA / TOTP', 'Dashboard'],
  },
  E4: {
    color: '#d97706',
    short: 'Cierre por contexto',
    label: 'E4 · Cierre por cambio de contexto',
    steps: ['Sesión activa', 'Cambio detectado', '401 SESSION_INVALID', 'Modal de cierre', 'Reiniciar sesión'],
  },
};

const E4_TRIGGERS: { reason: TerminationReason; label: string }[] = [
  { reason: 'context_geo_change', label: 'Ubicación' },
  { reason: 'context_ip_change', label: 'IP' },
  { reason: 'context_device_change', label: 'Dispositivo' },
];

function flowStepIndex(
  d: Deliverable,
  s: { screen: Screen; geoPhase: GeoPhase; termination: TerminationReason | null },
): number {
  if (d === 'E1' || d === 'E2') {
    if (s.screen === 'login-email' || s.screen === 'login-password') return 0;
    if (s.screen === 'geo-prompt') {
      if (s.geoPhase === 'priming') return 1;
      if (s.geoPhase === 'locating') return 2;
      if (s.geoPhase === 'blocked') return 4; // E2 modal bloqueado
    }
    if (s.screen === 'login-2fa') return 4; // E1 → MFA
    if (s.screen === 'loading' || s.screen === 'dashboard') return 5;
    return 0;
  }
  if (d === 'E3') {
    if (s.screen === 'login-email' || s.screen === 'login-password') return 0;
    if (s.screen === 'geo-prompt') return 1;
    if (s.screen === 'login-2fa') return 2;
    if (s.screen === 'loading' || s.screen === 'dashboard') return 3;
    return 0;
  }
  // E4
  if (s.termination) return 3;
  if (s.screen === 'dashboard') return 0;
  return 0;
}

function FlowGuide({
  active,
  scenario,
  screen,
  geoPhase,
  termination,
  onSelect,
  onSelectVariant,
  onTriggerContext,
}: {
  active: Deliverable | null;
  scenario: GeoScenario;
  screen: Screen;
  geoPhase: GeoPhase;
  termination: TerminationReason | null;
  onSelect: (d: Deliverable) => void;
  onSelectVariant: (kind: GeoErrorKind) => void;
  onTriggerContext: (reason: TerminationReason) => void;
}) {
  const [open, setOpen] = useState(true);
  const current = active ? flowStepIndex(active, { screen, geoPhase, termination }) : -1;
  const onDash = screen === 'dashboard' && !termination;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-white/60 hover:text-white text-[11px] border border-white/15 hover:border-white/30 rounded px-2 py-0.5 transition"
        title="Guía de flujo (E1–E4)"
      >
        <span className="size-1.5 rounded-full" style={{ background: active ? DELIVERABLES[active].color : '#9ca3af' }} />
        {active ? `Guía · ${active}` : 'Guía de flujo'}
        <span className="text-white/40">{open ? '▾' : '▸'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-[calc(100%+8px)] w-[300px] text-left"
          >
            <div className="bg-white rounded-xl shadow-2xl border border-[#e5e7eb] overflow-hidden">
              <div className="px-3 py-3 space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-[#666] px-1">Elige el flujo a seguir</p>

                <div className="grid grid-cols-2 gap-1.5">
                  {(['E1', 'E2', 'E3', 'E4'] as Deliverable[]).map((d) => {
                    const sel = active === d;
                    const c = DELIVERABLES[d].color;
                    return (
                      <button
                        key={d}
                        onClick={() => onSelect(d)}
                        className="text-left px-2.5 py-2 rounded-lg border transition"
                        style={sel ? { borderColor: c, background: `${c}14`, color: c } : { borderColor: '#e5e7eb', color: '#374151' }}
                      >
                        <span className="text-[12px] font-semibold">{d}</span>
                        <span className="block text-[11px] leading-tight">{DELIVERABLES[d].short}</span>
                      </button>
                    );
                  })}
                </div>

                {active ? (
                  <>
                    <div className="rounded-lg bg-[#f9fafb] border border-[#eef1f4] p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] uppercase tracking-wider text-[#666]">{DELIVERABLES[active].label}</p>
                        <button onClick={() => onSelect(active)} className="text-[11px] text-[#6b7280] hover:text-[#111827]" title="Reiniciar este flujo">
                          ↺
                        </button>
                      </div>
                      <ol className="space-y-1.5">
                        {DELIVERABLES[active].steps.map((step, i) => {
                          const done = i < current;
                          const cur = i === current;
                          const c = DELIVERABLES[active].color;
                          return (
                            <li key={i} className="flex items-center gap-2 text-[12px]">
                              <span
                                className="size-4 rounded-full flex items-center justify-center text-[9px] shrink-0 font-semibold"
                                style={cur ? { background: c, color: '#fff' } : done ? { background: '#d1fae5', color: '#047857' } : { background: '#e5e7eb', color: '#9ca3af' }}
                              >
                                {done ? '✓' : i + 1}
                              </span>
                              <span style={{ color: cur ? '#111827' : done ? '#6b7280' : '#9ca3af', fontWeight: cur ? 500 : 400 }}>{step}</span>
                            </li>
                          );
                        })}
                      </ol>
                    </div>

                    {/* E2 — D4 variant switch (denegado / no disponible) */}
                    {active === 'E2' && (
                      <div className="flex gap-1.5">
                        {([['denied', 'Denegado'], ['unavailable', 'No disponible']] as [GeoErrorKind, string][]).map(([k, label]) => {
                          const sel = scenario === (k === 'denied' ? 'force-denied' : 'force-unavailable');
                          return (
                            <button
                              key={k}
                              onClick={() => onSelectVariant(k)}
                              className={`flex-1 py-1.5 rounded-lg text-[12px] border transition ${
                                sel ? 'border-[#dc2626] bg-[#fef2f2] text-[#dc2626] font-medium' : 'border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb]'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* E4 — fire the context-change event */}
                    {active === 'E4' && (
                      <div>
                        <p className="text-[11px] text-[#666] px-1 mb-1.5">Disparar cambio de contexto:</p>
                        <div className="flex gap-1.5">
                          {E4_TRIGGERS.map((t) => (
                            <button
                              key={t.reason}
                              disabled={!onDash}
                              onClick={() => onTriggerContext(t.reason)}
                              className="flex-1 py-1.5 rounded-lg text-[12px] border border-[#fcd34d] bg-[#fffbeb] text-[#92400e] hover:bg-[#fef3c7] disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                        {!onDash && <p className="text-[11px] text-[#9ca3af] px-1 mt-1">Disponible dentro de la sesión activa</p>}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[12px] text-[#9ca3af] px-1 leading-relaxed">Elige un entregable para configurar y seguir su flujo paso a paso.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Screens gallery (handoff view — every screen/state, no flow) ─────────────────

type ScreenKind =
  | 'login-email'
  | 'login-password'
  | 'geo-priming'
  | 'geo-locating'
  | 'geo-blocked-denied'
  | 'geo-blocked-unavailable'
  | 'twofa'
  | 'loading'
  | 'dashboard'
  | 'expiry-banner'
  | 'ended-inactivity'
  | 'ended-context'
  | 'ended-newsession';

const SCREENS: { kind: ScreenKind; label: string; tag: string }[] = [
  { kind: 'login-email', label: 'Login · correo', tag: 'Login' },
  { kind: 'login-password', label: 'Login · contraseña', tag: 'Login' },
  { kind: 'geo-priming', label: 'Permiso de ubicación', tag: 'E1' },
  { kind: 'geo-locating', label: 'Obteniendo ubicación', tag: 'E1·E3' },
  { kind: 'geo-blocked-denied', label: 'Bloqueado · denegado', tag: 'E2' },
  { kind: 'geo-blocked-unavailable', label: 'Bloqueado · no disponible', tag: 'E2' },
  { kind: 'twofa', label: 'Verificación 2FA', tag: 'Login' },
  { kind: 'loading', label: 'Cargando', tag: 'Login' },
  { kind: 'dashboard', label: 'Dashboard', tag: '—' },
  { kind: 'expiry-banner', label: 'Banner de expiración', tag: 'E5' },
  { kind: 'ended-inactivity', label: 'Cierre · inactividad', tag: 'E6' },
  { kind: 'ended-context', label: 'Cierre por seguridad (genérico)', tag: 'E4' },
  { kind: 'ended-newsession', label: 'Bloqueo · sesión activa en otro dispositivo', tag: 'E4' },
];

const SCREEN_W = 1180;
const SCREEN_H = 760;
const PREVIEW_W = 1040; // near full-size previews, stacked vertically
const PREVIEW_SCALE = PREVIEW_W / SCREEN_W;

function StaticScreen({ kind }: { kind: ScreenKind }) {
  const noop = () => {};

  if (kind === 'loading') return <LoadingScreen />;
  if (kind === 'dashboard') return <DashboardScreen secondsRemaining={240} onLogout={noop} />;
  if (kind === 'expiry-banner') {
    return (
      <div className="w-full h-full relative">
        <DashboardScreen secondsRemaining={45} onLogout={noop} />
        <SessionExpiryBanner secondsRemaining={45} onContinue={noop} onLogout={noop} />
      </div>
    );
  }
  if (kind.startsWith('ended-')) {
    const reason: TerminationReason =
      kind === 'ended-context'
        ? 'context_ip_change'
        : kind === 'ended-newsession'
          ? 'new_session_started'
          : 'inactivity_timeout';
    return (
      <div className="w-full h-full relative">
        <DashboardScreen secondsRemaining={120} onLogout={noop} />
        <SessionEndedModal reason={reason} onRestart={noop} />
      </div>
    );
  }
  if (kind === 'login-email') {
    return (
      <div className="w-full h-full flex bg-white relative">
        <LoginEmailScreen onNext={noop} />
        <PhotoPanel />
      </div>
    );
  }

  const overlay =
    kind === 'geo-priming' ? (
      <GeoPrimingModal onAllow={noop} onClose={noop} />
    ) : kind === 'geo-locating' ? (
      <GeoLocatingOverlay />
    ) : kind === 'geo-blocked-denied' ? (
      <GeoBlockedModal kind="denied" onRetry={noop} />
    ) : kind === 'geo-blocked-unavailable' ? (
      <GeoBlockedModal kind="unavailable" onRetry={noop} />
    ) : kind === 'twofa' ? (
      <TwoFAModal onVerify={noop} onClose={noop} />
    ) : null;

  return (
    <div className="w-full h-full flex bg-white relative">
      <LoginPasswordScreen email={DEMO_EMAIL} onNext={noop} onBack={noop} />
      <PhotoPanel />
      {overlay}
    </div>
  );
}

function ScreensGallery() {
  return (
    <div className="w-full h-full overflow-y-auto bg-[#f5f6f8] p-6">
      <div className="mx-auto flex flex-col items-center gap-8" style={{ maxWidth: PREVIEW_W }}>
        <p className="text-[#6b7280] text-sm self-start">
          Pantallas del prototipo para handoff a ingeniería · {SCREENS.length} estados.
        </p>
        {SCREENS.map((s) => (
          <div key={s.kind} className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#333] text-[14px] font-medium">{s.label}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#eef1f4] text-[#666]">{s.tag}</span>
            </div>
            <div
              className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm relative overflow-hidden"
              style={{ width: PREVIEW_W, height: Math.round(SCREEN_H * PREVIEW_SCALE) }}
            >
              <div
                className="select-none"
                style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}
              >
                <StaticScreen kind={s.kind} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mac desktop wrapper ────────────────────────────────────────────────────────────

function GeoMacDesktop({
  onExit,
  initialMode = 'flow',
  initialGuide = null,
}: {
  onExit: () => void;
  initialMode?: 'flow' | 'screens';
  initialGuide?: Deliverable | null;
}) {
  const [screen, setScreen] = useState<Screen>('login-email');
  const [email, setEmail] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(SESSION_TTL);
  const [termination, setTermination] = useState<TerminationReason | null>(null);

  // Geo gate state (E1–E3)
  const [geoPhase, setGeoPhase] = useState<GeoPhase>('priming');
  const [geoError, setGeoError] = useState<GeoErrorKind | null>(null);
  const [silentCapture, setSilentCapture] = useState(false);
  const [scenario, setScenario] = useState<GeoScenario>('real');
  const [recurringMode, setRecurringMode] = useState(false);
  const [guide, setGuide] = useState<Deliverable | null>(initialGuide);
  const [mode, setMode] = useState<'flow' | 'screens'>(initialMode);
  const [copied, setCopied] = useState(false);

  const tickRef = useRef<number | null>(null);

  // E3 — recurring login captures silently: no popup, no toast, straight to MFA.
  const proceedToMfa = () => {
    setShow2FA(true);
    setScreen('login-2fa');
    setGeoPhase('priming'); // reset for a future login
  };

  // Geo capture — real navigator.geolocation (D2), overridable via scenario.
  const runCapture = (silent: boolean) => {
    setSilentCapture(silent);
    setGeoError(null);
    setGeoPhase('locating');

    const fail = (kind: GeoErrorKind) => {
      setGeoError(kind);
      setGeoPhase('blocked');
    };

    if (scenario === 'force-granted') {
      window.setTimeout(() => proceedToMfa(), 500);
      return;
    }
    if (scenario === 'force-denied') {
      window.setTimeout(() => fail('denied'), 500);
      return;
    }
    if (scenario === 'force-unavailable') {
      window.setTimeout(() => fail('unavailable'), 500);
      return;
    }

    // Real API
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      fail('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => proceedToMfa(),
      (err) => fail(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
    );
  };

  // D1 — geo requested right after password, before any branch. Recurring login
  // (E3) skips the priming modal and captures silently.
  const handlePasswordNext = () => {
    setGeoError(null);
    setScreen('geo-prompt');
    if (recurringMode) {
      runCapture(true);
    } else {
      setGeoPhase('priming');
    }
  };

  // Deep-link: configure the requested flow once on mount.
  useEffect(() => {
    if (initialGuide) selectFlow(initialGuide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL hash in sync with the current view so it can be shared.
  // replaceState is silent (no hashchange event) → no feedback loop.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const h = mode === 'screens' ? 'geo/screens' : guide ? `geo/flow/${guide}` : 'geo/flow';
    if (window.location.hash !== `#${h}`) window.history.replaceState(null, '', `#${h}`);
  }, [mode, guide]);

  const copyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      });
    }
  };

  // Simulated poll countdown while on the dashboard.
  useEffect(() => {
    if (screen !== 'dashboard' || termination) return;
    tickRef.current = window.setInterval(() => {
      setSecondsRemaining((s) => {
        if (s <= 1) {
          setTermination('inactivity_timeout');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [screen, termination]);

  const resetLoginState = () => {
    setEmail('');
    setShow2FA(false);
    setSecondsRemaining(SESSION_TTL);
    setTermination(null);
    setGeoPhase('priming');
    setGeoError(null);
    setSilentCapture(false);
  };

  const resetToLogin = () => {
    resetLoginState();
    setScreen('login-email');
  };

  const enterDashboard = () => {
    setShow2FA(false);
    setSecondsRemaining(SESSION_TTL);
    setTermination(null);
    setScreen('loading');
    setTimeout(() => setScreen('dashboard'), 2000);
  };

  // Flow guide — selecting a deliverable configures the scenario and resets the
  // flow to its starting point so it can be walked step by step.
  const selectFlow = (d: Deliverable) => {
    setGuide(d);
    resetLoginState();
    if (d === 'E1') {
      setScenario('real');
      setRecurringMode(false);
      setScreen('login-email');
    } else if (d === 'E2') {
      setScenario('force-denied');
      setRecurringMode(false);
      setScreen('login-email');
    } else if (d === 'E3') {
      setScenario('force-granted');
      setRecurringMode(true);
      setScreen('login-email');
    } else {
      // E4 — jump straight to an active session, ready to trigger a context event
      setRecurringMode(false);
      setScreen('dashboard');
    }
  };

  // E2 / D4 — switch the blocked variant and restart the flow from the login.
  const selectE2Variant = (kind: GeoErrorKind) => {
    setScenario(kind === 'denied' ? 'force-denied' : 'force-unavailable');
    setRecurringMode(false);
    resetLoginState();
    setScreen('login-email');
  };

  const titleMap: Record<Screen, string> = {
    'login-email': 'Finco Pay · Inicio de sesión',
    'login-password': 'Finco Pay · Inicio de sesión',
    'geo-prompt': 'Finco Pay · Validación de ubicación',
    'login-2fa': 'Finco Pay · Verificación',
    loading: 'Finco Pay · Cargando',
    dashboard: 'Finco Pay · Customer Platform',
  };

  return (
    <div className="w-full h-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-[1280px] rounded-xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
        style={{ height: 'min(860px, calc(100vh - 32px))' }}
      >
        {/* Mac title bar — relative z-50 so the flow-guide dropdown sits above content */}
        <div className="h-9 bg-[#1e1e1e] flex items-center px-4 gap-2 shrink-0 relative z-50">
          <button
            onClick={onExit}
            className="size-3 rounded-full bg-red-500 hover:bg-red-400 transition flex items-center justify-center group"
            title="Volver al catálogo"
          >
            <span className="text-red-900 text-[8px] font-bold opacity-0 group-hover:opacity-100">✕</span>
          </button>
          <div className="size-3 rounded-full bg-yellow-500" />
          <div className="size-3 rounded-full bg-green-500" />
          <div className="flex-1 flex justify-center">
            <span className="text-white/40 text-[11px]">{titleMap[screen]}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle: interactive flow vs screens gallery */}
            <div className="flex items-center rounded-md border border-white/15 overflow-hidden text-[11px]">
              <button
                onClick={() => setMode('flow')}
                className={`px-2 py-0.5 transition ${mode === 'flow' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80'}`}
              >
                Flujo
              </button>
              <button
                onClick={() => setMode('screens')}
                className={`px-2 py-0.5 transition ${mode === 'screens' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80'}`}
              >
                Pantallas
              </button>
            </div>

            {/* Flow guide — only relevant in flow mode */}
            {mode === 'flow' && (
              <FlowGuide
                active={guide}
                scenario={scenario}
                screen={screen}
                geoPhase={geoPhase}
                termination={termination}
                onSelect={selectFlow}
                onSelectVariant={selectE2Variant}
                onTriggerContext={(reason) => setTermination(reason)}
              />
            )}

            {/* Shareable deep-link to the current view */}
            <button
              onClick={copyLink}
              className="flex items-center gap-1 text-white/50 hover:text-white text-[11px] border border-white/15 hover:border-white/30 rounded px-2 py-0.5 transition"
              title="Copiar link a esta vista"
            >
              {copied ? '¡Copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>

        {/* App content */}
        <div className="flex-1 overflow-hidden relative">
          {mode === 'screens' ? (
            <ScreensGallery />
          ) : (
          <>
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {screen === 'loading' ? (
                <LoadingScreen />
              ) : screen === 'dashboard' ? (
                <DashboardScreen secondsRemaining={secondsRemaining} onLogout={resetToLogin} />
              ) : (
                <div className="w-full h-full flex bg-white relative">
                  {screen === 'login-email' && <LoginEmailScreen onNext={(e) => { setEmail(e); setScreen('login-password'); }} />}
                  {(screen === 'login-password' || screen === 'geo-prompt') && (
                    <LoginPasswordScreen email={email} onNext={handlePasswordNext} onBack={() => setScreen('login-email')} />
                  )}
                  <PhotoPanel />

                  {/* E1 — priming modal → fires the native prompt */}
                  {screen === 'geo-prompt' && geoPhase === 'priming' && (
                    <GeoPrimingModal onAllow={() => runCapture(false)} onClose={() => setScreen('login-password')} />
                  )}

                  {/* E1 / E3 — "obteniendo ubicación" (visible only for non-silent capture) */}
                  {screen === 'geo-prompt' && geoPhase === 'locating' && !silentCapture && <GeoLocatingOverlay />}

                  {/* E2 — blocked (non-dismissable), differentiated copy (D4) */}
                  {screen === 'geo-prompt' && geoPhase === 'blocked' && (
                    <GeoBlockedModal kind={geoError ?? 'denied'} onRetry={() => runCapture(false)} />
                  )}

                  {(screen === 'login-2fa' || show2FA) && screen !== 'geo-prompt' && (
                    <TwoFAModal onVerify={enterDashboard} onClose={resetToLogin} />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* E5 — expiry warning banner */}
          <AnimatePresence>
            {screen === 'dashboard' && !termination && secondsRemaining <= WARNING_THRESHOLD && (
              <SessionExpiryBanner
                secondsRemaining={secondsRemaining}
                onContinue={() => setSecondsRemaining(SESSION_TTL)}
                onLogout={resetToLogin}
              />
            )}
          </AnimatePresence>

          {/* E4 / E6 — session ended modal */}
          <AnimatePresence>
            {termination && <SessionEndedModal reason={termination} onRestart={resetToLogin} />}
          </AnimatePresence>

          </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Catalog entry ──────────────────────────────────────────────────────────────────

export function GeolocalizacionPrototype() {
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState<{ mode: 'flow' | 'screens'; guide: Deliverable | null }>({ mode: 'flow', guide: null });

  // Deep-link: open the proto in the view encoded in the URL hash.
  //   #geo/screens           → screens gallery
  //   #geo/flow              → flow mockup
  //   #geo/flow/E1..E4       → flow with that deliverable preselected
  useEffect(() => {
    const applyFromHash = () => {
      if (typeof window === 'undefined') return;
      const h = window.location.hash;
      if (!h.startsWith('#geo')) return;
      const parts = h.replace(/^#geo\/?/, '').split('/').filter(Boolean);
      let mode: 'flow' | 'screens' = 'flow';
      let guide: Deliverable | null = null;
      if (parts[0] === 'screens') mode = 'screens';
      else if (parts[0] === 'flow' && ['E1', 'E2', 'E3', 'E4'].includes(parts[1] ?? '')) guide = parts[1] as Deliverable;
      setInitial({ mode, guide });
      setOpen(true);
    };
    applyFromHash();
    window.addEventListener('hashchange', applyFromHash);
    return () => window.removeEventListener('hashchange', applyFromHash);
  }, []);

  const handleOpen = () => {
    setInitial({ mode: 'flow', guide: null });
    setOpen(true);
    if (typeof window !== 'undefined') window.history.replaceState(null, '', '#geo/flow');
  };

  const handleClose = () => {
    setOpen(false);
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#geo')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-base-100 bg-background-50 overflow-hidden">
        <div className="border-b border-base-100 bg-background-soft-50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">
            Geolocalización v1.0 — Validación de contexto de sesión
          </span>
          <Badge color="primary" size="sm">Prototype</Badge>
        </div>
        <div className="p-6 flex items-center gap-6">
          <div className="relative w-72 h-44 rounded-lg overflow-hidden border border-base-100 bg-background-soft-50 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <GeoPinIcon size={40} color="#60a5fa" />
                <div className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px]">§2.3.4 · IP · Device · Geo</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-text-50 font-semibold text-lg">Validación de contexto de sesión — Finco Pay</h3>
            <p className="text-text-200 text-sm max-w-md">
              Cuatro flujos (E1–E4): login con permiso otorgado, permiso denegado, login recurrente
              silencioso y cierre de sesión por cambio de contexto (§2.3.4). Usa la Guía de flujo en la barra
              superior para configurar y seguir cada entregable paso a paso.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {['E1 Otorgado', 'E2 Denegado', 'E3 Recurrente', 'E4 Cierre', 'Guía de flujo'].map((tag) => (
                <Badge key={tag} color="gray" size="sm">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-base-100 px-6 py-3 flex justify-end">
          <button
            onClick={handleOpen}
            className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition"
          >
            Abrir prototipo
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-4 rounded-xl overflow-hidden">
            <GeoMacDesktop
              key={`${initial.mode}:${initial.guide}`}
              onExit={handleClose}
              initialMode={initial.mode}
              initialGuide={initial.guide}
            />
          </div>
        </div>
      )}
    </div>
  );
}
