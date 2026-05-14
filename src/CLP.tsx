import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from './components/core/avatar';
import { Badge } from './components/core/badge';
import { Button } from './components/core/button';
import { Modal } from './components/core/modal';
import { Pagination } from './components/core/pagination';
import {
  Home2StrokeRounded,
  CreditCardMultipleStrokeRounded, DollarCircleStrokeRounded,
  Search1StrokeRounded, Funnel1StrokeRounded,
  ArrowUpwardStrokeRounded, Upload1StrokeRounded,
  RefreshDollar1StrokeRounded, TrendUp1StrokeRounded,
  BarChart4StrokeRounded, UserMultiple4StrokeRounded,
  Gear1StrokeRounded, Bell1StrokeRounded,
  ChevronDownStrokeRounded, Download1StrokeRounded,
  CloudUploadStrokeRounded, FileMultipleStrokeRounded,
  CheckCircle1StrokeRounded, Layers1StrokeRounded,
} from '@lineiconshq/free-icons';
// Logo — PNG para renderizado correcto sobre fondo claro
const LogoDefault = '/src/assets/logo-default.png';

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = 'portafolio' | 'clientes';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CLIENTES = [
  { id: '1',  name: 'John Doe',      email: 'johndoe@gmail.com',   monto: '$18,50.34', venc: '2024-06-15', tipo: 'Software License', etapa: 'Pre-vencimiento', estado: 'Pendiente',    sex: 'M', extId: '2d8929amz9', tel: '33 2837 3789' },
  { id: '2',  name: 'Kierra Franci', email: 'kierra@gmail.com',    monto: '$18,50.34', venc: '2024-06-15', tipo: 'Software License', etapa: 'Al día',          estado: 'Pagado',       sex: 'F', extId: '2d8929amz9', tel: '33 2837 3789' },
  { id: '3',  name: 'Emerson W.',    email: 'emerson@gmail.com',   monto: '$18,50.34', venc: '2024-06-15', tipo: 'Software License', etapa: 'Mora temprana',   estado: 'Reprogramado', sex: 'M', extId: '2d8929amz9', tel: '33 2837 3789' },
  { id: '4',  name: 'Chance Philips',email: 'chance@gmail.com',    monto: '$18,50.34', venc: '2024-06-15', tipo: 'Software License', etapa: 'Mora avanzada',   estado: 'Anulado',      sex: 'M', extId: '2d8929amz9', tel: '33 2837 3789' },
  { id: '5',  name: 'Sara Mitchell', email: 'sara@gmail.com',      monto: '$22,100.00',venc: '2024-07-01', tipo: 'Crédito',          etapa: 'Al día',          estado: 'Pagado',       sex: 'F', extId: '3k1029bxz1', tel: '55 1234 5678' },
  { id: '6',  name: 'Luis Torres',   email: 'luis@gmail.com',      monto: '$9,500.00', venc: '2024-06-20', tipo: 'Crédito',          etapa: 'Pre-vencimiento', estado: 'Pendiente',    sex: 'M', extId: '7p3847cqw4', tel: '81 9876 5432' },
  { id: '7',  name: 'Ana García',    email: 'ana@gmail.com',       monto: '$31,200.00',venc: '2024-05-30', tipo: 'Software License', etapa: 'Mora avanzada',   estado: 'Anulado',      sex: 'F', extId: '9x2048drt6', tel: '33 2837 9900' },
  { id: '8',  name: 'Pedro Ramos',   email: 'pedro@gmail.com',     monto: '$15,750.00',venc: '2024-06-10', tipo: 'Crédito',          etapa: 'Al día',          estado: 'Pagado',       sex: 'M', extId: '4m5619esu8', tel: '55 5678 1234' },
  { id: '9',  name: 'Valeria Cruz',  email: 'valeria@gmail.com',   monto: '$8,300.00', venc: '2024-07-15', tipo: 'Software License', etapa: 'Pre-vencimiento', estado: 'Pendiente',    sex: 'F', extId: '2d8929amz9', tel: '33 2837 3789' },
  { id: '10', name: 'Marco Silva',   email: 'marco@gmail.com',     monto: '$44,000.00',venc: '2024-06-05', tipo: 'Crédito',          etapa: 'Mora temprana',   estado: 'Reprogramado', sex: 'M', extId: '6n7730ftv2', tel: '81 3344 5566' },
];

