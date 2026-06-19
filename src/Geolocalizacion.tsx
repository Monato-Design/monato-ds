import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './components/core/badge';
import OtpInput from './components/core/otp-input';
import { InfoCircle, Eye, EyeDisabled } from '@tailgrids/icons';

// ─── Types ──────────────────────────────────────────────────────────────────────
// Maps the user-facing surface of the "Validación de contexto de sesión" PRD
// (Finco Pay IFPE · Manual de Medios Electrónicos §2.3.4).

type Screen =
  | 'login-email'
  | 'login-password'
  | 'geo-permission'
  | 'geo-denied'
  | 'login-2fa'
  | 'loading'
  | 'dashboard';

type TerminationReason =
  | 'inactivity_timeout'
  | 'context_ip_change'
  | 'context_device_change'
  | 'context_geo_change'
  | 'new_session_started';

// ─── Reference context (captured at login) ──────────────────────────────────────
// Persisted to Valkey + DB as the comparison baseline for every request (§3, §4.2).

const REF_CONTEXT = {
  ip_address: '203.0.113.45',
  user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  geo_latitude: 19.4326077, // CDMX — §6.2
  geo_longitude: -99.133208,
  session_token: 'Ez5lkC9G6ZNuiJdCdOeS3_aQ8xV2pLmNwRt',
};

const SESSION_TTL = 300; // SESSION_TIMEOUT_MINUTES = 5 (§4.2)
const WARNING_THRESHOLD = 60; // SESSION_WARNING_THRESHOLD_MINUTES = 1 (§4.5)

// Differentiated termination copy — verbatim from PRD §8.3.
const TERMINATION: Record<
  TerminationReason,
  { http: string; title: string; message: string }
> = {
  inactivity_timeout: {
    http: '401 SESSION_EXPIRED',
    title: 'Tu sesión ha expirado',
    message:
      'Tu sesión ha expirado por inactividad. Por seguridad, las sesiones se cierran automáticamente tras 5 minutos sin actividad. Vuelve a iniciar sesión para continuar.',
  },
  context_ip_change: {
    http: '401 SESSION_INVALID',
    title: 'Sesión cerrada por seguridad',
    message:
      'Tu sesión fue cerrada porque detectamos un cambio en la conexión desde la que estás accediendo. Por tu seguridad, debes volver a iniciar sesión.',
  },
  context_device_change: {
    http: '401 SESSION_INVALID',
    title: 'Sesión cerrada por seguridad',
    message:
      'Tu sesión fue cerrada porque detectamos un cambio en el dispositivo o navegador. Por tu seguridad, debes volver a iniciar sesión.',
  },
  context_geo_change: {
    http: '401 SESSION_INVALID',
    title: 'Sesión cerrada por seguridad',
    message:
      'Tu sesión fue cerrada porque detectamos un cambio en tu ubicación. Por tu seguridad, debes volver a iniciar sesión.',
  },
  new_session_started: {
    http: '401 SESSION_INVALID',
    title: 'Sesión cerrada',
    message:
      'Tu sesión fue cerrada porque se inició una nueva sesión desde otro dispositivo.',
  },
};

// ─── Inline iconography ───────────────────────────────────────────────────────────

function FinchLogoInline() {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
        <g transform="translate(20,20)">
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <ellipse
              key={i}
              cx={Math.cos((deg * Math.PI) / 180) * 8}
              cy={Math.sin((deg * Math.PI) / 180) * 8}
              rx="4"
              ry="7"
              transform={`rotate(${deg}, ${Math.cos((deg * Math.PI) / 180) * 8}, ${Math.sin((deg * Math.PI) / 180) * 8})`}
              fill={`rgba(${99 - i * 5}, ${130 + i * 8}, ${220 - i * 5}, ${0.9 - i * 0.1})`}
            />
          ))}
        </g>
      </svg>
      <span className="text-[#4a4a5a] font-semibold text-sm tracking-tight">finch</span>
    </div>
  );
}

