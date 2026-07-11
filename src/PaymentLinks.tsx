import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers2, Close, Copy1, CheckCircle1, Whatsapp,
  Telephone1, Envelope1, MapMarker5,
  Facebook, Twitter, Instagram, Linkedin,
  Download1, ClockThree,
} from '@tailgrids/icons';
import { Badge } from './components/core/badge';
import { Button } from './components/core/button';
import {
  AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent,
} from './components/core/accordion';

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = 'detalle' | 'expired' | 'success';
type PaymentMethod = 'SPEI' | 'Efectivo';

// ─── Demo data (Grupo Bimbo — mirrors CLP V1.0 Figma node 428:7237) ───────────
const MERCHANT = {
  name: 'Grupo Bimbo',
  phone: '+894 022 0232',
  email: 'ayuda@grupobimbo.com',
  address: 'Prolongación Paseo de la Reforma 1000, Col. Peña Blanca Santa Fe, Alcaldía Álvaro Obregón, C.P. 01210, Ciudad de México, México.',
};
const PAYMENT = {
  monto: '$3,450.00',
  referencia: 'REF-2026-00841',
  fechaLimite: '21/05/2026',
  // FINCO PAY CLABE — 18 digits, prefix 734
  clabeRaw: '734180529581739264',
  clabeDisplay: '7341 8052 9581 7392 64',
  banco: 'FINCOPAY',
  nombre: 'GRUPO BIMBO',
};
const SPEI_STEPS = [
  'Ingresa a tu app de banco.',
  'Selecciona "Transferencia SPEI".',
  'Copia la CLABE destino y el monto exacto.',
  'Incluye la referencia en el concepto y confirma la transferencia.',
];
const EFECTIVO_STEPS = [
  'Acude a cualquier tienda participante.',
  'Proporciona la referencia de pago en efectivo.',
  'Realiza el pago en tienda.',
  'Guarda tu comprobante.',
];