const ETAPA_COLOR: Record<string, 'primary'|'success'|'warning'|'error'|'orange'|'gray'|'blue'> = {
  'Pre-vencimiento': 'primary', 'Al día': 'success',
  'Mora temprana': 'orange',    'Mora avanzada': 'error',
};
const ESTADO_COLOR: Record<string, 'success'|'primary'|'warning'|'error'|'gray'|'blue'> = {
  'Pagado': 'success',  'Pendiente': 'primary',
  'Reprogramado': 'blue', 'Anulado': 'error',
};

const AVATAR_COLORS = [
  'bg-primary-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-orange-500',  'bg-rose-500',   'bg-sky-500',
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, sub, trend, delay = 0,
}: {
  icon: React.FC<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string; value: string; sub: string; trend: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.22, ease: 'easeOut' }}
      className="rounded-xl border border-base-100 bg-background-50 p-5 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-background-soft-50 border border-base-100">
          <span className="[&_svg]:fill-none [&_path]:fill-none">
            <Icon size={18} strokeWidth={1.4} className="text-text-100" />
          </span>
        </div>
        <Badge color="success" size="sm">
          <span className="[&_svg]:fill-none [&_path]:fill-none inline-flex items-center gap-0.5">
            <ArrowUpwardStrokeRounded size={10} strokeWidth={2} />
            {trend}
          </span>
        </Badge>
      </div>
      <div>
        <p className="text-text-200 text-xs font-medium">{label}</p>
        <p className="text-title-50 text-2xl font-semibold tracking-tight mt-0.5">{value}</p>
        <p className="text-text-200 text-xs mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
}

// ─── File Uploader ────────────────────────────────────────────────────────────
type UploadState = 'idle' | 'uploading' | 'completed' | 'error';

