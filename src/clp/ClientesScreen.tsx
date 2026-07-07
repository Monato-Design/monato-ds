import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search1, Funnel1, Upload1, ArrowLeft, ArrowRight, CheckCircle1, Close, Check } from '@tailgrids/icons';
import { Button, buttonStyles } from '@/components/core/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSection,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/core/dropdown';
import { TopBar } from './TopBar';
import { FileUploaderModal } from './FileUploaderModal';
import { useFitRows } from './useFitRows';

const ROW_H = 69; // uniform row height (px)
const HEAD_H = 49; // table header height (px)

// ─── Data (mock — mirrors CLP V1.0 "Clientes" list) ────────────────────────────
type TipoId = 'RFC' | 'CURP';
interface Cliente {
  name: string;
  email: string;
  id: string;
  tipoId: TipoId;
  tel: string;
  sexo: 'Masculino' | 'Femenino';
  extId: string;
}

const FIRST_NAMES = [
  'Diego', 'Lucia', 'Carlos', 'Santiago', 'Jessica', 'Mateo', 'Fernando', 'Valentina',
  'Andrea', 'Ricardo', 'Camila', 'Alejandro', 'Daniela', 'Emilio', 'Renata', 'Gabriel',
  'Ximena', 'Rodrigo', 'Paulina', 'Julian', 'Sofia', 'Manuel', 'Isabella', 'Adrian',
  'Mariana', 'Francisco', 'Natalia', 'Eduardo', 'Carolina', 'Sebastian',
];
const LAST_NAMES = [
  'Rivera', 'Morales', 'Mendoza', 'Torres', 'Contreras', 'Gonzalez', 'Castillo', 'Reyes',
  'Flores', 'Jimenez', 'Vargas', 'Romero', 'Ortiz', 'Delgado', 'Guerrero', 'Navarro',
  'Cortes', 'Aguilar', 'Salazar', 'Espinoza',
];

function pad(n: number, len: number) {
  return String(n).padStart(len, '0');
}

function generateClientes(count: number): Cliente[] {
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length];
    const slug = `${first}.${last}`.toLowerCase();
    const id = ((i + 1) * 2654435761 % 36 ** 8).toString(36).padStart(10, '0').slice(0, 10);
    const extId = ((i + 1) * 40503 % 36 ** 8).toString(36).padStart(10, '0').slice(0, 10);
    return {
      name: `${first} ${last}`,
      email: `${slug}@gmail.com`,
      id,
      tipoId: i % 2 === 0 ? 'RFC' : 'CURP',
      tel: `55 ${pad(1000 + ((i * 137) % 9000), 4)} ${pad(1000 + ((i * 271) % 9000), 4)}`,
      sexo: i % 2 === 0 ? 'Masculino' : 'Femenino',
      extId,
    };
  });
}

const CLIENTES: Cliente[] = generateClientes(96);

// Decorative avatar palette (soft bg + text) — CLP color tokens (Pink/Violet/Amber/Green/Blue/Gray)
const AVATAR_PALETTE = [
  { bg: '#e6f4fa', text: '#0894c8' },
  { bg: '#fdf2fa', text: '#dd2590' },
  { bg: '#f5f3ff', text: '#6d28d9' },
  { bg: '#ebebeb', text: '#5c5c5c' },
  { bg: '#fafde8', text: '#636709' },
  { bg: '#f0fdf4', text: '#15803d' },
];

const COLUMNS = ['Cliente', 'ID', 'Tipo de ID', 'Teléfono', 'Sexo', 'ID Externo'];

// Windowed page list (first, last, and current ± 1) so pagination shows movement without listing every page.
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

function TipoIdBadge({ tipo }: { tipo: TipoId }) {
  const isRfc = tipo === 'RFC';
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: isRfc ? 'var(--clp-badge-rfc-bg)' : 'var(--clp-badge-curp-bg)',
        color: isRfc ? 'var(--clp-badge-rfc-text)' : 'var(--clp-badge-curp-text)',
      }}
    >
      {tipo}
    </span>
  );
}

const TIPO_OPTIONS: TipoId[] = ['RFC', 'CURP'];
const SEXO_OPTIONS: Cliente['sexo'][] = ['Masculino', 'Femenino'];

