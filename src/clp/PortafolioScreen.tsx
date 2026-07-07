import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search1, Funnel1, Upload1, ArrowLeft, ArrowRight, ArrowUpward, ArrowDownward,
  CheckCircle1, Close, Check, ChevronDown, RefreshCircle1Clockwise, MenuKebab1,
  Briefcase4, HandTakingCoins, CalendarTime, TrendUp2,
} from '@tailgrids/icons';
import { Button, buttonStyles } from '@/components/core/button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuSection, DropdownMenuHeader, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/core/dropdown';
import { TopBar } from './TopBar';
import { StatusBadge, type BadgeColor } from './StatusBadge';
import { FileUploaderModal } from './FileUploaderModal';
import { useFitRows } from './useFitRows';

const ROW_H = 69; // uniform row height (px)
const HEAD_H = 49; // table header height (px)

// ─── KPI cards ─────────────────────────────────────────────────────────────────
type IconComponent = React.ComponentType<{ size?: number; className?: string }>;
interface Kpi {
  icon: IconComponent;
  label: string;
  value: string;
  trendDir: 'up' | 'down';
  trendValue: string;
  trendColor: Extract<BadgeColor, 'success' | 'error'>;
}

const KPIS: Kpi[] = [
  { icon: Briefcase4,      label: 'Saldo total en mora',      value: '$438,920', trendDir: 'up',   trendValue: '14.2%',  trendColor: 'error' },
  { icon: HandTakingCoins, label: 'Días promedio de mora',    value: '23',       trendDir: 'down', trendValue: '2 días', trendColor: 'success' },
  { icon: CalendarTime,    label: 'Índice de morosidad (IMor)', value: '15.4%',  trendDir: 'down', trendValue: '1.8%',   trendColor: 'error' },
  { icon: TrendUp2,        label: 'Tasa de recuperación',     value: '41.2%',    trendDir: 'down', trendValue: '3.2%',   trendColor: 'error' },
];

function KpiCard({ kpi }: { kpi: Kpi }) {
  const { icon: Icon, label, value, trendDir, trendValue, trendColor } = kpi;
  const TrendArrow = trendDir === 'up' ? ArrowUpward : ArrowDownward;
  return (
    <div className="flex-1 rounded-2xl border border-base-100 bg-background-50 p-5">
      <div
        className="mb-4 flex size-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: 'var(--clp-kpi-icon-bg)' }}
      >
        <Icon size={22} className="text-title-50" />
      </div>
      <p className="text-sm text-text-100">{label}</p>
      <div className="mt-1 flex items-center gap-2.5">
        <span className="text-3xl font-bold text-title-50">{value}</span>
        <span
          className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: `var(--clp-badge-${trendColor}-bg)`,
            color: `var(--clp-badge-${trendColor}-text)`,
          }}
        >
          <TrendArrow size={12} />
          {trendValue}
        </span>
      </div>
    </div>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────────
type Tipo = 'Crédito' | 'Subscripción';
interface Obligacion {
  name: string;
  email: string;
  monto: string;
  vencimiento: string;
  tipo: Tipo;
  etapa: string;
  estado: string;
}

const NAMES = [
  'Diego Rivera', 'Lucia Morales', 'Carlos Mendoza', 'Jessica Contreras', 'Mateo Gonzalez',
  'Andres Jimenez', 'Valentina Ortiz', 'Ricardo Flores', 'Camila Reyes', 'Sebastian Vargas',
  'Daniela Romero', 'Emilio Aguilar', 'Renata Guerrero', 'Gabriel Navarro', 'Ximena Salazar',
  'Rodrigo Cortes', 'Paulina Delgado', 'Julian Espinoza', 'Sofia Torres', 'Manuel Castillo',
];
// Etapa ↔ Estado pairing mirrors the CLP V1.0 mock
const STAGES: { etapa: string; etapaColor: BadgeColor; estado: string; estadoColor: BadgeColor }[] = [
  { etapa: 'Pre-vencimiento', etapaColor: 'primary', estado: 'Pendiente',    estadoColor: 'primary' },
  { etapa: 'Al día',          etapaColor: 'success', estado: 'Pagado',       estadoColor: 'success' },
  { etapa: 'Mora temprana',   etapaColor: 'warning', estado: 'Reprogramado', estadoColor: 'warning' },
  { etapa: 'Mora avanzada',   etapaColor: 'error',   estado: 'Anulado',      estadoColor: 'error' },
];

