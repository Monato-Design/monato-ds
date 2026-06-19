import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './components/core/badge';
import OtpInput from './components/core/otp-input';
import {
  Eye,
  EyeDisabled,
  InfoCircle,
  ArrowLeft,
} from '@tailgrids/icons';

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = 'login-email' | 'login-password' | 'login-2fa' | 'loading' | 'dashboard';
type NavItem = 'dashboard-ops' | 'contactos' | 'cuentas' | 'movimientos' | 'estados' | 'reportes' | 'soporte';

// ─── Finch logo ───────────────────────────────────────────────────────────────

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

// ─── Login photo panel ────────────────────────────────────────────────────────

function PhotoPanel() {
  return (
    <div className="w-1/2 h-full bg-gradient-to-br from-slate-200 via-blue-100 to-slate-300 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Simulated laptop+card scene */}
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

// ─── Screen: login-email ──────────────────────────────────────────────────────

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
              filled
                ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
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

// ─── Screen: login-password ───────────────────────────────────────────────────

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
  const masked = email.split('@')[0].slice(0, 1).toUpperCase() + '*****' + ' ' +
    (email.split('@')[0].slice(-1).toUpperCase() || 'A') + '*****';

  return (
    <div className="w-1/2 h-full flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-16 max-w-lg">
        <h1 className="text-3xl font-semibold text-[#111827] mb-2">Inicio de sesión</h1>
        <p className="text-[#6b7280] text-base mb-16">Ingrese los datos para acceder a su cuenta</p>

        <div className="flex flex-col gap-3">
          <p className="text-base font-semibold text-[#111827]">{masked}</p>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-[#374151]">Contraseña</label>
              <button className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
                Olvidé mi contraseña <InfoCircle size={14} />
              </button>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && password.length > 0 && onNext()}
                className="w-full px-3 py-2.5 pr-10 border border-[#d1d5db] rounded text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
              >
                {showPass ? <EyeDisabled size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline w-fit"
          >
            <ArrowLeft size={14} /> No son mis iniciales
          </button>

          <button
            onClick={() => password.length > 0 && onNext()}
            className={`w-full py-3 rounded text-sm font-semibold transition-colors mt-1 ${
              password.length > 0
                ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
            }`}
          >
            Ingresar
          </button>
        </div>
      </div>

      <div className="pb-8 flex justify-center">
        <FinchLogoInline />
      </div>
    </div>
  );
}

// ─── 2FA Modal ────────────────────────────────────────────────────────────────

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

          {/* Phone+key icon */}
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

          <OtpInput
            digitLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <p className="text-xs text-[#9ca3af]">Usa 123456 para continuar</p>

          <button
            onClick={handleVerify}
            className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors ${
              code.length === 6
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-blue-200 text-white cursor-not-allowed'
            }`}
          >
            Verificar
          </button>

          <button
            onClick={() => setCode('')}
            className="text-sm font-semibold text-[#111827] hover:underline"
          >
            Limpiar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Screen: loading ──────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
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

// ─── Sidebar + Dashboard (exact Figma values) ─────────────────────────────────

type SidebarProps = {
  active: NavItem;
  onSelect: (id: NavItem) => void;
  onLogout: () => void;
};

function SidebarOps({ active, onSelect, onLogout }: SidebarProps) {
  const [reportesOpen, setReportesOpen] = useState(false);

  const NavItem_ = ({ id, iconSrc, label }: { id: NavItem; iconSrc: string; label: string }) => (
    <button
      onClick={() => onSelect(id)}
      className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
        active === id ? 'bg-white text-black' : 'text-white hover:bg-white/10'
      }`}
    >
      <img src={iconSrc} alt="" className="size-5 shrink-0" />
      {label}
    </button>
  );

  return (
    <div className="w-[275px] h-full bg-[#1a1a1a] flex flex-col shrink-0 overflow-auto">
      <div className="px-6 pt-4 pb-3">
        <img src="/cp-assets/logo-fincopay.png" alt="FINCOPAY" className="h-[30px] w-auto" />
      </div>

      <div className="flex-1 px-6 flex flex-col gap-5">
        {/* Operaciones */}
        <div>
          <p className="text-[#99a1af] text-[12px] font-medium uppercase pl-3 pb-3">Operaciones</p>
          <div className="flex flex-col gap-1">
            <NavItem_ id="dashboard-ops" iconSrc="/cp-assets/icon-dashboard.svg" label="Dashboard" />
            <NavItem_ id="contactos"     iconSrc="/cp-assets/icon-contactos.svg"  label="Contactos" />
            <NavItem_ id="cuentas"       iconSrc="/cp-assets/icon-cuentas.svg"    label="Cuentas" />
            <NavItem_ id="movimientos"   iconSrc="/cp-assets/icon-movimientos.svg" label="Movimientos" />
            <NavItem_ id="estados"       iconSrc="/cp-assets/icon-estados.svg"    label="Estados de Cuenta" />
            <button
              onClick={() => setReportesOpen(!reportesOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"
            >
              <img src="/cp-assets/icon-reportes.svg" alt="" className="size-5 shrink-0" />
              <span className="flex-1 text-left">Reportes</span>
              <img src="/cp-assets/icon-chevron.svg" alt="" className={`size-3 transition-transform ${reportesOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ayuda */}
        <div>
          <p className="text-[#99a1af] text-[12px] font-medium uppercase pl-3 pb-3">Ayuda</p>
          <NavItem_ id="soporte" iconSrc="/cp-assets/icon-soporte.svg" label="Soporte" />
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

// ─── Account data ─────────────────────────────────────────────────────────────

const CUENTAS = [
  { cuenta: '529611080009',   clabe: '646180529611080009', banco: 'STP',       balance: '$0.00',      estatus: 'Activo' },
  { cuenta: '529600001772',   clabe: '646180529600001772', banco: 'Otro',      balance: '$0.00',      estatus: 'Activo' },
  { cuenta: '000000000055',   clabe: '734185000000000055', banco: 'Otro',      balance: '$971.50',    estatus: 'Activo' },
  { cuenta: '000000000000',   clabe: '734185000000000000', banco: 'Otro',      balance: '$846.98',    estatus: 'Activo' },
  { cuenta: '000000001004',   clabe: '734180000000001004', banco: 'FINCO PAY', balance: '$10,980.00', estatus: 'Activo' },
  { cuenta: '529600001701',   clabe: '646180529600001701', banco: 'Otro',      balance: '$0.00',      estatus: 'Activo' },
  { cuenta: '529600001280',   clabe: '646180529600001280', banco: 'Otro',      balance: '$0.00',      estatus: 'Activo' },
  { cuenta: '529660000001',   clabe: '646180529660000001', banco: 'Otro',      balance: '$554.97',    estatus: 'Activo' },
  { cuenta: '529677000007',   clabe: '646180529677000007', banco: 'Otro',      balance: '$182.94',    estatus: 'Activo' },
  { cuenta: '529600001206',   clabe: '646180529600001206', banco: 'Otro',      balance: '$21,018.04', estatus: 'Activo' },
];

type CuentaData = typeof CUENTAS[0];

const MOCK_BENEFICIARIOS: Record<string, Beneficiario[]> = {
  '000000001004': [
    { id: 'b1', type: 'PF', percentage: 60, phone: '5512345678', email: 'ana.garcia@email.com',
      first_name: 'Ana Sofía', last_name_1: 'García', last_name_2: 'Hernández',
      birth_date: '1985-03-12', business_name: '', rfc: '' },
    { id: 'b2', type: 'PF', percentage: 40, phone: '5598765432', email: '',
      first_name: 'Carlos', last_name_1: 'García', last_name_2: 'López',
      birth_date: '1988-07-24', business_name: '', rfc: '' },
  ],
  '529600001206': [
    { id: 'b3', type: 'PM', percentage: 50, phone: '5511223344', email: 'contacto@inversiones.mx',
      first_name: '', last_name_1: '', last_name_2: '', birth_date: '',
      business_name: 'Inversiones del Norte S.A. de C.V.', rfc: 'INO980512AB3' },
    { id: 'b4', type: 'PF', percentage: 30, phone: '', email: 'marco@mail.com',
      first_name: 'Marco Antonio', last_name_1: 'Reyes', last_name_2: 'Domínguez',
      birth_date: '1979-11-05', business_name: '', rfc: '' },
    { id: 'b5', type: 'PF', percentage: 20, phone: '5587654321', email: '',
      first_name: 'Lucía', last_name_1: 'Reyes', last_name_2: 'Domínguez',
      birth_date: '1983-02-18', business_name: '', rfc: '' },
  ],
  '000000000055': [
    { id: 'b6', type: 'PF', percentage: 100, phone: '5544332211', email: 'titular@email.com',
      first_name: 'Roberto', last_name_1: 'Mendoza', last_name_2: 'Salinas',
      birth_date: '1971-09-30', business_name: '', rfc: '' },
  ],
};

function CuentaCard({ cuenta, clabe, banco, balance, estatus, onClick }: CuentaData & { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="text-left w-full bg-[#f8f9fa] rounded-[10px] px-8 py-6 drop-shadow-[0px_4px_2px_rgba(0,0,0,0.05)] hover:drop-shadow-[0px_6px_8px_rgba(0,0,0,0.1)] transition-all cursor-pointer group">
      <div className="flex items-start justify-between pb-4">
        <span className="text-[#333] text-[20px] leading-[30px]">Cuenta Concentradora</span>
        <span className="text-[#333] text-[14.4px] font-light">Client MX</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[#666] text-[14px] leading-[21px]">Número de cuenta</p>
          <p className="text-[#333] text-[16px] leading-[24px] pl-[3px] pt-2">{cuenta}</p>
        </div>
        <div>
          <p className="text-[#666] text-[14px] leading-[21px]">Clabe</p>
          <p className="text-[#333] text-[16px] leading-[24px] pl-[3px] pt-2">{clabe}</p>
        </div>
        <div>
          <p className="text-[#666] text-[14px] leading-[21px]">Banco</p>
          <p className="text-[#333] text-[16px] leading-[24px] pl-[3px] pt-2">{banco}</p>
        </div>
        <div>
          <p className="text-[#666] text-[14px] leading-[21px]">Balance</p>
          <p className="text-[#333] text-[16px] leading-[24px] pl-[3px] pt-2">{balance}</p>
        </div>
        <div>
          <p className="text-[#666] text-[14px] leading-[21px]">Estatus</p>
          <p className="text-[#7fbc7d] text-[16px] leading-[24px] pl-[3px] pt-2">{estatus}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
        <span className="text-[#9ca3af] text-[13px]">Ver beneficiarios</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#333] transition-colors">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
    </button>
  );
}

// ─── Modal: nueva cuenta / asignar beneficiarios ─────────────────────────────

// ─── Beneficiarios types & data ───────────────────────────────────────────────

type BenType = 'PF' | 'PM';

type Beneficiario = {
  id: string;
  type: BenType;
  percentage: number;
  phone: string;
  email: string;
  // PF
  last_name_1: string;
  last_name_2: string;
  first_name: string;
  birth_date: string;
  // PM
  business_name: string;
  rfc: string;
};

const emptyBen = (): Omit<Beneficiario, 'id'> => ({
  type: 'PF', percentage: 100, phone: '', email: '',
  last_name_1: '', last_name_2: '', first_name: '', birth_date: '',
  business_name: '', rfc: '',
});

function benName(b: Beneficiario) {
  return b.type === 'PF'
    ? `${b.first_name} ${b.last_name_1} ${b.last_name_2}`.trim()
    : b.business_name;
}

// ─── 2FA modal (reusable) ─────────────────────────────────────────────────────

function TOTPModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  function handleConfirm() {
    if (code === '123456') {
      onConfirm();
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setError(next >= 3
        ? 'Demasiados intentos. Intenta de nuevo más tarde.'
        : `Código incorrecto. ${3 - next} intento(s) restante(s).`);
      setCode('');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-[12px] drop-shadow-[0px_20px_12.5px_rgba(0,0,0,0.1)] w-[400px] p-8" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="size-12 rounded-full bg-[#f0f9ff] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
            </svg>
          </div>
          <p className="font-bold text-[20px] text-[#1a1a1a]">Verificación 2FA</p>
          <p className="text-[14px] text-[#666] text-center">Ingresa el código de tu aplicación de autenticación</p>
        </div>
        <input
          type="text"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && code.length === 6 && attempts < 3 && handleConfirm()}
          className="w-full text-center text-[24px] tracking-[0.5em] px-4 py-3 border border-[#d1d5dc] rounded-[8px] focus:outline-none focus:border-[#0284c7] mb-2"
          disabled={attempts >= 3}
        />
        {error && <p className="text-[#e17100] text-[13px] text-center mb-2">{error}</p>}
        <p className="text-[#9ca3af] text-[12px] text-center mb-6">Código de prueba: 123456</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-[#d1d5dc] rounded-[8px] py-[11px] text-[14px] font-medium text-[#364153] hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={code.length !== 6 || attempts >= 3}
            className="flex-1 bg-[#1a1a1a] rounded-[8px] py-[11px] text-[14px] font-medium text-white disabled:opacity-40 hover:bg-[#333] transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-[10px] shadow-lg text-white text-[14px] font-medium ${type === 'success' ? 'bg-[#16a34a]' : 'bg-[#dc2626]'}`}>
      {type === 'success'
        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      }
      {message}
    </div>
  );
}

// ─── Formulario beneficiario ──────────────────────────────────────────────────

function BenForm({
  initial,
  usedPercentage,
  onSave,
  onCancel,
}: {
  initial: Omit<Beneficiario, 'id'>;
  usedPercentage: number;
  onSave: (data: Omit<Beneficiario, 'id'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const available = 100 - usedPercentage + (initial.percentage ?? 0);
  const sumError = form.percentage > available;

  function set(k: keyof typeof form, v: string | number) {
    setForm(f => ({ ...f, [k]: v }));
  }

  const pfValid = form.first_name && form.last_name_1 && form.last_name_2 && form.birth_date;
  const pmValid = form.business_name && form.rfc.length === 12;
  const canSave = form.percentage > 0 && form.percentage <= available && (form.type === 'PF' ? pfValid : pmValid);

  const labelCls = 'text-[#666] text-[13px] mb-1 block';
  const inputCls = 'w-full border border-[#d1d5dc] rounded-[8px] px-3 py-2.5 text-[14px] text-[#333] focus:outline-none focus:border-[#1a1a1a]';

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Tipo selector */}
      <div>
        <label className={labelCls}>Tipo de Beneficiario</label>
        <div className="flex rounded-[8px] border border-[#d1d5dc] overflow-hidden">
          {(['PF', 'PM'] as BenType[]).map(t => (
            <button
              key={t}
              onClick={() => set('type', t)}
              className={`flex-1 py-2.5 text-[14px] font-medium transition-colors ${form.type === t ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#666] hover:bg-gray-50'}`}
            >
              {t === 'PF' ? 'Persona Física' : 'Persona Moral'}
            </button>
          ))}
        </div>
      </div>

      {/* Porcentaje */}
      <div>
        <label className={labelCls}>
          Porcentaje de Derechos
          <span className="ml-2 text-[#9ca3af]">(Disponible: {available}%)</span>
        </label>
        <input
          type="number" min={1} max={available}
          value={form.percentage}
          onChange={e => set('percentage', Number(e.target.value))}
          className={`${inputCls} ${sumError ? 'border-[#e17100]' : ''}`}
        />
        {sumError && <p className="text-[#e17100] text-[12px] mt-1">La suma de porcentajes supera 100%</p>}
      </div>

      {/* Campos PF */}
      {form.type === 'PF' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Apellido Paterno *</label>
              <input value={form.last_name_1} onChange={e => set('last_name_1', e.target.value)} placeholder="Sin abreviaturas" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Apellido Materno *</label>
              <input value={form.last_name_2} onChange={e => set('last_name_2', e.target.value)} placeholder="Sin abreviaturas" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Nombre(s) *</label>
            <input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Sin abreviaturas" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Fecha de Nacimiento *</label>
            <input type="date" value={form.birth_date} onChange={e => set('birth_date', e.target.value)} className={inputCls} />
          </div>
        </>
      )}

      {/* Campos PM */}
      {form.type === 'PM' && (
        <>
          <div>
            <label className={labelCls}>Razón Social *</label>
            <input value={form.business_name} onChange={e => set('business_name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>RFC * (12 caracteres)</label>
            <input value={form.rfc} maxLength={12} onChange={e => set('rfc', e.target.value.toUpperCase())} placeholder="ABC123456789" className={inputCls} />
          </div>
        </>
      )}

      {/* Opcionales */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Teléfono de Contacto</label>
          <input value={form.phone} maxLength={10} onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} placeholder="10 dígitos" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Correo Electrónico</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 border border-[#d1d5dc] rounded-[8px] py-[11px] text-[14px] font-medium text-[#364153] hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button
          onClick={() => canSave && onSave(form)}
          disabled={!canSave}
          className="flex-1 bg-[#1a1a1a] rounded-[8px] py-[11px] text-[14px] font-medium text-white disabled:opacity-40 hover:bg-[#333] transition-colors"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

// ─── Pantalla principal: Beneficiarios ────────────────────────────────────────

type BenView = 'list' | 'add' | 'edit' | 'redistrib';
type PendingAction = { type: 'add'; data: Omit<Beneficiario, 'id'> } | { type: 'edit'; id: string; data: Omit<Beneficiario, 'id'> } | { type: 'delete'; id: string } | { type: 'redistrib'; items: Beneficiario[] };

function BeneficiariosScreen({ cuenta, onBack }: { cuenta: CuentaData; onBack: () => void }) {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>(
    MOCK_BENEFICIARIOS[cuenta.cuenta] ?? []
  );
  const [view, setView] = useState<BenView>('list');
  const [editTarget, setEditTarget] = useState<Beneficiario | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [showTotp, setShowTotp] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [redistribItems, setRedistribItems] = useState<Beneficiario[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function showToastMsg(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const usedPct = beneficiarios.reduce((s, b) => s + b.percentage, 0);

  function handleAddSave(data: Omit<Beneficiario, 'id'>) {
    setPendingAction({ type: 'add', data });
    setShowTotp(true);
  }

  function handleEditSave(data: Omit<Beneficiario, 'id'>) {
    if (!editTarget) return;
    setPendingAction({ type: 'edit', id: editTarget.id, data });
    setShowTotp(true);
  }

  function handleDeleteClick(id: string) {
    if (beneficiarios.length === 1) {
      showToastMsg('Debe existir al menos un beneficiario activo.', 'error');
      return;
    }
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  }

  function handleDeleteConfirm() {
    setShowDeleteConfirm(false);
    setPendingAction({ type: 'delete', id: deleteTarget! });
    setShowTotp(true);
  }

  function handleRedistribSave() {
    setPendingAction({ type: 'redistrib', items: redistribItems });
    setShowTotp(true);
  }

  function handleTOTPConfirm() {
    setShowTotp(false);
    if (!pendingAction) return;

    if (pendingAction.type === 'add') {
      setBeneficiarios(prev => [...prev, { ...pendingAction.data, id: Date.now().toString() }]);
      setView('list');
      showToastMsg('Beneficiario agregado exitosamente.');
    } else if (pendingAction.type === 'edit') {
      setBeneficiarios(prev => prev.map(b => b.id === pendingAction.id ? { ...pendingAction.data, id: b.id } : b));
      setView('list');
      setEditTarget(null);
      showToastMsg('Beneficiario actualizado.');
    } else if (pendingAction.type === 'delete') {
      const remaining = beneficiarios.filter(b => b.id !== pendingAction.id);
      setBeneficiarios(remaining);
      const newSum = remaining.reduce((s, b) => s + b.percentage, 0);
      if (newSum !== 100) {
        setRedistribItems(remaining);
        setView('redistrib');
        showToastMsg('Beneficiario eliminado. Redistribuye los porcentajes.', 'error');
      } else {
        setView('list');
        showToastMsg('Beneficiario eliminado.');
      }
    } else if (pendingAction.type === 'redistrib') {
      setBeneficiarios(pendingAction.items);
      setView('list');
      showToastMsg('Distribución guardada correctamente.');
    }
    setPendingAction(null);
  }

  const redistribSum = redistribItems.reduce((s, b) => s + b.percentage, 0);
  const redistribValid = redistribSum === 100;

  return (
    <div className="w-full h-full flex overflow-hidden relative">
      {/* Sidebar */}
      <SidebarOps active="cuentas" onSelect={() => {}} onLogout={onBack} />

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top nav */}
        <div className="h-[64px] border-b border-[#e5e7eb] flex items-center justify-between px-8 shrink-0 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] bg-white z-10">
          <div className="flex items-center gap-3 pl-4">
            <button onClick={onBack} className="text-[#9ca3af] hover:text-[#333] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <span className="text-black text-[16px]">Beneficiarios</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/cp-assets/logo-nav.png" alt="" className="h-[25px] w-[25px]" />
            <span className="text-black text-[16px] leading-[24px] pl-2">Staging Devs - Staging Developers, S.A. de C.V.</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Cuenta header */}
          <div className="bg-[#f8f9fa] rounded-[10px] px-6 py-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-[#666] text-[13px]">Cuenta Concentradora</p>
              <p className="text-[#333] text-[16px] font-medium">{cuenta.cuenta}</p>
              <p className="text-[#9ca3af] text-[13px]">{cuenta.clabe}</p>
            </div>
            <div className="text-right">
              <p className="text-[#666] text-[13px]">Banco</p>
              <p className="text-[#333] text-[14px]">{cuenta.banco}</p>
            </div>
          </div>

          {/* Vista: redistribución */}
          {view === 'redistrib' && (
            <div>
              <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-[10px] px-5 py-4 mb-6 flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e17100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <p className="text-[#e17100] font-semibold text-[14px]">Los porcentajes no suman 100%</p>
                  <p className="text-[#92400e] text-[13px]">Redistribuye antes de continuar. Suma actual: <strong>{redistribSum}%</strong></p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {redistribItems.map((b, i) => (
                  <div key={b.id} className="bg-[#f8f9fa] rounded-[10px] px-5 py-4 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-[#333] text-[14px] font-medium">{benName(b)}</p>
                      <p className="text-[#9ca3af] text-[12px]">{b.type === 'PF' ? 'Persona Física' : 'Persona Moral'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min={1} max={100}
                        value={b.percentage}
                        onChange={e => {
                          const copy = [...redistribItems];
                          copy[i] = { ...copy[i], percentage: Number(e.target.value) };
                          setRedistribItems(copy);
                        }}
                        className="w-20 border border-[#d1d5dc] rounded-[8px] px-3 py-2 text-[14px] text-center focus:outline-none focus:border-[#1a1a1a]"
                      />
                      <span className="text-[#666] text-[14px]">%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className={`text-[14px] font-medium ${redistribValid ? 'text-[#16a34a]' : 'text-[#e17100]'}`}>
                  Total: {redistribSum}% {redistribValid ? '✓' : `(faltan ${100 - redistribSum}%)`}
                </p>
                <button
                  onClick={handleRedistribSave}
                  disabled={!redistribValid}
                  className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-[8px] text-[14px] font-medium disabled:opacity-40 hover:bg-[#333] transition-colors"
                >
                  Guardar distribución
                </button>
              </div>
            </div>
          )}

          {/* Vista: formulario agregar/editar */}
          {(view === 'add' || view === 'edit') && (
            <div>
              <h2 className="text-[#333] text-[18px] font-semibold mb-6">
                {view === 'add' ? 'Agregar beneficiario' : 'Editar beneficiario'}
              </h2>
              <BenForm
                initial={view === 'edit' && editTarget ? { ...editTarget } : { ...emptyBen(), percentage: 100 - usedPct }}
                usedPercentage={view === 'edit' && editTarget ? usedPct - editTarget.percentage : usedPct}
                onSave={view === 'add' ? handleAddSave : handleEditSave}
                onCancel={() => { setView('list'); setEditTarget(null); }}
              />
            </div>
          )}

          {/* Vista: lista */}
          {view === 'list' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[#333] text-[18px] font-semibold">Beneficiarios</h2>
                  <p className="text-[#9ca3af] text-[13px] mt-0.5">Distribución total: <span className={usedPct === 100 ? 'text-[#16a34a] font-medium' : 'text-[#e17100] font-medium'}>{usedPct}%</span></p>
                </div>
                {beneficiarios.length < 3 && (
                  <button
                    onClick={() => setView('add')}
                    className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-[#333] transition-colors flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Agregar beneficiario
                  </button>
                )}
                {beneficiarios.length === 3 && (
                  <div title="Límite de 3 beneficiarios alcanzado">
                    <button disabled className="bg-[#e5e7eb] text-[#9ca3af] px-5 py-2.5 rounded-[8px] text-[14px] font-medium cursor-not-allowed flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Agregar beneficiario
                    </button>
                  </div>
                )}
              </div>

              {beneficiarios.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="size-16 rounded-full bg-[#f8f9fa] flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[#333] text-[16px] font-semibold">Sin beneficiarios registrados</p>
                    <p className="text-[#9ca3af] text-[14px] mt-1">Agrega al menos un beneficiario para esta cuenta</p>
                  </div>
                  <button
                    onClick={() => setView('add')}
                    className="bg-[#1a1a1a] text-white px-6 py-3 rounded-[8px] text-[14px] font-medium hover:bg-[#333] transition-colors mt-2"
                  >
                    Agregar tu primer beneficiario
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {beneficiarios.map(b => (
                    <div key={b.id} className="bg-[#f8f9fa] rounded-[10px] px-6 py-4 flex items-center gap-4">
                      <div className="size-10 rounded-full bg-[#e5e7eb] flex items-center justify-center text-[#666] font-semibold text-[14px] shrink-0">
                        {benName(b).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#333] text-[14px] font-medium truncate">{benName(b)}</p>
                        <p className="text-[#9ca3af] text-[12px]">{b.type === 'PF' ? 'Persona Física' : 'Persona Moral'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[#333] text-[16px] font-semibold">{b.percentage}%</p>
                        <p className="text-[#9ca3af] text-[12px]">derechos</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => { setEditTarget(b); setView('edit'); }}
                          className="border border-[#d1d5dc] rounded-[8px] px-3 py-1.5 text-[13px] text-[#364153] hover:bg-white transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(b.id)}
                          className="border border-[#fca5a5] rounded-[8px] px-3 py-1.5 text-[13px] text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-[12px] drop-shadow-[0px_20px_12.5px_rgba(0,0,0,0.1)] w-[400px] p-8" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="size-12 rounded-full bg-[#fef2f2] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </div>
              <p className="font-bold text-[20px] text-[#1a1a1a]">Eliminar beneficiario</p>
              <p className="text-[14px] text-[#666] text-center">Esta acción requiere confirmación. Deberás redistribuir los porcentajes restantes.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 border border-[#d1d5dc] rounded-[8px] py-[11px] text-[14px] font-medium text-[#364153] hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDeleteConfirm} className="flex-1 bg-[#dc2626] rounded-[8px] py-[11px] text-[14px] font-medium text-white hover:bg-[#b91c1c] transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA modal */}
      {showTotp && (
        <TOTPModal onConfirm={handleTOTPConfirm} onCancel={() => { setShowTotp(false); setPendingAction(null); }} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

function QuickCard({ label, imgSrc }: { label: string; imgSrc: string }) {
  return (
    <div className="bg-[#f7f9fb] rounded-lg drop-shadow-[0px_4px_2px_rgba(0,0,0,0.05)] flex flex-col items-center justify-between p-4 overflow-hidden">
      <div className="h-[196px] w-[190px] relative shrink-0 z-[2]">
        <div className="absolute h-[260px] left-0 top-[-64px] w-[190px] overflow-hidden">
          <img src={imgSrc} alt={label} className="absolute h-full left-[3%] w-[94%] top-0 max-w-none" />
        </div>
      </div>
      <div className="w-full pt-8 z-[1]">
        <div className="bg-black flex items-center justify-center px-4 py-2 rounded-lg shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
          <span className="text-white text-[16px] leading-[24px]">{label}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: dashboard ────────────────────────────────────────────────────────

function DashboardScreen({ onLogout }: { onLogout: () => void }) {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard-ops');
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaData | null>(null);

  if (selectedCuenta) {
    return <BeneficiariosScreen cuenta={selectedCuenta} onBack={() => setSelectedCuenta(null)} />;
  }

  return (
    <div className="w-full h-full flex overflow-hidden">
      <SidebarOps active={activeNav} onSelect={setActiveNav} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top nav */}
        <div className="h-[64px] border-b border-[#e5e7eb] flex items-center justify-between px-8 shrink-0 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] sticky top-0 bg-white z-10">
          <span className="text-black text-[16px] leading-[24px] pl-4">Dashboard</span>
          <div className="flex items-center gap-2">
            <img src="/cp-assets/logo-nav.png" alt="" className="h-[25px] w-[25px]" />
            <span className="text-black text-[16px] leading-[24px] pl-2">Staging Devs - Staging Developers, S.A. de C.V.</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4">
          <div className="bg-[#f7f9fb] rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.05)] flex flex-col items-center px-6 py-8 mb-4">
            <p className="text-black text-[25.6px] leading-[38.4px]">Staging Devs</p>
            <p className="text-black text-[19.2px] leading-[28.8px] font-thin">Staging Developers, S.A. de C.V.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {CUENTAS.map((c, i) => <CuentaCard key={i} {...c} onClick={() => setSelectedCuenta(c)} />)}
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4 pb-8">
            <QuickCard label="Cuentas"       imgSrc="/cp-assets/img-cuentas.png" />
            <QuickCard label="Transacciones" imgSrc="/cp-assets/img-transacciones.png" />
            <QuickCard label="Reportes"      imgSrc="/cp-assets/img-reportes.png" />
            <QuickCard label="Instrumentos"  imgSrc="/cp-assets/img-instrumentos.png" />
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Mac desktop wrapper ──────────────────────────────────────────────────────

function MacDesktop({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>('login-email');
  const [email, setEmail] = useState('');
  const [show2FA, setShow2FA] = useState(false);

  const handleEmailNext = (e: string) => {
    setEmail(e);
    setScreen('login-password');
  };

  const handlePasswordNext = () => {
    setShow2FA(true);
  };

  const handle2FAVerify = () => {
    setShow2FA(false);
    setScreen('loading');
    setTimeout(() => setScreen('dashboard'), 2200);
  };

  const handleLogout = () => {
    setEmail('');
    setShow2FA(false);
    setScreen('login-email');
  };

  const titleMap: Record<Screen, string> = {
    'login-email': 'FINCOPAY · Inicio de sesión',
    'login-password': 'FINCOPAY · Inicio de sesión',
    'login-2fa': 'FINCOPAY · Verificación',
    loading: 'FINCOPAY · Cargando',
    dashboard: 'FINCOPAY · Monato Admin Dashboard',
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
                <DashboardScreen onLogout={handleLogout} />
              ) : (
                <div className="w-full h-full flex bg-white relative">
                  {screen === 'login-email' && (
                    <LoginEmailScreen onNext={handleEmailNext} onBypass={() => setScreen('dashboard')} />
                  )}
                  {screen === 'login-password' && (
                    <LoginPasswordScreen
                      email={email}
                      onNext={handlePasswordNext}
                      onBack={() => setScreen('login-email')}
                    />
                  )}
                  <PhotoPanel />
                  {show2FA && (
                    <TwoFAModal
                      onVerify={handle2FAVerify}
                      onClose={() => setShow2FA(false)}
                    />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Catalog entry ────────────────────────────────────────────────────────────

export function CustomerPlatformPrototype() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-base-100 bg-background-50 overflow-hidden">
        <div className="border-b border-base-100 bg-background-soft-50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">
            Customer Platform v1.0 — Prototipo navegable
          </span>
          <Badge color="primary" size="sm">Prototype</Badge>
        </div>
        <div className="p-6 flex items-center gap-6">
          <div className="relative w-72 h-44 rounded-lg overflow-hidden border border-base-100 bg-background-soft-50 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <div className="w-52 h-34 bg-white rounded-lg shadow-xl overflow-hidden border border-white/10 flex" style={{ height: 120 }}>
                <div className="w-14 bg-[#111827] h-full" />
                <div className="flex-1 p-2 flex flex-col gap-1.5">
                  <div className="h-2 bg-[#e5e7eb] rounded w-3/4" />
                  <div className="h-2 bg-[#e5e7eb] rounded w-1/2" />
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    <div className="h-3 bg-[#f3f4f6] rounded border border-[#e5e7eb]" />
                    <div className="h-3 bg-[#f3f4f6] rounded border border-[#e5e7eb]" />
                  </div>
                  <div className="flex gap-1 mt-1">
                    {['#3b82f6','#6366f1','#0891b2','#0f172a'].map((c, i) => (
                      <div key={i} className="h-6 flex-1 rounded" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-text-50 font-semibold text-lg">Customer Platform — FINCOPAY</h3>
            <p className="text-text-200 text-sm max-w-md">
              Portal de administración FINCOPAY. Incluye flujo de login (email → contraseña → 2FA TOTP),
              loading screen y dashboard de administrador con sidebar de navegación.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {['Login', '2FA TOTP', 'Loading', 'Admin Dashboard', 'Sidebar nav'].map((tag) => (
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
            <MacDesktop onExit={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
