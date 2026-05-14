import { useState, useMemo } from 'react';
import {
  Home2StrokeRounded, Layers1StrokeRounded,
  Code1StrokeRounded, Gear1StrokeRounded,
  Bell1StrokeRounded, CreditCardMultipleStrokeRounded, BarChart4StrokeRounded,
  User4StrokeRounded, UserMultiple4StrokeRounded, Search1StrokeRounded,
  CalendarDaysStrokeRounded, FileMultipleStrokeRounded, DollarCircleStrokeRounded,
  Locked1StrokeRounded, EyeStrokeRounded, CheckCircle1StrokeRounded,
  ChevronDownStrokeRounded, ChevronRightCircleBulkRounded,
  Shield2CheckStrokeRounded, Globe1StrokeRounded, Wallet1StrokeRounded,
  ArrowRightStrokeRounded, RefreshDollar1StrokeRounded, TrendUp1StrokeRounded,
  Envelope1StrokeRounded, PlusStrokeRounded, Funnel1StrokeRounded,
  ColourPalette3StrokeRounded, Layout9StrokeRounded, Bolt2StrokeRounded,
  SlidersHorizontalSquare2StrokeRounded, CheckSquare2StrokeRounded,
  Comment1StrokeRounded, PaginationStrokeRounded, Diamonds1StrokeRounded,
} from '@lineiconshq/free-icons';
import { Button } from './components/core/button';
import { ButtonGroup } from './components/core/button-group';
import { Badge } from './components/core/badge';
import { Input } from './components/core/input';
import { TextArea } from './components/core/text-area';
import Alert from './components/core/alert';
import { Avatar } from './components/core/avatar';
import { Toggle } from './components/core/toggle';
import { Checkbox } from './components/core/checkbox';
import { Progress } from './components/core/progress';
import { TabRoot, TabList, TabTrigger, TabContent } from './components/core/tabs';
import { AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent } from './components/core/accordion';
import { Skeleton } from './components/core/skeleton';
import { Toast } from './components/core/toast';
import { Modal } from './components/core/modal';
import { Pagination } from './components/core/pagination';
import { DefaultSpinner } from './components/core/spinner/default';
import { NativeSelect, NativeSelectOption } from './components/core/native-select';
import { TableRoot, TableHeader, TableBody, TableHead, TableRow, TableCell } from './components/core/table';
// Logo — using PNG for correct rendering on light backgrounds
// (SVG has white fill on wordmark which is invisible on white)
const LogoDefault = '/src/assets/logo-default.png';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'overview' | 'buttons' | 'badges' | 'inputs' | 'alerts' |
  'avatars' | 'controls' | 'feedback' | 'tabs' | 'accordion' |
  'toast' | 'modal' | 'pagination' | 'icons';

// ─── Nav structure (agrupado como Figma reference) ────────────────────────────
const NAV_GROUPS = [
  {
    label: 'General',
    items: [
      { id: 'overview' as TabId,  label: 'Overview',   icon: Home2StrokeRounded },
    ],
  },
  {
    label: 'Components',
    items: [
      { id: 'buttons' as TabId,   label: 'Buttons',    icon: Bolt2StrokeRounded },
      { id: 'badges' as TabId,    label: 'Badges',     icon: Diamonds1StrokeRounded },
      { id: 'inputs' as TabId,    label: 'Inputs',     icon: SlidersHorizontalSquare2StrokeRounded },
      { id: 'alerts' as TabId,    label: 'Alerts',     icon: Bell1StrokeRounded },
      { id: 'avatars' as TabId,   label: 'Avatars',    icon: User4StrokeRounded },
      { id: 'controls' as TabId,  label: 'Controls',   icon: CheckSquare2StrokeRounded },
      { id: 'feedback' as TabId,  label: 'Feedback',   icon: Comment1StrokeRounded },
      { id: 'tabs' as TabId,      label: 'Tabs',       icon: Layout9StrokeRounded },
      { id: 'accordion' as TabId, label: 'Accordion',  icon: FileMultipleStrokeRounded },
      { id: 'toast' as TabId,     label: 'Toast',      icon: CheckCircle1StrokeRounded },
      { id: 'modal' as TabId,     label: 'Modal',      icon: Layers1StrokeRounded },
      { id: 'pagination' as TabId, label: 'Pagination', icon: PaginationStrokeRounded },
    ],
  },
  {
    label: 'Assets',
    items: [
      { id: 'icons' as TabId,     label: 'Icons',      icon: ColourPalette3StrokeRounded },
    ],
  },
];

