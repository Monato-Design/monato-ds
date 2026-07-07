import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './components/core/badge';
import { Button } from './components/core/button';
import { Input } from './components/core/input';
import { Checkbox } from './components/core/checkbox';
import { Label } from './components/core/label';
import { Eye, EyeDisabled, Layers2 } from '@tailgrids/icons';
import LogoDefault from './assets/logo-default.png';
import { AppShell } from './clp/AppShell';
import './clp/tokens.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = 'login' | 'app';

// ─── Screen: login ────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Bypass de demo: para fines de portafolio, cualquier click en "Iniciar sesión" entra.
    setTimeout(onLogin, 600);
  };

  return (
    <div className="flex h-full w-full">
      {/* Panel izquierdo — formulario */}
      <div className="flex flex-1 items-center justify-center bg-background-50 px-8 py-12">
        <motion.div
          className="w-full max-w-[400px]"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="mb-9"
          >
            <h1 className="text-title-50 text-4xl font-semibold">Inicia sesión en CLP</h1>
            <p className="text-text-100 mt-3 text-base">
              Accede a tu cuenta para gestionar tu cartera de cobranza.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-col gap-2"
            >
              <Label>Correo electrónico</Label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="tu.nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-col gap-2"
            >
              <Label>Contraseña</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-text-100 absolute top-1/2 right-3.5 -translate-y-1/2"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeDisabled size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              className="flex items-center justify-between"
            >
              <label className="flex cursor-pointer items-center gap-2.5">
                <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span className="text-text-50 text-sm">Recuérdame</span>
              </label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-title-50 text-sm font-medium hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading && (
                    <motion.span
                      className="size-4 rounded-full border-2 border-white/40 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Panel derecho — marca */}
      <div className="relative hidden w-[42%] max-w-md shrink-0 overflow-hidden bg-[var(--primitive-gray-950)] md:flex md:flex-col md:justify-center md:px-16">
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full opacity-70 blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, rgba(8,148,200,0.55), transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 size-[460px] rounded-full opacity-60 blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, rgba(99,102,241,0.4), transparent 70%)',
          }}
        />

        <div className="relative flex flex-col gap-5">
          <img src={LogoDefault} alt="Monato" className="h-9 w-auto object-contain object-left" />
          <p className="max-w-xs text-lg leading-7 text-[var(--primitive-white-a70)]">
            Gestiona tu cartera y cobranza desde un solo lugar.
          </p>
        </div>

        <div className="relative mt-9 flex flex-col gap-1 text-sm">
          <p className="text-[var(--primitive-white-a60)]">¿Necesitas ayuda?</p>
          <a href="mailto:soporte@monato.com" className="text-[var(--primitive-white-a90)] underline">
            soporte@monato.com
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Mac Desktop Wrapper ──────────────────────────────────────────────────────
function MacDesktop({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>('login');

  const screenLabel = screen === 'login' ? 'Inicio de sesión' : 'CLP';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="clp-root relative h-full w-full overflow-hidden bg-background-50"
    >
      {/* Hover zone pinned to the top edge — only this strip triggers the reveal,
          not the whole window, so the bar stays hidden while using the app. */}
      <div className="group/mac absolute inset-x-0 top-0 z-30 h-9">
        {/* Mac title bar — hidden by default, slides down on hover near the top edge */}
        <div className="absolute inset-x-0 top-0 z-20 flex h-9 shrink-0 -translate-y-full items-center gap-2 bg-[#1e1e1e]/95 px-4 backdrop-blur transition-transform duration-200 group-hover/mac:translate-y-0">
          <button
            onClick={onExit}
            className="group flex size-3 items-center justify-center rounded-full bg-red-500 transition hover:bg-red-400"
            title="Volver al catálogo"
          >
            <span className="text-[8px] font-bold text-red-900 opacity-0 group-hover:opacity-100">✕</span>
          </button>
          <div className="size-3 rounded-full bg-yellow-500" />
          <div className="size-3 rounded-full bg-green-500" />
          <div className="flex flex-1 justify-center">
            <span className="text-[11px] text-white/40">CLP — Monato · {screenLabel}</span>
          </div>
        </div>
      </div>

      {/* App content — occupies the full window */}
      <div className="relative h-full w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="h-full w-full"
          >
            {screen === 'login'
              ? <LoginScreen onLogin={() => setScreen('app')} />
              : <AppShell />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Catalog entry (DS section) ───────────────────────────────────────────────
export function CLP() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Preview card */}
      <div className="rounded-xl border border-base-100 bg-background-50 overflow-hidden">
        <div className="border-b border-base-100 bg-background-soft-50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">CLP v1.0 — Prototipo navegable</span>
          <Badge color="primary" size="sm">Prototype</Badge>
        </div>
        <div className="p-6 flex items-center gap-6">
          {/* Thumbnail */}
          <div className="relative w-72 h-44 rounded-lg overflow-hidden border border-base-100 bg-background-soft-50 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <div className="w-48 h-32 rounded-lg bg-background-50 shadow-xl overflow-hidden border border-white/10 flex flex-col">
                <div className="h-4 bg-[#1e1e1e] flex items-center px-2 gap-1">
                  <div className="size-1.5 rounded-full bg-red-500" />
                  <div className="size-1.5 rounded-full bg-yellow-500" />
                  <div className="size-1.5 rounded-full bg-green-500" />
                </div>
                <div className="flex flex-1">
                  {/* Login mock: form panel + dark brand panel */}
                  <div className="flex-1 p-2.5 flex flex-col justify-center gap-1.5">
                    <div className="h-2 w-16 bg-base-100 rounded" />
                    <div className="h-4 bg-base-100 rounded" />
                    <div className="h-4 bg-base-100 rounded" />
                    <div className="h-4 bg-primary-500/70 rounded mt-0.5" />
                  </div>
                  <div className="w-16 bg-[#030712]" />
                </div>
              </div>
            </div>
          </div>
          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-title-50 text-base font-semibold">CLP — Cartera de Crédito</h3>
              <p className="text-text-100 text-sm mt-1">Prototipo en reconstrucción. Por ahora solo el flujo de inicio de sesión; las demás pantallas se rearmarán desde el diseño nuevo.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Login', 'En construcción'].map(tag => (
                <Badge key={tag} color="gray" size="sm">{tag}</Badge>
              ))}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={() => setOpen(true)}>
                <Layers2 size={14} />
                Abrir prototipo
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fullscreen proto */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            <MacDesktop onExit={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export { CLP as default };