function GeoPinIcon({ size = 24, color = '#2563eb' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}

function ShieldCheckIcon({ size = 18, color = '#16a34a' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.5-3 8.3-7 9.5C8 22.3 5 18.5 5 14V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
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

function LoginEmailScreen({ onNext, onBypass }: { onNext: (email: string) => void; onBypass: () => void }) {
  const [email, setEmail] = useState('');
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

      <div className="pb-8 flex flex-col items-center gap-3">
        <button
          onClick={onBypass}
          className="text-xs text-[#9ca3af] hover:text-[#6b7280] underline underline-offset-2 transition-colors"
        >
          Saltar al dashboard →
        </button>
        <FinchLogoInline />
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
  const [password, setPassword] = useState('');
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
        <FinchLogoInline />
      </div>
    </div>
  );
}

// ─── Overlay: geolocation permission (mock) ───────────────────────────────────────
// Blocking permission gate — requested immediately after password, before any
// branch of the flow (§5.3.1 / §7.1 step 2). Geo is mandatory (§3 nota).

function GeoPermissionOverlay({ onAllow, onDeny }: { onAllow: () => void; onDeny: () => void }) {
  return (
    <div className="absolute inset-0 z-30 bg-black/40 flex items-start justify-center pt-10 backdrop-blur-[1px]">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="bg-white rounded-2xl shadow-2xl w-[440px] overflow-hidden border border-[#e5e7eb]"
      >
        {/* Mock browser permission bar */}
        <div className="bg-[#f3f4f6] border-b border-[#e5e7eb] px-5 py-3 flex items-center gap-2">
          <GeoPinIcon size={18} />
          <span className="text-[13px] text-[#374151] font-medium">customer.fincopay.mx quiere</span>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-[#eff6ff] flex items-center justify-center shrink-0">
              <GeoPinIcon size={22} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#111827]">Conocer tu ubicación</p>
              <p className="text-[13px] text-[#6b7280] mt-0.5 leading-relaxed">
                Finco Pay requiere tu ubicación para validar el contexto de la sesión conforme a la
                normativa de medios electrónicos (§2.3.4).
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={onDeny}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#374151] border border-[#d1d5db] hover:bg-[#f9fafb] transition"
            >
              Bloquear
            </button>
            <button
              onClick={onAllow}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Permitir
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Screen: geolocation denied (blocking) ─────────────────────────────────────────
// §5.3.1 — no alternative route. Verbatim message.

function GeoDeniedScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white px-8 text-center">
      <div className="size-16 rounded-2xl bg-[#fef2f2] flex items-center justify-center mb-6">
        <GeoPinIcon size={30} color="#dc2626" />
      </div>
      <h1 className="text-2xl font-semibold text-[#111827] mb-3">Ubicación requerida</h1>
      <p className="text-[#6b7280] text-base max-w-md leading-relaxed mb-8">
        Para acceder a la plataforma necesitamos acceso a tu ubicación. Habilita la geolocalización en
        tu navegador e intenta de nuevo.
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] transition"
      >
        Intentar de nuevo
      </button>
      <div className="mt-10">
        <FinchLogoInline />
      </div>
    </div>
  );
}

// ─── Modal: 2FA / TOTP ──────────────────────────────────────────────────────────────

function TwoFAModal({ onVerify, onClose }: { onVerify: () => void; onClose: () => void }) {
  const [code, setCode] = useState('');

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

          <OtpInput digitLength={6} value={code} onChange={(e) => setCode(e.target.value)} />

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
    <div className="w-full h-full flex flex-col items-center justify-center bg-white gap-3">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
          <g transform="translate(20,20)">
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <ellipse
                key={i}
                cx={Math.cos((deg * Math.PI) / 180) * 8}
                cy={Math.sin((deg * Math.PI) / 180) * 8}
                rx="4"
                ry="7"
                transform={`rotate(${deg}, ${Math.cos((deg * Math.PI) / 180) * 8}, ${Math.sin((deg * Math.PI) / 180) * 8})`}
                fill={`rgba(${99 - i * 5}, ${130 + i * 8}, ${220 - i * 5}, ${0.9 - i * 0.1})`}
              />
            ))}
          </g>
        </svg>
      </motion.div>
      <span className="text-[#4a4a5a] font-semibold text-2xl tracking-tight">finch</span>
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