// ─── Component registry ───────────────────────────────────────────────────────
const COMPONENTS = [
  { name: 'Button',     variants: 4,  tokens: 12, status: 'stable',      category: 'Action' },
  { name: 'Badge',      variants: 13, tokens: 6,  status: 'stable',      category: 'Display' },
  { name: 'Input',      variants: 3,  tokens: 8,  status: 'stable',      category: 'Form' },
  { name: 'Alert',      variants: 5,  tokens: 10, status: 'stable',      category: 'Feedback' },
  { name: 'Modal',      variants: 1,  tokens: 4,  status: 'stable',      category: 'Overlay' },
  { name: 'Toast',      variants: 4,  tokens: 6,  status: 'stable',      category: 'Feedback' },
  { name: 'Tabs',       variants: 2,  tokens: 4,  status: 'stable',      category: 'Navigation' },
  { name: 'Accordion',  variants: 5,  tokens: 3,  status: 'stable',      category: 'Display' },
  { name: 'Avatar',     variants: 6,  tokens: 3,  status: 'stable',      category: 'Display' },
  { name: 'Toggle',     variants: 2,  tokens: 4,  status: 'stable',      category: 'Form' },
  { name: 'Checkbox',   variants: 2,  tokens: 5,  status: 'stable',      category: 'Form' },
  { name: 'Progress',   variants: 1,  tokens: 2,  status: 'stable',      category: 'Feedback' },
  { name: 'Pagination', variants: 2,  tokens: 3,  status: 'stable',      category: 'Navigation' },
  { name: 'Table',      variants: 2,  tokens: 3,  status: 'stable',      category: 'Display' },
  { name: 'Skeleton',   variants: 1,  tokens: 3,  status: 'stable',      category: 'Feedback' },
  { name: 'Spinner',    variants: 1,  tokens: 1,  status: 'stable',      category: 'Feedback' },
  { name: 'Drawer',     variants: 4,  tokens: 4,  status: 'in-progress', category: 'Overlay' },
  { name: 'DatePicker', variants: 1,  tokens: 8,  status: 'in-progress', category: 'Form' },
  { name: 'OTP Input',  variants: 1,  tokens: 5,  status: 'in-progress', category: 'Form' },
  { name: 'Dropdown',   variants: 1,  tokens: 4,  status: 'planned',     category: 'Form' },
];

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'gray'> = {
  stable: 'success', 'in-progress': 'warning', planned: 'gray',
};

// ─── Icons showcase ───────────────────────────────────────────────────────────
const ICON_SHOWCASE = [
  { icon: Home2StrokeRounded,            name: 'Home2' },
  { icon: Layout9StrokeRounded,           name: 'Layout' },
  { icon: User4StrokeRounded,            name: 'User' },
  { icon: UserMultiple4StrokeRounded,    name: 'Users' },
  { icon: Search1StrokeRounded,          name: 'Search' },
  { icon: Bell1StrokeRounded,            name: 'Bell' },
  { icon: Gear1StrokeRounded,            name: 'Gear' },
  { icon: CreditCardMultipleStrokeRounded, name: 'CreditCard' },
  { icon: BarChart4StrokeRounded,        name: 'BarChart' },
  { icon: CalendarDaysStrokeRounded,     name: 'Calendar' },
  { icon: FileMultipleStrokeRounded,     name: 'Files' },
  { icon: DollarCircleStrokeRounded,     name: 'Dollar' },
  { icon: Locked1StrokeRounded,          name: 'Lock' },
  { icon: EyeStrokeRounded,              name: 'Eye' },
  { icon: CheckCircle1StrokeRounded,     name: 'CheckCircle' },
  { icon: Shield2CheckStrokeRounded,     name: 'ShieldCheck' },
  { icon: Globe1StrokeRounded,           name: 'Globe' },
  { icon: Wallet1StrokeRounded,          name: 'Wallet' },
  { icon: ArrowRightStrokeRounded,       name: 'ArrowRight' },
  { icon: RefreshDollar1StrokeRounded,   name: 'RefreshDollar' },
  { icon: TrendUp1StrokeRounded,         name: 'TrendUp' },
  { icon: Envelope1StrokeRounded,        name: 'Envelope' },
  { icon: PlusStrokeRounded,             name: 'Plus' },
  { icon: Funnel1StrokeRounded,          name: 'Funnel' },
  { icon: Layers1StrokeRounded,          name: 'Layers' },
  { icon: ColourPalette3StrokeRounded,   name: 'Palette' },
  { icon: Code1StrokeRounded,            name: 'Code' },
  { icon: ChevronDownStrokeRounded,      name: 'ChevronDown' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function PreviewCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-base-100 bg-background-50 overflow-hidden">
      <div className="border-b border-base-100 bg-background-soft-50 px-4 py-2.5">
        <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 p-5">{children}</div>
    </div>
  );
}

