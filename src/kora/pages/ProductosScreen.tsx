import { useState } from 'react';
import {
  ChevronRight,
  Search1,
  Filter,
  Download1,
  ChevronDown,
  Eye,
  SlidersDoubleHorizontal,
  Bank1,
  ClockThree,
} from '@tailgrids/icons';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { TextArea } from '@/components/core/text-area';
import { NativeSelect, NativeSelectOption } from '@/components/core/native-select';
import { TableRoot, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/table';
import { Pagination } from '@/components/core/pagination';
import { RangeDatePicker } from '@/components/core/date-picker/range-date';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/core/tooltip';
import { EMPRESAS_SPEI, RANGOS_CLABE, MOVIMIENTOS_SPEI } from '../data';
import type { BadgeColor, EmpresaSpei } from '../types';
import { SecondaryButton } from '../components/SecondaryButton';

type SpeiSubView = 'list' | 'limites' | 'clabes' | 'movimientos';

const MOV_ESTATUS_BADGE: Record<string, BadgeColor> = {
  Liquidada: 'success',
  Pendiente: 'warning',
  Rechazada: 'error',
};

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

function RowActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: IconComponent;
  label: string;
  onClick: () => void;
}) {
  // Solo para íconos de convención universal (ej. ojo = ver detalle) — cualquier
  // acción específica del dominio necesita texto visible, no solo un ícono + tooltip.
  return (
    <Tooltip placement="top">
      <TooltipTrigger asChild>
        <Button variant="ghost" iconOnly size="sm" onClick={onClick} aria-label={label}>
          <Icon size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// Estilo exacto de Figma (node 7140:74271, "Buttons/Button" type=Outline size=sm): el
// Button compartido del DS en appearance="outline" usa gris neutro (border #a1a1aa,
// texto #18181b) — no coincide con el azul-gris real del spec (#d9e2ec / #334e68).
function LabeledActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: IconComponent;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#d9e2ec] bg-background-50 px-3.5 py-2.5 text-sm font-medium text-[#334e68] transition-colors hover:bg-[#f8fafc]"
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <div className="mb-5 flex items-center gap-1.5 text-xs text-text-100">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} />}
          {item.onClick ? (
            <button onClick={item.onClick} className="text-[var(--primitive-skyblue-600)] hover:underline">
              {item.label}
            </button>
          ) : (
            <span className="font-medium text-title-50">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function ProductosScreen() {
  const [subView, setSubView] = useState<SpeiSubView>('list');
  const [empresa, setEmpresa] = useState<EmpresaSpei | null>(null);

  function open(view: SpeiSubView, emp: EmpresaSpei) {
    setEmpresa(emp);
    setSubView(view);
  }

  function backToList() {
    setSubView('list');
    setEmpresa(null);
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <h2 className="text-lg font-bold text-title-50">SPEI</h2>
        <Badge color="gray" size="sm">Bill Pay, DOMI y Comercial — próxima fase</Badge>
      </div>

      {subView === 'list' && <SpeiListView onOpen={open} />}
      {subView === 'limites' && empresa && <SpeiLimitesView empresa={empresa} onBack={backToList} />}
      {subView === 'clabes' && empresa && <SpeiClabesView empresa={empresa} onBack={backToList} />}
      {subView === 'movimientos' && empresa && <SpeiMovimientosView empresa={empresa} onBack={backToList} />}
    </div>
  );
}

function SpeiListView({ onOpen }: { onOpen: (view: SpeiSubView, empresa: EmpresaSpei) => void }) {
  return (
    <div>
      <div className="mb-4 relative">
        <Search1 size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-100" />
        <Input placeholder="Buscar empresa…" className="w-full border-[#bcccdc] pl-9" />
      </div>

      <TableRoot>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>RFC</TableHead>
            <TableHead>Límite / tx (MXN)</TableHead>
            <TableHead>Límite diario (MXN)</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {EMPRESAS_SPEI.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-semibold">{e.nombre}</TableCell>
              <TableCell className="font-mono text-[13px]">{e.rfc}</TableCell>
              <TableCell>${e.limitePorTx.toLocaleString('es-MX')}</TableCell>
              <TableCell>${e.limiteDiario.toLocaleString('es-MX')}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <LabeledActionButton
                    icon={SlidersDoubleHorizontal}
                    label="Límites"
                    onClick={() => onOpen('limites', e)}
                  />
                  <LabeledActionButton
                    icon={Bank1}
                    label="CLABEs"
                    onClick={() => onOpen('clabes', e)}
                  />
                  <LabeledActionButton
                    icon={ClockThree}
                    label="Movimientos"
                    onClick={() => onOpen('movimientos', e)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </div>
  );
}

function SpeiLimitesView({ empresa, onBack }: { empresa: EmpresaSpei; onBack: () => void }) {
  const [porTx, setPorTx] = useState(String(empresa.limitePorTx));
  const [diario, setDiario] = useState(String(empresa.limiteDiario));
  const [justificacion, setJustificacion] = useState('');

  return (
    <div>
      <Breadcrumb items={[{ label: 'SPEI', onClick: onBack }, { label: empresa.nombre }, { label: 'Límites transaccionales' }]} />

      <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-[var(--color-alerts-warning-border)] bg-[var(--color-alerts-warning-background)] p-3.5 text-sm text-[var(--color-alerts-warning-description)]">
        Los cambios se aplican en producción de forma inmediata.
      </div>

      <div className="max-w-xl rounded-lg border border-[#d9e2ec] bg-background-50 p-5">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-50">Límite por transacción (MXN)</label>
            <Input type="number" value={porTx} onChange={(e) => setPorTx(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-50">Límite diario (MXN)</label>
            <Input type="number" value={diario} onChange={(e) => setDiario(e.target.value)} />
          </div>
        </div>
        <TextArea
          label="Justificación del cambio"
          placeholder="Motivo del ajuste…"
          className="mb-4 h-20"
          value={justificacion}
          onChange={(e) => setJustificacion(e.target.value)}
        />
        <div className="flex gap-2.5">
          <Button onClick={onBack}>Guardar cambios</Button>
          <SecondaryButton appearance="outline" onClick={onBack}>Cancelar</SecondaryButton>
        </div>
      </div>
    </div>
  );
}

function SpeiClabesView({ empresa, onBack }: { empresa: EmpresaSpei; onBack: () => void }) {
  const [inicio, setInicio] = useState('');
  const [cantidad, setCantidad] = useState('1000');
  const [justificacion, setJustificacion] = useState('');
  const rangos = RANGOS_CLABE[empresa.id] ?? [];

  return (
    <div>
      <Breadcrumb items={[{ label: 'SPEI', onClick: onBack }, { label: empresa.nombre }, { label: 'Rango de CLABEs' }]} />

      <div className="mb-4 max-w-xl rounded-lg border border-[#d9e2ec] bg-background-50 p-5">
        <p className="mb-4 text-sm font-semibold text-title-50">Nuevo rango</p>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-50">CLABE inicio</label>
            <Input
              className="font-mono"
              placeholder="734000000000000000"
              maxLength={18}
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-50">Cantidad de CLABEs</label>
            <Input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          </div>
        </div>
        <TextArea
          label="Justificación"
          placeholder="Motivo de la solicitud…"
          className="mb-4 h-20"
          value={justificacion}
          onChange={(e) => setJustificacion(e.target.value)}
        />
        <div className="flex gap-2.5">
          <Button onClick={onBack}>Crear rango</Button>
          <SecondaryButton appearance="outline" onClick={onBack}>Cancelar</SecondaryButton>
        </div>
      </div>

      <p className="mb-3 text-sm font-semibold text-title-50">Rangos activos</p>
      <TableRoot>
        <TableHeader>
          <TableRow>
            <TableHead>Inicio</TableHead>
            <TableHead>Fin</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rangos.map((r) => (
            <TableRow key={r.inicio}>
              <TableCell className="font-mono text-[13px]">{r.inicio}</TableCell>
              <TableCell className="font-mono text-[13px]">{r.fin}</TableCell>
              <TableCell>{r.cantidad.toLocaleString('es-MX')}</TableCell>
              <TableCell>{r.creado}</TableCell>
              <TableCell>
                <Badge color={r.estado === 'Activo' ? 'success' : 'gray'}>{r.estado}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </div>
  );
}

function SpeiMovimientosView({ empresa, onBack }: { empresa: EmpresaSpei; onBack: () => void }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(1);

  return (
    <div>
      <Breadcrumb items={[{ label: 'SPEI', onClick: onBack }, { label: empresa.nombre }, { label: 'Movimientos' }]} />

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative w-56">
          <Search1 size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-100" />
          <Input placeholder="Clave de rastreo…" className="w-full border-[#bcccdc] pl-9" />
        </div>
        <Input placeholder="Buscar en descripción…" className="w-52 border-[#bcccdc]" />
        <RangeDatePicker
          defaultStartDate={new Date(2026, 6, 15)}
          defaultEndDate={new Date(2026, 6, 21)}
        />
      </div>

      <button
        onClick={() => setShowAdvanced((v) => !v)}
        className="mb-4 flex items-center gap-2 rounded-lg border border-[#d9e2ec] px-3.5 py-2 text-sm font-medium text-title-50 transition-colors hover:bg-background-soft-50"
      >
        <Filter size={14} />
        Búsqueda avanzada
        <ChevronDown size={13} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
      </button>

      {showAdvanced && (
        <div className="mb-4 rounded-lg border border-[#d9e2ec] bg-background-50 p-4">
          <p className="mb-3 text-sm font-semibold text-title-50">Filtros avanzados</p>
          <div className="grid grid-cols-3 gap-4">
            <NativeSelect className="border-[#bcccdc]" defaultValue="todos">
              <NativeSelectOption value="todos">Todos los tipos</NativeSelectOption>
              <NativeSelectOption value="Recibida">Recibida</NativeSelectOption>
              <NativeSelectOption value="Enviada">Enviada</NativeSelectOption>
            </NativeSelect>
            <NativeSelect className="border-[#bcccdc]" defaultValue="todos">
              <NativeSelectOption value="todos">Todos los estatus</NativeSelectOption>
              <NativeSelectOption value="Liquidada">Liquidada</NativeSelectOption>
              <NativeSelectOption value="Pendiente">Pendiente</NativeSelectOption>
              <NativeSelectOption value="Rechazada">Rechazada</NativeSelectOption>
            </NativeSelect>
            <NativeSelect className="border-[#bcccdc]" defaultValue="todos">
              <NativeSelectOption value="todos">Todos los bancos</NativeSelectOption>
              <NativeSelectOption value="FINCO PAY">FINCO PAY</NativeSelectOption>
              <NativeSelectOption value="BBVA">BBVA</NativeSelectOption>
              <NativeSelectOption value="Santander">Santander</NativeSelectOption>
              <NativeSelectOption value="Banorte">Banorte</NativeSelectOption>
              <NativeSelectOption value="AZTECA">AZTECA</NativeSelectOption>
              <NativeSelectOption value="Mercado Pago">Mercado Pago</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-text-100">{MOVIMIENTOS_SPEI.length} movimientos encontrados hoy</p>
        <Button appearance="outline" size="sm">
          <Download1 size={14} />
          Exportar
        </Button>
      </div>

      <TableRoot>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha (CST)</TableHead>
            <TableHead>Clave de rastreo</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Banco origen</TableHead>
            <TableHead>Banco destino</TableHead>
            <TableHead>CLABE origen</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOVIMIENTOS_SPEI.map((m) => (
            <TableRow key={m.claveRastreo}>
              <TableCell className="whitespace-nowrap text-[13px]">{m.fecha}</TableCell>
              <TableCell className="font-mono text-[12px]">{m.claveRastreo}</TableCell>
              <TableCell>${m.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell>{m.bancoOrigen}</TableCell>
              <TableCell>{m.bancoDestino}</TableCell>
              <TableCell className="font-mono text-[12px]">{m.clabeOrigen}</TableCell>
              <TableCell>
                <Badge color={m.tipo === 'Recibida' ? 'success' : 'blue'}>{m.tipo}</Badge>
              </TableCell>
              <TableCell>
                <Badge color={MOV_ESTATUS_BADGE[m.estatus]}>{m.estatus}</Badge>
              </TableCell>
              <TableCell>
                <RowActionButton icon={Eye} label="Ver detalle" onClick={() => {}} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>

      <div className="mt-4">
        <Pagination currentPage={page} totalPages={132} onPageChange={setPage} sideLayout="icon" />
      </div>
    </div>
  );
}
