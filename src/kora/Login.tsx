import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Locked3 } from '@tailgrids/icons';
import { Button } from '@/components/core/button';
import LogoSymbol from '@/assets/Symbol.png';

// Login decorativo — sin autenticación real, calca el splash → SSO del wireframe.
export function Login({ onSuccess }: { onSuccess: () => void }) {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowWelcome(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      data-theme="dark"
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-background-50 px-6"
    >
      <div
        className="pointer-events-none absolute -top-64 left-1/2 h-[520px] w-[920px] -translate-x-1/2 blur-[80px]"
        style={{
          background:
            'radial-gradient(circle at 32% 34%, rgba(8,148,200,.5), transparent 60%), radial-gradient(circle at 62% 42%, rgba(124,92,229,.4), transparent 58%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[400px] text-center">
        <AnimatePresence mode="wait">
          {!showWelcome ? (
            <motion.div key="splash" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-4 flex justify-center">
                <img src={LogoSymbol} alt="Monato" className="h-7 w-auto object-contain" />
              </div>
              <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-white-100">Kora Central Desk</h1>
              <p className="mb-7 text-[13px] text-[var(--primitive-white-a40)]">by Monato</p>
              <div className="mx-auto size-6 animate-spin rounded-full border-[3px] border-[var(--primitive-white-a10)] border-t-[var(--primitive-skyblue-400)]" />
            </motion.div>
          ) : (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
              <h1 className="mb-2.5 text-[28px] leading-tight font-bold tracking-tight text-white-100">
                <span className="mb-1.5 block text-[20px] font-normal text-[var(--primitive-white-a60)]">
                  Welcome to
                </span>
                Kora Central Desk
              </h1>
              <p className="mb-6 text-[13px] text-[var(--primitive-white-a40)]">by Monato</p>

              <div className="mb-6 flex items-center gap-3 text-xs text-[var(--primitive-skyblue-400)]">
                <span className="h-px flex-1 bg-[var(--primitive-white-a10)]" />
                Acceso exclusivo con tu cuenta corporativa
                <span className="h-px flex-1 bg-[var(--primitive-white-a10)]" />
              </div>

              <Button
                appearance="outline"
                onClick={onSuccess}
                className="w-full border-[var(--primitive-white-a20)] bg-[var(--primitive-white-a05)] text-white-100 hover:bg-[var(--primitive-white-a10)]"
              >
                <Locked3 size={16} className="text-[var(--primitive-skyblue-400)]" />
                Continuar con JumpCloud SSO
              </Button>

              <p className="mt-5 text-[11px] text-[var(--primitive-white-a40)]">
                Acceso exclusivo para colaboradores de Monato
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
