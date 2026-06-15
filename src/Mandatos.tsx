import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/core/button';
import { Input } from './components/core/input';
import { Badge } from './components/core/badge';
import { Modal } from './components/core/modal';
import Alert from './components/core/alert';
import OtpInput from './components/core/otp-input';
import { TabRoot, TabList, TabTrigger, TabContent } from './components/core/tabs';
import LogoDefault from './assets/logo-default.png';
import {
  Envelope1,
  Phone,
  Copy1,
  CheckCircle1,
  ArrowLeft,
  Download1,
  Shield1Check,
  Buildings11,
  Calendar,
  Check,
} from '@tailgrids/icons';

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | 'checkout-info'
  | 'checkout-auth'
  | 'checkout-otp'
  | 'checkout-clabe'
  | 'checkout-transfer'
  | 'checkout-confirm'
  | 'checkout-success'
  | 'portal-list'
  | 'portal-detail';

type AuthChannel = 'email' | 'sms';

interface FlowData {
  channel: AuthChannel;
  contact: string;
  otp: string;
  clabe: string;
  confirmAmount: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const COMERCIO = {
  nombre: 'Financiera Avanza S.A.',
  concepto: 'Contrato de crédito #MX-2026-00441',
  frecuencia: 'Mensual',
  monto_max: '$3,500.00 MXN',
  rfc: 'FAV210305AB1',
};

const CLABE_MONATO = '646180157000000001';

const MANDATOS_MOCK = [
  {
    id: 'MDT-2026-001',
    comercio: 'Financiera Avanza S.A.',
    concepto: 'Contrato de crédito #MX-2026-00441',
    clabe: '***************1234',
    estado: 'Activo',
    fecha: '01 Jun 2026',
    frecuencia: 'Mensual',
    monto_max: '$3,500.00 MXN',
    eventos: [
      { ts: '01 Jun 2026, 14:32', desc: 'Mandato aceptado y activado' },
      { ts: '01 Jun 2026, 14:31', desc: 'Transferencia de verificación confirmada' },
      { ts: '01 Jun 2026, 14:28', desc: 'CLABE capturada y validada' },
      { ts: '01 Jun 2026, 14:25', desc: 'Identidad verificada vía email' },
    ],
  },
  {
    id: 'MDT-2026-002',
    comercio: 'Seguros Patria',
    concepto: 'Póliza de vida #SP-00892',
    clabe: '***************5678',
    estado: 'Cancelado',
    fecha: '15 Mar 2026',
    frecuencia: 'Anual',
    monto_max: '$1,200.00 MXN',
    eventos: [
      { ts: '20 Mar 2026, 10:05', desc: 'Mandato cancelado por solicitud del usuario' },
      { ts: '15 Mar 2026, 09:12', desc: 'Mandato aceptado y activado' },
    ],
  },
];

const STEPS = [
  'Información',
  'Verificación',
  'Código',
  'Cuenta',
  'Transferencia',
  'Confirmar',
];

const CHECKOUT_SCREENS: Screen[] = [
  'checkout-info',
  'checkout-auth',
  'checkout-otp',
  'checkout-clabe',
  'checkout-transfer',
  'checkout-confirm',
];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 px-6 pt-5 pb-2">
      {STEPS.map((label, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`h-1 w-full rounded-full transition-colors duration-300 ${
              i < current
                ? 'bg-primary-500'
                : i === current
                  ? 'bg-primary-500'
                  : 'bg-base-100'
            }`}
          />
          {i === current && (
            <span className="text-[9px] text-primary-500 font-medium">{label}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Mobile frame ─────────────────────────────────────────────────────────────

function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className="relative bg-white rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col"
        style={{ width: 390, height: 'min(820px, calc(100% - 32px))' }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#1e1e1e] rounded-b-2xl z-10" />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Checkout header ──────────────────────────────────────────────────────────

function CheckoutHeader({ step, onBack }: { step: number; onBack?: () => void }) {
  return (
    <div className="pt-8">
      <StepIndicator current={step} />
      <div className="flex items-center px-5 py-2 min-h-[44px]">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 -ml-1 rounded-full text-text-200 hover:text-text-50 transition"
          >
            <ArrowLeft size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Screen: checkout-info ────────────────────────────────────────────────────

function CheckoutInfoScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col min-h-full">
      <CheckoutHeader step={0} />
      <div className="flex-1 px-5 pb-6 flex flex-col gap-5">
        {/* Merchant card */}
        <div className="flex flex-col items-center gap-3 pt-2 pb-4">
          <img src={LogoDefault} alt="Monato" className="h-8 object-contain" />
          <div className="text-center">
            <p className="text-text-50 font-semibold text-base">{COMERCIO.nombre}</p>
            <p className="text-text-200 text-sm">RFC: {COMERCIO.rfc}</p>
          </div>
        </div>

        {/* Mandate detail */}
        <div className="rounded-xl border border-base-100 bg-background-soft-50 p-4 flex flex-col gap-3">
          <p className="text-text-200 text-xs font-medium uppercase tracking-wider">Detalle del mandato</p>
          <div className="flex flex-col gap-2">
            <Row label="Concepto" value={COMERCIO.concepto} />
            <Row label="Frecuencia" value={COMERCIO.frecuencia} />
            <Row label="Monto máximo" value={COMERCIO.monto_max} />
          </div>
        </div>

        {/* Terms */}
        <div className="rounded-xl border border-base-100 bg-background-soft-50 p-4">
          <p className="text-text-200 text-xs font-medium uppercase tracking-wider mb-2">Términos de autorización</p>
          <p className="text-text-200 text-xs leading-relaxed">
            Al aceptar este mandato autorizas a {COMERCIO.nombre} a realizar cargos automáticos sobre tu cuenta bancaria
            por los montos y frecuencia indicados. Podrás cancelar este mandato en cualquier momento desde tu portal de
            mandatos. Monato actúa como intermediario de pagos conforme a la regulación CNBV y BANXICO vigente.
          </p>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-badge-primary-background">
          <Shield1Check size={16} className="text-primary-500 mt-0.5 shrink-0" />
          <p className="text-primary-500 text-xs">Tu información bancaria está protegida con cifrado de extremo a extremo.</p>
        </div>
      </div>

      <div className="px-5 pb-8 pt-2">
        <Button className="w-full" onClick={onNext}>
          Iniciar proceso de autorización
        </Button>
      </div>
    </div>
  );
}

// ─── Screen: checkout-auth ────────────────────────────────────────────────────

function CheckoutAuthScreen({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: FlowData;
  onChange: (d: Partial<FlowData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const valid = data.contact.trim().length > 3;

  return (
    <div className="flex flex-col min-h-full">
      <CheckoutHeader step={1} onBack={onBack} />
      <div className="flex-1 px-5 pb-6 flex flex-col gap-5">
        <div>
          <h2 className="text-text-50 font-semibold text-lg">Verifica tu identidad</h2>
          <p className="text-text-200 text-sm mt-1">
            Elige cómo quieres recibir tu código de verificación.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <ChannelCard
            active={data.channel === 'email'}
            icon={<Envelope1 size={20} className="text-primary-500" />}
            title="Correo electrónico"
            desc="Recibirás un código de 6 dígitos"
            onClick={() => onChange({ channel: 'email', contact: '' })}
          />
          <ChannelCard
            active={data.channel === 'sms'}
            icon={<Phone size={20} className="text-primary-500" />}
            title="SMS"
            desc="Recibirás un mensaje de texto"
            onClick={() => onChange({ channel: 'sms', contact: '' })}
          />
        </div>

        <Input
          label={data.channel === 'email' ? 'Correo electrónico' : 'Número de teléfono'}
          placeholder={data.channel === 'email' ? 'correo@ejemplo.com' : '55 1234 5678'}
          type={data.channel === 'email' ? 'email' : 'tel'}
          value={data.contact}
          onChange={(e) => onChange({ contact: e.target.value })}
        />
      </div>

      <div className="px-5 pb-8 pt-2">
        <Button className="w-full" disabled={!valid} onClick={onNext}>
          Enviar código
        </Button>
      </div>
    </div>
  );
}

function ChannelCard({
  active,
  icon,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
        active
          ? 'border-primary-500 bg-badge-primary-background'
          : 'border-base-100 bg-background-soft-50 hover:border-base-200'
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${active ? 'text-primary-500' : 'text-text-50'}`}>{title}</p>
        <p className="text-text-200 text-xs">{desc}</p>
      </div>
      <div
        className={`size-4 rounded-full border-2 transition-colors ${
          active ? 'border-primary-500 bg-primary-500' : 'border-base-200 bg-white'
        }`}
      />
    </button>
  );
}

// ─── Screen: checkout-otp ─────────────────────────────────────────────────────

function CheckoutOtpScreen({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: FlowData;
  onChange: (d: Partial<FlowData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState(false);
  const [timer, setTimer] = useState(59);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleConfirm = useCallback(() => {
    if (data.otp === '123456') {
      setError(false);
      onNext();
    } else {
      setError(true);
    }
  }, [data.otp, onNext]);

  const masked =
    data.channel === 'email'
      ? data.contact.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      : data.contact.replace(/(.{2})(.*)(.{2})/, '$1****$3');

  return (
    <div className="flex flex-col min-h-full">
      <CheckoutHeader step={2} onBack={onBack} />
      <div className="flex-1 px-5 pb-6 flex flex-col gap-5">
        <div>
          <h2 className="text-text-50 font-semibold text-lg">Ingresa tu código</h2>
          <p className="text-text-200 text-sm mt-1">
            Enviamos un código a{' '}
            <span className="text-text-50 font-medium">{masked}</span>
          </p>
        </div>

        <OtpInput
          digitLength={6}
          label="Código de verificación"
          hint="Usa 123456 para continuar en este prototipo"
          value={data.otp}
          onChange={(e) => {
            onChange({ otp: e.target.value });
            setError(false);
          }}
        />

        {error && (
          <Alert
            title="Código incorrecto"
            message="Verifica el código e inténtalo de nuevo."
            variant="danger"
          />
        )}

        <div className="text-center">
          {timer > 0 ? (
            <p className="text-text-200 text-sm">
              Reenviar código en{' '}
              <span className="text-text-50 font-medium">0:{String(timer).padStart(2, '0')}</span>
            </p>
          ) : (
            <button
              onClick={() => setTimer(59)}
              className="text-primary-500 text-sm font-medium hover:underline"
            >
              Reenviar código
            </button>
          )}
        </div>
      </div>

      <div className="px-5 pb-8 pt-2">
        <Button
          className="w-full"
          disabled={data.otp.length < 6}
          onClick={handleConfirm}
        >
          Verificar código
        </Button>
      </div>
    </div>
  );
}

// ─── Screen: checkout-clabe ───────────────────────────────────────────────────

function CheckoutClabeScreen({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: FlowData;
  onChange: (d: Partial<FlowData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isValid = data.clabe.replace(/\s/g, '').length === 18 && /^\d+$/.test(data.clabe.replace(/\s/g, ''));
  const showError = data.clabe.length > 0 && !isValid;

  return (
    <div className="flex flex-col min-h-full">
      <CheckoutHeader step={3} onBack={onBack} />
      <div className="flex-1 px-5 pb-6 flex flex-col gap-5">
        <div>
          <h2 className="text-text-50 font-semibold text-lg">Cuenta bancaria</h2>
          <p className="text-text-200 text-sm mt-1">
            Ingresa la CLABE de la cuenta desde la que se realizarán los débitos automáticos.
          </p>
        </div>

        <Input
          label="CLABE interbancaria"
          placeholder="18 dígitos"
          value={data.clabe}
          maxLength={18}
          onChange={(e) => onChange({ clabe: e.target.value.replace(/\D/g, '') })}
          hint={showError ? 'La CLABE debe tener 18 dígitos' : `${data.clabe.length}/18 dígitos`}
          state={showError ? 'error' : 'default'}
        />

        {isValid && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-badge-success-background">
            <CheckCircle1 size={16} className="text-badge-success-text shrink-0" />
            <p className="text-badge-success-text text-xs">CLABE válida</p>
          </div>
        )}

        <div className="rounded-xl border border-base-100 bg-background-soft-50 p-4">
          <p className="text-text-200 text-xs leading-relaxed">
            Esta cuenta será utilizada exclusivamente para los débitos autorizados en este mandato.
            El titular debe ser el mismo que está realizando esta autorización.
          </p>
        </div>
      </div>

      <div className="px-5 pb-8 pt-2">
        <Button className="w-full" disabled={!isValid} onClick={onNext}>
          Continuar
        </Button>
      </div>
    </div>
  );
}

// ─── Screen: checkout-transfer ────────────────────────────────────────────────

function CheckoutTransferScreen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-full">
      <CheckoutHeader step={4} onBack={onBack} />
      <div className="flex-1 px-5 pb-6 flex flex-col gap-5">
        <div>
          <h2 className="text-text-50 font-semibold text-lg">Verifica tu cuenta</h2>
          <p className="text-text-200 text-sm mt-1">
            Realiza una transferencia de verificación por un monto entre{' '}
            <span className="font-medium text-text-50">$0.01 y $1.00 MXN</span> hacia la siguiente cuenta.
          </p>
        </div>

        {/* CLABE destino */}
        <div className="rounded-xl border border-base-100 bg-background-soft-50 p-4 flex flex-col gap-3">
          <p className="text-text-200 text-xs font-medium uppercase tracking-wider">Cuenta Monato para verificación</p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-text-50 font-mono text-sm tracking-widest">{CLABE_MONATO}</p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-primary-500 text-xs font-medium shrink-0"
            >
              <Copy1 size={14} />
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Buildings11 size={14} className="text-text-200" />
            <p className="text-text-200 text-xs">Monato Pagos S.A. · STP</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3">
          {[
            'Abre tu banca móvil o en línea',
            'Realiza una transferencia SPEI a la cuenta Monato indicada',
            'El monto debe ser entre $0.01 y $1.00 MXN desde tu cuenta registrada',
            'Conserva el comprobante y regresa aquí',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="size-5 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-text-200 text-sm">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8 pt-2">
        <Button className="w-full" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Verificando...' : 'Ya realicé la transferencia'}
        </Button>
      </div>
    </div>
  );
}

// ─── Screen: checkout-confirm ─────────────────────────────────────────────────

function CheckoutConfirmScreen({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: FlowData;
  onChange: (d: Partial<FlowData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState(false);
  const amount = parseFloat(data.confirmAmount.replace(',', '.'));
  const valid = !isNaN(amount) && amount >= 0.01 && amount <= 1.0;

  const handleConfirm = () => {
    if (valid) {
      setError(false);
      onNext();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <CheckoutHeader step={5} onBack={onBack} />
      <div className="flex-1 px-5 pb-6 flex flex-col gap-5">
        <div>
          <h2 className="text-text-50 font-semibold text-lg">Confirma el monto</h2>
          <p className="text-text-200 text-sm mt-1">
            Ingresa el monto exacto que transferiste para completar la verificación.
          </p>
        </div>

        <Input
          label="Monto enviado (MXN)"
          placeholder="0.00"
          type="number"
          value={data.confirmAmount}
          onChange={(e) => {
            onChange({ confirmAmount: e.target.value });
            setError(false);
          }}
          hint="Debe coincidir exactamente con el monto de tu transferencia"
        />

        {error && (
          <Alert
            title="Monto no válido"
            message="El monto debe estar entre $0.01 y $1.00 MXN."
            variant="danger"
          />
        )}
      </div>

      <div className="px-5 pb-8 pt-2">
        <Button className="w-full" disabled={!valid} onClick={handleConfirm}>
          Confirmar y activar mandato
        </Button>
      </div>
    </div>
  );
}

// ─── Screen: checkout-success ─────────────────────────────────────────────────

function CheckoutSuccessScreen({
  data,
  onPortal,
}: {
  data: FlowData;
  onPortal: () => void;
}) {
  const mandateId = 'MDT-2026-' + Math.floor(Math.random() * 900 + 100);

  return (
    <div className="flex flex-col min-h-full pt-8">
      <div className="flex-1 px-5 pb-6 flex flex-col items-center gap-5">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-full bg-badge-success-background flex items-center justify-center mt-4"
        >
          <CheckCircle1 size={40} className="text-badge-success-text" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-text-50 font-semibold text-xl">¡Mandato activado!</h2>
          <p className="text-text-200 text-sm mt-1">Tu autorización ha quedado registrada.</p>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full rounded-xl border border-base-100 bg-background-soft-50 p-4 flex flex-col gap-2"
        >
          <Row label="Comercio" value={COMERCIO.nombre} />
          <Row label="Concepto" value={COMERCIO.concepto} />
          <Row
            label="CLABE"
            value={`${data.clabe.slice(0, 4)}***${data.clabe.slice(-4)}`}
          />
          <Row label="ID de mandato" value={mandateId} />
          <Row label="Fecha de aceptación" value="15 Jun 2026, 14:32" />
          <div className="flex items-center justify-between pt-1">
            <span className="text-text-200 text-xs">Estado</span>
            <Badge color="success" size="sm">Activo</Badge>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-text-200 text-xs text-center"
        >
          Recibirás una copia de este mandato en {data.channel === 'email' ? 'tu correo' : 'tu teléfono'}.
        </motion.p>
      </div>

      <div className="px-5 pb-8 pt-2 flex flex-col gap-3">
        <Button variant="ghost" className="w-full gap-2">
          <Download1 size={16} />
          Descargar mandato
        </Button>
        <Button className="w-full" onClick={onPortal}>
          Ver mis mandatos
        </Button>
      </div>
    </div>
  );
}

// ─── Screen: portal-list ──────────────────────────────────────────────────────

function PortalListScreen({
  userContact,
  onDetail,
}: {
  userContact: string;
  onDetail: (id: string) => void;
}) {
  const activos = MANDATOS_MOCK.filter((m) => m.estado === 'Activo');
  const historicos = MANDATOS_MOCK.filter((m) => m.estado !== 'Activo');

  return (
    <div className="flex flex-col min-h-full pt-8">
      {/* Header */}
      <div className="px-5 pt-4 pb-4 border-b border-base-100">
        <img src={LogoDefault} alt="Monato" className="h-7 object-contain mb-3" />
        <h2 className="text-text-50 font-semibold text-lg">Mis mandatos</h2>
        <p className="text-text-200 text-xs mt-0.5">{userContact}</p>
      </div>

      <div className="flex-1 px-5 py-4">
        <TabRoot defaultValue="activos">
          <TabList>
            <TabTrigger value="activos">Activos ({activos.length})</TabTrigger>
            <TabTrigger value="historicos">Históricos ({historicos.length})</TabTrigger>
          </TabList>
          <TabContent value="activos">
            <div className="flex flex-col gap-3 pt-4">
              {activos.map((m) => (
                <MandatoCard key={m.id} mandato={m} onClick={() => onDetail(m.id)} />
              ))}
            </div>
          </TabContent>
          <TabContent value="historicos">
            <div className="flex flex-col gap-3 pt-4">
              {historicos.map((m) => (
                <MandatoCard key={m.id} mandato={m} onClick={() => onDetail(m.id)} />
              ))}
            </div>
          </TabContent>
        </TabRoot>
      </div>
    </div>
  );
}

function MandatoCard({
  mandato,
  onClick,
}: {
  mandato: (typeof MANDATOS_MOCK)[0];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-base-100 bg-background-soft-50 p-4 hover:border-base-200 transition flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-text-50 font-medium text-sm">{mandato.comercio}</p>
        <Badge
          color={mandato.estado === 'Activo' ? 'success' : 'gray'}
          size="sm"
        >
          {mandato.estado}
        </Badge>
      </div>
      <p className="text-text-200 text-xs line-clamp-1">{mandato.concepto}</p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-text-200 text-xs">
          <Calendar size={12} />
          {mandato.fecha}
        </div>
        <span className="text-text-200 text-xs">·</span>
        <p className="text-text-200 text-xs">{mandato.monto_max}</p>
      </div>
    </button>
  );
}

// ─── Screen: portal-detail ────────────────────────────────────────────────────

function PortalDetailScreen({
  mandatoId,
  onBack,
}: {
  mandatoId: string;
  onBack: () => void;
}) {
  const m = MANDATOS_MOCK.find((x) => x.id === mandatoId) ?? MANDATOS_MOCK[0];
  const [aclaracionOpen, setAclaracionOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [aclaracionDone, setAclaracionDone] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);

  return (
    <div className="flex flex-col min-h-full pt-8">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-base-100">
        <button onClick={onBack} className="p-1 -ml-1 text-text-200 hover:text-text-50 transition">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-text-50 font-semibold text-base">Detalle del mandato</h2>
      </div>

      <div className="flex-1 px-5 py-4 flex flex-col gap-5">
        {/* Status */}
        <div className="flex items-center justify-between">
          <p className="text-text-50 font-semibold">{m.comercio}</p>
          <Badge color={m.estado === 'Activo' ? 'success' : 'gray'} size="sm">
            {m.estado}
          </Badge>
        </div>

        {/* Info */}
        <div className="rounded-xl border border-base-100 bg-background-soft-50 p-4 flex flex-col gap-2">
          <Row label="ID de mandato" value={m.id} />
          <Row label="Concepto" value={m.concepto} />
          <Row label="CLABE" value={m.clabe} />
          <Row label="Frecuencia" value={m.frecuencia} />
          <Row label="Monto máximo" value={m.monto_max} />
          <Row label="Fecha de aceptación" value={m.fecha} />
        </div>

        {/* Events */}
        <div>
          <p className="text-text-200 text-xs font-medium uppercase tracking-wider mb-3">Historial</p>
          <div className="flex flex-col">
            {m.eventos.map((ev, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="size-2 rounded-full bg-primary-500 mt-1" />
                  {i < m.eventos.length - 1 && <div className="w-px flex-1 bg-base-100 my-1" />}
                </div>
                <div className="pb-3">
                  <p className="text-text-50 text-xs font-medium">{ev.desc}</p>
                  <p className="text-text-200 text-xs mt-0.5">{ev.ts}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {aclaracionDone && (
          <Alert title="Aclaración registrada" message="Recibirás respuesta en un plazo de 5 días hábiles." variant="success" />
        )}
        {cancelDone && (
          <Alert title="Cancelación solicitada" message="Tu mandato será cancelado en un plazo de 24 horas." variant="warning" />
        )}

        {/* Actions — only for active mandates */}
        {m.estado === 'Activo' && !cancelDone && (
          <div className="flex flex-col gap-3 pb-2">
            <Button variant="ghost" className="w-full" onClick={() => setAclaracionOpen(true)}>
              Solicitar aclaración
            </Button>
            <Button
              className="w-full !bg-badge-error-background !text-badge-error-text hover:!bg-badge-error-background/80 border border-badge-error-text/20"
              variant="ghost"
              onClick={() => setCancelOpen(true)}
            >
              Cancelar mandato
            </Button>
          </div>
        )}
      </div>

      {/* Modal: aclaración */}
      <Modal open={aclaracionOpen} onClose={() => setAclaracionOpen(false)}>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-text-50 font-semibold text-base">Solicitar aclaración</h3>
          <p className="text-text-200 text-sm">
            Se registrará una solicitud de aclaración para el mandato <strong>{m.id}</strong>.
            Nuestro equipo se pondrá en contacto contigo en un plazo de 5 días hábiles.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setAclaracionOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setAclaracionOpen(false);
                setAclaracionDone(true);
              }}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: cancelación */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Check size={20} className="text-badge-error-text" />
            <h3 className="text-text-50 font-semibold text-base">Cancelar mandato</h3>
          </div>
          <p className="text-text-200 text-sm">
            Estás a punto de cancelar el mandato <strong>{m.id}</strong>. Una vez cancelado,{' '}
            <strong>no se realizarán nuevos débitos</strong> en tu cuenta.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setCancelOpen(false)}>
              Mantener
            </Button>
            <Button
              className="flex-1 !bg-badge-error-background !text-badge-error-text"
              variant="ghost"
              onClick={() => {
                setCancelOpen(false);
                setCancelDone(true);
              }}
            >
              Sí, cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-text-200 text-xs shrink-0">{label}</span>
      <span className="text-text-50 text-xs font-medium text-right">{value}</span>
    </div>
  );
}

// ─── Mac desktop wrapper ──────────────────────────────────────────────────────

function MacDesktop({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>('checkout-info');
  const [selectedMandato, setSelectedMandato] = useState<string>('');
  const [flow, setFlow] = useState<FlowData>({
    channel: 'email',
    contact: '',
    otp: '',
    clabe: '',
    confirmAmount: '',
  });

  const updateFlow = (d: Partial<FlowData>) => setFlow((f) => ({ ...f, ...d }));

  const goNext = () => {
    const idx = CHECKOUT_SCREENS.indexOf(screen as typeof CHECKOUT_SCREENS[number]);
    if (idx === -1) return;
    if (idx < CHECKOUT_SCREENS.length - 1) {
      setScreen(CHECKOUT_SCREENS[idx + 1]);
    } else {
      setScreen('checkout-success');
    }
  };

  const goBack = () => {
    const idx = CHECKOUT_SCREENS.indexOf(screen as typeof CHECKOUT_SCREENS[number]);
    if (idx > 0) setScreen(CHECKOUT_SCREENS[idx - 1]);
  };

  const screenTitle = () => {
    if (screen.startsWith('checkout')) return 'Autorización de mandato';
    if (screen === 'portal-list') return 'Portal de mandatos';
    return 'Detalle del mandato';
  };

  return (
    <div className="w-full h-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-[1440px] rounded-xl overflow-hidden shadow-2xl flex flex-col border border-white/10 relative"
        style={{ height: 'min(900px, calc(100vh - 32px))' }}
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
            <span className="text-white/40 text-[11px]">Mandatos — Monato · {screenTitle()}</span>
          </div>
        </div>

        {/* Desktop background + mobile frame */}
        <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full h-full"
            >
              <MobileFrame>
                {screen === 'checkout-info' && (
                  <CheckoutInfoScreen onNext={goNext} />
                )}
                {screen === 'checkout-auth' && (
                  <CheckoutAuthScreen data={flow} onChange={updateFlow} onNext={goNext} onBack={goBack} />
                )}
                {screen === 'checkout-otp' && (
                  <CheckoutOtpScreen data={flow} onChange={updateFlow} onNext={goNext} onBack={goBack} />
                )}
                {screen === 'checkout-clabe' && (
                  <CheckoutClabeScreen data={flow} onChange={updateFlow} onNext={goNext} onBack={goBack} />
                )}
                {screen === 'checkout-transfer' && (
                  <CheckoutTransferScreen onNext={goNext} onBack={goBack} />
                )}
                {screen === 'checkout-confirm' && (
                  <CheckoutConfirmScreen data={flow} onChange={updateFlow} onNext={goNext} onBack={goBack} />
                )}
                {screen === 'checkout-success' && (
                  <CheckoutSuccessScreen data={flow} onPortal={() => setScreen('portal-list')} />
                )}
                {screen === 'portal-list' && (
                  <PortalListScreen
                    userContact={flow.contact || 'usuario@monato.com'}
                    onDetail={(id) => { setSelectedMandato(id); setScreen('portal-detail'); }}
                  />
                )}
                {screen === 'portal-detail' && (
                  <PortalDetailScreen mandatoId={selectedMandato} onBack={() => setScreen('portal-list')} />
                )}
              </MobileFrame>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Catalog entry ────────────────────────────────────────────────────────────

export function MandatosPrototype() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-base-100 bg-background-50 overflow-hidden">
        <div className="border-b border-base-100 bg-background-soft-50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">
            Mandatos v1.0 — Prototipo navegable
          </span>
          <Badge color="primary" size="sm">Prototype</Badge>
        </div>
        <div className="p-6 flex items-center gap-6">
          {/* Thumbnail */}
          <div className="relative w-72 h-44 rounded-lg overflow-hidden border border-base-100 bg-background-soft-50 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <div
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/10 flex flex-col"
                style={{ width: 96, height: 140 }}
              >
                <div className="h-5 flex items-center justify-center">
                  <div className="w-12 h-2 bg-[#1e1e1e] rounded-b-lg" />
                </div>
                <div className="flex-1 px-2 py-1 flex flex-col gap-1">
                  <div className="h-1.5 bg-primary-500/20 rounded" />
                  <div className="h-1.5 bg-primary-500/30 rounded w-3/4" />
                  <div className="mt-1 h-6 bg-background-soft-50 rounded border border-base-100" />
                  <div className="h-6 bg-background-soft-50 rounded border border-base-100" />
                  <div className="mt-auto h-5 bg-primary-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          {/* Info */}
          <div className="flex flex-col gap-2">
            <h3 className="text-text-50 font-semibold text-lg">Mandatos de Débito Automático</h3>
            <p className="text-text-200 text-sm max-w-md">
              Flujo de aceptación de mandatos para débito automático (CLABE). Incluye checkout mobile del pagador
              y portal de gestión de mandatos activos/históricos.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {['Checkout mobile', 'OTP', 'Verificación CLABE', 'Portal', 'Cancelación'].map((tag) => (
                <Badge key={tag} color="gray" size="sm">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-base-100 px-6 py-3 flex justify-end">
          <Button onClick={() => setOpen(true)}>Abrir prototipo</Button>
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