function fmtMoney(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function generateObligaciones(count: number): Obligacion[] {
  return Array.from({ length: count }, (_, i) => {
    const name = NAMES[i % NAMES.length];
    const slug = name.toLowerCase().replace(' ', '.');
    const monto = 8000 + ((i * 51367) % 130000) + ((i * 89) % 100) / 100;
    const day = String(1 + ((i * 7) % 28)).padStart(2, '0');
    const month = String(1 + ((i * 3) % 12)).padStart(2, '0');
    return {
      name,
      email: `${slug}@gmail.com`,
      monto: fmtMoney(monto),
      vencimiento: `${day}/${month}/2026`,
      tipo: i % 2 === 0 ? 'Crédito' : 'Subscripción',
      ...STAGES[i % STAGES.length],
    };
  });
}
const OBLIGACIONES = generateObligaciones(84);

const AVATAR_PALETTE = [
  { bg: '#e6f4fa', text: '#0894c8' }, { bg: '#fdf2fa', text: '#dd2590' },
  { bg: '#f5f3ff', text: '#6d28d9' }, { bg: '#ebebeb', text: '#5c5c5c' },
  { bg: '#fafde8', text: '#636709' }, { bg: '#f0fdf4', text: '#15803d' },
];
const COLUMNS = ['Cliente', 'Monto', 'Vencimiento', 'Tipo', 'Etapa', 'Estado'];
const CARTERAS = ['Cartera mayo 2026', 'Cartera abril 2026', 'Cartera marzo 2026'];
const ETAPA_OPTIONS = STAGES.map((s) => s.etapa);
const ESTADO_OPTIONS = STAGES.map((s) => s.estado);

function getPageList(current: number, total: number): (number | '…')[] {
  const pages = Array.from(new Set([1, total, current - 1, current, current + 1]))
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result: (number | '…')[] = [];
  let prev = 0;
  for (const p of pages) {
    if (p - prev > 1) result.push('…');
    result.push(p);
    prev = p;
  }
  return result;
}
function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}
function SortIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-text-200">
      <path d="M6 2.5L8.5 5.5H3.5L6 2.5Z" fill="currentColor" opacity="0.55" />
      <path d="M6 9.5L3.5 6.5H8.5L6 9.5Z" fill="currentColor" opacity="0.55" />
    </svg>
  );
}
const etapaColorFor = (e: string) => STAGES.find((s) => s.etapa === e)?.etapaColor ?? 'primary';
const estadoColorFor = (e: string) => STAGES.find((s) => s.estado === e)?.estadoColor ?? 'primary';