function FileUploader({ onClose }: { onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleUpload = () => {
    if (!file) return;
    setUploadState('uploading');
    setProgress(0);

    // Simular progreso
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setProgress(100);
        // 50/50 completed vs error para demo
        setTimeout(() => {
          setUploadState(Math.random() > 0.4 ? 'completed' : 'error');
        }, 400);
      } else {
        setProgress(Math.round(p));
      }
    }, 180);
  };

  const fileSize = file ? `${(file.size / 1024).toFixed(0)} KB` : '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="w-full max-w-lg rounded-2xl bg-background-50 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-base-100">
        <h3 className="text-title-50 text-base font-semibold">Upload Files</h3>
        <button
          onClick={onClose}
          className="size-7 rounded-lg hover:bg-background-soft-50 flex items-center justify-center transition text-text-200 hover:text-title-50"
        >
          ✕
        </button>
      </div>

      <div className="px-6 py-5 space-y-4">

        {/* ── Estado: idle — drop zone ── */}
        {uploadState === 'idle' && (
          <>
            <motion.div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              animate={{
                borderColor: dragging ? '#0894c8' : file ? '#22c55e' : '#e4e4e7',
                backgroundColor: dragging ? 'rgba(8,148,200,0.04)' : 'transparent',
              }}
              transition={{ duration: 0.15 }}
              className="rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-3 cursor-pointer"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input id="file-input" type="file" accept=".csv" className="hidden" onChange={handleFile} />
              <motion.div
                animate={{ scale: dragging ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className={`size-12 rounded-full flex items-center justify-center ${file ? 'bg-green-50' : 'bg-background-soft-50'}`}
              >
                <span className="[&_svg]:fill-none [&_path]:fill-none">
                  {file
                    ? <CheckCircle1StrokeRounded size={24} strokeWidth={1.4} className="text-green-500" />
                    : <CloudUploadStrokeRounded  size={24} strokeWidth={1.4} className="text-text-200" />
                  }
                </span>
              </motion.div>
              {file ? (
                <div className="text-center">
                  <p className="text-title-50 text-sm font-medium">{file.name}</p>
                  <p className="text-text-200 text-xs mt-0.5">{fileSize} · listo para subir</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-title-50 text-sm font-medium">Arrastra tu archivo aquí</p>
                  <p className="text-text-200 text-xs mt-0.5">o haz clic para seleccionar · Solo .CSV, hasta 50MB</p>
                </div>
              )}
              {!file && (
                <button
                  onClick={e => { e.stopPropagation(); document.getElementById('file-input')?.click(); }}
                  className="mt-1 px-4 py-1.5 rounded-lg border border-base-200 text-xs text-title-50 hover:bg-background-soft-50 transition"
                >
                  Seleccionar archivo
                </button>
              )}
            </motion.div>

            {/* Template download */}
            <div className="flex items-center gap-3 rounded-xl border border-base-100 bg-background-soft-50 px-4 py-3">
              <div className="flex size-9 items-center justify-center rounded-lg border border-base-100 bg-background-50 shrink-0">
                <span className="[&_svg]:fill-none [&_path]:fill-none">
                  <FileMultipleStrokeRounded size={16} strokeWidth={1.4} className="text-text-100" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-title-50 text-xs font-medium">Descarga la plantilla .CSV aquí</p>
                <p className="text-text-200 text-[11px] mt-0.5">Campos: nombre, ID, teléfono, email, sexo (opc.), ID externo</p>
              </div>
              <button className="shrink-0 text-text-200 hover:text-primary-500 transition">
                <span className="[&_svg]:fill-none [&_path]:fill-none">
                  <Download1StrokeRounded size={16} strokeWidth={1.4} />
                </span>
              </button>
            </div>
          </>
        )}

        {/* ── Estados: uploading / completed / error — file row ── */}
        {uploadState !== 'idle' && file && (
          <div className="rounded-xl border border-base-100 bg-background-50 px-4 py-3.5 space-y-3">
            <div className="flex items-center gap-3">
              {/* PDF icon */}
              <div className="relative shrink-0">
                <div className="size-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                  <span className="[&_svg]:fill-none [&_path]:fill-none">
                    <FileMultipleStrokeRounded size={18} strokeWidth={1.4} className="text-red-400" />
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-red-500 rounded text-white text-[8px] font-bold px-0.5 leading-tight">
                  PDF
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-title-50 text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-text-200 text-xs">
                    {uploadState === 'uploading'
                      ? `${Math.round(file.size / 1024 * (progress / 100))} KB of ${fileSize}`
                      : `${fileSize} of ${fileSize}`
                    }
                  </p>
                  {uploadState === 'completed' && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 text-xs font-medium text-green-500"
                    >
                      <span className="size-1.5 rounded-full bg-green-500 inline-block" />
                      Completed
                    </motion.span>
                  )}
                  {uploadState === 'error' && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 text-xs font-medium text-red-500"
                    >
                      <span className="size-1.5 rounded-full bg-red-500 inline-block" />
                      Errores encontrados
                    </motion.span>
                  )}
                </div>
              </div>

              <button className="shrink-0 text-text-200 hover:text-red-400 transition">
                <span className="[&_svg]:fill-none [&_path]:fill-none">
                  <Download1StrokeRounded size={16} strokeWidth={1.4} />
                </span>
              </button>
            </div>

            {/* Progress bar — solo en uploading */}
            {uploadState === 'uploading' && (
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-background-soft-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.15, ease: 'linear' }}
                  />
                </div>
                <p className="text-text-200 text-xs text-right">{progress}%</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Actions ── */}
      <div className="px-6 pb-6 flex gap-3">
        <Button appearance="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>

        {uploadState === 'idle' && (
          <Button className="flex-1" disabled={!file} onClick={handleUpload}>
            <span className="flex items-center gap-1.5">
              <span className="[&_svg]:fill-none [&_path]:fill-none">
                <Upload1StrokeRounded size={14} strokeWidth={1.6} />
              </span>
              Cargar clientes
            </span>
          </Button>
        )}

        {uploadState === 'uploading' && (
          <Button className="flex-1" disabled>
            <span className="flex items-center gap-1.5">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="[&_svg]:fill-none [&_path]:fill-none inline-flex"
              >
                <RefreshDollar1StrokeRounded size={14} strokeWidth={1.6} />
              </motion.span>
              Subiendo...
            </span>
          </Button>
        )}

        {uploadState === 'completed' && (
          <Button className="flex-1" onClick={onClose}>
            Continuar
          </Button>
        )}

        {uploadState === 'error' && (
          <Button className="flex-1" variant="danger">
            <span className="flex items-center gap-1.5">
              <span className="[&_svg]:fill-none [&_path]:fill-none">
                <Download1StrokeRounded size={14} strokeWidth={1.6} />
              </span>
              Descargar errores
            </span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

// ─── Nav data ─────────────────────────────────────────────────────────────────
const NAV_MAIN = [
  { id: 'dashboard',   label: 'Dashboard',                icon: Home2StrokeRounded,              disabled: true  },
  { id: 'products',    label: 'Products',                 icon: Layers1StrokeRounded,             disabled: true  },
  { id: 'portafolio',  label: 'Portafolio de obligaciones',icon: CreditCardMultipleStrokeRounded, disabled: false },
  { id: 'clientes',    label: 'Clientes',                 icon: UserMultiple4StrokeRounded,       disabled: false },
  { id: 'payments',    label: 'Payments',                 icon: DollarCircleStrokeRounded,        disabled: true  },
];

const NAV_OTHERS = [
  { label: 'Marketing',    icon: TrendUp1StrokeRounded,       disabled: true },
  { label: 'Notification', icon: Bell1StrokeRounded,          disabled: true },
  { label: 'Store',        icon: RefreshDollar1StrokeRounded, disabled: true },
  { label: 'Cashback',     icon: BarChart4StrokeRounded,      disabled: true },
];

function Sidebar({ screen, onNavigate }: { screen: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <aside className="h-full w-60 shrink-0 flex flex-col border-r border-base-100 bg-background-50">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-base-100 px-4 py-3.5">
        <img src={LogoDefault} alt="monato" className="h-5 w-auto" />
        <button className="text-text-200 hover:text-title-50 transition">
          <span className="[&_svg]:fill-none [&_path]:fill-none">
            <Layers1StrokeRounded size={15} strokeWidth={1.4} />
          </span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Main menu */}
        <div>
          <p className="text-text-200 mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest">Main menu</p>
          {NAV_MAIN.map(({ id, label, icon: Icon, disabled }) => {
            const isActive = screen === id;
            return (
              <button
                key={id}
                onClick={() => !disabled && onNavigate(id as Screen)}
                disabled={disabled}
                className={[
                  'w-full relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors',
                  isActive
                    ? 'text-primary-500 font-medium'
                    : disabled
                    ? 'text-text-200 opacity-50 cursor-not-allowed'
                    : 'text-text-50 hover:bg-background-soft-50',
                ].join(' ')}
              >
                {isActive && (
                  <motion.div
                    layoutId="clp-nav-bg"
                    className="absolute inset-0 rounded-lg bg-primary-500/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="[&_svg]:fill-none [&_path]:fill-none relative z-10">
                  <Icon size={15} strokeWidth={1.4} className={isActive ? 'text-primary-500' : 'text-text-200'} />
                </span>
                <span className="relative z-10 leading-tight">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Others */}
        <div>
          <p className="text-text-200 mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest">Others</p>
          {NAV_OTHERS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              disabled
              className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-text-200 opacity-50 cursor-not-allowed"
            >
              <span className="[&_svg]:fill-none [&_path]:fill-none">
                <Icon size={15} strokeWidth={1.4} className="text-text-200" />
              </span>
              {label}
            </button>
          ))}
        </div>

        {/* Support */}
        <div>
          <p className="text-text-200 mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest">Support</p>
          {[
            { label: 'Support',  icon: Bell1StrokeRounded },
            { label: 'Settings', icon: Gear1StrokeRounded },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              disabled
              className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-text-200 opacity-50 cursor-not-allowed"
            >
              <span className="[&_svg]:fill-none [&_path]:fill-none">
                <Icon size={15} strokeWidth={1.4} className="text-text-200" />
              </span>
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-base-100 px-4 py-3 flex items-center gap-2.5">
        <Avatar size="sm" fallback="KM" />
        <div className="min-w-0">
          <p className="text-title-50 text-xs font-medium truncate">Kathryn Murphy</p>
          <p className="text-text-200 text-[11px] truncate">murphy.mitc@example.com</p>
        </div>
      </div>
    </aside>
  );
}

// ─── Portafolio screen ────────────────────────────────────────────────────────
function PortafolioScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const PER_PAGE = 6;

  const filtered = CLIENTES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.etapa.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex-1 overflow-y-auto bg-background-soft-50">
      {/* Top bar */}
      <div className="bg-background-50 border-b border-base-100 px-7 py-4 flex items-center">
        <h1 className="text-title-50 text-lg font-semibold">Portafolio de obligaciones</h1>
      </div>

      <div className="px-7 py-6 space-y-5">
        {/* KPI Cards row 1 */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard icon={CreditCardMultipleStrokeRounded} label="Obligaciones activas"        value="3,782" sub="Total en cartera"       trend="11.01%" delay={0}    />
          <KpiCard icon={DollarCircleStrokeRounded}       label="Monto total esperado"         value="3,782" sub="MXN en periodo actual"  trend="11.01%" delay={0.05} />
          <KpiCard icon={BarChart4StrokeRounded}          label="Obligaciones en mora"         value="3,782" sub="Requieren seguimiento"   trend="11.01%" delay={0.10} />
          <KpiCard icon={TrendUp1StrokeRounded}           label="Performance del portafolio"   value="3,782" sub="Índice general"          trend="11.01%" delay={0.15} />
        </div>

        {/* KPI Cards row 2 */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Saldo total en mora',        value: '$120,369' },
            { label: 'Días promedio de mora',      value: '$120,369' },
            { label: 'Índice de morosidad (iMor)', value: '$120,369' },
            { label: 'Tasa de recuperación',       value: '$120,369' },
          ].map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.22, ease: 'easeOut' }}
              className="rounded-xl border border-base-100 bg-background-50 px-5 py-4"
            >
              <p className="text-title-50 text-xl font-semibold">{value}</p>
              <p className="text-text-200 text-xs mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.22, ease: 'easeOut' }}
          className="rounded-xl border border-base-100 bg-background-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-100">
            <h3 className="text-title-50 text-sm font-semibold">Obligaciones</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 [&_svg]:fill-none [&_path]:fill-none pointer-events-none">
                  <Search1StrokeRounded size={13} strokeWidth={1.4} className="text-text-200" />
                </span>
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Buscar..."
                  className="h-8 w-44 rounded-lg border border-base-200 bg-background-soft-50 pl-8 pr-3 text-xs text-title-50 placeholder:text-text-200 focus:outline-none focus:border-primary-500"
                />
              </div>
              <button className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-base-200 bg-background-soft-50 text-xs text-text-50 hover:bg-background-soft-100 transition">
                <span className="[&_svg]:fill-none [&_path]:fill-none">
                  <Funnel1StrokeRounded size={12} strokeWidth={1.4} />
                </span>
                Filtrar
              </button>
              <Button size="sm" appearance="outline">
                <span className="[&_svg]:fill-none [&_path]:fill-none"><RefreshDollar1StrokeRounded size={13} strokeWidth={1.4} /></span>
                Actualizar portafolio
              </Button>
              <Button size="sm">
                <span className="[&_svg]:fill-none [&_path]:fill-none"><Upload1StrokeRounded size={13} strokeWidth={1.4} /></span>
                Cargar portafolio
              </Button>
            </div>
          </div>

          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                {['Cliente', 'Monto', 'Vencimiento', 'Tipo', 'Etapa', 'Estado'].map(h => (
                  <th key={h} className="border-base-100 border-b px-5 py-3 text-xs font-medium text-text-100">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-title-50 transition">
                      {h}
                      <span className="[&_svg]:fill-none [&_path]:fill-none opacity-40">
                        <ChevronDownStrokeRounded size={10} strokeWidth={2} />
                      </span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paginated.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.18 }}
                    className="hover:bg-background-soft-50 transition-colors border-b border-base-100 last:border-0"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-full ${AVATAR_COLORS[parseInt(c.id) % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                          {c.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-title-50 text-sm font-medium leading-tight">{c.name}</p>
                          <p className="text-text-200 text-xs">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><span className="text-title-50 text-sm font-medium">{c.monto}</span></td>
                    <td className="px-5 py-3.5"><span className="text-text-50 text-sm">{c.venc}</span></td>
                    <td className="px-5 py-3.5"><span className="text-text-50 text-sm">{c.tipo}</span></td>
                    <td className="px-5 py-3.5"><Badge color={ETAPA_COLOR[c.etapa] ?? 'gray'} size="sm">{c.etapa}</Badge></td>
                    <td className="px-5 py-3.5"><Badge color={ESTADO_COLOR[c.estado] ?? 'gray'} size="sm">{c.estado}</Badge></td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          <div className="border-t border-base-100 px-5 py-3 flex items-center gap-4">
            <span className="text-text-200 text-xs shrink-0">{filtered.length} obligaciones</span>
            <div className="ml-auto">
              <Pagination
                totalPages={Math.ceil(filtered.length / PER_PAGE)}
                currentPage={page}
                onPageChange={setPage}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Clientes screen ──────────────────────────────────────────────────────────
function ClientesScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const PER_PAGE = 6;

  const filtered = CLIENTES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex-1 overflow-y-auto bg-background-soft-50">
      {/* Top bar */}
      <div className="bg-background-50 border-b border-base-100 px-7 py-4 flex items-center">
        <h1 className="text-title-50 text-lg font-semibold">Clientes</h1>
      </div>

      <div className="px-7 py-6 space-y-5">
        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard icon={UserMultiple4StrokeRounded} label="Obligaciones activas"        value="3,782" sub="Clientes activos"           trend="11.01%" delay={0}    />
          <KpiCard icon={DollarCircleStrokeRounded}  label="Monto total esperado"         value="3,782" sub="MXN en cartera"             trend="11.01%" delay={0.05} />
          <KpiCard icon={BarChart4StrokeRounded}     label="Obligaciones en mora"         value="3,782" sub="Clientes con deuda vencida" trend="11.01%" delay={0.10} />
          <KpiCard icon={TrendUp1StrokeRounded}      label="Performance del portafolio"   value="3,782" sub="Índice general"             trend="11.01%" delay={0.15} />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.22 }}
          className="rounded-xl border border-base-100 bg-background-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-100">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 [&_svg]:fill-none [&_path]:fill-none pointer-events-none">
                <Search1StrokeRounded size={13} strokeWidth={1.4} className="text-text-200" />
              </span>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar..."
                className="h-8 w-52 rounded-lg border border-base-200 bg-background-soft-50 pl-8 pr-3 text-xs text-title-50 placeholder:text-text-200 focus:outline-none focus:border-primary-500"
              />
            </div>
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <span className="[&_svg]:fill-none [&_path]:fill-none"><Upload1StrokeRounded size={13} strokeWidth={1.4} /></span>
              Cargar clientes
            </Button>
          </div>

          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                {['Cliente', 'ID Externo', 'Etapa', 'Teléfono', 'Sexo', 'Estado'].map(h => (
                  <th key={h} className="border-base-100 border-b px-5 py-3 text-xs font-medium text-text-100">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-title-50 transition">
                      {h}
                      <span className="[&_svg]:fill-none [&_path]:fill-none opacity-40">
                        <ChevronDownStrokeRounded size={10} strokeWidth={2} />
                      </span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paginated.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.18 }}
                    className="hover:bg-background-soft-50 transition-colors border-b border-base-100 last:border-0"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-full ${AVATAR_COLORS[parseInt(c.id) % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                          {c.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-title-50 text-sm font-medium leading-tight">{c.name}</p>
                          <p className="text-text-200 text-xs">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><span className="text-text-50 font-mono text-sm">{c.extId}</span></td>
                    <td className="px-5 py-3.5"><Badge color={ETAPA_COLOR[c.etapa] ?? 'gray'} size="sm">{c.etapa}</Badge></td>
                    <td className="px-5 py-3.5"><span className="text-text-50 text-sm">{c.tel}</span></td>
                    <td className="px-5 py-3.5"><span className="text-text-50 text-sm">{c.sex === 'F' ? 'Femenino' : 'Masculino'}</span></td>
                    <td className="px-5 py-3.5"><Badge color={ESTADO_COLOR[c.estado] ?? 'gray'} size="sm">{c.estado}</Badge></td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          <div className="border-t border-base-100 px-5 py-3 flex items-center gap-4">
            <span className="text-text-200 text-xs shrink-0">{filtered.length} clientes</span>
            <div className="ml-auto">
              <Pagination
                totalPages={Math.ceil(filtered.length / PER_PAGE)}
                currentPage={page}
                onPageChange={setPage}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upload modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <FileUploader onClose={() => setUploadOpen(false)} />
      </Modal>
    </div>
  );
}

// ─── Mac Desktop Wrapper ──────────────────────────────────────────────────────
function MacDesktop({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>('portafolio');

  return (
    <div className="w-full h-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-[1440px] rounded-xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
        style={{ height: 'min(1000px, calc(100vh - 32px))' }}
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
            <span className="text-white/40 text-[11px]">CLP — Monato · {screen === 'portafolio' ? 'Portafolio de obligaciones' : 'Clientes'}</span>
          </div>
        </div>

        {/* App content */}
        <div className="flex-1 flex overflow-hidden bg-background-50">
          <Sidebar screen={screen} onNavigate={setScreen} />

          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex-1 flex overflow-hidden"
            >
              {screen === 'portafolio' ? <PortafolioScreen /> : <ClientesScreen />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
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
                <div className="flex flex-1 overflow-hidden">
                  <div className="w-14 border-r border-base-100 bg-background-50 p-1.5 flex flex-col gap-1">
                    <div className="h-2 bg-primary-500/20 rounded" />
                    <div className="h-1.5 bg-base-100 rounded" />
                    <div className="h-1.5 bg-base-100 rounded" />
                    <div className="h-1.5 bg-base-100 rounded" />
                  </div>
                  <div className="flex-1 p-1.5 space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="h-5 bg-base-100 rounded" />
                      <div className="h-5 bg-base-100 rounded" />
                    </div>
                    <div className="h-12 bg-base-100 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-title-50 text-base font-semibold">CLP — Cartera de Crédito</h3>
              <p className="text-text-100 text-sm mt-1">Prototipo navegable con 2 pantallas: Portafolio de obligaciones y Clientes. Incluye modal de carga de archivo.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Portafolio', 'Clientes', 'Upload modal', 'KPI cards', 'Tabla paginada'].map(tag => (
                <Badge key={tag} color="gray" size="sm">{tag}</Badge>
              ))}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={() => setOpen(true)}>
                <span className="[&_svg]:fill-none [&_path]:fill-none">
                  <Layers1StrokeRounded size={14} strokeWidth={1.4} />
                </span>
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
