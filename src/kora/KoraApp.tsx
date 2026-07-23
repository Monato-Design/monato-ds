import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers2 } from '@tailgrids/icons';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Login } from './Login';
import { AppShell } from './AppShell';

type Screen = 'login' | 'app';

// ─── Mac Desktop Wrapper ──────────────────────────────────────────────────────
function MacDesktop({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>('login');
  const screenLabel = screen === 'login' ? 'Inicio de sesión' : 'Kora Central Desk';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="relative h-full w-full overflow-hidden bg-background-50"
    >
      <div className="group/mac absolute inset-x-0 top-0 z-30 h-9">
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
            <span className="text-[11px] text-white/40">Kora Central Desk — Monato · {screenLabel}</span>
          </div>
        </div>
      </div>

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
            {screen === 'login' ? (
              <Login onSuccess={() => setScreen('app')} />
            ) : (
              <AppShell onLogout={() => setScreen('login')} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Catalog entry (DS section) ───────────────────────────────────────────────
export function KoraApp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#d9e2ec] bg-background-50">
        <div className="flex items-center justify-between border-b border-[#d9e2ec] bg-background-soft-50 px-4 py-2.5">
          <span className="text-[11px] font-medium tracking-widest text-text-200 uppercase">
            Kora Central Desk — Prototipo navegable
          </span>
          <Badge color="primary" size="sm">Prototype</Badge>
        </div>
        <div className="flex items-center gap-6 p-6">
          {/* Thumbnail */}
          <div className="relative h-44 w-72 shrink-0 overflow-hidden rounded-lg border border-[#d9e2ec] bg-background-soft-50">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#030712] to-[#0b1220]">
              <div className="flex h-32 w-48 overflow-hidden rounded-lg border border-white/10 bg-background-50 shadow-xl">
                <div className="flex w-14 flex-col gap-1.5 bg-[#030712] p-2">
                  <div className="h-1.5 w-8 rounded bg-[var(--primitive-skyblue-a30)]" />
                  <div className="mt-1 h-1.5 w-full rounded bg-white/10" />
                  <div className="h-1.5 w-full rounded bg-white/10" />
                  <div className="h-1.5 w-full rounded bg-[var(--primitive-skyblue-a15)]" />
                  <div className="h-1.5 w-full rounded bg-white/10" />
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                  <div className="h-2 w-14 rounded bg-base-100" />
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    <div className="h-6 rounded bg-base-100" />
                    <div className="h-6 rounded bg-base-100" />
                    <div className="h-6 rounded bg-base-100" />
                    <div className="h-6 rounded bg-base-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-title-50">Kora — Central Desk</h3>
              <p className="mt-1 text-sm text-text-100">
                Backoffice interno de Monato: atención al cliente, operación de productos (SPEI, Bill Pay, DOMI),
                onboarding, compliance y auditoría.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Backoffice', 'Fase 1'].map((tag) => (
                <Badge key={tag} color="gray" size="sm">{tag}</Badge>
              ))}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button onClick={() => setOpen(true)}>
                <Layers2 size={14} />
                Abrir prototipo
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

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

export default KoraApp;