// ─── Copy-to-clipboard button (pattern from src/billpay/pages/CashPage.tsx) ───
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = () => {
    try { void navigator.clipboard?.writeText(value); } catch { /* noop */ }
    setCopied(true);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      className="shrink-0 text-text-200 transition-colors hover:text-primary-500"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="inline-grid place-items-center text-success-500"
          >
            <CheckCircle1 size={16} />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="inline-grid place-items-center"
          >
            <Copy1 size={16} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Small shared pieces ───────────────────────────────────────────────────────
function FieldRow({ label, value, copyValue, highlight }: {
  label: string; value: string; copyValue?: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-text-100">{label}</span>
      <span className="flex items-center gap-2">
        <span className={`text-sm font-medium ${highlight ? 'text-success-500' : 'text-title-50'}`}>{value}</span>
        {copyValue && <CopyButton value={copyValue} label={label.toLowerCase()} />}
      </span>
    </div>
  );
}

function StepsList({ steps }: { steps: string[] }) {
  return (
    <div className="mt-4 rounded-xl bg-background-soft-50 p-4">
      <p className="mb-2 text-sm font-medium text-title-50">Cómo realizar tu pago</p>
      <ol className="space-y-1.5">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2 text-sm text-text-100">
            <span className="shrink-0 text-text-200">{i + 1}.</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Barcode() {
  // Deterministic bar widths — a decorative stand-in, not a real barcode library.
  const bars = [2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 2, 1, 3, 1, 2, 1];
  return (
    <div className="flex h-14 items-stretch gap-[2px] overflow-hidden rounded-lg border border-base-100 bg-background-50 px-3 py-2">
      {bars.map((w, i) => (
        <div key={i} style={{ width: w * 2 }} className="bg-title-50" />
      ))}
    </div>
  );
}

function StoreChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="rounded-md px-2 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

function MerchantHeader() {
  return (
    <div className="flex flex-col items-center gap-1 border-b border-base-100 px-4 py-5">
      <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#e4032e' }}>
        BIMBO
      </span>
    </div>
  );
}

function ContactCta({ label }: { label: string }) {
  return (
    <div className="space-y-3 text-center">
      <p className="text-sm text-text-100">
        ¿Tienes dudas sobre tu pago?<br />Contáctanos, estamos para ayudarte.
      </p>
      <Button className="w-full gap-2">
        <Whatsapp size={18} />
        {label}
      </Button>
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-8 space-y-4 border-t border-base-100 px-4 pt-5 pb-6">
      <p className="text-sm font-semibold text-title-50">Sobre {MERCHANT.name}</p>
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-text-100">
          <Telephone1 size={18} className="shrink-0 text-text-200" />
          <span>{MERCHANT.phone}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-100">
          <Envelope1 size={18} className="shrink-0 text-text-200" />
          <span>{MERCHANT.email}</span>
        </div>
        <div className="flex items-start gap-3 text-sm text-text-100">
          <MapMarker5 size={18} className="mt-0.5 shrink-0 text-text-200" />
          <span>{MERCHANT.address}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 border-t border-base-100 pt-4 text-xs text-text-100">
        <span>Síguenos en</span>
        <div className="flex items-center gap-2">
          {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
            <span key={i} className="flex size-7 items-center justify-center rounded-full bg-background-soft-50 text-text-100">
              <Icon size={14} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Detalle (+ SPEI / Efectivo accordion states) ─────────────────────
function DetalleScreen({ onSimulateSuccess }: { onSimulateSuccess: (method: PaymentMethod) => void }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background-50">
      <MerchantHeader />
      <div className="space-y-6 px-4 py-5">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-title-50">Tu pago, simple y seguro</h1>
          <p className="mt-1 text-sm text-text-100">Todo listo para ti, en minutos y sin complicaciones</p>
        </div>

        {/* Resumen de pago */}
        <div className="rounded-2xl bg-background-soft-50 p-4">
          <p className="mb-3 text-base font-semibold text-title-50">Resumen de pago</p>
          <div className="divide-y divide-base-100 rounded-xl border border-base-100 bg-background-50 px-4">
            <FieldRow label="Monto" value={PAYMENT.monto} />
            <FieldRow label="Referencia" value={PAYMENT.referencia} />
            <FieldRow label="Comercio" value={MERCHANT.name} />
            <FieldRow label="Fecha límite" value={PAYMENT.fechaLimite} highlight />
          </div>
        </div>

        {/* Opciones de pago */}
        <div>
          <p className="mb-3 px-1 text-base font-semibold text-title-50">Opciones de pago</p>
          <AccordionRoot variant="style_four" className="gap-3">
            {/* SPEI */}
            <AccordionItem className="border border-base-100 bg-background-100">
              <AccordionTrigger className="max-sm:p-4 sm:p-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background-soft-50">
                    <span className="text-[10px] font-bold text-primary-500">SPEI</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-title-50">Transferencia SPEI</p>
                    <p className="text-xs text-text-100">Realiza una transferencia bancaria desde tu app de banca en línea</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="mx-4 sm:mx-4 border-t-0 pt-0 pb-4 sm:pb-4">
                <div className="flex flex-col items-center gap-1 py-2">
                  <p className="text-sm text-text-100">Monto a pagar</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-title-50">{PAYMENT.monto}</span>
                    <CopyButton value={PAYMENT.monto} label="monto" />
                  </div>
                </div>

                <div className="rounded-xl border border-base-200 bg-background-soft-50 p-4 text-center">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-200">CLABE</p>
                  <p className="font-mono text-lg font-semibold tracking-wider text-title-50">{PAYMENT.clabeDisplay}</p>
                </div>
                <Button className="mt-3 w-full gap-2" onClick={() => { try { void navigator.clipboard?.writeText(PAYMENT.clabeRaw); } catch { /* noop */ } }}>
                  <Copy1 size={16} />
                  Copiar
                </Button>

                <div className="mt-2 divide-y divide-base-100">
                  <FieldRow label="Nombre" value={PAYMENT.nombre} copyValue={PAYMENT.nombre} />
                  <FieldRow label="Banco" value={PAYMENT.banco} />
                  <FieldRow label="Referencia (opcional)" value={PAYMENT.referencia} copyValue={PAYMENT.referencia} />
                </div>

                <StepsList steps={SPEI_STEPS} />
                <p className="mt-3 text-center text-xs text-text-200">Tu pago se confirmará en segundos</p>

                <button
                  type="button"
                  onClick={() => onSimulateSuccess('SPEI')}
                  className="mt-4 w-full rounded-lg border border-dashed border-base-200 py-2 text-xs font-medium text-text-100 transition-colors hover:bg-background-soft-50"
                >
                  Simular pago exitoso →
                </button>
              </AccordionContent>
            </AccordionItem>

            {/* Efectivo */}
            <AccordionItem className="border border-base-100 bg-background-100">
              <AccordionTrigger className="max-sm:p-4 sm:p-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background-soft-50 text-title-50">
                    $
                  </div>
                  <div>
                    <p className="text-sm font-medium text-title-50">Pago en efectivo</p>
                    <p className="text-xs text-text-100">Paga en OXXO, 7-Eleven, Tiendas 3B u otros establecimientos</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="mx-4 sm:mx-4 border-t-0 pt-0 pb-4 sm:pb-4">
                <div className="flex flex-col items-center gap-1 py-2">
                  <p className="text-sm text-text-100">Monto a pagar</p>
                  <span className="text-2xl font-bold text-title-50">{PAYMENT.monto}</span>
                  <p className="text-xs text-text-200">+ comisión de tienda</p>
                </div>

                <p className="text-center text-sm text-text-100">
                  Tienes tiempo hasta el {PAYMENT.fechaLimite} a las 11:59 pm
                </p>

                <p className="mt-4 mb-2 text-xs font-medium text-text-200">Referencia para pago en tiendas</p>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <StoreChip label="OXXO" color="#e4032e" />
                  <StoreChip label="7-Eleven" color="#00824a" />
                  <StoreChip label="Circle K" color="#ee3124" />
                  <Badge color="gray" size="sm">y 30+</Badge>
                </div>

                <Barcode />
                <p className="mt-2 text-center font-mono text-sm tracking-wider text-title-50">{PAYMENT.clabeDisplay}</p>

                <div className="mt-3 flex gap-2">
                  <Button className="flex-1 gap-2" onClick={() => { try { void navigator.clipboard?.writeText(PAYMENT.clabeRaw); } catch { /* noop */ } }}>
                    <Copy1 size={16} />
                    Copiar
                  </Button>
                  <Button appearance="outline" className="flex-1 gap-2">
                    <Download1 size={16} />
                    Descargar
                  </Button>
                </div>

                <StepsList steps={EFECTIVO_STEPS} />
                <p className="mt-3 text-center text-xs text-text-200">Tu pago se confirmará en máximo 30 minutos</p>

                <button
                  type="button"
                  onClick={() => onSimulateSuccess('Efectivo')}
                  className="mt-4 w-full rounded-lg border border-dashed border-base-200 py-2 text-xs font-medium text-text-100 transition-colors hover:bg-background-soft-50"
                >
                  Simular pago exitoso →
                </button>
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </div>

        <ContactCta label="Contactar agente" />
      </div>
      <Footer />
    </div>
  );
}

// ─── Screen: link vencido (Figma node 321:7333, named "Pending") ──────────────
function ExpiredScreen() {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background-50">
      <MerchantHeader />
      <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-warning-500/10">
          <ClockThree size={36} className="text-warning-500" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-title-50">Este link ya no está disponible</h1>
          <p className="mt-1.5 text-sm text-text-100">
            El tiempo para realizar este pago ha vencido. Contacta al comercio para obtener uno nuevo.
          </p>
        </div>
        <Button className="mt-2 w-full gap-2">
          <Whatsapp size={18} />
          Contactar al comercio
        </Button>
      </div>
      <Footer />
    </div>
  );
}

// ─── Screen: Success (Figma node 321:7218) ────────────────────────────────────
function SuccessScreen({ method }: { method: PaymentMethod }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background-50">
      <MerchantHeader />
      <div className="space-y-6 px-4 py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-success-500/10">
            <CheckCircle1 size={32} className="text-success-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-title-50">Gracias por tu pago</h1>
            <p className="mt-1 text-sm text-text-100">Tu pago fue procesado y tu obligación ha sido liquidada correctamente</p>
          </div>
        </div>

        <div className="rounded-2xl bg-background-soft-50 p-4">
          <p className="mb-3 text-base font-semibold text-title-50">Resumen del pago</p>
          <div className="divide-y divide-base-100 rounded-xl border border-base-100 bg-background-50 px-4">
            <FieldRow label="Monto" value={PAYMENT.monto} />
            <FieldRow label="Referencia" value={PAYMENT.referencia} />
            <FieldRow label="Comercio" value={MERCHANT.name} />
            <FieldRow label="Fecha y hora" value="21/05/2026 11:42" />
            <FieldRow label="Método" value={method} />
          </div>
        </div>

        <ContactCta label="Contactar agente" />
      </div>
      <Footer />
    </div>
  );
}

// ─── Phone frame wrapper (mobile equivalent of the desktop "Mac window") ──────
function PhoneFrame({ children, onExit }: { children: React.ReactNode; onExit: () => void }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-6">
      <div className="relative">
        <button
          onClick={onExit}
          aria-label="Cerrar prototipo"
          className="absolute -top-3 -right-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
        >
          <Close size={18} />
        </button>
        <div
          className="relative overflow-hidden rounded-[3rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl"
          style={{ width: 390, height: 812 }}
        >
          {/* Dynamic island */}
          <div className="absolute left-1/2 top-2 z-20 h-7 w-28 -translate-x-1/2 rounded-full bg-neutral-900" />
          {/* Screen content */}
          <div className="absolute inset-0 overflow-hidden rounded-[2.25rem] bg-background-50">
            <div className="h-full overflow-y-auto pt-11">
              {children}
            </div>
          </div>
          {/* Home indicator */}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center">
            <div className="h-1 w-32 rounded-full bg-title-50/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

const SCREEN_TABS: { id: Screen; label: string }[] = [
  { id: 'detalle', label: 'Detalle' },
  { id: 'expired', label: 'Link vencido' },
  { id: 'success', label: 'Éxito' },
];

// ─── Catalog entry (DS section) ───────────────────────────────────────────────
export function PaymentLinksPrototype() {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('detalle');
  const [method, setMethod] = useState<PaymentMethod>('SPEI');

  const handleOpen = () => {
    setScreen('detalle');
    setOpen(true);
  };

  const handleSimulateSuccess = (m: PaymentMethod) => {
    setMethod(m);
    setScreen('success');
  };

  return (
    <div className="space-y-4">
      {/* Preview card */}
      <div className="rounded-xl border border-base-100 bg-background-50 overflow-hidden">
        <div className="border-b border-base-100 bg-background-soft-50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">Payment Experience — Prototipo navegable</span>
          <Badge color="primary" size="sm">Prototype</Badge>
        </div>
        <div className="p-6 flex items-center gap-6">
          {/* Thumbnail — vertical phone shape */}
          <div className="relative w-28 h-56 rounded-2xl overflow-hidden border border-base-100 bg-background-soft-50 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center p-2">
              <div className="w-full h-full rounded-xl bg-background-50 shadow-xl overflow-hidden border border-white/10 flex flex-col items-center gap-2 px-2 pt-3">
                <div className="h-2 w-10 rounded-full bg-neutral-900/70" />
                <div className="mt-1 h-2 w-12 rounded bg-primary-500/30" />
                <div className="h-1.5 w-16 rounded bg-base-100" />
                <div className="mt-2 h-8 w-full rounded bg-base-100" />
                <div className="h-10 w-full rounded bg-base-100" />
              </div>
            </div>
          </div>
          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-title-50 text-base font-semibold">Payment Experience — Link de pago</h3>
              <p className="text-text-100 text-sm mt-1">Prototipo mobile: detalle de obligación con SPEI y pago en efectivo, éxito y link vencido.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Mobile', 'SPEI', 'Efectivo', 'Accordion'].map(tag => (
                <Badge key={tag} color="gray" size="sm">{tag}</Badge>
              ))}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={handleOpen}>
                <Layers2 size={14} />
                Abrir prototipo
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fullscreen phone overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            <PhoneFrame onExit={() => setOpen(false)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={screen}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="h-full"
                >
                  {screen === 'detalle' && <DetalleScreen onSimulateSuccess={handleSimulateSuccess} />}
                  {screen === 'expired' && <ExpiredScreen />}
                  {screen === 'success' && <SuccessScreen method={method} />}
                </motion.div>
              </AnimatePresence>
            </PhoneFrame>

            {/* Dev-only screen switcher — lets reviewers jump directly to any state */}
            <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
              <div className="pointer-events-auto flex gap-1.5 rounded-full bg-black/40 p-1.5 backdrop-blur">
                {SCREEN_TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setScreen(id)}
                    className={[
                      'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                      screen === id ? 'bg-white text-neutral-900' : 'text-white/80 hover:bg-white/10',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
