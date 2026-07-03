import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as TailgridsIcons from '@tailgrids/icons';
import {
  Home, Layers2, Code1, Bell1, User2, Search1,
  ChevronDown, ChevronRight, Plus, Funnel1, Layout14,
  Bolt1, Check, Comment1, ChevronBothDirection,
  Diamonds1, Rocket1, ColourPalette3, SlidersDoubleHorizontal,
  FileTextMultiple, CheckCircle1, Doller,
} from '@tailgrids/icons';
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
import { CLP } from './CLP';
import { CrossBorderPrototype } from './CrossBorder';
import { Demo1xbetPrototype } from './1xbet';
import GiftcardsPrototype from './giftcards/Giftcards';
import { BillpayMainPrototype } from './billpay';
import { MandatosPrototype } from './Mandatos';
import { CustomerPlatformPrototype } from './CustomerPlatform';
import { GeolocalizacionPrototype } from './Geolocalizacion';
import { MenuBar } from './components/core/menu-bar';
import { Sidebar } from './blocks/Sidebar';
// Logo — using PNG for correct rendering on light backgrounds
import LogoDefault from './assets/logo-default.png';
import { AuthGate } from './components/AuthGate';
import { getUserDisplay, clearUserEmail } from './lib/user';
import { Docs, DocsLoader } from './docs';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'overview' | 'buttons' | 'badges' | 'inputs' | 'alerts' |
  'avatars' | 'controls' | 'feedback' | 'tabs' | 'accordion' |
  'toast' | 'modal' | 'pagination' | 'icons' | 'prototypes' | 'crossborder' | 'giftcards' | 'mandatos' | 'customer-platform' |
  'colors' | 'typography' | 'shadows' | 'spacing' | 'border-radius' | 'grid' |
  'menubar' | 'blocks-sidebar';