export function PortafolioScreen() {
  const [cartera, setCartera] = useState(CARTERAS[0]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [etapaFilter, setEtapaFilter] = useState<Set<string>>(new Set());
  const [estadoFilter, setEstadoFilter] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toast, setToast] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return OBLIGACIONES.filter((o) => {
      const matchesSearch = !q || o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
      const matchesEtapa = etapaFilter.size === 0 || etapaFilter.has(o.etapa);
      const matchesEstado = estadoFilter.size === 0 || estadoFilter.has(o.estado);
      return matchesSearch && matchesEtapa && matchesEstado;
    });
  }, [search, etapaFilter, estadoFilter]);

  const { ref: tableAreaRef, rows: pageSize } = useFitRows(ROW_H, HEAD_H);
  const activeFilterCount = etapaFilter.size + estadoFilter.size;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleInSet = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };
  const handleUploadSuccess = () => {
    setUploadOpen(false);
    setToast(true);
    setTimeout(() => setToast(false), 3800);
  };

  const headerActions = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonStyles({ appearance: 'outline', size: 'sm', className: 'h-10 min-w-[190px] justify-between gap-2 px-4 font-normal' })}
        >
          <span className="text-title-50">{cartera}</span>
          <ChevronDown size={18} className="text-text-200" />
        </DropdownMenuTrigger>
        <DropdownMenuContent placement="bottom end" className="w-[220px]">
          <DropdownMenuSection>
            {CARTERAS.map((c) => (
              <DropdownMenuItem key={c} id={c} onAction={() => setCartera(c)}>
                <span className="flex-1">{c}</span>
                {cartera === c && <Check size={16} className="text-primary-500" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="sm" className="h-10 gap-2 whitespace-nowrap px-4" onClick={() => setUploadOpen(true)}>
        <Upload1 size={18} />
        Cargar portafolio
      </Button>
    </>
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <TopBar title="Portafolio" actions={headerActions} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-soft-50 px-6 py-6">
        {/* KPI cards */}
        <div className="flex shrink-0 gap-5">
          {KPIS.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </div>

        {/* Table card — fills remaining height */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-base-100 bg-background-50"
        >
          {/* Toolbar */}
          <div className="flex shrink-0 items-center gap-3 px-6 py-4">
            <div className="relative w-full max-w-[260px]">
              <Search1 size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-200" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="h-10 w-full rounded-lg border border-base-100 bg-background-50 pl-10 pr-3 text-sm text-title-50 outline-none placeholder:text-text-200 focus:border-primary-500"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className={buttonStyles({ appearance: 'outline', size: 'sm', className: 'h-10 gap-2 whitespace-nowrap px-4' })}>
                Filtrar
                <Funnel1 size={18} />
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white-100">
                    {activeFilterCount}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent placement="bottom start" className="w-56">
                <DropdownMenuSection>
                  <DropdownMenuHeader>Etapa</DropdownMenuHeader>
                  {ETAPA_OPTIONS.map((op) => (
                    <DropdownMenuItem key={op} id={op} shouldCloseOnSelect={false} onAction={() => setEtapaFilter((s) => toggleInSet(s, op))}>
                      <span className="flex-1">{op}</span>
                      {etapaFilter.has(op) && <Check size={16} className="text-primary-500" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSection>
                <DropdownMenuSeparator />
                <DropdownMenuSection>
                  <DropdownMenuHeader>Estado</DropdownMenuHeader>
                  {ESTADO_OPTIONS.map((op) => (
                    <DropdownMenuItem key={op} id={op} shouldCloseOnSelect={false} onAction={() => setEstadoFilter((s) => toggleInSet(s, op))}>
                      <span className="flex-1">{op}</span>
                      {estadoFilter.has(op) && <Check size={16} className="text-primary-500" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSection>
                {activeFilterCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuSection>
                      <DropdownMenuItem id="clear" onAction={() => { setEtapaFilter(new Set()); setEstadoFilter(new Set()); }}>
                        <span className="text-error-500">Limpiar filtros</span>
                      </DropdownMenuItem>
                    </DropdownMenuSection>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={handleRefresh}
              className="ml-auto flex h-10 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--clp-dark)' }}
            >
              Actualizar portafolio
              <motion.span
                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={refreshing ? { duration: 0.9, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
                className="inline-flex"
              >
                <RefreshCircle1Clockwise size={18} />
              </motion.span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-base-200 text-text-100 transition-colors hover:bg-background-soft-50">
                <MenuKebab1 size={18} />
              </DropdownMenuTrigger>
              <DropdownMenuContent placement="bottom end" className="w-48">
                <DropdownMenuSection>
                  <DropdownMenuItem id="export"><span className="flex-1">Exportar CSV</span></DropdownMenuItem>
                  <DropdownMenuItem id="columns"><span className="flex-1">Configurar columnas</span></DropdownMenuItem>
                </DropdownMenuSection>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table area — measured to fit the available height */}
          <div ref={tableAreaRef} className="min-h-0 flex-1 overflow-hidden">
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                {COLUMNS.map((h) => (
                  <th key={h} className="border-y border-base-100 bg-background-soft-50 px-6 py-3.5 text-sm font-medium text-text-100">
                    <span className="flex items-center gap-1.5">
                      {h}
                      <SortIcon />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((o, i) => {
                const av = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                return (
                  <tr key={i} style={{ height: ROW_H }} className="transition-colors hover:bg-background-soft-50">
                    <td className="border-b border-base-100 px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: av.bg, color: av.text }}>
                          {initials(o.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-title-50">{o.name}</p>
                          <p className="truncate text-sm text-text-100">{o.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-base-100 px-6 py-3.5 text-sm text-text-50">{o.monto}</td>
                    <td className="border-b border-base-100 px-6 py-3.5 text-sm text-text-50">{o.vencimiento}</td>
                    <td className="border-b border-base-100 px-6 py-3.5 text-sm text-text-50">{o.tipo}</td>
                    <td className="border-b border-base-100 px-6 py-3.5"><StatusBadge color={etapaColorFor(o.etapa)}>{o.etapa}</StatusBadge></td>
                    <td className="border-b border-base-100 px-6 py-3.5"><StatusBadge color={estadoColorFor(o.estado)}>{o.estado}</StatusBadge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </motion.div>

        {/* Pagination */}
        <div className="mt-5 flex shrink-0 items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex size-10 items-center justify-center rounded-lg border border-base-200 bg-background-50 text-text-100 transition-colors hover:bg-background-soft-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-background-50"
            aria-label="Página anterior"
          >
            <ArrowLeft size={18} />
          </button>
          {getPageList(currentPage, totalPages).map((p, idx) =>
            p === '…' ? (
              <span key={`e${idx}`} className="flex size-10 items-center justify-center text-sm text-text-200">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                aria-current={currentPage === p ? 'page' : undefined}
                className={[
                  'flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                  currentPage === p ? 'bg-background-soft-50 text-title-50' : 'text-text-100 hover:bg-background-soft-50',
                ].join(' ')}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex size-10 items-center justify-center rounded-lg border border-base-200 bg-background-50 text-text-100 transition-colors hover:bg-background-soft-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-background-50"
            aria-label="Página siguiente"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Upload flow */}
      <FileUploaderModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={handleUploadSuccess} />

      {/* Success toast */}
      {createPortal(
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="clp-root fixed right-6 top-6 z-[60]"
            >
              <div className="flex items-center gap-3 rounded-xl border border-base-100 bg-background-50 px-4 py-3 shadow-lg">
                <CheckCircle1 size={22} style={{ color: 'var(--clp-status-success)' }} />
                <p className="text-sm font-medium text-title-50">Se cargó correctamente el portafolio</p>
                <button onClick={() => setToast(false)} className="ml-2 text-text-200 transition-colors hover:text-title-50" aria-label="Cerrar">
                  <Close size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
