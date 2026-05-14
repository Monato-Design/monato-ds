import { useState } from 'react';
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

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
const NAV = [
  { id: 'buttons',    label: 'Buttons' },
  { id: 'badges',     label: 'Badges' },
  { id: 'inputs',     label: 'Inputs' },
  { id: 'alerts',     label: 'Alerts' },
  { id: 'avatars',    label: 'Avatars' },
  { id: 'controls',   label: 'Controls' },
  { id: 'feedback',   label: 'Feedback' },
  { id: 'tabs',       label: 'Tabs' },
  { id: 'accordion',  label: 'Accordion' },
  { id: 'toast',      label: 'Toast' },
  { id: 'modal',      label: 'Modal' },
  { id: 'pagination', label: 'Pagination' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-title-50 text-base font-semibold">{title}</h2>
        <div className="h-px flex-1 bg-base-100" />
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      {label && (
        <p className="text-text-200 text-xs font-medium uppercase tracking-wider">{label}</p>
      )}
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export function App() {
  const [active, setActive] = useState('buttons');
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(3);

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen bg-background-50 font-sans">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="sticky top-0 h-screen w-56 shrink-0 flex flex-col border-r border-base-100 bg-background-50">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-base-100 px-5 py-[15px]">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary-500">
            <svg viewBox="0 0 20 20" fill="none" className="size-4">
              <circle cx="10" cy="10" r="3.5" fill="white"/>
              <path d="M10 3v3M10 14v3M3 10h3M14 10h3" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-title-50 text-sm font-semibold">Monato DS</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="text-text-200 mb-2 px-2 text-[11px] font-medium uppercase tracking-widest">
            Components
          </p>
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={[
                'w-full rounded-lg px-3 py-2 text-left text-sm transition',
                active === id
                  ? 'bg-primary-500/10 text-primary-500 font-medium'
                  : 'text-text-50 hover:bg-background-soft-50',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-base-100 px-5 py-3">
          <p className="text-text-200 text-xs">v0.1 · Figma sync 13 may 2026</p>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-14 px-10 py-10">

          <div>
            <h1 className="text-title-50 text-2xl font-semibold">Component Catalog</h1>
            <p className="text-text-100 mt-1 text-sm">
              Monato Design System · Tailgrids base · Skyblue #0894c8
            </p>
          </div>

          {/* ── Buttons ─────────────────────────────────────────────────────── */}
          <Section id="buttons" title="Buttons">
            <Row label="Fill">
              <Button variant="primary">Primary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </Row>
            <Row label="Outline">
              <Button variant="primary" appearance="outline">Primary</Button>
              <Button variant="danger" appearance="outline">Danger</Button>
              <Button variant="success" appearance="outline">Success</Button>
              <Button variant="primary" appearance="outline" disabled>Disabled</Button>
            </Row>
            <Row label="Sizes">
              <Button size="xs">XSmall</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </Row>
            <Row label="Button Group">
              <ButtonGroup variant="secondary" size="sm">
                <button>Semanal</button>
                <button>Mensual</button>
                <button>Anual</button>
              </ButtonGroup>
              <ButtonGroup variant="primary" size="sm">
                <button>SPEI</button>
                <button>CoDi</button>
              </ButtonGroup>
            </Row>
          </Section>

          {/* ── Badges ──────────────────────────────────────────────────────── */}
          <Section id="badges" title="Badges">
            <Row label="All colors">
              {(
                ['primary','success','warning','error','gray',
                 'cyan','sky','blue','violet','purple','pink','rose','orange'] as const
              ).map(c => (
                <Badge key={c} color={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Badge>
              ))}
            </Row>
            <Row label="Sizes">
              <Badge color="primary" size="sm">Small</Badge>
              <Badge color="primary" size="md">Medium</Badge>
              <Badge color="primary" size="lg">Large</Badge>
            </Row>
          </Section>

          {/* ── Inputs ──────────────────────────────────────────────────────── */}
          <Section id="inputs" title="Inputs">
            <Row label="States">
              <Input placeholder="Default" className="w-56" />
              <Input state="error" placeholder="Error" className="w-56" />
              <Input state="success" placeholder="Success" className="w-56" />
              <Input placeholder="Disabled" disabled className="w-56" />
            </Row>
            <Row label="Select">
              <NativeSelect className="w-56" placeholder="Seleccionar tipo">
                <NativeSelectOption>Pago SPEI</NativeSelectOption>
                <NativeSelectOption>Pago CoDi</NativeSelectOption>
                <NativeSelectOption>Transferencia</NativeSelectOption>
              </NativeSelect>
            </Row>
            <Row label="Textarea">
              <TextArea
                placeholder="Descripción del pago…"
                className="w-full max-w-md"
                rows={3}
              />
            </Row>
          </Section>

          {/* ── Alerts ──────────────────────────────────────────────────────── */}
          <Section id="alerts" title="Alerts">
            <Alert variant="success" title="Pago procesado" message="El SPEI fue enviado y confirmado por el banco receptor." />
            <Alert variant="info"    title="Información"    message="Tu cuenta tiene pagos pendientes de conciliación." />
            <Alert variant="warning" title="Atención"       message="El saldo disponible es menor al mínimo recomendado." />
            <Alert variant="danger"  title="Error"          message="No se pudo completar la transferencia. Intenta de nuevo." />
            <Alert variant="gray"    title="Sin actividad"  message="No hay movimientos en los últimos 30 días." />
          </Section>

          {/* ── Avatars ─────────────────────────────────────────────────────── */}
          <Section id="avatars" title="Avatars">
            <Row label="Sizes · Initial">
              {(['xs','sm','md','lg','xl','xxl'] as const).map(s => (
                <Avatar key={s} size={s} fallback="AL" />
              ))}
            </Row>
            <Row label="Sizes · Single letter">
              {(['xs','sm','md','lg','xl'] as const).map(s => (
                <Avatar key={s} size={s} fallback="M" />
              ))}
            </Row>
          </Section>

          {/* ── Controls ────────────────────────────────────────────────────── */}
          <Section id="controls" title="Controls">
            <Row label="Toggle">
              <Toggle label="Notificaciones push" defaultChecked />
              <Toggle label="Modo silencioso" />
              <Toggle label="Deshabilitado" disabled />
            </Row>
            <Row label="Checkbox">
              <Checkbox defaultChecked />
              <Checkbox />
              <Checkbox disabled />
            </Row>
            <Row label="Progress">
              <div className="w-80 space-y-3">
                <Progress progress={25} withLabel />
                <Progress progress={60} withLabel />
                <Progress progress={88} withLabel />
              </div>
            </Row>
          </Section>

          {/* ── Feedback ────────────────────────────────────────────────────── */}
          <Section id="feedback" title="Feedback">
            <Row label="Spinners">
              <DefaultSpinner size={24} />
              <DefaultSpinner size={36} />
              <DefaultSpinner size={48} />
            </Row>
            <Row label="Skeleton">
              <div className="w-80 space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>
            </Row>
          </Section>

          {/* ── Tabs ────────────────────────────────────────────────────────── */}
          <Section id="tabs" title="Tabs">
            <TabRoot defaultValue="pagos">
              <TabList>
                <TabTrigger value="pagos">Pagos</TabTrigger>
                <TabTrigger value="conciliacion">Conciliación</TabTrigger>
                <TabTrigger value="credito">Crédito</TabTrigger>
              </TabList>
              <TabContent value="pagos">
                <p className="text-text-50 p-4 text-sm">Módulo de Pagos — BillPay.</p>
              </TabContent>
              <TabContent value="conciliacion">
                <p className="text-text-50 p-4 text-sm">Módulo de Conciliación automática.</p>
              </TabContent>
              <TabContent value="credito">
                <p className="text-text-50 p-4 text-sm">Módulo de Crédito — Finch by Monato.</p>
              </TabContent>
            </TabRoot>
          </Section>

          {/* ── Accordion ───────────────────────────────────────────────────── */}
          <Section id="accordion" title="Accordion">
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
          </Section>

          {/* ── Toast ───────────────────────────────────────────────────────── */}
          <Section id="toast" title="Toast">
            <div className="space-y-3">
              <Toast variant="default" message={{ title: 'Pago procesado', description: 'SPEI enviado correctamente.' }} />
              <Toast variant="success" message={{ title: 'Conciliado', description: 'Transacción conciliada con éxito.' }} />
              <Toast variant="error"   message={{ title: 'Error', description: 'No se pudo completar el pago.' }} />
              <Toast variant="warning" message={{ title: 'Atención', description: 'Saldo insuficiente en la cuenta.' }} />
            </div>
          </Section>

          {/* ── Modal ───────────────────────────────────────────────────────── */}
          <Section id="modal" title="Modal">
            <Row>
              <Button onClick={() => setModalOpen(true)}>Abrir modal</Button>
            </Row>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
              <div className="w-full max-w-md rounded-xl bg-background-50 p-6 shadow-lg space-y-5">
                <div>
                  <h3 className="text-title-50 text-base font-semibold">Confirmar pago</h3>
                  <p className="text-text-100 mt-1 text-sm">
                    ¿Deseas procesar $12,500 MXN vía SPEI a Proveedor ABC?
                  </p>
                </div>
                <Input placeholder="Referencia (opcional)" />
                <div className="flex justify-end gap-3">
                  <Button appearance="outline" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setModalOpen(false)}>Confirmar</Button>
                </div>
              </div>
            </Modal>
          </Section>

          {/* ── Pagination ──────────────────────────────────────────────────── */}
          <Section id="pagination" title="Pagination">
            <Pagination
              totalPages={8}
              currentPage={page}
              onPageChange={setPage}
            />
          </Section>

        </div>
      </main>
    </div>
  );
}
