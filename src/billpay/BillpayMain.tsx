// src/billpay/BillpayMain.tsx
// Default export — mirrors the pattern of GiftcardsPrototype:
//   · An entry card in the DS overview
//   · Click "Abrir prototipo" → mount BPApp fullscreen with a framer-motion fade

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Doller } from '@tailgrids/icons';
import { Button } from '../components/core/button';
import { Badge } from '../components/core/badge';
import { BPApp } from './BPApp';

export default function BillpayMainPrototype() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <motion.div
        className="rounded-xl border border-base-100 bg-background-50 overflow-hidden"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="border-b border-base-100 bg-background-soft-50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">
            BillPay Main v1.0 — Backoffice (Home + Cash)
          </span>
          <Badge color="primary" size="sm">Prototype</Badge>
        </div>
        <div className="p-6 flex items-center gap-6">
          <div className="relative w-72 h-44 rounded-lg overflow-hidden border border-base-100 bg-background-soft-50 shrink-0">
            <div className="absolute inset-0 flex">
              {/* Sidebar mock (280→56 scaled proxy) */}
              <div className="w-14 border-r border-base-100 bg-white p-2 flex flex-col gap-1.5">
                <div className="h-2 bg-primary-500/20 rounded" />
                <div className="h-1.5 bg-base-100 rounded" />
                <div className="h-1.5 bg-base-100 rounded" />
                <div className="h-1.5 bg-primary-500 rounded" />
                <div className="h-1.5 bg-base-100 rounded" />
                <div className="mt-auto h-4 rounded-full w-4 bg-primary-500/30 self-center" />
              </div>
              {/* Right column mock — top bar + table */}
              <div className="flex-1 flex flex-col">
                <div className="h-4 border-b border-base-100 bg-white flex items-center px-2">
                  <div className="h-1 bg-base-100 rounded w-1/3" />
                </div>
                <div className="flex-1 p-2 flex flex-col gap-1.5">
                  <div className="h-4 rounded border border-base-100 bg-white flex items-center gap-1 px-1.5">
                    <div className="h-1 bg-base-100 rounded w-2/5" />
                  </div>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-3 rounded border border-base-100 bg-white" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-title-50 text-base font-semibold">BillPay Main — Backoffice</h3>
              <p className="text-text-100 text-sm mt-1">
                Producto B2B para gestión de operaciones Cash. Sidebar con 11 secciones (Home, Payments,
                Balances, Clients, Payees, Users, Audit logs, Request records, Cash, Lottery/Melate,
                Remittances). Cash implementa tabla de transacciones con búsqueda por referencia,
                filtro, export CSV y paginación.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Sidebar 280px', 'Cash table', 'Búsqueda', 'Filtro', 'Export CSV', 'Paginación', 'Damaris'].map(tag => (
                <Badge key={tag} color="gray" size="sm">{tag}</Badge>
              ))}
            </div>
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} style={{ display: 'inline-block' }}>
              <Button onClick={() => setOpen(true)}>
                <Doller size={14} className="text-white" />
                Abrir prototipo
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            <BPApp onExit={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