function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8 pb-6 border-b border-base-100">
      <h1 className="text-title-50 text-xl font-semibold">{title}</h1>
      {sub && <p className="text-text-100 mt-1 text-sm">{sub}</p>}
    </div>
  );
}

// ─── Page components ──────────────────────────────────────────────────────────

function OverviewPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = useMemo(() =>
    COMPONENTS.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const stable = COMPONENTS.filter(r => r.status === 'stable').length;

  return (
    <div className="space-y-8">
      <PageHeader title="Component Catalog" sub="Tailgrids base · Monato tokens · Figma DS Web 2026" />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Componentes', value: COMPONENTS.length, sub: `${stable} estables`, accent: true },
          { label: 'Tokens de color', value: 302, sub: 'Mapeados al DS' },
          { label: 'Variantes totales', value: COMPONENTS.reduce((a,r)=>a+r.variants,0), sub: 'Across components' },
          { label: 'Cobertura tokens', value: '302/302', sub: '100% mapeados' },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} className={`rounded-xl border p-5 space-y-1.5 ${accent ? 'border-primary-500/30 bg-primary-500/5' : 'border-base-100 bg-background-50'}`}>
            <p className="text-text-200 text-xs font-medium uppercase tracking-wider">{label}</p>
            <p className={`text-3xl font-semibold tracking-tight ${accent ? 'text-primary-500' : 'text-title-50'}`}>{value}</p>
            <p className="text-text-200 text-xs">{sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-base-100 bg-background-50 overflow-hidden">
        <div className="flex items-center justify-between border-b border-base-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <h3 className="text-title-50 text-sm font-semibold">Todos los componentes</h3>
            <div className="flex gap-1.5">
              <Badge color="success" size="sm">Stable {stable}</Badge>
              <Badge color="warning" size="sm">In progress {COMPONENTS.filter(r=>r.status==='in-progress').length}</Badge>
              <Badge color="gray" size="sm">Planned {COMPONENTS.filter(r=>r.status==='planned').length}</Badge>
            </div>
          </div>
          {/* Buscador dentro de la tabla */}
          <div className="relative">
            <Search1StrokeRounded size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar componente…"
              className="h-8 w-52 rounded-lg border border-base-200 bg-background-soft-50 pl-8 pr-3 text-xs text-title-50 placeholder:text-text-200 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <TableRoot>
          <TableHeader>
            <TableRow>
              <TableHead>Componente</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Variantes</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(row => (
              <TableRow key={row.name}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="xs" fallback={row.name[0]} />
                    <span className="text-title-50 text-sm font-medium">{row.name}</span>
                  </div>
                </TableCell>
                <TableCell><Badge color="gray" size="sm">{row.category}</Badge></TableCell>
                <TableCell><span className="text-title-50 font-semibold">{row.variants}</span></TableCell>
                <TableCell><span className="text-title-50 font-semibold">{row.tokens}</span></TableCell>
                <TableCell>
                  <Badge color={STATUS_COLOR[row.status]} size="sm">
                    {row.status === 'stable' ? 'Stable' : row.status === 'in-progress' ? 'In progress' : 'Planned'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>

        <div className="border-t border-base-100 px-5 py-3 flex items-center justify-between">
          <span className="text-text-200 text-xs">{filtered.length} componentes · página {page} de {totalPages}</span>
          {totalPages > 1 && (
            <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
          )}
        </div>
      </div>
    </div>
  );
}

function ButtonsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Buttons" sub="Acciones primarias, secundarias y de estado del sistema." />
      <PreviewCard label="Fill — todas las variantes">
        <Button variant="primary">Primary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="success">Success</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </PreviewCard>
      <PreviewCard label="Outline">
        <Button variant="primary" appearance="outline">Primary</Button>
        <Button variant="danger" appearance="outline">Danger</Button>
        <Button variant="success" appearance="outline">Success</Button>
        <Button variant="primary" appearance="outline" disabled>Disabled</Button>
      </PreviewCard>
      <PreviewCard label="Sizes">
        <Button size="xs">XSmall</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </PreviewCard>
      <PreviewCard label="Con ícono">
        <Button variant="primary" size="sm">
          <PlusStrokeRounded size={14} />
          Nuevo pago
        </Button>
        <Button variant="primary" appearance="outline" size="sm">
          <Funnel1StrokeRounded size={14} />
          Filtrar
        </Button>
      </PreviewCard>
      <PreviewCard label="Button Group">
        <ButtonGroup variant="secondary" size="sm">
          <button>Semanal</button>
          <button>Mensual</button>
          <button>Anual</button>
        </ButtonGroup>
        <ButtonGroup variant="primary" size="sm">
          <button>SPEI</button>
          <button>CoDi</button>
        </ButtonGroup>
      </PreviewCard>
    </div>
  );
}

function BadgesPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Badges" sub="Etiquetas de estado, categoría y contexto semántico." />
      <PreviewCard label="Todos los colores">
        {(['primary','success','warning','error','gray','cyan','sky','blue','violet','purple','pink','rose','orange'] as const).map(c => (
          <Badge key={c} color={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</Badge>
        ))}
      </PreviewCard>
      <PreviewCard label="Tamaños">
        <Badge color="primary" size="sm">Small</Badge>
        <Badge color="primary" size="md">Medium</Badge>
        <Badge color="primary" size="lg">Large</Badge>
      </PreviewCard>
      <PreviewCard label="Casos de uso en Monato">
        <Badge color="success">Al día</Badge>
        <Badge color="warning">Pre-vencimiento</Badge>
        <Badge color="error">Mora avanzada</Badge>
        <Badge color="orange">Mora temprana</Badge>
        <Badge color="gray">Anulado</Badge>
        <Badge color="blue">Reprogramado</Badge>
        <Badge color="primary">Pendiente</Badge>
      </PreviewCard>
    </div>
  );
}

function InputsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Inputs" sub="Campos de texto, selección y entrada de datos del sistema." />
      <PreviewCard label="Estados">
        <Input placeholder="Default" className="w-52" />
        <Input state="error" placeholder="Error" className="w-52" />
        <Input state="success" placeholder="Success" className="w-52" />
        <Input placeholder="Disabled" disabled className="w-52" />
      </PreviewCard>
      <PreviewCard label="Select nativo">
        <NativeSelect className="w-56" placeholder="Tipo de pago">
          <NativeSelectOption>Pago SPEI</NativeSelectOption>
          <NativeSelectOption>Pago CoDi</NativeSelectOption>
          <NativeSelectOption>Transferencia</NativeSelectOption>
        </NativeSelect>
      </PreviewCard>
      <PreviewCard label="Textarea">
        <TextArea placeholder="Descripción del movimiento…" className="w-full max-w-lg" rows={3} />
      </PreviewCard>
    </div>
  );
}

function AlertsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Alerts" sub="Mensajes de sistema, confirmaciones y advertencias." />
      <Alert variant="success" title="Pago procesado"  message="El SPEI fue enviado y confirmado por el banco receptor." />
      <Alert variant="info"    title="Información"     message="Tu cuenta tiene pagos pendientes de conciliación." />
      <Alert variant="warning" title="Atención"        message="El saldo disponible es menor al mínimo recomendado." />
      <Alert variant="danger"  title="Error"           message="No se pudo completar la transferencia. Intenta de nuevo." />
      <Alert variant="gray"    title="Sin actividad"   message="No hay movimientos en los últimos 30 días." />
    </div>
  );
}

function AvatarsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Avatars" sub="Representación visual de usuarios y entidades." />
      <PreviewCard label="Tamaños">
        {(['xs','sm','md','lg','xl','xxl'] as const).map(s => (
          <Avatar key={s} size={s} fallback="AL" />
        ))}
      </PreviewCard>
      <PreviewCard label="Inicial única">
        {(['xs','sm','md','lg','xl'] as const).map(s => (
          <Avatar key={s} size={s} fallback="M" />
        ))}
      </PreviewCard>
    </div>
  );
}

function ControlsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Controls" sub="Toggles, checkboxes y controles de formulario." />
      <PreviewCard label="Toggle">
        <Toggle label="Notificaciones push" defaultChecked />
        <Toggle label="Modo silencioso" />
        <Toggle label="Deshabilitado" disabled />
      </PreviewCard>
      <PreviewCard label="Checkbox">
        <Checkbox defaultChecked />
        <Checkbox />
        <Checkbox disabled />
      </PreviewCard>
      <PreviewCard label="Progress">
        <div className="w-80 space-y-3">
          <Progress progress={25} withLabel />
          <Progress progress={60} withLabel />
          <Progress progress={90} withLabel />
        </div>
      </PreviewCard>
    </div>
  );
}

function FeedbackPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Feedback" sub="Spinners, skeletons y estados de carga." />
      <PreviewCard label="Spinners">
        <DefaultSpinner size={24} />
        <DefaultSpinner size={36} />
        <DefaultSpinner size={48} />
      </PreviewCard>
      <PreviewCard label="Skeleton">
        <div className="w-80 space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>
      </PreviewCard>
    </div>
  );
}

function TabsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Tabs" sub="Navegación entre vistas dentro de un mismo contexto." />
      <TabRoot defaultValue="pagos">
        <TabList>
          <TabTrigger value="pagos">Pagos</TabTrigger>
          <TabTrigger value="conciliacion">Conciliación</TabTrigger>
          <TabTrigger value="credito">Crédito</TabTrigger>
        </TabList>
        <TabContent value="pagos"><p className="text-text-50 p-5 text-sm">Módulo de Pagos — BillPay.</p></TabContent>
        <TabContent value="conciliacion"><p className="text-text-50 p-5 text-sm">Conciliación automática.</p></TabContent>
        <TabContent value="credito"><p className="text-text-50 p-5 text-sm">Crédito — Finch by Monato.</p></TabContent>
      </TabRoot>
    </div>
  );
}

function AccordionPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Accordion" sub="Contenido expandible para secciones colapsables." />
      <AccordionRoot>
        <AccordionItem>
          <AccordionTrigger>¿Qué es Monato?</AccordionTrigger>
          <AccordionContent>Infraestructura de pagos B2B para empresas en México.</AccordionContent>
        </AccordionItem>
        <AccordionItem>
          <AccordionTrigger>¿Cómo funciona BillPay?</AccordionTrigger>
          <AccordionContent>BillPay procesa pagos B2B vía SPEI y CoDi con conciliación automática.</AccordionContent>
        </AccordionItem>
        <AccordionItem>
          <AccordionTrigger>¿Qué es Finch?</AccordionTrigger>
          <AccordionContent>Finch es Crédito by Monato — líneas de crédito integradas a la misma API.</AccordionContent>
        </AccordionItem>
      </AccordionRoot>
    </div>
  );
}

function ToastPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Toast" sub="Notificaciones temporales no bloqueantes." />
      <div className="space-y-3 max-w-md">
        <Toast variant="default" message={{ title: 'Pago procesado',  description: 'SPEI enviado correctamente.' }} />
        <Toast variant="success" message={{ title: 'Conciliado',       description: 'Transacción conciliada con éxito.' }} />
        <Toast variant="error"   message={{ title: 'Error',            description: 'No se pudo completar el pago.' }} />
        <Toast variant="warning" message={{ title: 'Atención',         description: 'Saldo insuficiente en la cuenta.' }} />
      </div>
    </div>
  );
}

function ModalPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-4">
      <PageHeader title="Modal" sub="Diálogos bloqueantes para acciones críticas." />
      <Button onClick={() => setOpen(true)}>Abrir modal de ejemplo</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="w-full max-w-md rounded-xl bg-background-50 p-6 shadow-lg space-y-5">
          <div>
            <h3 className="text-title-50 text-base font-semibold">Confirmar pago</h3>
            <p className="text-text-100 mt-1 text-sm">¿Procesar $12,500 MXN vía SPEI a Proveedor ABC?</p>
          </div>
          <Input placeholder="Referencia (opcional)" />
          <div className="flex justify-end gap-3">
            <Button appearance="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => setOpen(false)}>Confirmar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PaginationPage() {
  const [page, setPage] = useState(1);
  return (
    <div className="space-y-4">
      <PageHeader title="Pagination" sub="Navegación entre páginas de contenido." />
      <div className="rounded-xl border border-base-100 bg-background-50 p-6 space-y-4">
        <Pagination totalPages={8} currentPage={page} onPageChange={setPage} />
        <p className="text-text-200 text-xs">Página activa: {page} de 8</p>
      </div>
    </div>
  );
}

