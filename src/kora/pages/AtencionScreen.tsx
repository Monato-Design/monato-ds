import { useState } from 'react';
import { Search1 } from '@tailgrids/icons';
import { Badge } from '@/components/core/badge';
import { Input } from '@/components/core/input';
import { NativeSelect, NativeSelectOption } from '@/components/core/native-select';
import { TextArea } from '@/components/core/text-area';
import { TabRoot, TabList, TabTrigger, TabContent } from '@/components/core/tabs';
import { TableRoot, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/table';
import { buttonStyles, Button } from '@/components/core/button';
import {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/core/dialog';
import { StatCard } from '../components/StatCard';
import { SecondaryButton } from '../components/SecondaryButton';
import { CONVERSACIONES, JIRA_TICKETS, JIRA_STATS } from '../data';
import type { BadgeColor } from '../types';

const CONV_BADGE: Record<string, BadgeColor> = { Abierto: 'error', Pendiente: 'warning', Cerrado: 'gray' };
const PRIORIDAD_BADGE: Record<string, BadgeColor> = { Alta: 'error', Media: 'warning', Baja: 'gray' };
const JIRA_ESTADO_BADGE: Record<string, BadgeColor> = {
  Abierto: 'error',
  'En revisión': 'warning',
  'En progreso': 'blue',
  Resuelto: 'success',
  Cerrado: 'gray',
};

export function AtencionScreen() {
  return (
    <TabRoot defaultValue="conversaciones" variant="minimal">
      <TabList>
        <TabTrigger value="conversaciones">Conversaciones</TabTrigger>
        <TabTrigger value="jira">JIRA</TabTrigger>
      </TabList>

      <TabContent value="conversaciones">
        <ConversacionesTab />
      </TabContent>
      <TabContent value="jira">
        <JiraTab />
      </TabContent>
    </TabRoot>
  );
}

function ConversacionesTab() {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search1 size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-100" />
          <Input placeholder="Buscar conversación…" className="w-full border-[#bcccdc] pl-9" />
        </div>
        <div className="w-56 shrink-0">
          <NativeSelect className="border-[#bcccdc]" defaultValue="todos">
            <NativeSelectOption value="todos">Todos los estados</NativeSelectOption>
            <NativeSelectOption value="Abierto">Abiertos</NativeSelectOption>
            <NativeSelectOption value="Pendiente">Pendientes</NativeSelectOption>
            <NativeSelectOption value="Cerrado">Cerrados</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>

      <TableRoot>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Asunto</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Última actividad</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CONVERSACIONES.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-semibold">{c.cliente}</TableCell>
              <TableCell>{c.asunto}</TableCell>
              <TableCell>{c.responsable}</TableCell>
              <TableCell>{c.ultimaActividad}</TableCell>
              <TableCell>
                <Badge color={CONV_BADGE[c.estado]}>{c.estado}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </div>
  );
}

function JiraTab() {
  const [tickets, setTickets] = useState(JIRA_TICKETS);

  function updateEstado(id: string, estado: string) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, estado: estado as (typeof t)['estado'] } : t)));
  }

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-4">
        <StatCard label="Abiertos" value={JIRA_STATS.abiertos} tone="danger" />
        <StatCard label="En progreso" value={JIRA_STATS.enProgreso} tone="warning" />
        <StatCard label="Resueltos (mes)" value={JIRA_STATS.resueltosMes} />
      </div>

      <TableRoot>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-mono text-[13px] text-[var(--primitive-skyblue-600)]">{t.id}</TableCell>
              <TableCell>{t.titulo}</TableCell>
              <TableCell>{t.cliente}</TableCell>
              <TableCell>
                <Badge color={PRIORIDAD_BADGE[t.prioridad]}>{t.prioridad}</Badge>
              </TableCell>
              <TableCell>
                <Badge color={JIRA_ESTADO_BADGE[t.estado]}>{t.estado}</Badge>
              </TableCell>
              <TableCell>
                <JiraUpdateDialog
                  ticketId={t.id}
                  estadoActual={t.estado}
                  onSave={(estado) => updateEstado(t.id, estado)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </div>
  );
}

function JiraUpdateDialog({
  ticketId,
  estadoActual,
  onSave,
}: {
  ticketId: string;
  estadoActual: string;
  onSave: (estado: string) => void;
}) {
  const [estado, setEstado] = useState(estadoActual);
  const [comentario, setComentario] = useState('');

  return (
    <Dialog>
      <DialogTrigger className={buttonStyles({ variant: 'primary', appearance: 'outline', size: 'sm' })}>
        Actualizar
      </DialogTrigger>
      <DialogOverlay>
        <DialogContent className="max-w-md">
          {({ close }) => (
            <>
              <DialogHeader>
                <DialogTitle>Actualizar {ticketId}</DialogTitle>
              </DialogHeader>
              <DialogBody className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-50">Nuevo estatus</label>
                  <NativeSelect value={estado} onChange={(e) => setEstado(e.target.value)}>
                    <NativeSelectOption value="Abierto">Abierto</NativeSelectOption>
                    <NativeSelectOption value="En revisión">En revisión</NativeSelectOption>
                    <NativeSelectOption value="En progreso">En progreso</NativeSelectOption>
                    <NativeSelectOption value="Resuelto">Resuelto</NativeSelectOption>
                    <NativeSelectOption value="Cerrado">Cerrado</NativeSelectOption>
                  </NativeSelect>
                </div>
                <TextArea
                  label="Comentario"
                  placeholder="Agrega contexto del cambio…"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="h-20"
                />
              </DialogBody>
              <DialogFooter>
                <SecondaryButton appearance="outline" onClick={close}>Cancelar</SecondaryButton>
                <Button
                  onClick={() => {
                    onSave(estado);
                    close();
                  }}
                >
                  Guardar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