// ─── Session context monitor card (§2.3.4 made visible) ────────────────────────────

function ContextRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-[#eef1f4] last:border-0">
      <div className="min-w-0">
        <p className="text-[#666] text-[13px]">{label}</p>
        <p className={`text-[#333] text-[14px] truncate ${mono ? 'font-mono text-[12px]' : ''}`}>{value}</p>
      </div>
      <span className="flex items-center gap-1 text-[#16a34a] text-[12px] font-medium shrink-0">
        <ShieldCheckIcon size={15} /> Coincide
      </span>
    </div>
  );
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Screen: dashboard ──────────────────────────────────────────────────────────────

function DashboardScreen({
  secondsRemaining,
  onLogout,
}: {
  secondsRemaining: number;
  onLogout: () => void;
}) {
  const warning = secondsRemaining <= WARNING_THRESHOLD;

  return (
    <div className="w-full h-full flex overflow-hidden">
      <SidebarOps onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top nav */}
        <div className="h-[64px] border-b border-[#e5e7eb] flex items-center justify-between px-8 shrink-0 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] sticky top-0 bg-white z-10">
          <span className="text-black text-[16px] leading-[24px] pl-4">Dashboard</span>
          <div className="flex items-center gap-3">
            {/* Live session TTL chip (driven by the simulated poll) */}
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
          <div className="bg-[#f7f9fb] rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.05)] flex flex-col items-center px-6 py-7 mb-5">
            <p className="text-black text-[25.6px] leading-[38.4px]">Staging Devs</p>
            <p className="text-black text-[19.2px] leading-[28.8px] font-thin">Staging Developers, S.A. de C.V.</p>
          </div>

          {/* Session context monitor */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-[10px] border border-[#d9e2ec] p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheckIcon size={18} />
                <h3 className="text-[#333] text-[15px] font-semibold">Contexto de sesión monitoreado</h3>
                <span className="ml-auto text-[11px] text-[#666]">Manual Medios Electrónicos §2.3.4</span>
              </div>
              <ContextRow label="Dirección IP de referencia" value={REF_CONTEXT.ip_address} mono />
              <ContextRow label="Dispositivo / User-Agent" value={REF_CONTEXT.user_agent} mono />
              <ContextRow
                label="Ubicación geográfica"
                value={`${REF_CONTEXT.geo_latitude.toFixed(5)}, ${REF_CONTEXT.geo_longitude.toFixed(5)} · Ciudad de México`}
              />
            </div>

            <div className="bg-white rounded-[10px] border border-[#d9e2ec] p-5 flex flex-col">
              <h3 className="text-[#333] text-[15px] font-semibold mb-3">Telemetría</h3>
              <div className="space-y-3 text-[13px]">
                <div>
                  <p className="text-[#666]">session_token (cifrado · localStorage)</p>
                  <p className="text-[#333] font-mono text-[12px] truncate">
                    {REF_CONTEXT.session_token.slice(0, 6)}••••••••••••
                  </p>
                </div>
                <div>
                  <p className="text-[#666]">Capa de validación</p>
                  <p className="text-[#333]">Valkey · TTL 5 min</p>
                </div>
                <div>
                  <p className="text-[#666]">Firma de payload geo</p>
                  <p className="text-[#16a34a] font-medium">HMAC-SHA256 válida</p>
                </div>
                <div className="mt-auto pt-2 border-t border-[#eef1f4]">
                  <p className="text-[#666]">Poll del frontend</p>
                  <p className="text-[#333]">cada 30 s · GET /sessions/check</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Warning banner (§8.1) ──────────────────────────────────────────────────────────

function ExpiryBanner({
  secondsRemaining,
  onContinue,
  onLogout,
}: {
  secondsRemaining: number;
  onContinue: () => void;
  onLogout: () => void;
}) {
  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-[560px] max-w-[90%]"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-[#fcd34d] overflow-hidden">
        <div className="h-1 bg-[#f59e0b]" />
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="size-9 rounded-lg bg-[#fef3c7] flex items-center justify-center shrink-0">
            <img src="/cp-assets/icon-warning.png" alt="" className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-[#111827] text-[14px] font-semibold">
              Tu sesión expirará en menos de 1 minuto. ¿Deseas continuar?
            </p>
            <p className="text-[#92400e] text-[12px] mt-0.5">Tiempo restante: {fmt(secondsRemaining)}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-lg text-[13px] font-medium text-[#374151] border border-[#d1d5db] hover:bg-[#f9fafb] transition"
            >
              Cerrar sesión
            </button>
            <button
              onClick={onContinue}
              className="px-3 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] transition"
            >
              Continuar sesión
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Modal: session terminated (non-dismissable · §8.3) ─────────────────────────────

function TerminationModal({ reason, onRestart }: { reason: TerminationReason; onRestart: () => void }) {
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
        <div
          className={`size-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
            isSecurity ? 'bg-[#fef2f2]' : 'bg-[#f3f4f6]'
          }`}
        >
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
          Iniciar sesión nuevamente
        </button>
      </motion.div>
    </div>
  );
}

// ─── Simulator panel (demo of backend-detected context changes) ─────────────────────

function SimulatorPanel({
  disabled,
  onTrigger,
  onForceWarning,
}: {
  disabled: boolean;
  onTrigger: (reason: TerminationReason) => void;
  onForceWarning: () => void;
}) {
  const [open, setOpen] = useState(true);

  const actions: { reason: TerminationReason; label: string }[] = [
    { reason: 'context_ip_change', label: 'Cambio de IP' },
    { reason: 'context_device_change', label: 'Cambio de dispositivo' },
    { reason: 'context_geo_change', label: 'Cambio de ubicación' },
    { reason: 'new_session_started', label: 'Nuevo login (otro equipo)' },
    { reason: 'inactivity_timeout', label: 'Expirar por inactividad' },
  ];

  return (
    <div className="absolute bottom-4 right-4 z-40 w-[260px]">
      <div className="bg-[#0f172a] rounded-xl shadow-2xl border border-white/10 overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2 px-4 py-3 text-white text-[13px] font-semibold hover:bg-white/5 transition"
        >
          <span className="size-2 rounded-full bg-[#10b981]" />
          Simulador de contexto §2.3.4
          <span className="ml-auto text-white/40">{open ? '▾' : '▸'}</span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-1 space-y-1.5">
                <p className="text-white/40 text-[11px] px-1 pb-1">
                  {disabled ? 'Disponible dentro de la sesión activa' : 'Dispara un evento de cierre:'}
                </p>
                {actions.map((a) => (
                  <button
                    key={a.reason}
                    disabled={disabled}
                    onClick={() => onTrigger(a.reason)}
                    className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-white/90 bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    {a.label}
                  </button>
                ))}
                <button
                  disabled={disabled}
                  onClick={onForceWarning}
                  className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-[#fcd34d] bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Forzar advertencia ≤ 60 s
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Mac desktop wrapper ────────────────────────────────────────────────────────────

function GeoMacDesktop({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>('login-email');
  const [email, setEmail] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(SESSION_TTL);
  const [termination, setTermination] = useState<TerminationReason | null>(null);
  const tickRef = useRef<number | null>(null);

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

  const resetToLogin = () => {
    setEmail('');
    setShow2FA(false);
    setSecondsRemaining(SESSION_TTL);
    setTermination(null);
    setScreen('login-email');
  };

  const enterDashboard = () => {
    setShow2FA(false);
    setSecondsRemaining(SESSION_TTL);
    setTermination(null);
    setScreen('loading');
    setTimeout(() => setScreen('dashboard'), 2000);
  };

  const titleMap: Record<Screen, string> = {
    'login-email': 'Finco Pay · Inicio de sesión',
    'login-password': 'Finco Pay · Inicio de sesión',
    'geo-permission': 'Finco Pay · Validación de ubicación',
    'geo-denied': 'Finco Pay · Ubicación requerida',
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
        {/* Mac title bar */}
        <div className="h-9 bg-[#1e1e1e] flex items-center px-4 gap-2 shrink-0">
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
        </div>

        {/* App content */}
        <div className="flex-1 overflow-hidden relative">
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
              ) : screen === 'geo-denied' ? (
                <GeoDeniedScreen onRetry={() => setScreen('geo-permission')} />
              ) : (
                <div className="w-full h-full flex bg-white relative">
                  {screen === 'login-email' && (
                    <LoginEmailScreen
                      onNext={(e) => {
                        setEmail(e);
                        setScreen('login-password');
                      }}
                      onBypass={enterDashboard}
                    />
                  )}
                  {(screen === 'login-password' || screen === 'geo-permission') && (
                    <LoginPasswordScreen
                      email={email}
                      onNext={() => setScreen('geo-permission')}
                      onBack={() => setScreen('login-email')}
                    />
                  )}
                  <PhotoPanel />

                  {/* Geo permission gate — appears over the password screen */}
                  {screen === 'geo-permission' && (
                    <GeoPermissionOverlay
                      onAllow={() => {
                        setShow2FA(true);
                        setScreen('login-2fa');
                      }}
                      onDeny={() => setScreen('geo-denied')}
                    />
                  )}

                  {(screen === 'login-2fa' || show2FA) && screen !== 'geo-permission' && (
                    <TwoFAModal onVerify={enterDashboard} onClose={resetToLogin} />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Expiry warning banner (§8.1) */}
          <AnimatePresence>
            {screen === 'dashboard' && !termination && secondsRemaining <= WARNING_THRESHOLD && (
              <ExpiryBanner
                secondsRemaining={secondsRemaining}
                onContinue={() => setSecondsRemaining(SESSION_TTL)}
                onLogout={resetToLogin}
              />
            )}
          </AnimatePresence>

          {/* Termination modal (§8.3) */}
          <AnimatePresence>
            {termination && <TerminationModal reason={termination} onRestart={resetToLogin} />}
          </AnimatePresence>

          {/* Context-event simulator */}
          <SimulatorPanel
            disabled={screen !== 'dashboard' || !!termination}
            onTrigger={(reason) => setTermination(reason)}
            onForceWarning={() => setSecondsRemaining(WARNING_THRESHOLD)}
          />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Catalog entry ──────────────────────────────────────────────────────────────────

export function GeolocalizacionPrototype() {
  const [open, setOpen] = useState(false);

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
              Captura obligatoria de geolocalización en el login, monitoreo de contexto (IP, dispositivo,
              ubicación) y cierre de sesión diferenciado por causa conforme al Manual de Medios Electrónicos §2.3.4.
              Incluye banner de expiración y simulador de eventos de contexto.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {['Geo obligatoria', 'Contexto §2.3.4', 'Banner ≤60s', 'Cierre diferenciado', 'Simulador'].map((tag) => (
                <Badge key={tag} color="gray" size="sm">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-base-100 px-6 py-3 flex justify-end">
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition"
          >
            Abrir prototipo
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-4 rounded-xl overflow-hidden">
            <GeoMacDesktop onExit={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