// ─── Nav structure ────────────────────────────────────────────────────────────
type NavItem = { id: TabId; label: string; icon: React.FC<{size?:number;className?:string;strokeWidth?:number}> };
type NavGroup = {
  label: string;
  items: NavItem[];
  children?: { label: string; items: NavItem[] }[]; // para dropdown de sub-grupos
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'General',
    items: [
      { id: 'overview', label: 'Overview', icon: Home },
    ],
  },
  {
    label: 'Foundations',
    items: [
      { id: 'colors',     label: 'Colors',     icon: ColourPalette3 },
      { id: 'typography', label: 'Typography',  icon: Code1 },
      { id: 'icons',      label: 'Icons',       icon: Diamonds1 },
    ],
    children: [
      {
        label: 'Primitives',
        items: [
          { id: 'shadows',       label: 'Shadows',       icon: Layers2 },
          { id: 'spacing',       label: 'Spacing',        icon: SlidersDoubleHorizontal },
          { id: 'grid',          label: 'Grid Layouts',   icon: Layout14 },
          { id: 'border-radius', label: 'Border Radius',  icon: ChevronBothDirection },
        ],
      },
    ],
  },
  {
    label: 'Components',
    items: [
      { id: 'buttons',    label: 'Buttons',    icon: Bolt1 },
      { id: 'badges',     label: 'Badges',     icon: Diamonds1 },
      { id: 'inputs',     label: 'Inputs',     icon: SlidersDoubleHorizontal },
      { id: 'alerts',     label: 'Alerts',     icon: Bell1 },
      { id: 'avatars',    label: 'Avatars',    icon: User2 },
      { id: 'controls',   label: 'Controls',   icon: Check },
      { id: 'feedback',   label: 'Feedback',   icon: Comment1 },
      { id: 'tabs',       label: 'Tabs',       icon: Layout14 },
      { id: 'accordion',  label: 'Accordion',  icon: FileTextMultiple },
      { id: 'toast',      label: 'Toast',      icon: CheckCircle1 },
      { id: 'modal',      label: 'Modal',      icon: Layers2 },
      { id: 'pagination', label: 'Pagination', icon: ChevronBothDirection },
      { id: 'menubar',    label: 'Menu Bar',   icon: Layout14 },
    ],
  },
  {
    label: 'Blocks',
    items: [
      { id: 'blocks-sidebar', label: 'Sidebar', icon: Layout14 },
    ],
  },
  {
    label: 'Prototypes',
    items: [
      { id: 'prototypes',  label: 'CLP v1.0',         icon: Rocket1 },
      { id: 'crossborder', label: 'CrossBorder v1.0', icon: Doller },
      { id: 'giftcards',   label: 'BillPay v1.0',     icon: Doller },
      { id: 'mandatos',    label: 'Mandatos v1.0',    icon: Rocket1 },
      { id: 'customer-platform', label: 'Customer Platform v1.0', icon: Rocket1 },
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
  { name: 'Menu Bar',  variants: 4,  tokens: 6,  status: 'stable',      category: 'Navigation' },
  { name: 'Sidebar',   variants: 2,  tokens: 14, status: 'stable',      category: 'Blocks' },
];

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'gray'> = {
  stable: 'success', 'in-progress': 'warning', planned: 'gray',
};

// ─── Icons showcase ───────────────────────────────────────────────────────────
// Genera automáticamente la lista desde todos los exports de @tailgrids/icons
const ICON_SHOWCASE = Object.entries(TailgridsIcons)
  .filter(([, val]) => typeof val === 'function')
  .map(([name, icon]) => ({ name, icon: icon as React.FC<{ size?: number; className?: string }> }))
  .sort((a, b) => a.name.localeCompare(b.name));

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
            <Search1 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200 pointer-events-none" />
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

        <div className="border-t border-base-100 px-5 py-3 flex items-center gap-4">
          <span className="text-text-200 text-xs shrink-0">{filtered.length} componentes · página {page} de {totalPages}</span>
          <div className="ml-auto">
            {totalPages > 1 && (
              <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            )}
          </div>
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
        {[
          { variant: 'primary' as const, label: 'Primary' },
          { variant: 'danger' as const,  label: 'Danger' },
          { variant: 'success' as const, label: 'Success' },
          { variant: 'ghost' as const,   label: 'Ghost' },
        ].map(({ variant, label }) => (
          <motion.div key={variant} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
            <Button variant={variant}>{label}</Button>
          </motion.div>
        ))}
        <Button variant="primary" disabled>Disabled</Button>
      </PreviewCard>
      <PreviewCard label="Outline">
        {[
          { variant: 'primary' as const, label: 'Primary' },
          { variant: 'danger' as const,  label: 'Danger' },
          { variant: 'success' as const, label: 'Success' },
        ].map(({ variant, label }) => (
          <motion.div key={variant} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
            <Button variant={variant} appearance="outline">{label}</Button>
          </motion.div>
        ))}
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
          <Plus size={14} />
          Nuevo pago
        </Button>
        <Button variant="primary" appearance="outline" size="sm">
          <Funnel1 size={14} />
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
  const colors = ['primary','success','warning','error','gray','cyan','sky','blue','violet','purple','pink','rose','orange'] as const;
  return (
    <div className="space-y-4">
      <PageHeader title="Badges" sub="Etiquetas de estado, categoría y contexto semántico." />
      <PreviewCard label="Todos los colores">
        {colors.map((c, i) => (
          <motion.div
            key={c}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Badge color={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</Badge>
          </motion.div>
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
      {/* Spinner wrapper sin [&_path]:fill-none porque el spinner usa fill internamente */}
      <div className="rounded-xl border border-base-100 bg-background-50 overflow-hidden">
        <div className="border-b border-base-100 bg-background-soft-50 px-4 py-2.5">
          <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">Spinners</span>
        </div>
        <div className="flex flex-wrap items-center gap-6 p-5">
          <DefaultSpinner size={32} />
          <DefaultSpinner size={48} />
          <DefaultSpinner size={64} />
        </div>
      </div>
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
      <PageHeader title="Icons" sub="Tailgrids Icons — 240+ SVG icons · vía @tailgrids/icons" />
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search1 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ícono…"
            className="h-8 w-56 rounded-lg border border-base-200 bg-background-50 pl-8 pr-3 text-xs text-title-50 placeholder:text-text-200 focus:outline-none focus:border-primary-500"
          />
        </div>
        <span className="text-text-200 text-xs">{filtered.length} íconos</span>
      </div>
      <div className="grid grid-cols-8 gap-2.5">
        {filtered.map(({ icon: Icon, name }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(i * 0.008, 0.3), type: 'spring', stiffness: 400, damping: 28 }}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="group flex flex-col items-center gap-2 rounded-xl border border-base-100 bg-background-50 p-3.5 hover:border-primary-500/40 hover:bg-primary-500/5 transition-colors cursor-default"
          >
            <Icon size={20} className="text-title-50 group-hover:text-primary-500 transition-colors" />
            <span className="text-text-200 text-[10px] text-center leading-tight truncate w-full">{name}</span>
          </motion.div>
        ))}
      </div>
      <div className="rounded-xl border border-base-100 bg-background-soft-50 p-4">
        <p className="text-text-100 text-xs">
          <span className="font-medium text-title-50">Uso:</span>{' '}
          <code className="bg-background-soft-100 px-1.5 py-0.5 rounded text-primary-500 text-[11px]">
            {`import { Home } from '@tailgrids/icons'`}
          </code>
          {' · '}
          <code className="bg-background-soft-100 px-1.5 py-0.5 rounded text-primary-500 text-[11px]">
            {`<Home size={20} className="text-primary-500" />`}
          </code>
        </p>
      </div>
    </div>
  );
}

// ─── Foundations Pages ────────────────────────────────────────────────────────

function ColorsPage() {
  const PALETTES = [
    { name: 'Skyblue (Brand)', prefix: 'skyblue', shades: [
      { shade: '50', hex: '#e6f4fa' }, { shade: '100', hex: '#b2deee' },
      { shade: '200', hex: '#8dcee6' }, { shade: '300', hex: '#5ab7da' },
      { shade: '400', hex: '#39a9d3' }, { shade: '500', hex: '#0894c8' },
      { shade: '600', hex: '#0787b6' }, { shade: '700', hex: '#06698e' },
      { shade: '800', hex: '#04516e' }, { shade: '900', hex: '#033e54' },
    ]},
    { name: 'Gray', prefix: 'gray', shades: [
      { shade: '50',  hex: '#fafafa' }, { shade: '100', hex: '#f4f4f5' },
      { shade: '200', hex: '#a1a1aa' }, { shade: '300', hex: '#71717a' },
      { shade: '400', hex: '#52525b' }, { shade: '500', hex: '#3f3f46' },
      { shade: '600', hex: '#27272a' }, { shade: '700', hex: '#1e1e22' },
      { shade: '800', hex: '#18181b' }, { shade: '900', hex: '#09090b' },
    ]},
    { name: 'Red', prefix: 'red', shades: [
      { shade: '50',  hex: '#ffebed' }, { shade: '100', hex: '#fec1c6' },
      { shade: '300', hex: '#fc7984' }, { shade: '500', hex: '#fb3748' },
      { shade: '600', hex: '#e43242' }, { shade: '700', hex: '#b22733' },
      { shade: '800', hex: '#8a1e28' }, { shade: '900', hex: '#69171e' },
    ]},
    { name: 'Green', prefix: 'green', shades: [
      { shade: '50',  hex: '#f0fdf4' }, { shade: '100', hex: '#dcfce7' },
      { shade: '300', hex: '#86efac' }, { shade: '500', hex: '#22c55e' },
      { shade: '600', hex: '#16a34a' }, { shade: '700', hex: '#15803d' },
      { shade: '800', hex: '#166534' }, { shade: '900', hex: '#14532d' },
    ]},
    { name: 'Yellow', prefix: 'yellow', shades: [
      { shade: '50',  hex: '#fef8e9' }, { shade: '100', hex: '#fce8b9' },
      { shade: '300', hex: '#f9cd68' }, { shade: '500', hex: '#f6b51e' },
      { shade: '600', hex: '#e0a51b' }, { shade: '700', hex: '#af8115' },
      { shade: '800', hex: '#876411' }, { shade: '900', hex: '#674c0d' },
    ]},
  ];
  return (
    <div className="space-y-4">
      <div className="mb-8 pb-6 border-b border-base-100">
        <h1 className="text-title-50 text-xl font-semibold">Colors</h1>
        <p className="text-text-100 mt-1 text-sm">Paleta de primitivos · Sincronizada desde Figma DS Web 2026</p>
      </div>
      <div className="space-y-8">
        {PALETTES.map(({ name, shades }) => (
          <div key={name}>
            <p className="text-title-50 text-sm font-semibold mb-3">{name}</p>
            <div className="flex gap-2 flex-wrap">
              {shades.map(({ shade, hex }) => (
                <motion.div
                  key={shade}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex flex-col items-center gap-1.5 cursor-default"
                >
                  <div
                    className="w-14 h-10 rounded-lg border border-black/5 shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                  <p className="text-text-200 text-[10px] font-medium">{shade}</p>
                  <p className="text-text-200 text-[9px] font-mono uppercase">{hex}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypographyPage() {
  const SCALE = [
    { token: '--font-size-xs',  size: '12px', lh: '16px', label: 'XS — Caption' },
    { token: '--font-size-sm',  size: '14px', lh: '20px', label: 'SM — Body small' },
    { token: '--font-size-md',  size: '16px', lh: '24px', label: 'MD — Body' },
    { token: '--font-size-lg',  size: '18px', lh: '28px', label: 'LG — Body large' },
    { token: '--font-size-xl',  size: '20px', lh: '28px', label: 'XL — Subtitle' },
    { token: '--font-size-2xl', size: '24px', lh: '32px', label: '2XL — Title' },
    { token: '--font-size-3xl', size: '30px', lh: '36px', label: '3XL — H3' },
    { token: '--font-size-4xl', size: '36px', lh: '40px', label: '4XL — H2' },
    { token: '--font-size-5xl', size: '48px', lh: '52px', label: '5XL — H1' },
  ];
  const WEIGHTS = [
    { token: '--font-weight-regular',  value: '400', label: 'Regular' },
    { token: '--font-weight-medium',   value: '500', label: 'Medium' },
    { token: '--font-weight-semibold', value: '600', label: 'Semibold' },
    { token: '--font-weight-bold',     value: '700', label: 'Bold' },
  ];
  return (
    <div className="space-y-10">
      <div className="pb-6 border-b border-base-100">
        <h1 className="text-title-50 text-xl font-semibold">Typography</h1>
        <p className="text-text-100 mt-1 text-sm">DM Sans · Escala tipográfica del DS</p>
      </div>
      {/* Scale */}
      <div>
        <p className="text-title-50 text-sm font-semibold mb-4">Escala de tamaños</p>
        <div className="rounded-xl border border-base-100 overflow-hidden">
          {SCALE.map(({ token, size, lh, label }, i) => (
            <motion.div
              key={token}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-6 px-5 py-4 border-b border-base-100 last:border-0 hover:bg-background-soft-50 transition-colors"
            >
              <div className="w-32 shrink-0">
                <p className="text-text-200 text-xs font-mono">{token}</p>
                <p className="text-text-200 text-[10px] mt-0.5">{size} / {lh}</p>
              </div>
              <p style={{ fontSize: size, lineHeight: lh, fontFamily: 'DM Sans, sans-serif' }}
                className="text-title-50 truncate flex-1"
              >
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Weights */}
      <div>
        <p className="text-title-50 text-sm font-semibold mb-4">Pesos tipográficos</p>
        <div className="grid grid-cols-4 gap-4">
          {WEIGHTS.map(({ value, label }) => (
            <div key={label} className="rounded-xl border border-base-100 p-5 space-y-2">
              <p style={{ fontWeight: value, fontSize: '24px', fontFamily: 'DM Sans, sans-serif' }}
                className="text-title-50"
              >Aa</p>
              <p className="text-title-50 text-sm font-medium">{label}</p>
              <p className="text-text-200 text-xs font-mono">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShadowsPage() {
  const SHADOWS = [
    { name: 'xs',   value: '0px 1px 2px 0px rgba(16,24,40,0.05)',    token: '--shadow-xs' },
    { name: 'sm',   value: '0px 1px 3px 0px rgba(16,24,40,0.1)',     token: '--shadow-sm' },
    { name: 'md',   value: '0px 4px 8px -2px rgba(16,24,40,0.1)',    token: '--shadow-md' },
    { name: 'lg',   value: '0px 12px 16px -4px rgba(16,24,40,0.08)', token: '--shadow-lg' },
    { name: 'xl',   value: '0px 20px 24px -4px rgba(16,24,40,0.08)', token: '--shadow-xl' },
    { name: '2xl',  value: '0px 24px 48px -12px rgba(16,24,40,0.18)',token: '--shadow-2xl' },
  ];
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-base-100">
        <h1 className="text-title-50 text-xl font-semibold">Shadows</h1>
        <p className="text-text-100 mt-1 text-sm">Escala de sombras del DS</p>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {SHADOWS.map(({ name, value, token }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl bg-background-50 border border-base-100 p-6 space-y-4"
            style={{ boxShadow: value }}
          >
            <div>
              <p className="text-title-50 text-sm font-semibold">shadow-{name}</p>
              <p className="text-text-200 text-xs font-mono mt-1">{token}</p>
            </div>
            <p className="text-text-200 text-[11px] font-mono leading-relaxed">{value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SpacingPage() {
  const TOKENS = [
    { token: '0',   px: '0px'  }, { token: '0.5', px: '2px'  }, { token: '1',  px: '4px'  },
    { token: '1.5', px: '6px'  }, { token: '2',   px: '8px'  }, { token: '2.5',px: '10px' },
    { token: '3',   px: '12px' }, { token: '3.5', px: '14px' }, { token: '4',  px: '16px' },
    { token: '5',   px: '20px' }, { token: '6',   px: '24px' }, { token: '7',  px: '28px' },
    { token: '8',   px: '32px' }, { token: '10',  px: '40px' }, { token: '12', px: '48px' },
    { token: '16',  px: '64px' }, { token: '20',  px: '80px' }, { token: '24', px: '96px' },
  ];
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-base-100">
        <h1 className="text-title-50 text-xl font-semibold">Spacing</h1>
        <p className="text-text-100 mt-1 text-sm">Escala base-4 · {TOKENS.length} tokens</p>
      </div>
      <div className="space-y-2">
        {TOKENS.map(({ token, px }, i) => (
          <motion.div
            key={token}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.025 }}
            className="flex items-center gap-4 rounded-lg hover:bg-background-soft-50 px-3 py-2 transition-colors"
          >
            <p className="text-text-200 text-xs font-mono w-20 shrink-0">--space-{token}</p>
            <p className="text-text-200 text-xs w-10 shrink-0">{px}</p>
            <div className="bg-primary-500/30 rounded" style={{ width: px, height: '8px', minWidth: '2px' }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BorderRadiusPage() {
  const TOKENS = [
    { name: 'none',    token: '--radius-none',    px: '0px',    sample: 0    },
    { name: 'sm',      token: '--radius-sm',      px: '2px',    sample: 2    },
    { name: 'default', token: '--radius-default', px: '4px',    sample: 4    },
    { name: 'md',      token: '--radius-md',      px: '6px',    sample: 6    },
    { name: 'lg',      token: '--radius-lg',      px: '8px',    sample: 8    },
    { name: 'xl',      token: '--radius-xl',      px: '12px',   sample: 12   },
    { name: '2xl',     token: '--radius-2xl',     px: '16px',   sample: 16   },
    { name: '3xl',     token: '--radius-3xl',     px: '24px',   sample: 24   },
    { name: '4xl',     token: '--radius-4xl',     px: '32px',   sample: 32   },
    { name: 'full',    token: '--radius-full',    px: '9999px', sample: 9999 },
  ];
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-base-100">
        <h1 className="text-title-50 text-xl font-semibold">Border Radius</h1>
        <p className="text-text-100 mt-1 text-sm">Escala de radios del DS</p>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {TOKENS.map(({ name, token, px, sample }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 400 }}
            className="flex flex-col items-center gap-3 p-4 rounded-xl border border-base-100 bg-background-50"
          >
            <div
              className="size-12 bg-primary-500/20 border-2 border-primary-500/40"
              style={{ borderRadius: Math.min(sample, 24) }}
            />
            <div className="text-center">
              <p className="text-title-50 text-xs font-semibold">{name}</p>
              <p className="text-text-200 text-[10px] font-mono mt-0.5">{px}</p>
              <p className="text-text-200 text-[9px] font-mono mt-0.5 truncate w-full">{token}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GridPage() {
  const GRIDS = [
    { cols: 1, label: '1 columna',   use: 'Móvil · contenido full width' },
    { cols: 2, label: '2 columnas',  use: 'Comparaciones, lado a lado' },
    { cols: 3, label: '3 columnas',  use: 'Cards de features, métricas' },
    { cols: 4, label: '4 columnas',  use: 'KPI cards, dashboards' },
    { cols: 6, label: '6 columnas',  use: 'Grids densos, íconos' },
    { cols: 12,label: '12 columnas', use: 'Layout base (sub-grids)' },
  ];
  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-base-100">
        <h1 className="text-title-50 text-xl font-semibold">Grid Layouts</h1>
        <p className="text-text-100 mt-1 text-sm">Sistema de grillas · gap-4 (16px) por defecto</p>
      </div>
      <div className="space-y-6">
        {GRIDS.map(({ cols, label, use }, i) => (
          <motion.div
            key={cols}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-title-50 text-xs font-semibold">{label}</p>
              <p className="text-text-200 text-xs">{use}</p>
            </div>
            <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${Math.min(cols, 12)}, 1fr)` }}>
              {Array.from({ length: Math.min(cols, 12) }).map((_, j) => (
                <div key={j} className="h-8 rounded-md bg-primary-500/15 border border-primary-500/20" />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


function PrototypesPage() {
  return (
    <div className="space-y-4">
      <div className="mb-8 pb-6 border-b border-base-100">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-title-50 text-xl font-semibold">Prototypes</h1>
          <Badge color="primary" size="sm">2 protos</Badge>
        </div>
        <p className="text-text-100 text-sm">Pantallas navegables construidas con componentes del DS.</p>
      </div>
      <CLP />
    </div>
  );
}

// ─── Icon helpers for Menu Bar showcase ──────────────────────────────────────

function IconOpen() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3C5.5 3 3.5 4.5 3.5 6.5V13h4.5V6.5C8 4.5 10 3 12.5 3H8z" /><path d="M8 13V6.5" />
    </svg>
  );
}
function IconFile() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z" /><path d="M9 2v4h4" /><path d="M5.5 8.5h5M5.5 11h5" />
    </svg>
  );
}
function IconPrint() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="9" width="8" height="5" rx="0.5" /><path d="M4 9V4h8v5" /><path d="M4 11H2.5A.5.5 0 012 10.5v-4A.5.5 0 012.5 6h11a.5.5 0 01.5.5v4a.5.5 0 01-.5.5H12" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4l.5 9h5L11 4" />
    </svg>
  );
}

function MenuBarPage() {
  const basicMenus = [
    {
      label: 'File',
      sections: [
        {
          items: [
            { label: 'Open' },
            { label: 'Save' },
            { label: 'Print', shortcut: '⌘P' },
          ],
        },
        {
          footer: true,
          items: [{ label: 'Delete', danger: true }],
        },
      ],
    },
    { label: 'Edit' },
    { label: 'View' },
    { label: 'Help', disabled: true },
  ];

  const submenuMenus = [
    {
      label: 'File',
      sections: [
        {
          items: [
            { label: 'Open' },
            { label: 'Save' },
            { label: 'Print', shortcut: '⌘P' },
            {
              label: 'Export',
              submenu: [{ label: 'PDF' }, { label: 'PNG' }, { label: 'SVG' }],
            },
          ],
        },
        {
          footer: true,
          items: [{ label: 'Delete', danger: true }],
        },
      ],
    },
    { label: 'Edit' },
    { label: 'View' },
    { label: 'Help', disabled: true },
  ];

  const iconMenus = [
    {
      label: 'File',
      sections: [
        {
          items: [
            { label: 'Open',  icon: <IconOpen /> },
            { label: 'Save',  icon: <IconFile /> },
            { label: 'Print', icon: <IconPrint />, shortcut: '⌘P' },
          ],
        },
        {
          footer: true,
          items: [{ label: 'Delete', danger: true, icon: <IconTrash /> }],
        },
      ],
    },
    { label: 'Help', disabled: true },
  ];

  const checkmarkMenus = [
    { label: 'File' },
    {
      label: 'Options',
      sections: [
        {
          items: [
            { label: 'Option', checked: true },
            { label: 'Option' },
            { label: 'Option' },
          ],
        },
      ],
    },
    { label: 'Help', disabled: true },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Menu Bar"
        sub="Barra de menú con dropdowns, submenús, íconos y checkmarks."
      />

      <PreviewCard label="Menubar — básico">
        <MenuBar menus={basicMenus} />
      </PreviewCard>

      <PreviewCard label="Menubar with Submenu">
        <MenuBar menus={submenuMenus} />
      </PreviewCard>

      <PreviewCard label="Menubar with Icon">
        <MenuBar menus={iconMenus} />
      </PreviewCard>

      <PreviewCard label="Menubar with Checkmark">
        <MenuBar menus={checkmarkMenus} />
      </PreviewCard>

      {/* Anatomy note */}
      <div className="rounded-xl border border-base-100 bg-background-soft-50 p-4">
        <p className="text-text-100 text-xs">
          <span className="font-medium text-title-50">Uso:</span>{' '}
          <code className="bg-background-soft-100 px-1.5 py-0.5 rounded text-primary-500 text-[11px]">
            {`import { MenuBar } from './components/core/menu-bar'`}
          </code>
          {' · '}Soporta secciones, footer de danger, íconos, shortcuts, submenús y checkmarks.
        </p>
      </div>
    </div>
  );
}

// ─── Blocks ───────────────────────────────────────────────────────────────────

function SidebarBlockPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Sidebar"
        sub="DASH-SIDEBAR V1 — navegación vertical para dashboards. Expandido (290px) y colapsado (92px) con animación spring."
      />

      <PreviewCard label="Expanded — active: Payments">
        <div className="h-[520px] w-full overflow-hidden rounded-lg border border-base-100">
          <Sidebar activeItemId="payments" />
        </div>
      </PreviewCard>

      <PreviewCard label="Collapsed">
        <div className="h-[520px] overflow-hidden rounded-lg border border-base-100">
          <Sidebar defaultCollapsed activeItemId="payments" />
        </div>
      </PreviewCard>

      <div className="rounded-xl border border-base-100 bg-background-soft-50 p-4">
        <p className="text-text-100 text-xs">
          <span className="font-medium text-title-50">Uso:</span>{' '}
          <code className="bg-background-soft-100 px-1.5 py-0.5 rounded text-primary-500 text-[11px]">
            {`import { Sidebar } from './blocks/Sidebar'`}
          </code>
          {' · Props: '}
          <code className="bg-background-soft-100 px-1.5 py-0.5 rounded text-primary-500 text-[11px]">
            defaultCollapsed · activeItemId · onItemClick
          </code>
        </p>
      </div>
    </div>
  );
}

// ─── CrossBorder section — dos prototipos apilados ─────────────────────────────
function CrossBorderSection() {
  return (
    <div className="space-y-6">
      <PageHeader title="CrossBorder" sub="Prototipos navegables sobre el DS" />
      <CrossBorderPrototype />
      <Demo1xbetPrototype />
    </div>
  );
}

// ─── BillPay section ────────────────────────────────────────────────────────
// Renamed from "Giftcards" — now hosts BOTH the new BillPay Main prototype
// (backoffice) and the existing Giftcards marketplace prototype.
function BillPaySection() {
  return (
    <div className="space-y-6">
      <PageHeader title="BillPay" sub="Producto de gestión de pagos, cobros y flujos B2B/B2C" />
      <BillpayMainPrototype />
      <GiftcardsPrototype />
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
  menubar: MenuBarPage,
  'blocks-sidebar': SidebarBlockPage,
  prototypes: PrototypesPage,
  crossborder: CrossBorderSection,
  giftcards: BillPaySection,
  mandatos: () => <div className="space-y-6"><PageHeader title="Mandatos" sub="Flujo de aceptación de mandatos para débito automático (CLABE)" /><MandatosPrototype /></div>,
  'customer-platform': () => <div className="space-y-6"><PageHeader title="Customer Platform" sub="Portal de administración FINCOPAY — login, 2FA, dashboard y validación de contexto de sesión" /><CustomerPlatformPrototype /><GeolocalizacionPrototype /></div>,
  colors: ColorsPage, typography: TypographyPage,
  shadows: ShadowsPage, spacing: SpacingPage,
  'border-radius': BorderRadiusPage, grid: GridPage,
};

// ─── Primitives Dropdown ──────────────────────────────────────────────────────
function PrimitivesDropdown({ label, items, active, onSelect }: {
  label: string;
  items: NavItem[];
  active: TabId;
  onSelect: (id: TabId) => void;
}) {
  const hasActive = items.some(i => i.id === active);
  const [open, setOpen] = useState(hasActive);

  return (
    <div>
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className={[
          'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
          hasActive
            ? 'text-primary-500 font-medium bg-primary-500/5'
            : 'text-text-50 hover:bg-background-soft-50 hover:text-title-50',
        ].join(' ')}
      >
        <Layers2 size={16} className={hasActive ? 'text-primary-500' : 'text-text-200'} />
        <span className="flex-1">{label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="[&_svg]:fill-none [&_path]:fill-none shrink-0"
        >
          <ChevronDown size={13} className="text-text-200" />
        </motion.span>
      </button>

      {/* Sub-items */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="ml-4 pl-3 border-l border-base-100 mt-0.5 space-y-0.5 pb-1">
              {items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onSelect(id)}
                  className={[
                    'w-full relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                    active === id
                      ? 'text-primary-500 font-medium bg-primary-500/10'
                      : 'text-text-50 hover:bg-background-soft-50 hover:text-title-50',
                  ].join(' ')}
                >
                  <Icon size={14} className={active === id ? 'text-primary-500' : 'text-text-200'} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── External resources ───────────────────────────────────────────────────────

// ─── Logout icon (inline SVG, no @tailgrids dependency) ───────────────────────
function LogoutIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export function App() {
  const [active, setActive] = useState<TabId>('overview');
  const [docsView, setDocsView] = useState<'ds' | 'loading' | 'docs'>('ds');
  const userDisplay = useMemo(() => getUserDisplay(), []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      clearUserEmail();
      window.location.reload();
    }
  };

  const PageComponent = PAGES[active];

  // Deep-link: a #geo* hash lands on the Customer Platform page (where the
  // Geolocalización proto lives and reads the rest of the hash).
  useEffect(() => {
    const sync = () => {
      if (typeof window !== 'undefined' && window.location.hash.startsWith('#geo')) {
        setActive('customer-platform');
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  // ── Docs experience (redirection flow) ────────────────────────
  if (docsView === 'loading') {
    return <DocsLoader onReady={() => setDocsView('docs')} />;
  }
  if (docsView === 'docs') {
    return <Docs onBackToDS={() => setDocsView('ds')} />;
  }

  return (
    <AuthGate>
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
                {/* Items regulares del grupo */}
                {group.items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={[
                      'w-full relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      active === id
                        ? 'text-primary-500 font-medium'
                        : 'text-text-50 hover:bg-background-soft-50 hover:text-title-50',
                    ].join(' ')}
                  >
                    {active === id && (
                      <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 rounded-lg bg-primary-500/10"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <Icon size={16} className={active === id ? 'text-primary-500' : 'text-text-200'} />
                    <span className="relative z-10">{label}</span>
                    {id === 'overview' && (
                      <span className="ml-auto relative z-10">
                        <Badge color="primary" size="sm">{COMPONENTS.filter(c=>c.status==='stable').length}</Badge>
                      </span>
                    )}
                  </button>
                ))}

                {/* Sub-grupos con dropdown (ej: Primitives) */}
                {group.children?.map(sub => (
                  <PrimitivesDropdown
                    key={sub.label}
                    label={sub.label}
                    items={sub.items}
                    active={active}
                    onSelect={setActive}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-base-100 px-4 py-3 flex items-center gap-3">
          <Avatar size="sm" fallback={userDisplay.initials} />
          <div className="min-w-0">
            <p
              className="text-title-50 truncate text-xs font-medium"
              title={`${userDisplay.greeting} ${userDisplay.name}`}
            >
              {userDisplay.greeting} {userDisplay.name}
            </p>
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
            <ChevronRight size={12} className="text-text-200" />
            <span className="text-title-50 font-medium capitalize">{active}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              appearance="outline"
              onClick={() => setDocsView('loading')}
            >
              <FileTextMultiple size={13} />
              For devs
            </Button>
            <Button size="sm" onClick={handleLogout}>
              <LogoutIcon size={13} />
              Cerrar sesión
            </Button>
          </div>
        </div>

        {/* Page content */}
        <div className="px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      </div>
    </AuthGate>
  );
}