export function ClientesScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<Set<TipoId>>(new Set());
  const [sexoFilter, setSexoFilter] = useState<Set<Cliente['sexo']>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toast, setToast] = useState(false);

  const filteredClientes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CLIENTES.filter((c) => {
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      const matchesTipo = tipoFilter.size === 0 || tipoFilter.has(c.tipoId);
      const matchesSexo = sexoFilter.size === 0 || sexoFilter.has(c.sexo);
      return matchesSearch && matchesTipo && matchesSexo;
    });
  }, [search, tipoFilter, sexoFilter]);

  const { ref: tableAreaRef, rows: pageSize } = useFitRows(ROW_H, HEAD_H);
  const activeFilterCount = tipoFilter.size + sexoFilter.size;
  const totalPages = Math.max(1, Math.ceil(filteredClientes.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageClientes = filteredClientes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleInSet = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const handleSuccess = () => {
    setUploadOpen(false);
    setToast(true);
    setTimeout(() => setToast(false), 3800);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <TopBar title="Clientes" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-soft-50 px-6 py-6">
      {/* Card — fills remaining height */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-base-100 bg-background-50"
      >
        {/* Toolbar */}
        <div className="flex shrink-0 items-center gap-3 px-6 py-4">
          <div className="relative w-full max-w-[260px]">
            <Search1
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-200"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="h-10 w-full rounded-lg border border-base-100 bg-background-50 pl-10 pr-3 text-sm text-title-50 outline-none placeholder:text-text-200 focus:border-primary-500"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonStyles({ appearance: 'outline', size: 'sm', className: 'h-10 gap-2 whitespace-nowrap px-4' })}
            >
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
                <DropdownMenuHeader>Tipo de ID</DropdownMenuHeader>
                {TIPO_OPTIONS.map((tipo) => (
                  <DropdownMenuItem
                    key={tipo}
                    id={tipo}
                    shouldCloseOnSelect={false}
                    onAction={() => setTipoFilter((s) => toggleInSet(s, tipo))}
                  >
                    <span className="flex-1">{tipo}</span>
                    {tipoFilter.has(tipo) && <Check size={16} className="text-primary-500" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSection>
              <DropdownMenuSeparator />
              <DropdownMenuSection>
                <DropdownMenuHeader>Sexo</DropdownMenuHeader>
                {SEXO_OPTIONS.map((sexo) => (
                  <DropdownMenuItem
                    key={sexo}
                    id={sexo}
                    shouldCloseOnSelect={false}
                    onAction={() => setSexoFilter((s) => toggleInSet(s, sexo))}
                  >
                    <span className="flex-1">{sexo}</span>
                    {sexoFilter.has(sexo) && <Check size={16} className="text-primary-500" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSection>
              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuSection>
                    <DropdownMenuItem
                      id="clear"
                      onAction={() => {
                        setTipoFilter(new Set());
                        setSexoFilter(new Set());
                      }}
                    >
                      <span className="text-error-500">Limpiar filtros</span>
                    </DropdownMenuItem>
                  </DropdownMenuSection>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="ml-auto h-10 gap-2 whitespace-nowrap px-4" onClick={() => setUploadOpen(true)}>
            Cargar clientes
            <Upload1 size={18} />
          </Button>
        </div>

        {/* Table area — measured to fit the available height */}
        <div ref={tableAreaRef} className="min-h-0 flex-1 overflow-hidden">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {COLUMNS.map((h) => (
                <th
                  key={h}
                  className="border-y border-base-100 bg-background-soft-50 px-6 py-3.5 text-sm font-medium text-text-100"
                >
                  <span className="flex items-center gap-1.5">
                    {h}
                    <SortIcon />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageClientes.map((c, i) => {
              const av = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
              return (
                <tr key={i} style={{ height: ROW_H }} className="transition-colors hover:bg-background-soft-50">
                  <td className="border-b border-base-100 px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                        style={{ backgroundColor: av.bg, color: av.text }}
                      >
                        {initials(c.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-title-50">{c.name}</p>
                        <p className="truncate text-sm text-text-100">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-base-100 px-6 py-3.5 text-sm text-text-50">{c.id}</td>
                  <td className="border-b border-base-100 px-6 py-3.5">
                    <TipoIdBadge tipo={c.tipoId} />
                  </td>
                  <td className="border-b border-base-100 px-6 py-3.5 text-sm text-text-50">{c.tel}</td>
                  <td className="border-b border-base-100 px-6 py-3.5 text-sm text-text-50">{c.sexo}</td>
                  <td className="border-b border-base-100 px-6 py-3.5 text-sm text-text-50">{c.extId}</td>
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
            <span key={`e${idx}`} className="flex size-10 items-center justify-center text-sm text-text-200">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-current={currentPage === p ? 'page' : undefined}
              className={[
                'flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                currentPage === p
                  ? 'bg-background-soft-50 text-title-50'
                  : 'text-text-100 hover:bg-background-soft-50',
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
      <FileUploaderModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Success toast — portaled to body (fixed to viewport, escapes Mac overflow) */}
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
                <p className="text-sm font-medium text-title-50">Se cargaron correctamente los clientes</p>
                <button
                  onClick={() => setToast(false)}
                  className="ml-2 text-text-200 transition-colors hover:text-title-50"
                  aria-label="Cerrar"
                >
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