function IconsPage() {
  const [search, setSearch] = useState('');
  const filtered = ICON_SHOWCASE.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <PageHeader title="Icons" sub="Lineicons Free — StrokeRounded style · vía @lineiconshq/react-lineicons" />
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search1StrokeRounded size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ícono…"
            className="h-8 w-56 rounded-lg border border-base-200 bg-background-50 pl-8 pr-3 text-xs text-title-50 placeholder:text-text-200 focus:outline-none focus:border-primary-500"
          />
        </div>
        <span className="text-text-200 text-xs">{filtered.length} íconos</span>
      </div>
      <div className="grid grid-cols-7 gap-3">
        {filtered.map(({ icon: Icon, name }) => (
          <div key={name} className="group flex flex-col items-center gap-2 rounded-xl border border-base-100 bg-background-50 p-4 hover:border-primary-500/40 hover:bg-primary-500/5 transition cursor-default">
            <span className="[&_svg]:fill-none [&_path]:fill-none">
              <Icon size={22} strokeWidth={1.4} className="text-title-50 group-hover:text-primary-500 transition" />
            </span>
            <span className="text-text-200 text-[10px] text-center leading-tight truncate w-full text-center">{name}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-base-100 bg-background-soft-50 p-4">
        <p className="text-text-100 text-xs">
          <span className="font-medium text-title-50">Uso:</span>{' '}
          <code className="bg-background-soft-100 px-1.5 py-0.5 rounded text-primary-500 text-[11px]">
            {`import { Home2StrokeRounded } from '@lineiconshq/free-icons'`}
          </code>
          {' · '}
          <code className="bg-background-soft-100 px-1.5 py-0.5 rounded text-primary-500 text-[11px]">
            {`<Home2StrokeRounded size={20} />`}
          </code>
        </p>
      </div>
    </div>
  );
}

// ─── Page map ─────────────────────────────────────────────────────────────────
const PAGES: Record<TabId, React.FC> = {
  overview: OverviewPage, buttons: ButtonsPage, badges: BadgesPage,
  inputs: InputsPage, alerts: AlertsPage, avatars: AvatarsPage,
  controls: ControlsPage, feedback: FeedbackPage, tabs: TabsPage,
  accordion: AccordionPage, toast: ToastPage, modal: ModalPage,
  pagination: PaginationPage, icons: IconsPage,
};

// ─── App ──────────────────────────────────────────────────────────────────────
export function App() {
  const [active, setActive] = useState<TabId>('overview');
  const PageComponent = PAGES[active];

  return (
    <div className="flex min-h-screen bg-background-soft-50 font-sans">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="sticky top-0 h-screen w-60 shrink-0 flex flex-col border-r border-base-100 bg-background-50">

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-base-100 px-5 py-[15px]">
          <img src={LogoDefault} alt="monato" className="h-6 w-auto" />
          <Badge color="primary" size="sm">DS</Badge>
        </div>

        {/* Nav agrupado */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-text-200 mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={[
                      'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition',
                      active === id
                        ? 'bg-primary-500/10 text-primary-500 font-medium'
                        : 'text-text-50 hover:bg-background-soft-50 hover:text-title-50',
                    ].join(' ')}
                  >
                    <span className="[&_svg]:fill-none [&_path]:fill-none shrink-0">
                      <Icon size={16} strokeWidth={1.4} className={active === id ? 'text-primary-500' : 'text-text-200'} />
                    </span>
                    {label}
                    {id === 'overview' && (
                      <span className="ml-auto">
                        <Badge color="primary" size="sm">{COMPONENTS.filter(c=>c.status==='stable').length}</Badge>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-base-100 px-4 py-3 flex items-center gap-3">
          <Avatar size="sm" fallback="ML" />
          <div className="min-w-0">
            <p className="text-title-50 truncate text-xs font-medium">Monato Design</p>
            <p className="text-text-200 truncate text-xs">v0.1 · 13 may 2026</p>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-base-100 bg-background-50/90 px-8 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-text-200">Monato DS</span>
            <ChevronRightCircleBulkRounded size={12} className="text-text-200" />
            <span className="text-title-50 font-medium capitalize">{active}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" appearance="outline">
              <span className="[&_svg]:fill-none [&_path]:fill-none"><Globe1StrokeRounded size={13} strokeWidth={1.4} /></span>
              Figma
            </Button>
            <Button size="sm">
              <span className="[&_svg]:fill-none [&_path]:fill-none"><Code1StrokeRounded size={13} strokeWidth={1.4} /></span>
              Usar componente
            </Button>
          </div>
        </div>

        {/* Page content */}
        <div className="px-8 py-8">
          <PageComponent />
        </div>
      </main>
    </div>
  );
}
